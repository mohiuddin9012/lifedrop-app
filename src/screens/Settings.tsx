import React from 'react';
import { ChevronLeft, User as UserIcon, Bell, Shield, Info, LogOut, ChevronRight, Moon, Globe, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface SettingsProps {
  user: User | null;
  onBack: () => void;
  onLogout: () => void;
}

export default function Settings({ user, onBack, onLogout }: SettingsProps) {
  const isAdmin = user?.role === 'admin';

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
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        <div className="space-y-2.5">
          <SectionTitle title="Account" />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <SettingItem icon={<UserIcon size={18} />} label="Edit Profile" />
            <SettingItem icon={<Bell size={18} />} label="Notifications" />
            <SettingItem icon={<Shield size={18} />} label="Privacy & Security" />
          </div>
        </div>

        <div className="space-y-2.5">
          <SectionTitle title="Preferences" />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <SettingItem icon={<Moon size={18} />} label="Dark Mode" hasToggle />
            <SettingItem icon={<Globe size={18} />} label="Language" value="English" />
          </div>
        </div>

        <div className="space-y-2.5">
          <SectionTitle title="Support" />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <SettingItem icon={<Info size={18} />} label="About LifeDrop" />
            <SettingItem icon={<Info size={18} />} label="Privacy Policy" />
            <SettingItem icon={<Info size={18} />} label="Terms of Service" />
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center space-x-2.5 p-4 bg-red-50 text-[#e53935] rounded-2xl font-bold hover:bg-red-100 transition-colors mb-6 text-sm"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">{title}</h3>;
}

function SettingItem({ icon, label, value, hasToggle, onClick }: { icon: React.ReactNode, label: string, value?: string, hasToggle?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
    >
      <div className="flex items-center space-x-3.5">
        <div className="text-gray-400">{icon}</div>
        <span className="font-bold text-xs text-gray-700">{label}</span>
      </div>
      <div className="flex items-center space-x-2">
        {value && <span className="text-xs text-gray-400 font-medium">{value}</span>}
        {hasToggle ? (
          <div className="w-9 h-5 bg-gray-200 rounded-full relative">
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
          </div>
        ) : (
          <ChevronRight size={16} className="text-gray-300" />
        )}
      </div>
    </button>
  );
}
