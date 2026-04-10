import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User as UserIcon, Phone, Calendar, Lock, Eye, EyeOff, Droplet, ChevronLeft, MapPin, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { BLOOD_GROUPS, DISTRICTS } from '../constants';
import { User, MoodStatus } from '../types';

interface RegisterProps {
  onRegister: (user: User) => void;
  onLogin: () => void;
}

export default function Register({ onRegister, onLogin }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    dob: '',
    password: '',
    bloodGroup: 'A+',
    district: 'Dhaka',
    upazila: '',
    moodStatus: 'Ready' as MoodStatus
  });

  const handleRegister = async () => {
    if (!formData.name || !formData.mobile || !formData.password || !formData.upazila) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.register(formData);
      onRegister(response);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white p-5">
      <div className="mt-6 mb-3">
        <button
          onClick={onLogin}
          className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-500 mt-1 text-sm">Join our community to save lives</p>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-1 scrollbar-hide">
        {error && (
          <div className="bg-red-50 text-[#e53935] p-3 rounded-xl text-xs font-medium border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 ml-1">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <UserIcon size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              className="w-full bg-gray-50 border-0 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:ring-2 focus:ring-[#e53935] transition-all text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 ml-1">Mobile Number</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Phone size={16} className="text-gray-400" />
              </div>
              <input
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="01XXXXXXXXX"
                className="w-full bg-gray-50 border-0 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:ring-2 focus:ring-[#e53935] transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 ml-1">Blood Group</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Droplet size={16} className="text-gray-400" />
              </div>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full bg-gray-50 border-0 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:ring-2 focus:ring-[#e53935] appearance-none text-sm"
              >
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 ml-1">Date of Birth</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Calendar size={16} className="text-gray-400" />
            </div>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              className="w-full bg-gray-50 border-0 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:ring-2 focus:ring-[#e53935] transition-all text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 ml-1">District</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <MapPin size={16} className="text-gray-400" />
              </div>
              <select
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full bg-gray-50 border-0 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:ring-2 focus:ring-[#e53935] appearance-none text-sm"
              >
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 ml-1">Upazila</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <MapPin size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.upazila}
                onChange={(e) => setFormData({ ...formData, upazila: e.target.value })}
                placeholder="e.g. Uttara"
                className="w-full bg-gray-50 border-0 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:ring-2 focus:ring-[#e53935] transition-all text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 ml-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock size={16} className="text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full bg-gray-50 border-0 rounded-xl py-3 pl-10 pr-10 text-gray-900 focus:ring-2 focus:ring-[#e53935] transition-all text-sm"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-[#e53935] text-white py-3 rounded-xl font-bold text-base shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-[0.98] mt-2 flex items-center justify-center space-x-2 disabled:opacity-70"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          <span>{loading ? 'Creating Account...' : 'Register'}</span>
        </button>
      </div>

      <div className="py-3 text-center">
        <p className="text-gray-500 text-sm">
          Already have an account?{" "}
          <button
            onClick={onLogin}
            className="font-bold text-[#e53935] hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
