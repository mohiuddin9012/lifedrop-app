import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  getDocs,
  deleteDoc,
  serverTimestamp,
  orderBy,
  limit,
  getDocFromServer
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { notificationService } from './notificationService';
import { User, Donor, BloodRequest, Notification, Hospital, AdminStats, MoodStatus } from '../types';

// Helper to map mobile to email for Firebase Auth
const mobileToEmail = (mobile: string) => `${mobile}@lifedrop.com`;

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const api = {
  // Auth
  async login(mobile: string, password: string) {
    try {
      const email = mobileToEmail(mobile);
      let userCredential;
      
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (error: any) {
        // Restoration logic for the previous account 01741898259
        if (mobile === '01741898259' && password === '123456' && error.code === 'auth/invalid-credential') {
          try {
            userCredential = await signInWithEmailAndPassword(auth, email, 'admin12');
            if (auth.currentUser) {
              await updatePassword(auth.currentUser, '123456');
              console.log('Account 01741898259 restored to original password 123456');
            }
          } catch (restoreError) {
            throw error;
          }
        } else if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
          if (mobile === '01724737949') {
            throw new Error('অ্যাডমিন অ্যাকাউন্টটি পাওয়া যায়নি। দয়া করে প্রথমে Register করুন।');
          }
          throw new Error('ভুল মোবাইল নম্বর বা পাসওয়ার্ড। দয়া করে সঠিক তথ্য দিন।');
        } else {
          throw error;
        }
      }

      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }
      const userData = userDoc.data() as User;
      
      // New Strict Admin Check: Only 01724737949 with admin12
      const isAdminCredentials = mobile === '01724737949' && password === 'admin12';
      
      if (isAdminCredentials) {
        userData.role = 'admin';
        // Update role in database to ensure persistence
        await updateDoc(doc(db, 'users', userCredential.user.uid), { role: 'admin' });
      } else if (userData.role === 'admin' && mobile !== '01724737949') {
        // Security: If someone else was somehow an admin, demote them
        userData.role = 'user';
        await updateDoc(doc(db, 'users', userCredential.user.uid), { role: 'user' });
      }
      
      return userData;
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        throw new Error('ভুল মোবাইল নম্বর বা পাসওয়ার্ড। দয়া করে সঠিক তথ্য দিন।');
      }
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(userData: any) {
    try {
      const email = mobileToEmail(userData.mobile);
      const userCredential = await createUserWithEmailAndPassword(auth, email, userData.password);
      
      // Only the new specific admin credentials
      const isAdminCredentials = userData.mobile === '01724737949' && userData.password === 'admin12';
      
      const newUser: User = {
        ...userData,
        uid: userCredential.user.uid,
        id: userCredential.user.uid,
        status: 'Available',
        moodStatus: userData.moodStatus || 'Ready',
        totalDonations: 0,
        livesSaved: 0,
        role: isAdminCredentials ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
        donationHistory: [],
        favorites: [],
        heroMode: false,
      };
      
      delete (newUser as any).password;
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async getMe() {
    return new Promise<User | null>((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data() as User;
              // No more hardcoding here, rely on the role stored in DB 
              // which is set during login/register based on strict credentials
              resolve(userData);
            } else {
              resolve(null);
            }
          } catch (error) {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
  },

  async logout() {
    await signOut(auth);
  },

  // Donors
  async getDonors(filters: { bloodGroup?: string, district?: string, upazila?: string, moodStatus?: string } = {}) {
    const path = 'users';
    try {
      let q = query(collection(db, path));
      
      if (filters.bloodGroup) {
        q = query(q, where('bloodGroup', '==', filters.bloodGroup));
      }
      if (filters.district) {
        q = query(q, where('district', '==', filters.district));
      }
      if (filters.moodStatus) {
        q = query(q, where('moodStatus', '==', filters.moodStatus));
      }
      
      const querySnapshot = await getDocs(q);
      let donors = querySnapshot.docs.map(doc => doc.data() as Donor);
      
      if (filters.upazila) {
        donors = donors.filter(d => d.upazila.toLowerCase().includes(filters.upazila!.toLowerCase()));
      }
      
      return donors;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async updateDonorStatus(status: 'Available' | 'Busy') {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const path = `users/${user.uid}`;
    try {
      await updateDoc(doc(db, 'users', user.uid), { status });
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      return userDoc.data() as User;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  async updateMoodStatus(moodStatus: MoodStatus) {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const path = `users/${user.uid}`;
    try {
      await updateDoc(doc(db, 'users', user.uid), { moodStatus });
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      return userDoc.data() as User;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  async toggleHeroMode() {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const path = `users/${user.uid}`;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const currentHeroMode = userDoc.data()?.heroMode || false;
      await updateDoc(doc(db, 'users', user.uid), { heroMode: !currentHeroMode });
      const updatedDoc = await getDoc(doc(db, 'users', user.uid));
      return updatedDoc.data() as User;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  async toggleFavorite(donorId: string) {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const path = `users/${user.uid}`;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const favorites = userDoc.data()?.favorites || [];
      const newFavorites = favorites.includes(donorId)
        ? favorites.filter((id: string) => id !== donorId)
        : [...favorites, donorId];
      
      await updateDoc(doc(db, 'users', user.uid), { favorites: newFavorites });
      const updatedDoc = await getDoc(doc(db, 'users', user.uid));
      return updatedDoc.data() as User;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  // Requests
  async createRequest(requestData: any) {
    const user = auth.currentUser;
    const path = 'requests';
    try {
      const newRequest = {
        patientName: requestData.patientName,
        bloodGroup: requestData.bloodGroup,
        units: requestData.units || 1,
        hospital: requestData.hospitalName || requestData.hospital,
        district: requestData.district,
        upazila: requestData.upazila,
        phone: requestData.contactNumber || requestData.phone,
        time: requestData.neededDate || requestData.time,
        reason: requestData.reason || '',
        urgency: requestData.urgency || 'Serious',
        requesterId: user?.uid || 'guest',
        userId: requestData.donorId || null, // The donor ID
        status: 'Requested',
        createdAt: new Date().toISOString(),
        senderConfirmed: false,
        donorConfirmed: false,
      };
      
      const docRef = await addDoc(collection(db, path), newRequest);
      
      // Trigger Notification
      if (newRequest.userId) {
        // Targeted notification
        await notificationService.sendNotification({
          userId: newRequest.userId,
          type: 'system',
          title: 'Direct Blood Request',
          message: `You have received a direct blood request from ${user?.displayName || user?.email || 'a user'}.`
        });
      } else if (newRequest.urgency === 'Critical') {
        // Broadcast notification
        await notificationService.sendNotification({
          type: 'emergency',
          title: 'Emergency Blood Request!',
          message: `${newRequest.bloodGroup} needed at ${newRequest.hospital}. Please help!`,
          targetGroup: 'all'
        });
      }
      
      return { ...newRequest, id: docRef.id };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  async acceptRequest(requestId: string) {
    const path = `requests/${requestId}`;
    try {
      await updateDoc(doc(db, 'requests', requestId), { status: 'Accepted' });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  async confirmDonation(requestId: string, role: 'sender' | 'donor') {
    const path = `requests/${requestId}`;
    try {
      const requestRef = doc(db, 'requests', requestId);
      const requestSnap = await getDoc(requestRef);
      if (!requestSnap.exists()) throw new Error('Request not found');
      
      const requestData = requestSnap.data() as BloodRequest;
      const updates: any = {};
      
      if (role === 'sender') {
        updates.senderConfirmed = true;
      } else {
        updates.donorConfirmed = true;
      }
      
      const isSenderConfirmed = role === 'sender' ? true : requestData.senderConfirmed;
      const isDonorConfirmed = role === 'donor' ? true : requestData.donorConfirmed;
      
      if (isSenderConfirmed && isDonorConfirmed) {
        updates.status = 'Completed';
        
        // Update Donor Stats
        if (requestData.userId) {
          const donorRef = doc(db, 'users', requestData.userId);
          const donorSnap = await getDoc(donorRef);
          if (donorSnap.exists()) {
            const donorData = donorSnap.data() as User;
            const newDonation = {
              date: new Date().toISOString().split('T')[0],
              hospital: requestData.hospital,
              location: `${requestData.upazila}, ${requestData.district}`
            };
            
            await updateDoc(donorRef, {
              totalDonations: (donorData.totalDonations || 0) + 1,
              lastDonationDate: newDonation.date,
              donationHistory: [newDonation, ...(donorData.donationHistory || [])]
            });
          }
        }
      } else {
        updates.status = 'Donation Pending Confirmation';
      }
      
      await updateDoc(requestRef, updates);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  async getMyRequests() {
    const user = auth.currentUser;
    if (!user) return [];
    
    try {
      const sentQuery = query(collection(db, 'requests'), where('requesterId', '==', user.uid));
      const receivedQuery = query(collection(db, 'requests'), where('userId', '==', user.uid));
      
      const [sentSnap, receivedSnap] = await Promise.all([
        getDocs(sentQuery),
        getDocs(receivedQuery)
      ]);
      
      const sent = sentSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }) as BloodRequest);
      const received = receivedSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }) as BloodRequest);
      
      return [...sent, ...received].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Failed to fetch my requests', error);
      return [];
    }
  },

  async getRequests() {
    const path = 'requests';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as BloodRequest);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  // Notifications
  async getNotifications() {
    const user = auth.currentUser;
    if (!user) return [];
    
    const path = 'notifications';
    try {
      const q = query(
        collection(db, path), 
        where('userId', 'in', [user.uid, 'broadcast', 'all'])
      );
      const querySnapshot = await getDocs(q);
      const notifications = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          ...data, 
          id: doc.id,
          isRead: data.isRead || data.read || false // Handle both field names
        } as Notification;
      });
      
      // Sort client-side to avoid needing a composite index
      return notifications.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async markNotificationAsRead(notificationId: string) {
    const path = `notifications/${notificationId}`;
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { isRead: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  // Hospitals
  async getHospitals() {
    // For simplicity, keep hospitals static or fetch from a collection
    return [];
  },

  // Admin
  async sendAnnouncement(title: string, message: string) {
    try {
      await notificationService.sendNotification({
        type: 'system',
        title,
        message,
        targetGroup: 'all'
      });
      return true;
    } catch (error) {
      console.error('Failed to send announcement:', error);
      throw error;
    }
  },

  async getAdminStats() {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const requestsSnapshot = await getDocs(collection(db, 'requests'));
      
      const users = usersSnapshot.docs.map(d => d.data() as User);
      const requests = requestsSnapshot.docs.map(d => d.data() as BloodRequest);
      
      const donors = users.filter(u => u.heroMode || u.totalDonations > 0);
      const activeDonors = donors.filter(d => d.moodStatus === 'Ready');
      const pendingRequests = requests.filter(r => r.status === 'Requested' || r.status === 'Pending' || r.status === 'Donation Pending Confirmation');
      const completedDonations = requests.filter(r => r.status === 'Completed');
      const emergencyRequests = requests.filter(r => r.urgency === 'Critical');
      const totalLivesSaved = users.reduce((acc, u) => acc + (u.livesSaved || 0), 0);
      
      return {
        totalUsers: users.length,
        totalDonors: donors.length,
        activeDonors: activeDonors.length,
        totalRequests: requests.length,
        pendingRequests: pendingRequests.length,
        completedDonations: completedDonations.length,
        emergencyRequests: emergencyRequests.length,
        totalAdmins: users.filter(u => u.role === 'admin').length,
        livesSaved: totalLivesSaved,
      } as AdminStats;
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      return { 
        totalUsers: 0, totalDonors: 0, activeDonors: 0, 
        totalRequests: 0, pendingRequests: 0, completedDonations: 0, 
        emergencyRequests: 0, totalAdmins: 0, livesSaved: 0 
      };
    }
  },

  async updateUserRole(userId: string, role: 'user' | 'admin') {
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, 'users', userId), { role });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  async toggleUserBlock(userId: string, isBlocked: boolean) {
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, 'users', userId), { isBlocked });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  async toggleDonorVerification(userId: string, isVerified: boolean) {
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, 'users', userId), { isVerified });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  async updateRequestStatus(requestId: string, status: BloodRequest['status']) {
    const path = `requests/${requestId}`;
    try {
      await updateDoc(doc(db, 'requests', requestId), { status });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  async forceCompleteRequest(requestId: string) {
    const path = `requests/${requestId}`;
    try {
      const requestRef = doc(db, 'requests', requestId);
      const requestSnap = await getDoc(requestRef);
      if (!requestSnap.exists()) throw new Error('Request not found');
      
      const requestData = requestSnap.data() as BloodRequest;
      
      // Update request status
      await updateDoc(requestRef, { 
        status: 'Completed',
        senderConfirmed: true,
        donorConfirmed: true
      });
      
      // Update Donor Stats
      if (requestData.userId) {
        const donorRef = doc(db, 'users', requestData.userId);
        const donorSnap = await getDoc(donorRef);
        if (donorSnap.exists()) {
          const donorData = donorSnap.data() as User;
          const newDonation = {
            date: new Date().toISOString().split('T')[0],
            hospital: requestData.hospital,
            location: `${requestData.upazila}, ${requestData.district}`
          };
          
          await updateDoc(donorRef, {
            totalDonations: (donorData.totalDonations || 0) + 1,
            lastDonationDate: newDonation.date,
            donationHistory: [newDonation, ...(donorData.donationHistory || [])]
          });
        }
      }
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      throw error;
    }
  },

  async sendTargetedNotification(targets: { 
    userId?: string, 
    bloodGroup?: string, 
    district?: string, 
    targetGroup?: 'all' | 'donors' 
  }, title: string, message: string) {
    try {
      if (targets.userId) {
        await notificationService.sendNotification({
          userId: targets.userId,
          type: 'system',
          title,
          message
        });
      } else {
        // For blood group or district, we might need to fetch users first or use a more complex logic
        // For now, we'll use the existing targetGroup if applicable, or fetch and send individually
        if (targets.bloodGroup || targets.district) {
          const usersSnapshot = await getDocs(collection(db, 'users'));
          const users = usersSnapshot.docs.map(d => d.data() as User);
          
          const filteredUsers = users.filter(u => {
            let match = true;
            if (targets.bloodGroup && u.bloodGroup !== targets.bloodGroup) match = false;
            if (targets.district && u.district !== targets.district) match = false;
            if (targets.targetGroup === 'donors' && !u.heroMode && u.totalDonations === 0) match = false;
            return match;
          });

          await Promise.all(filteredUsers.map(u => 
            notificationService.sendNotification({
              userId: u.uid,
              type: 'system',
              title,
              message
            })
          ));
        } else {
          await notificationService.sendNotification({
            type: 'system',
            title,
            message,
            targetGroup: targets.targetGroup || 'all'
          });
        }
      }
      return true;
    } catch (error) {
      console.error('Failed to send targeted notification:', error);
      throw error;
    }
  },

  async getAdminUsers() {
    const path = 'users';
    try {
      const querySnapshot = await getDocs(collection(db, path));
      return querySnapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async deleteUser(id: string) {
    const path = `users/${id}`;
    try {
      await deleteDoc(doc(db, 'users', id));
      return { success: true };
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      throw error;
    }
  },

  async testConnection() {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration.");
      }
    }
  }
};
