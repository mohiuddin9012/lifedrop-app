import React, { useState } from 'react';
import { ChevronLeft, MapPin, Phone, Calendar, Heart, ShieldCheck, Droplet, Loader2, CheckCircle2, Info } from 'lucide-react';
import { Donor, User } from '../types';
import { api } from '../services/api';

interface DonorDetailsProps {
  donor: Donor | null;
  onBack: () => void;
}

export default function DonorDetails({ donor, onBack, user, onUpdateUser }: { donor: Donor | null, onBack: () => void, user: User | null, onUpdateUser: (user: User) => void }) {
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);

  if (!donor) return null;

  const handleToggleFavorite = async () => {
    if (!user) return;
    try {
      const updatedUser = await api.toggleFavorite(donor.id);
      onUpdateUser(updatedUser);
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };

  const isFavorite = user?.favorites?.includes(donor.id);

  const handleRequest = async () => {
    setRequesting(true);
    try {
      await api.createRequest({
        patientName: 'Emergency Patient',
        bloodGroup: donor.bloodGroup,
        units: 1,
        hospital: 'Local Hospital',
        district: donor.district,
        upazila: donor.upazila,
        phone: '01700000000',
        time: new Date().toISOString().split('T')[0],
        reason: 'Emergency blood request from donor profile.',
        urgency: 'Critical',
        donorId: donor.id
      });
      setRequested(true);
    } catch (err) {
      console.error('Failed to send request', err);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="relative h-52 bg-red-50 flex items-center justify-center">
        <button
          onClick={onBack}
          className="absolute top-8 left-5 w-9 h-9 bg-white rounded-full flex items-center justify-center text-gray-600 shadow-sm z-10"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-8 right-5 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm z-10 transition-all ${isFavorite ? 'text-[#e53935]' : 'text-gray-300'}`}
        >
          <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
        <div className="w-24 h-24 bg-white rounded-[32px] shadow-lg overflow-hidden border-4 border-white">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${donor.name}`} 
            alt={donor.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -bottom-4 right-10 w-10 h-10 bg-[#e53935] rounded-xl flex items-center justify-center text-white font-black text-base shadow-lg border-4 border-white">
          {donor.bloodGroup}
        </div>
      </div>

      <div className="flex-1 px-5 pt-10 space-y-6 overflow-y-auto scrollbar-hide">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{donor.name}</h1>
          <div className="flex items-center justify-center text-gray-500 mt-1 space-x-3">
            <div className="flex items-center">
              <MapPin size={14} className="mr-1 text-[#e53935]" />
              <span className="text-xs">{donor.upazila}, {donor.district}</span>
            </div>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-1.5 ${
                donor.moodStatus === 'Ready' ? 'bg-green-500' : 
                'bg-yellow-500'
              }`} />
              <span className="text-xs">{donor.moodStatus === 'Ready' ? 'Ready to Donate' : 'Busy'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatBox label="Donations" value={donor.totalDonations?.toString() || '0'} />
          <StatBox label="Last Date" value={donor.lastDonationDate || 'Never'} />
          <StatBox label="Badge" value={donor.badge || 'Newbie'} />
        </div>

        <div className="space-y-3">
          <h3 className="text-base font-bold text-gray-900">Personal Information</h3>
          <div className="space-y-2.5">
            <InfoRow icon={<Phone size={16} />} label="Phone Number" value={donor.mobile || 'Private'} />
            <InfoRow icon={<Calendar size={16} />} label="Last Donation" value={donor.lastDonationDate || 'Never'} />
            <InfoRow icon={<ShieldCheck size={16} />} label="Verified Donor" value="Yes" />
          </div>
        </div>

        <div className="flex space-x-3 pb-6">
          <a 
            href={`tel:${donor.mobile}`}
            className="flex-1 bg-green-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-green-100 active:scale-95 transition-all text-sm"
          >
            <Phone size={18} />
            <span>Call Now</span>
          </a>
          <button 
            onClick={handleRequest}
            disabled={requesting || requested || donor.status !== 'Available'}
            className={`flex-1 py-3.5 rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-red-100 active:scale-95 transition-all text-sm ${requested ? 'bg-green-500 text-white' : 'bg-[#e53935] text-white disabled:opacity-50 disabled:bg-gray-300'}`}
          >
            {requesting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : requested ? (
              <>
                <CheckCircle2 size={18} />
                <span>Requested</span>
              </>
            ) : (
              <>
                <Heart size={18} />
                <span>Request</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string, value: string }) {
  return (
    <div className="bg-gray-50 p-3 rounded-xl text-center">
      <p className="text-[10px] text-gray-500 font-medium mb-0.5">{label}</p>
      <p className="text-base font-bold text-gray-900">{value}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl">
      <div className="flex items-center space-x-3 text-gray-600">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="text-xs font-bold text-gray-900">{value}</span>
    </div>
  );
}
