import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, Users, Droplet, AlertCircle, Trash2, Shield, Loader2, 
  Search, Heart, Bell, CheckCircle2, XCircle, UserPlus, UserMinus,
  MapPin, Filter, MoreVertical, Settings, Activity, Award, Phone, LogOut
} from 'lucide-react';
import { AdminStats, User, BloodRequest, BloodGroup } from '../types';
import { api } from '../services/api';

interface AdminProps {
  onLogout: () => void;
}

type AdminTab = 'dashboard' | 'users' | 'donors' | 'requests' | 'broadcast';

export default function Admin({ onLogout }: AdminProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState<BloodGroup | 'All'>('All');
  const [announcement, setAnnouncement] = useState({ 
    title: '', 
    message: '', 
    targetGroup: 'all' as 'all' | 'donors',
    bloodGroup: '' as BloodGroup | '',
    district: ''
  });
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, requestsData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getRequests()
      ]);
      setStats(statsData);
      setUsers(usersData);
      setRequests(requestsData);
    } catch (err) {
      console.error('Failed to fetch admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendAnnouncement = async () => {
    if (!announcement.title || !announcement.message) return;
    setSending(true);
    try {
      await api.sendTargetedNotification(
        { 
          targetGroup: announcement.targetGroup,
          bloodGroup: announcement.bloodGroup || undefined,
          district: announcement.district || undefined
        },
        announcement.title,
        announcement.message
      );
      setAnnouncement({ title: '', message: '', targetGroup: 'all', bloodGroup: '', district: '' });
      alert('Notification sent successfully!');
    } catch (err) {
      console.error('Failed to send announcement', err);
    } finally {
      setSending(false);
    }
  };

  const handleToggleBlock = async (userId: string, currentStatus: boolean) => {
    setActionLoading(userId);
    try {
      await api.toggleUserBlock(userId, !currentStatus);
      await fetchData();
    } catch (err) {
      console.error('Failed to toggle block', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: 'user' | 'admin') => {
    setActionLoading(userId);
    try {
      await api.updateUserRole(userId, currentRole === 'admin' ? 'user' : 'admin');
      await fetchData();
    } catch (err) {
      console.error('Failed to toggle role', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleVerify = async (userId: string, currentStatus: boolean) => {
    setActionLoading(userId);
    try {
      await api.toggleDonorVerification(userId, !currentStatus);
      await fetchData();
    } catch (err) {
      console.error('Failed to toggle verification', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestAction = async (requestId: string, action: 'Approved' | 'Cancelled' | 'Completed') => {
    setActionLoading(requestId);
    try {
      if (action === 'Completed') {
        await api.forceCompleteRequest(requestId);
      } else {
        await api.updateRequestStatus(requestId, action);
      }
      await fetchData();
    } catch (err) {
      console.error('Failed to update request', err);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`)) return;
    setActionLoading(id);
    try {
      await api.deleteUser(id);
      setUsers(users.filter(u => u.id !== id));
      // Refresh stats
      const statsData = await api.getAdminStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to delete user', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.mobile.includes(searchTerm);
    const matchesBloodGroup = filterBloodGroup === 'All' || u.bloodGroup === filterBloodGroup;
    return matchesSearch && matchesBloodGroup;
  });

  const filteredDonors = users.filter(u => u.heroMode || u.totalDonations > 0).filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.mobile.includes(searchTerm);
    const matchesBloodGroup = filterBloodGroup === 'All' || u.bloodGroup === filterBloodGroup;
    return matchesSearch && matchesBloodGroup;
  });

  const filteredRequests = requests.filter(r => 
    r.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.hospital.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#f8fafc]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 size={40} className="text-[#ef4444]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] font-sans">
      {/* Premium Header */}
      <div className="bg-gradient-to-br from-[#ef4444] to-[#f97316] px-5 pt-8 pb-8 rounded-b-[32px] shadow-2xl shadow-red-200/50 relative overflow-hidden">
        {/* Decorative background elements */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-20%] right-[-10%] w-48 h-48 bg-white rounded-full blur-3xl opacity-10" 
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute bottom-[-10%] left-[-5%] w-32 h-32 bg-black rounded-full blur-2xl opacity-5" 
        />
        
        <div className="flex items-center justify-between relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-xl font-black text-white tracking-tight">Admin Panel</h1>
            <div className="flex items-center space-x-2 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-red-50 text-[9px] font-bold uppercase tracking-widest opacity-90">
                System Live
              </p>
            </div>
          </motion.div>
          <div className="flex items-center space-x-3">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 bg-white/15 backdrop-blur-xl rounded-xl flex items-center justify-center text-white relative border border-white/20"
            >
              <Bell size={18} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-yellow-400 rounded-full border-2 border-[#ef4444]" />
            </motion.button>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="w-9 h-9 bg-white rounded-xl p-0.5 shadow-xl border border-white/30"
            >
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Admin`} 
                alt="Admin" 
                className="w-full h-full rounded-[10px] object-cover"
              />
            </motion.div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="w-9 h-9 bg-white/15 backdrop-blur-xl rounded-xl flex items-center justify-center text-white border border-white/20"
            >
              <LogOut size={18} />
            </motion.button>
          </div>
        </div>

        {/* Search Bar in Header */}
        {(activeTab === 'users' || activeTab === 'donors' || activeTab === 'requests') && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 relative z-10"
          >
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-red-100 group-focus-within:text-white transition-colors" size={18} />
              <input 
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl py-3 pl-12 pr-5 text-sm text-white placeholder:text-red-100 focus:outline-none focus:ring-4 focus:ring-white/20 focus:bg-white/20 transition-all shadow-inner"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Segmented Control Navigation */}
      <div className="px-5 -mt-6 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-xl p-1.5 rounded-2xl shadow-2xl shadow-gray-200/60 flex items-center border border-white"
        >
          <NavTab active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} label="Home" icon={<Activity size={18} />} />
          <NavTab active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="Users" icon={<Users size={18} />} />
          <NavTab active={activeTab === 'donors'} onClick={() => setActiveTab('donors')} label="Donors" icon={<Droplet size={18} />} />
          <NavTab active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} label="Requests" icon={<Heart size={18} />} />
        </motion.div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <PremiumStatCard 
                icon={<Users size={18} />} 
                label="Total Users" 
                value={stats?.totalUsers || 0} 
                gradient="from-blue-500 to-blue-600"
                bgLight="bg-blue-50"
              />
              <PremiumStatCard 
                icon={<Droplet size={18} />} 
                label="Total Donors" 
                value={stats?.totalDonors || 0} 
                gradient="from-red-500 to-red-600"
                bgLight="bg-red-50"
              />
              <PremiumStatCard 
                icon={<Activity size={18} />} 
                label="Active Now" 
                value={stats?.activeDonors || 0} 
                gradient="from-green-500 to-green-600"
                bgLight="bg-green-50"
              />
              <PremiumStatCard 
                icon={<Heart size={18} />} 
                label="Requests" 
                value={stats?.totalRequests || 0} 
                gradient="from-orange-500 to-orange-600"
                bgLight="bg-orange-50"
              />
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-black text-gray-900">Quick Actions</h3>
                <button className="text-[10px] font-bold text-[#e53935] uppercase tracking-widest">View All</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <QuickActionBtn 
                  icon={<Bell size={24} />} 
                  label="Broadcast" 
                  onClick={() => setActiveTab('broadcast')}
                />
                <QuickActionBtn 
                  icon={<AlertCircle size={24} />} 
                  label="Requests" 
                  onClick={() => setActiveTab('requests')}
                />
                <QuickActionBtn 
                  icon={<Users size={24} />} 
                  label="Users" 
                  onClick={() => setActiveTab('users')}
                />
                <QuickActionBtn 
                  icon={<Droplet size={24} />} 
                  label="Donors" 
                  onClick={() => setActiveTab('donors')}
                />
              </div>
            </div>

            {/* Recent Activity / Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-black text-gray-900">Recent Requests</h3>
                <button onClick={() => setActiveTab('requests')} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">See More</button>
              </div>
              <div className="space-y-3">
                {requests.slice(0, 3).map(req => (
                  <div key={req.id} className="bg-white p-4 rounded-[24px] shadow-sm border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-[#e53935]">
                        <Droplet size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{req.patientName}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{req.hospital}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-[#e53935]">{req.bloodGroup}</p>
                      <p className="text-[8px] text-gray-400 font-bold uppercase">{req.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'users' || activeTab === 'donors' || activeTab === 'requests') && (
          <div className="space-y-6">
            {activeTab !== 'requests' && (
              <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                {['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <button
                    key={bg}
                    onClick={() => setFilterBloodGroup(bg as any)}
                    className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                      filterBloodGroup === bg 
                        ? 'bg-[#e53935] text-white shadow-lg shadow-red-100' 
                        : 'bg-white text-gray-500 border border-gray-100'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-4">
              {activeTab === 'users' && filteredUsers.map(user => (
                <div key={user.id} className="relative group">
                  <UserListItem 
                    user={user} 
                    onToggleBlock={() => handleToggleBlock(user.id, !!user.isBlocked)}
                    onToggleRole={() => handleToggleRole(user.id, user.role)}
                    loading={actionLoading === user.id}
                  />
                  <button 
                    onClick={() => deleteUser(user.id, user.name)}
                    disabled={actionLoading === user.id}
                    className="absolute top-4 right-4 p-2.5 bg-red-50 text-red-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {activeTab === 'donors' && filteredDonors.map(donor => (
                <div key={donor.id}>
                  <DonorListItem 
                    donor={donor} 
                    onToggleVerify={() => handleToggleVerify(donor.id, !!donor.isVerified)}
                    loading={actionLoading === donor.id}
                  />
                </div>
              ))}
              {activeTab === 'requests' && filteredRequests.map(req => (
                <div key={req.id}>
                  <RequestListItem 
                    request={req} 
                    onAction={(action) => handleRequestAction(req.id, action)}
                    loading={actionLoading === req.id}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'broadcast' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white p-10 rounded-[48px] shadow-2xl shadow-gray-200/50 border border-white space-y-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-[64px] opacity-50" />
              
              <div className="flex items-center space-x-5 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-[#ef4444] to-[#f97316] rounded-3xl flex items-center justify-center text-white shadow-xl shadow-red-100">
                  <Bell size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Broadcast</h3>
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Send global notifications</p>
                </div>
              </div>
              
              <div className="space-y-8 relative z-10">
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Target Audience</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['all', 'donors'].map((group) => (
                      <button
                        key={group}
                        onClick={() => setAnnouncement({ ...announcement, targetGroup: group as any })}
                        className={`py-4 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all border-2 ${
                          announcement.targetGroup === group 
                            ? 'bg-red-50 border-[#ef4444] text-[#ef4444]' 
                            : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {group === 'all' ? 'All Users' : 'Donors Only'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Blood Group</label>
                    <select 
                      value={announcement.bloodGroup}
                      onChange={(e) => setAnnouncement({ ...announcement, bloodGroup: e.target.value as any })}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-[24px] py-4.5 px-6 text-sm font-bold focus:bg-white focus:border-red-100 focus:ring-4 focus:ring-red-50 transition-all appearance-none"
                    >
                      <option value="">Any Group</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">District</label>
                    <input 
                      type="text"
                      placeholder="e.g. Dhaka"
                      value={announcement.district}
                      onChange={(e) => setAnnouncement({ ...announcement, district: e.target.value })}
                      className="w-full bg-gray-50 border-2 border-transparent rounded-[24px] py-4.5 px-6 text-sm font-bold focus:bg-white focus:border-red-100 focus:ring-4 focus:ring-red-50 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Message Content</label>
                  <input 
                    type="text"
                    placeholder="Announcement Title"
                    value={announcement.title}
                    onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-transparent rounded-[24px] py-4.5 px-6 text-sm font-bold focus:bg-white focus:border-red-100 focus:ring-4 focus:ring-red-50 transition-all mb-4"
                  />
                  <textarea 
                    placeholder="Write your message here..."
                    value={announcement.message}
                    onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                    rows={5}
                    className="w-full bg-gray-50 border-2 border-transparent rounded-[32px] py-5 px-7 text-sm font-bold focus:bg-white focus:border-red-100 focus:ring-4 focus:ring-red-50 resize-none transition-all"
                  />
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSendAnnouncement}
                  disabled={sending || !announcement.title || !announcement.message}
                  className="w-full bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white py-6 rounded-[28px] font-black text-sm shadow-2xl shadow-red-200/50 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center space-x-4 uppercase tracking-[0.25em]"
                >
                  {sending ? <Loader2 size={24} className="animate-spin" /> : <Bell size={24} />}
                  <span>{sending ? 'Sending...' : 'Send Broadcast'}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function NavTab({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
        active 
          ? 'bg-gradient-to-r from-[#ef4444] to-[#f97316] text-white shadow-xl shadow-red-200/60 scale-[1.02]' 
          : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
      }`}
    >
      <span className={`${active ? 'scale-110' : 'scale-100'} transition-transform`}>{icon}</span>
      <span className={active ? 'block' : 'hidden sm:block'}>{label}</span>
    </button>
  );
}

function PremiumStatCard({ icon, label, value, gradient, bgLight }: { icon: React.ReactNode, label: string, value: number, gradient: string, bgLight: string }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-xl shadow-gray-200/40 border border-gray-50 relative overflow-hidden group hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-500">
      <div className={`absolute top-0 right-0 w-16 h-16 ${bgLight} rounded-bl-[32px] opacity-40 group-hover:scale-125 transition-transform duration-700`} />
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${gradient} text-white shadow-lg shadow-gray-200/50 group-hover:rotate-6 transition-transform`}>
        {icon}
      </div>
      <p className="text-2xl font-black text-gray-900 tracking-tight">{value.toLocaleString()}</p>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}

function QuickActionBtn({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <motion.button 
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick} 
      className="bg-gradient-to-br from-[#ef4444] to-[#f97316] p-5 sm:p-6 rounded-[32px] shadow-xl shadow-red-100/50 flex flex-col items-center space-y-4 transition-all group relative overflow-hidden"
    >
      <div className="absolute top-[-20%] right-[-20%] w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
      <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-[22px] flex items-center justify-center text-white shadow-inner border border-white/20">
        {icon}
      </div>
      <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">{label}</span>
    </motion.button>
  );
}

function UserListItem({ user, onToggleBlock, onToggleRole, loading }: { user: User, onToggleBlock: () => void | Promise<void>, onToggleRole: () => void | Promise<void>, loading: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`bg-white p-5 sm:p-6 rounded-[28px] shadow-xl shadow-gray-200/30 border border-gray-100 flex items-center justify-between group hover:shadow-2xl hover:shadow-gray-200/50 transition-all ${user.isBlocked ? 'opacity-60 grayscale' : ''}`}
    >
      <div className="flex items-center space-x-5">
        <div className="w-16 h-16 bg-gray-50 rounded-[24px] p-1 shadow-inner border border-gray-100 group-hover:scale-105 transition-transform">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-full h-full rounded-[20px] object-cover" />
        </div>
        <div>
          <div className="flex items-center space-x-2.5">
            <p className="font-black text-gray-900 text-base">{user.name}</p>
            <div className={`w-2 h-2 rounded-full ${user.isBlocked ? 'bg-red-400' : 'bg-green-500'}`} />
          </div>
          <p className="text-xs text-gray-400 font-bold tracking-wide mt-0.5">{user.mobile}</p>
          <div className="flex items-center space-x-3 mt-2.5">
            <span className={`text-[9px] px-3 py-1 rounded-xl font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
              {user.role}
            </span>
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center">
              <Droplet size={10} className="mr-1 text-red-400" />
              {user.bloodGroup} • {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={onToggleRole} 
          disabled={loading} 
          className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all shadow-sm"
        >
          {user.role === 'admin' ? <UserMinus size={20} /> : <UserPlus size={20} />}
        </motion.button>
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={onToggleBlock} 
          disabled={loading} 
          className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-sm ${
            user.isBlocked ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}
        >
          {user.isBlocked ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
        </motion.button>
      </div>
    </motion.div>
  );
}

function DonorListItem({ donor, onToggleVerify, loading }: { donor: User, onToggleVerify: () => void | Promise<void>, loading: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-[32px] shadow-xl shadow-gray-200/30 border border-gray-100 space-y-5 group hover:shadow-2xl hover:shadow-gray-200/50 transition-all"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-5">
          <div className="w-16 h-16 bg-gray-50 rounded-[24px] p-1 shadow-inner border border-gray-100 group-hover:scale-105 transition-transform">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${donor.name}`} alt={donor.name} className="w-full h-full rounded-[20px] object-cover" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <p className="font-black text-gray-900 text-base">{donor.name}</p>
              {donor.isVerified && (
                <div className="bg-blue-500 p-1 rounded-full shadow-lg shadow-blue-100">
                  <CheckCircle2 size={12} className="text-white" />
                </div>
              )}
            </div>
            <div className="flex items-center text-gray-400 mt-1">
              <MapPin size={12} className="mr-1" />
              <p className="text-[10px] font-bold uppercase tracking-widest">{donor.upazila}, {donor.district}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-[#ef4444] leading-none tracking-tight">{donor.bloodGroup}</p>
          <div className="flex items-center justify-end mt-1.5 space-x-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${donor.moodStatus === 'Ready' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className={`text-[9px] font-black uppercase tracking-widest ${donor.moodStatus === 'Ready' ? 'text-green-500' : 'text-yellow-500'}`}>
              {donor.moodStatus}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-5 border-t border-gray-50">
        <div className="flex space-x-8">
          <div>
            <p className="text-sm font-black text-gray-900">{donor.totalDonations}</p>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Donations</p>
          </div>
          <div>
            <p className="text-sm font-black text-gray-900">{donor.lastDonationDate || 'Never'}</p>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Last Date</p>
          </div>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={onToggleVerify} 
          disabled={loading}
          className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm ${
            donor.isVerified 
              ? 'bg-blue-50 text-blue-600 border border-blue-100' 
              : 'bg-gray-50 text-gray-400 border border-gray-100'
          }`}
        >
          {donor.isVerified ? 'Verified' : 'Verify'}
        </motion.button>
      </div>
    </motion.div>
  );
}

function RequestListItem({ request, onAction, loading }: { request: BloodRequest, onAction: (action: 'Approved' | 'Cancelled' | 'Completed') => void | Promise<void>, loading: boolean }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Requested': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Accepted': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Donation Pending Confirmation': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Completed': return 'bg-green-50 text-green-600 border-green-100';
      case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-7 rounded-[32px] shadow-xl shadow-gray-200/30 border border-gray-100 space-y-6 group hover:shadow-2xl hover:shadow-gray-200/50 transition-all"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-5">
          <div className="w-14 h-14 bg-red-50 rounded-[22px] flex items-center justify-center text-[#ef4444] shadow-inner border border-red-100 group-hover:rotate-12 transition-transform">
            <Droplet size={28} />
          </div>
          <div>
            <p className="font-black text-gray-900 text-base">{request.patientName}</p>
            <div className="flex items-center text-gray-400 mt-1">
              <MapPin size={12} className="mr-1" />
              <p className="text-[10px] font-bold uppercase tracking-widest">{request.hospital}</p>
            </div>
          </div>
        </div>
        <span className={`text-[9px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest border ${getStatusColor(request.status)}`}>
          {request.status}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6 py-5 border-y border-gray-50">
        <div className="text-center">
          <p className="text-sm font-black text-gray-900">{request.bloodGroup}</p>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Group</p>
        </div>
        <div className="text-center border-x border-gray-50">
          <p className="text-sm font-black text-gray-900">{request.units}</p>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Units</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-black text-gray-900">{request.urgency}</p>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">Urgency</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex -space-x-3">
            <motion.div 
              whileHover={{ zIndex: 10, scale: 1.1 }}
              className="w-10 h-10 rounded-2xl border-2 border-white bg-gray-100 overflow-hidden shadow-md" 
              title="Requester"
            >
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.requesterId}`} alt="Requester" />
            </motion.div>
            {request.userId && (
              <motion.div 
                whileHover={{ zIndex: 10, scale: 1.1 }}
                className="w-10 h-10 rounded-2xl border-2 border-white bg-red-100 overflow-hidden shadow-md" 
                title="Donor"
              >
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.userId}`} alt="Donor" />
              </motion.div>
            )}
          </div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            {request.userId ? 'Donor Assigned' : 'Finding Donor...'}
          </p>
        </div>
        <div className="flex space-x-3">
          {request.status !== 'Completed' && request.status !== 'Cancelled' && (
            <>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={() => onAction('Cancelled')} 
                disabled={loading}
                className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center hover:bg-red-100 transition-all shadow-sm border border-red-100"
              >
                <XCircle size={22} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAction('Completed')} 
                disabled={loading}
                className="px-7 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-green-100 active:scale-95 transition-all"
              >
                Complete
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
