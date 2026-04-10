import { getToken, onMessage } from 'firebase/messaging';
import { messaging, db } from '../firebase';
import { doc, updateDoc, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { Notification as AppNotification } from '../types';

export const notificationService = {
  async requestPermission(userId: string) {
    if (!messaging) return;

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: 'BPA_YOUR_VAPID_KEY_HERE' // Note: User needs to provide this or I use a placeholder
        });
        
        if (token) {
          await updateDoc(doc(db, 'users', userId), {
            fcmToken: token
          });
          return token;
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  },

  onMessageListener() {
    if (!messaging) return;
    return new Promise((resolve) => {
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    });
  },

  async sendNotification(data: {
    userId?: string;
    type: 'emergency' | 'nearby' | 'system';
    title: string;
    message: string;
    targetGroup?: 'all' | 'donors';
  }) {
    const path = 'notifications';
    try {
      const notificationData = {
        ...data,
        isRead: false,
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp()
      };

      // If it's a targeted notification
      if (data.userId) {
        await addDoc(collection(db, path), notificationData);
      } 
      // If it's a broadcast (emergency or admin)
      else if (data.targetGroup) {
        // In a real app, this would be handled by a cloud function or backend
        // For this app, we'll save it as a "broadcast" notification that users fetch
        await addDoc(collection(db, path), {
          ...notificationData,
          userId: 'broadcast', // Special ID for broadcast
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  },

  subscribeToNotifications(userId: string, callback: (notifications: AppNotification[]) => void) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', 'in', [userId, 'broadcast'])
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppNotification[];
      
      // Sort client-side to avoid needing a composite index
      const sorted = notifications.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
      
      callback(sorted);
    });
  }
};
