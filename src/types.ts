export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
export type UrgencyLevel = 'Critical' | 'Serious' | 'Planned';
export type MoodStatus = 'Ready' | 'Busy';

export interface DonationRecord {
  date: string;
  hospital: string;
  location: string;
}

export interface User {
  id: string;
  uid: string;
  name: string;
  mobile: string;
  bloodGroup: BloodGroup;
  dob: string;
  district: string;
  upazila: string;
  lastDonationDate?: string;
  totalDonations: number;
  livesSaved: number;
  status: 'Available' | 'Busy'; // Legacy status
  moodStatus: MoodStatus;
  role: 'user' | 'admin';
  isBlocked?: boolean;
  isVerified?: boolean;
  createdAt: string;
  email?: string;
  donationHistory: DonationRecord[];
  favorites: string[];
  heroMode: boolean;
  fcmToken?: string;
}

export interface Donor {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  district: string;
  upazila: string;
  status: 'Available' | 'Busy'; // Legacy status
  moodStatus: MoodStatus;
  totalDonations: number;
  livesSaved: number;
  lastDonationDate?: string;
  distance?: string;
  mobile: string;
  badge?: string;
  isVerified?: boolean;
  isBlocked?: boolean;
}

export interface BloodRequest {
  id: string;
  patientName: string;
  bloodGroup: BloodGroup;
  units: number;
  hospital: string;
  district: string;
  upazila: string;
  time: string;
  phone: string;
  status: 'Requested' | 'Accepted' | 'Donation Pending Confirmation' | 'Completed' | 'Cancelled' | 'Pending' | 'Approved';
  urgency: UrgencyLevel;
  userId: string; // The donor ID
  requesterId: string;
  createdAt: string;
  reason?: string;
  senderConfirmed?: boolean;
  donorConfirmed?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'emergency' | 'nearby' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  createdAt: string;
}

export interface Hospital {
  id: string;
  name: string;
  district: string;
  upazila: string;
  address?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalDonors: number;
  activeDonors: number;
  totalRequests: number;
  pendingRequests: number;
  completedDonations: number;
  emergencyRequests: number;
  totalAdmins: number;
  livesSaved?: number;
}
