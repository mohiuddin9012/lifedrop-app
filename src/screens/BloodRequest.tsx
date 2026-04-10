import React, { useState } from 'react';
import { ChevronLeft, User, Droplet, Layers, Hospital, MapPin, Clock, Phone, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { BLOOD_GROUPS, DISTRICTS } from '../constants';
import { api } from '../services/api';
import { UrgencyLevel } from '../types';

interface BloodRequestProps {
  onBack: () => void;
}

export default function BloodRequest({ onBack }: BloodRequestProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: BLOOD_GROUPS[0],
    units: 1,
    hospitalName: '',
    district: DISTRICTS[0],
    upazila: '',
    contactNumber: '',
    reason: '',
    urgency: 'Serious' as UrgencyLevel,
    neededDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.createRequest(formData);
      setSuccess(true);
      setTimeout(() => onBack(), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white p-8 text-center">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8">
          <CheckCircle2 size={48} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Request Sent!</h1>
        <p className="text-gray-500 text-lg leading-relaxed mb-12">
          Your emergency blood request has been broadcasted to all nearby donors. You will be notified when someone accepts.
        </p>
        <button
          onClick={onBack}
          className="w-full bg-[#e53935] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-red-100"
        >
          Back to Home
        </button>
      </div>
    );
  }

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
          <h1 className="text-xl font-bold text-gray-900">Emergency Request</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <form onSubmit={handleSubmit} className="space-y-4 pb-6">
          {error && (
            <div className="bg-red-50 text-[#e53935] p-3 rounded-xl text-xs font-medium border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 ml-1">Urgency Level</label>
              <div className="flex space-x-2.5">
                {(['Critical', 'Serious', 'Planned'] as UrgencyLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, urgency: level })}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      formData.urgency === level
                        ? level === 'Critical' ? 'bg-red-600 text-white shadow-md shadow-red-100' :
                          level === 'Serious' ? 'bg-orange-500 text-white shadow-md shadow-orange-100' :
                          'bg-blue-500 text-white shadow-md shadow-blue-100'
                        : 'bg-white text-gray-500 border border-gray-100'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <InputGroup 
              icon={<User size={16} />} 
              label="Patient Name" 
              placeholder="Full Name" 
              value={formData.patientName}
              onChange={(val) => setFormData({ ...formData, patientName: val })}
              required
            />
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">Blood Group</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Droplet size={16} className="text-gray-400" />
                  </div>
                  <select 
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    className="w-full bg-white border-0 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:ring-2 focus:ring-[#e53935] appearance-none text-sm"
                  >
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>
              <InputGroup 
                icon={<Layers size={16} />} 
                label="Units Needed" 
                type="number"
                placeholder="1" 
                value={formData.units.toString()}
                onChange={(val) => setFormData({ ...formData, units: parseInt(val) || 1 })}
                required
              />
            </div>

            <InputGroup 
              icon={<Layers size={16} />} 
              label="Reason" 
              placeholder="Surgery, etc." 
              value={formData.reason}
              onChange={(val) => setFormData({ ...formData, reason: val })}
              required
            />

            <InputGroup 
              icon={<Hospital size={16} />} 
              label="Hospital" 
              placeholder="Hospital Name" 
              value={formData.hospitalName}
              onChange={(val) => setFormData({ ...formData, hospitalName: val })}
              required
            />
            
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
                    className="w-full bg-white border-0 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:ring-2 focus:ring-[#e53935] appearance-none text-sm"
                  >
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <InputGroup 
                icon={<MapPin size={16} />} 
                label="Upazila" 
                placeholder="Upazila" 
                value={formData.upazila}
                onChange={(val) => setFormData({ ...formData, upazila: val })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InputGroup 
                icon={<Clock size={16} />} 
                label="Date Needed" 
                type="date" 
                value={formData.neededDate}
                onChange={(val) => setFormData({ ...formData, neededDate: val })}
                required
              />
              <InputGroup 
                icon={<Phone size={16} />} 
                label="Contact Number" 
                placeholder="01XXXXXXXXX" 
                type="tel" 
                value={formData.contactNumber}
                onChange={(val) => setFormData({ ...formData, contactNumber: val })}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e53935] text-white py-3.5 rounded-xl font-bold text-base shadow-lg shadow-red-100 hover:bg-red-700 transition-all active:scale-[0.98] mt-2 flex items-center justify-center"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

function InputGroup({ icon, label, placeholder, type = "text", value, onChange, required }: { icon: React.ReactNode, label: string, placeholder?: string, type?: string, value: string, onChange: (val: string) => void, required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-700 ml-1">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border-0 rounded-xl py-3 pl-10 pr-4 text-gray-900 focus:ring-2 focus:ring-[#e53935] transition-all text-sm"
        />
      </div>
    </div>
  );
}
