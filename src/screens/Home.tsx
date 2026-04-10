import React, { useState, useEffect } from 'react';
import { Search, Bell, MapPin, Droplet, Heart, Users, Activity, Menu, Loader2, User as UserIcon } from 'lucide-react';
import { Screen } from '../App';
import { Donor, User } from '../types';
import { api } from '../services/api';

interface HomeProps {
  user: User | null;
  onNavigate: (screen: Screen) => void;
  onViewDonor: (donor: Donor) => void;
  onUpdateUser: (user: User) => void;
  currentLocation: { district: string; upazila: string } | null;
  unreadCount?: number;
}

export default function Home({ user, onNavigate, onViewDonor, onUpdateUser, currentLocation, unreadCount = 0 }: HomeProps) {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ totalDonors: '0', activeDonors: '0', livesSaved: '0' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const donorData = await api.getDonors();
        setDonors(donorData);
        
        // Calculate stats from the same data source
        const totalDonorsCount = donorData.length;
        const activeDonorsCount = donorData.filter(d => d.moodStatus === 'Ready').length;
        const totalLivesSaved = donorData.reduce((acc, d) => acc + (d.livesSaved || 0), 0);

        setStats({
          totalDonors: totalDonorsCount >= 1000 ? (totalDonorsCount / 1000).toFixed(1) + 'k' : totalDonorsCount.toString(),
          activeDonors: activeDonorsCount >= 1000 ? (activeDonorsCount / 1000).toFixed(1) + 'k' : activeDonorsCount.toString(),
          livesSaved: totalLivesSaved >= 1000 ? (totalLivesSaved / 1000).toFixed(1) + 'k' : totalLivesSaved.toString(),
        });
      } catch (err) {
        console.error('Failed to fetch home data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    // Simulate location-based reminder
    const locationTimer = setTimeout(() => {
      // In a real app, use navigator.geolocation
      console.log('Location check: Near a hospital');
    }, 5000);

    // Simulate situation-based alert
    const situationTimer = setTimeout(() => {
      const situations = [
        "Blood demand may be high today due to Eid celebrations.",
        "Emergency alert: High demand for O- blood in Dhaka area.",
        "Monsoon season: Blood reserves are low, consider donating."
      ];
      const randomSituation = situations[Math.floor(Math.random() * situations.length)];
      console.log('Situation alert:', randomSituation);
    }, 10000);

    return () => {
      clearTimeout(locationTimer);
      clearTimeout(situationTimer);
    };
  }, [user]);

  const filteredDonors = donors.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.district.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const handleSilentEmergency = async () => {
    if (!user) return;
    try {
      setLoading(true);
      await api.createRequest({
        patientName: `Emergency (${user.name})`,
        bloodGroup: user.bloodGroup,
        units: 1,
        hospital: 'Nearby Hospital (Auto-detected)',
        district: user.district,
        upazila: user.upazila,
        contactNumber: user.mobile,
        reason: 'Silent Emergency Request',
        urgency: 'Critical',
      });
      alert('Silent Emergency Request sent successfully!');
    } catch (err) {
      console.error('Failed to send silent emergency', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleHeroMode = async () => {
    if (!user) return;
    try {
      const updatedUser = await api.toggleHeroMode();
      onUpdateUser(updatedUser);
      alert(`Hero Mode ${updatedUser.heroMode ? 'Activated' : 'Deactivated'}!`);
    } catch (err) {
      console.error('Failed to toggle hero mode', err);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-10 pb-6 rounded-b-[28px] shadow-sm relative z-20">
        <div className="flex justify-between items-center mb-5">
          <button 
            onClick={() => {}}
            className="w-11 h-11 bg-gray-50 rounded-full flex items-center justify-center text-gray-600"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center space-x-1.5">
            <MapPin size={18} className="text-red-500" />
            <span className="font-bold text-gray-900 text-base tracking-tight">
              {currentLocation ? `${currentLocation.upazila}, ${currentLocation.district}` : (user ? `${user.upazila}, ${user.district}` : 'Detecting location...')}
            </span>
          </div>
          <button 
            onClick={() => onNavigate('notifications')}
            className="w-11 h-11 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by blood group, location..."
            className="w-full bg-gray-50 border-0 rounded-[20px] py-4 pl-12 pr-6 text-gray-900 focus:ring-2 focus:ring-red-500 transition-all placeholder:text-gray-400 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 px-2">
          <QuickAction 
            icon={<Droplet size={24} />} 
            label="Donate" 
            color="bg-red-50 text-red-500" 
            onClick={() => {}}
          />
          <QuickAction 
            icon={<Heart size={24} />} 
            label="Emergency" 
            color="bg-orange-50 text-orange-500" 
            onClick={() => onNavigate('blood_request')}
            onLongPress={handleSilentEmergency}
            isEmergency
          />
          <QuickAction 
            icon={<MapPin size={24} />} 
            label="Nearby" 
            color="bg-green-50 text-green-500" 
            onClick={() => onNavigate('nearby_donors')}
          />
        </div>

        {/* Stats Card */}
        <div className="bg-[#e53935] rounded-[24px] p-6 text-white shadow-xl relative overflow-hidden mx-1">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-5 tracking-tight">Community Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-2xl font-black">{stats.totalDonors}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">Donors</p>
              </div>
              <div>
                <p className="text-2xl font-black">{stats.activeDonors}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">Active</p>
              </div>
              <div>
                <p className="text-2xl font-black">{stats.livesSaved}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mt-1">Lives Saved</p>
              </div>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-15 rotate-12">
            <Droplet size={100} fill="white" strokeWidth={0} />
          </div>
        </div>

        {/* Available Donors */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold text-gray-900">Available Donors</h3>
            <button 
              onClick={() => onNavigate('donor_list')}
              className="text-red-500 font-bold text-xs"
            >
              See All
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 size={24} className="animate-spin text-red-500" />
            </div>
          ) : filteredDonors.length > 0 ? (
            <div className="space-y-3">
              {filteredDonors.slice(0, 5).map((donor) => (
                <DonorCard 
                  key={donor.id} 
                  donor={donor} 
                  onClick={() => onViewDonor(donor)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-400 text-sm">No donors found</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-50 px-8 py-4 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.03)] relative z-30">
        <NavButton icon={<Activity size={24} />} active />
        <NavButton icon={<Users size={24} />} onClick={() => onNavigate('donor_list')} />
        
        <div className="relative -mt-10">
          <button 
            onClick={toggleHeroMode}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl shadow-red-200 transition-all active:scale-90 border-4 border-white ${user?.heroMode ? 'bg-orange-500' : 'bg-[#e53935]'}`}
          >
            <Droplet size={28} fill="white" strokeWidth={1.5} className={user?.heroMode ? 'animate-pulse' : ''} />
          </button>
        </div>

        <NavButton icon={<Bell size={24} />} onClick={() => onNavigate('notifications')} />
        <NavButton icon={<UserIcon size={24} />} onClick={() => onNavigate('profile')} />
      </div>
    </div>
  );
}

function QuickAction({ icon, label, color, onClick, isEmergency, onLongPress }: { icon: React.ReactNode, label: string, color: string, onClick: () => void, isEmergency?: boolean, onLongPress?: () => void }) {
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isPressing, setIsPressing] = useState(false);

  const handleStart = () => {
    if (!isEmergency || !onLongPress) return;
    setIsPressing(true);
    timerRef.current = setTimeout(() => {
      onLongPress();
      setIsPressing(false);
    }, 2000); // 2 seconds for silent emergency
  };

  const handleEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsPressing(false);
  };

  return (
    <button 
      onClick={onClick}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onFocus={handleStart}
      onBlur={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      className="flex flex-col items-center space-y-2 group"
    >
      <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center transition-all group-active:scale-95 ${color} shadow-sm`}>
        {icon}
      </div>
      <span className="text-sm font-bold text-gray-600 tracking-tight">{label}</span>
    </button>
  );
}

function DonorCard({ donor, onClick }: { donor: Donor, onClick: () => void, key?: string }) {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-[20px] shadow-sm border border-gray-50 flex items-center space-x-4 active:scale-[0.98] transition-all cursor-pointer group hover:shadow-md"
    >
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 bg-gray-100 rounded-full overflow-hidden border-2 border-white shadow-sm">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${donor.name}`} 
            alt={donor.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
          donor.moodStatus === 'Ready' ? 'bg-green-500' : 'bg-yellow-500'
        }`}></div>
      </div>
      <div className="flex-1">
        <h4 className="font-black text-gray-900 text-base tracking-tight">{donor.name}</h4>
        <div className="flex items-center text-xs text-gray-400 mt-0.5 font-medium">
          <MapPin size={12} className="mr-1 opacity-70" />
          <span className="truncate">{donor.upazila}, {donor.district}</span>
        </div>
      </div>
      <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center border border-red-100/50">
        <span className="text-[#e53935] font-black text-sm">{donor.bloodGroup}</span>
      </div>
    </div>
  );
}

function NavButton({ icon, active, onClick }: { icon: React.ReactNode, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`p-2 rounded-xl transition-colors ${active ? 'text-[#e53935] bg-red-50' : 'text-gray-400 hover:text-gray-600'}`}
    >
      {icon}
    </button>
  );
}
