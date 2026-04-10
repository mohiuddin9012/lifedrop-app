import React, { useState, useEffect } from 'react';
import { ChevronLeft, Bell, Heart, MapPin, Info, Loader2, Droplet } from 'lucide-react';
import { Notification as AppNotification, User } from '../types';
import { api } from '../services/api';
import { notificationService } from '../services/notificationService';

interface NotificationsProps {
  user: User | null;
  onBack: () => void;
}

export default function Notifications({ user, onBack }: NotificationsProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = notificationService.subscribeToNotifications(user.uid, (data) => {
      setNotifications(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white px-5 pt-8 pb-5 rounded-b-[32px] shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 size={28} className="animate-spin text-[#e53935]" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => handleMarkAsRead(notif.id)}
                className={`p-4 rounded-2xl shadow-sm border flex space-x-3.5 transition-all active:scale-[0.98] cursor-pointer ${notif.isRead ? 'bg-white border-gray-100' : 'bg-red-50 border-red-100'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  notif.type === 'emergency' ? 'bg-red-100 text-[#e53935]' : 
                  notif.type === 'nearby' ? 'bg-blue-100 text-blue-600' : 
                  'bg-gray-100 text-gray-600'
                }`}>
                  {notif.type === 'emergency' ? <Droplet size={20} /> : 
                   notif.type === 'nearby' ? <MapPin size={20} /> : 
                   <Bell size={20} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className={`font-bold text-gray-900 text-sm ${notif.isRead ? '' : 'text-[#e53935]'}`}>{notif.title}</h4>
                    <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">{new Date(notif.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
              <Bell size={32} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">No Notifications</h3>
              <p className="text-gray-500 text-xs max-w-[180px] mx-auto mt-0.5">
                We'll notify you when there's an emergency or update.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
