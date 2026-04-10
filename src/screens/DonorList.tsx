import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, Filter, MapPin, Phone, Info, Droplet, Loader2, Heart } from 'lucide-react';
import { Screen } from '../App';
import { BLOOD_GROUPS, DISTRICTS } from '../constants';
import { Donor, User } from '../types';
import { api } from '../services/api';

interface DonorListProps {
  user: User | null;
  onBack: () => void;
  onViewDonor: (donor: Donor) => void;
  onUpdateUser: (user: User) => void;
  initialFilters?: { district?: string; upazila?: string };
}

export default function DonorList({ user, onBack, onViewDonor, onUpdateUser, initialFilters }: DonorListProps) {
  const [allDonors, setAllDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(!!initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filters, setFilters] = useState({
    bloodGroup: '',
    district: '',
    upazila: '',
    moodStatus: ''
  });

  useEffect(() => {
    fetchAllDonors();
  }, []);

  const fetchAllDonors = async () => {
    setLoading(true);
    try {
      const data = await api.getDonors();
      setAllDonors(data);
    } catch (err) {
      console.error('Failed to fetch donors', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDonors = allDonors.filter(donor => {
    const matchesSearch = !searchQuery || 
      donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.upazila.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBloodGroup = !filters.bloodGroup || donor.bloodGroup === filters.bloodGroup;
    const matchesDistrict = !filters.district || donor.district === filters.district;
    const matchesUpazila = !filters.upazila || donor.upazila.toLowerCase().includes(filters.upazila.toLowerCase());
    const matchesMoodStatus = !filters.moodStatus || donor.moodStatus === filters.moodStatus;

    return matchesSearch && matchesBloodGroup && matchesDistrict && matchesUpazila && matchesMoodStatus;
  });

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
        <div className="flex items-center space-x-3 mb-5">
          <button
            onClick={onBack}
            className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Find Donors</h1>
        </div>

        <div className="flex space-x-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, group, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border-0 rounded-xl py-2.5 pl-10 pr-4 text-gray-900 focus:ring-2 focus:ring-[#e53935] transition-all text-sm"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showFilters ? 'bg-[#e53935] text-white' : 'bg-gray-50 text-gray-600'}`}
          >
            <Filter size={18} />
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 space-y-2.5 animate-in slide-in-from-top duration-300">
            <div className="grid grid-cols-2 gap-2.5">
              <select 
                value={filters.bloodGroup}
                onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
                className="bg-gray-50 border-0 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-[#e53935]"
              >
                <option value="">All Groups</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
              <select 
                value={filters.moodStatus}
                onChange={(e) => setFilters({ ...filters, moodStatus: e.target.value })}
                className="bg-gray-50 border-0 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-[#e53935]"
              >
                <option value="">All Status</option>
                <option value="Ready">Ready to Donate</option>
                <option value="Busy">Busy</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <select 
                value={filters.district}
                onChange={(e) => setFilters({ ...filters, district: e.target.value, upazila: '' })}
                className="bg-gray-50 border-0 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-[#e53935]"
              >
                <option value="">All Districts</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input
                type="text"
                placeholder="Upazila"
                value={filters.upazila}
                onChange={(e) => setFilters({ ...filters, upazila: e.target.value })}
                className="w-full bg-gray-50 border-0 rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-[#e53935]"
              />
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <Loader2 size={32} className="animate-spin text-[#e53935]" />
            <p className="text-gray-500 text-sm font-medium">Finding donors...</p>
          </div>
        ) : filteredDonors.length > 0 ? (
          <div className="space-y-3">
            {filteredDonors.map((donor) => (
              <div key={donor.id}>
                <DonorCard 
                  donor={donor} 
                  onClick={() => onViewDonor(donor)}
                  onToggleFavorite={() => handleToggleFavorite(donor.id)}
                  isFavorite={user?.favorites?.includes(donor.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
              <Droplet size={32} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">No Donors Found</h3>
              <p className="text-gray-500 text-xs max-w-[180px] mx-auto mt-0.5">
                Try adjusting your filters to find donors in other areas.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DonorCard({ donor, onClick, onToggleFavorite, isFavorite }: { donor: Donor, onClick: () => void, onToggleFavorite?: () => void, isFavorite?: boolean }) {
  return (
    <div 
      className="bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100 space-y-3.5 relative"
    >
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
            donor.moodStatus === 'Ready' ? 'bg-green-500' : 
            'bg-yellow-500'
          }`}></div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <h4 className="font-bold text-gray-900 text-base">{donor.name}</h4>
              <span className={`text-[9px] font-bold uppercase tracking-wider ${
                donor.moodStatus === 'Ready' ? 'text-green-600' : 
                'text-yellow-600'
              }`}>
                {donor.moodStatus === 'Ready' ? 'Ready to Donate' : 
                 'Busy'}
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
            {donor.distance && (
              <span className="text-[10px] font-medium text-[#e53935] mt-0.5 ml-4">
                {donor.distance} away
              </span>
            )}
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
