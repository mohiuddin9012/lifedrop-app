import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Phone, Lock, Eye, EyeOff, Droplet, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onRegister: () => void;
  onForgotPassword: () => void;
}

export default function Login({ onLogin, onRegister, onForgotPassword }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!mobile || !password) {
      setError('Please enter both mobile and password');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.login(mobile, password);
      onLogin(data);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white p-5">
      <div className="mt-8 mb-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
          <Droplet size={32} className="text-[#e53935] fill-[#e53935]" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome Back</h1>
        <p className="text-gray-500 mt-1 text-sm">Login to your account</p>
      </div>

      <div className="space-y-4 flex-1">
        {error && (
          <div className="bg-red-50 text-[#e53935] p-3 rounded-xl text-xs font-medium border border-red-100">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700 ml-1">Mobile Number</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Phone size={16} className="text-gray-400" />
            </div>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="01XXXXXXXXX"
              className="w-full bg-gray-50 border-0 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:ring-2 focus:ring-[#e53935] transition-all text-sm"
            />
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

        <div className="flex justify-end">
          <button
            onClick={onForgotPassword}
            className="text-xs font-semibold text-[#e53935] hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#e53935] text-white py-3 rounded-xl font-bold text-base shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-70"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          <span>{loading ? 'Logging in...' : 'Login'}</span>
        </button>
      </div>

      <div className="pb-6 text-center">
        <p className="text-gray-500 text-sm">
          Don't have an account?{" "}
          <button
            onClick={onRegister}
            className="font-bold text-[#e53935] hover:underline"
          >
            Register Now
          </button>
        </p>
      </div>
    </div>
  );
}
