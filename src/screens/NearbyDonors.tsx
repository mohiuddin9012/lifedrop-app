import React, { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, Phone, Info, Droplet, Loader2, Heart } from 'lucide-react';
import { Donor, User } from '../types';
import { api } from '../services/api';

interface NearbyDonorsProps {
  user: User | null;
  onBack: () => void;
  onViewDonor: (donor: Donor) => void;
  onUpdateUser: (user: User) => void;
  currentLocation: { district: string; upazila: string } | null;
}

export default function NearbyDonors({ user, onBack, onViewDonor, onUpdateUser, currentLocation }: NearbyDonorsProps) {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchNearbyDonors = async () => {
      setLoading(true);
      try {
        const allDonors = await api.getDonors();
        if (!isMounted) return;

        const targetDistrict = currentLocation?.district || user?.district;
        const targetUpazila = currentLocation?.upazila || user?.upazila;

        if (targetDistrict && targetUpazila) {
          const nearby = allDonors.filter(d => 
            d.district.toLowerCase().trim() === targetDistrict.toLowerCase().trim() &&
            d.upazila.toLowerCase().trim() === targetUpazila.toLowerCase().trim()
          );
          setDonors(nearby);
        } else {
          setDonors([]);
        }
      } catch (err) {
        console.error('Failed to fetch nearby donors', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNearbyDonors();
    return () => { isMounted = false; };
  }, [currentLocation, user?.district, user?.upazila]);

  const handleToggleFavorite = async (donorId: string) => {
    if (!user) return;
    try {
      const updatedUser = await api.toggleFavorite(donorId);
      onUpdateUser(updatedUser);
    } catch (err) {
      console.error('Failed to toggle favorite', err);
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
          <div>
            <h1 className="text-xl font-bold text-gray-900">Nearby Donors</h1>
            <div className="flex items-center text-gray-500 text-[10px] mt-0.5">
              <MapPin size={10} className="mr-1 text-[#e53935]" />
              <span>
                {currentLocation 
                  ? `${currentLocation.upazila}, ${currentLocation.district}` 
                  : (user ? `${user.upazila}, ${user.district}` : 'Unknown Location')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <Loader2 size={32} className="animate-spin text-[#e53935]" />
            <p className="text-gray-500 text-sm font-medium">Finding nearby donors...</p>
          </div>
        ) : donors.length > 0 ? (
          <div className="space-y-3">
            <div className="bg-green-50 p-3 rounded-xl border border-green-100 mb-1">
              <p className="text-[10px] text-green-700 font-medium">
                Showing {donors.length} donors in your immediate area.
              </p>
            </div>
            {donors.map((donor) => (
              <DonorCard 
                key={donor.id} 
                donor={donor} 
                onClick={() => onViewDonor(donor)}
                onToggleFavorite={() => handleToggleFavorite(donor.id)}
                isFavorite={user?.favorites?.includes(donor.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
              <Droplet size={32} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">No Nearby Donors</h3>
              <p className="text-gray-500 text-xs max-w-[180px] mx-auto mt-0.5">
                We couldn't find any donors in your current area. Try checking the main community list.
              </p>
              <button 
                onClick={onBack}
                className="mt-4 text-[#e53935] font-bold text-xs"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DonorCard({ donor, onClick, onToggleFavorite, isFavorite }: { donor: Donor, onClick: () => void, onToggleFavorite?: () => void, isFavorite?: boolean, key?: string }) {
  return (
    <div className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 space-y-3.5 relative">
      {onToggleFavorite && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-all ${isFavorite ? 'bg-red-50 text-[#e53935]' : 'bg-gray-50 text-gray-300'}`}
        >
          <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      )}
      <div className="flex items-center space-x-3.5">
        <div className="relative">
          <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${donor.name}`} 
              alt={donor.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
            donor.moodStatus === 'Ready' ? 'bg-green-500' : 'bg-yellow-500'
          }`}></div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <h4 className="font-bold text-gray-900 text-base">{donor.name}</h4>
              <span className={`text-[9px] font-bold uppercase tracking-wider ${
                donor.moodStatus === 'Ready' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {donor.moodStatus === 'Ready' ? 'Ready to Donate' : 'Busy'}
              </span>
            </div>
            <div className="px-2 py-0.5 bg-red-50 rounded-lg">
              <span className="text-[#e53935] font-black text-sm">{donor.bloodGroup}</span>
            </div>
          </div>
          <div className="flex flex-col mt-0.5">
            <div className="flex items-center text-xs text-gray-500">
              <MapPin size={12} className="mr-1 text-gray-400" />
              <span>{donor.upazila}, {donor.district}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <div className="text-[10px] text-gray-400">
          Last Donation: <span className="text-gray-600 font-medium">{donor.lastDonationDate || 'Never'}</span>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={onClick}
            className="p-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <Info size={18} />
          </button>
          <a 
            href={`tel:${donor.mobile}`}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-green-500 text-white rounded-lg font-bold text-xs shadow-md shadow-green-100 active:scale-95 transition-all"
          >
            <Phone size={14} />
            <span>Call</span>
          </a>
        </div>
      </div>
    </div>
  );
}
