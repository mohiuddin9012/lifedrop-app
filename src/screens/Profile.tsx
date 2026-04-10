import React, { useState } from 'react';
import { ChevronLeft, Settings as SettingsIcon, MapPin, Calendar, Droplet, Award, LogOut, ChevronRight, Phone, Loader2, User as UserIcon, Activity } from 'lucide-react';
import { Screen } from '../App';
import { User } from '../types';
import { api } from '../services/api';

interface ProfileProps {
  user: User | null;
  onBack: () => void;
  onSettings: () => void;
  onNavigate: (screen: Screen) => void;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
}

export default function Profile({ user, onBack, onSettings, onNavigate, onUpdateUser, onLogout }: ProfileProps) {
  const [updating, setUpdating] = useState(false);

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
          <UserIcon size={48} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Profile Found</h2>
        <p className="text-gray-500 mb-8 max-w-[250px]">
          Please log in or register to view and manage your profile.
        </p>
        <button 
          onClick={onLogout}
          className="w-full bg-[#e53935] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-red-100 active:scale-[0.98] transition-all"
        >
          Go to Login
        </button>
        <button 
          onClick={onBack}
          className="mt-4 text-gray-500 font-bold"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const updateMoodStatus = async (mood: 'Ready' | 'Busy') => {
    setUpdating(true);
    try {
      const updatedUser = await api.updateMoodStatus(mood);
      onUpdateUser(updatedUser);
    } catch (err) {
      console.error('Failed to update mood status', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white px-5 pt-8 pb-6 rounded-b-[32px] shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={onBack}
            className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
          <button
            onClick={onSettings}
            className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <SettingsIcon size={18} />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-[32px] shadow-lg overflow-hidden border-4 border-white">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-9 h-9 bg-[#e53935] rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg border-4 border-white">
              {user.bloodGroup}
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mt-4">{user.name}</h2>
          <div className="flex items-center text-gray-500 mt-0.5">
            <MapPin size={12} className="mr-1 text-[#e53935]" />
            <span className="text-xs">{user.upazila}, {user.district}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {/* Mood Status Selector */}
        <div className="space-y-2.5">
          <h3 className="text-base font-bold text-gray-900">My Status</h3>
          <div className="flex space-x-3">
            {(['Ready', 'Busy'] as const).map((mood) => (
              <button
                key={mood}
                onClick={() => updateMoodStatus(mood)}
                disabled={updating}
                className={`flex-1 p-3 rounded-2xl border transition-all flex flex-col items-center space-y-1 ${
                  user.moodStatus === mood
                    ? mood === 'Ready' ? 'bg-green-50 border-green-200 text-green-600' :
                      'bg-yellow-50 border-yellow-200 text-yellow-600'
                    : 'bg-white border-gray-100 text-gray-400'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${
                  mood === 'Ready' ? 'bg-green-500' :
                  'bg-yellow-500'
                }`} />
                <span className="text-[9px] font-bold uppercase tracking-wider">
                  {mood === 'Ready' ? 'Ready' : 'Busy'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-center">
            <p className="text-xl font-bold text-[#e53935]">{user.totalDonations || 0}</p>
            <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">Donations</p>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col justify-center">
            <p className="text-[11px] font-bold text-gray-900 leading-tight">{user.lastDonationDate || 'Never'}</p>
            <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">Last Date</p>
          </div>
        </div>

        {/* Badges */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-gray-900">My Badges</h3>
          <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            <Badge icon={<Award size={20} />} label="Bronze" active />
            {user.totalDonations >= 5 && <Badge icon={<Award size={20} />} label="Silver" active />}
            {user.totalDonations >= 10 && <Badge icon={<Award size={20} />} label="Gold" active />}
            {user.totalDonations >= 20 && <Badge icon={<Award size={20} />} label="Hero" active />}
          </div>
        </div>

        {/* Donation History */}
        {user.donationHistory && user.donationHistory.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-900">Donation History</h3>
            <div className="space-y-2.5">
              {user.donationHistory.map((record, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-gray-50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center text-[#e53935]">
                      <Droplet size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-xs">{record.hospital}</p>
                      <p className="text-[10px] text-gray-500">{record.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400">{record.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <MenuItem icon={<Activity size={18} />} label="My Requests" onClick={() => onNavigate('request_management')} />
          <MenuItem icon={<Droplet size={18} />} label="Donation History" />
          <MenuItem icon={<Phone size={18} />} label="Contact Support" />
          <MenuItem icon={<LogOut size={18} />} label="Logout" color="text-red-500" onClick={onLogout} />
        </div>
      </div>
    </div>
  );
}

function Badge({ icon, label, active }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className="flex flex-col items-center space-y-1.5 flex-shrink-0">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${active ? 'bg-orange-50 text-orange-500' : 'bg-gray-50 text-gray-300'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold ${active ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
    </div>
  );
}

function MenuItem({ icon, label, color = "text-gray-600", onClick }: { icon: React.ReactNode, label: string, color?: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
    >
      <div className="flex items-center space-x-3">
        <div className={`${color} opacity-80`}>{icon}</div>
        <span className={`font-bold text-xs ${color === 'text-red-500' ? 'text-red-500' : 'text-gray-700'}`}>{label}</span>
      </div>
      <ChevronRight size={16} className="text-gray-300" />
    </button>
  );
}
