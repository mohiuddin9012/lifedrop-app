import React, { useState, useEffect } from 'react';
import { ChevronLeft, Activity, CheckCircle2, Clock, AlertCircle, Loader2, Droplet, User as UserIcon, Heart } from 'lucide-react';
import { BloodRequest, User } from '../types';
import { api } from '../services/api';

interface RequestManagementProps {
  user: User | null;
  onBack: () => void;
}

export default function RequestManagement({ user, onBack }: RequestManagementProps) {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getMyRequests();
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch requests', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    setActionLoading(requestId);
    try {
      await api.acceptRequest(requestId);
      await fetchRequests();
    } catch (err) {
      console.error('Failed to accept request', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirm = async (requestId: string, role: 'sender' | 'donor') => {
    setActionLoading(requestId);
    try {
      await api.confirmDonation(requestId, role);
      await fetchRequests();
    } catch (err) {
      console.error('Failed to confirm donation', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Requested': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Accepted': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Donation Pending Confirmation': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'Completed': return 'bg-green-50 text-green-600 border-green-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
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
          <h1 className="text-xl font-bold text-gray-900">My Requests</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <Loader2 size={32} className="animate-spin text-[#e53935]" />
            <p className="text-gray-500 text-sm font-medium">Loading requests...</p>
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-3">
            {requests.map((req) => {
              const isDonor = req.userId === user?.uid;
              const isRequester = req.requesterId === user?.uid;
              
              return (
                <div key={req.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-3.5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center text-[#e53935]">
                        <Droplet size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-xs">{req.patientName}</h4>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                          {isDonor ? 'Incoming Request' : 'Sent Request'}
                        </p>
                      </div>
                    </div>
                    <div className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${getStatusColor(req.status)}`}>
                      {req.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-2 border-y border-gray-50">
                    <div className="flex items-center space-x-2">
                      <Clock size={12} className="text-gray-400" />
                      <span className="text-[10px] text-gray-600">{req.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Droplet size={12} className="text-[#e53935]" />
                      <span className="text-[10px] font-bold text-gray-900">{req.bloodGroup}</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    {/* Action Buttons */}
                    {req.status === 'Requested' && isDonor && (
                      <button
                        onClick={() => handleAccept(req.id)}
                        disabled={actionLoading === req.id}
                        className="w-full bg-[#e53935] text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-red-100 active:scale-95 transition-all flex items-center justify-center space-x-2"
                      >
                        {actionLoading === req.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                        <span>Accept Request</span>
                      </button>
                    )}

                    {req.status === 'Accepted' && (
                      <div className="flex flex-col space-y-2">
                        {isDonor && !req.donorConfirmed && (
                          <button
                            onClick={() => handleConfirm(req.id, 'donor')}
                            disabled={actionLoading === req.id}
                            className="w-full bg-green-500 text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-green-100 active:scale-95 transition-all flex items-center justify-center space-x-2"
                          >
                            {actionLoading === req.id ? <Loader2 size={16} className="animate-spin" /> : <Droplet size={16} />}
                            <span>I donated blood</span>
                          </button>
                        )}
                        {isRequester && !req.senderConfirmed && (
                          <button
                            onClick={() => handleConfirm(req.id, 'sender')}
                            disabled={actionLoading === req.id}
                            className="w-full bg-blue-500 text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-blue-100 active:scale-95 transition-all flex items-center justify-center space-x-2"
                          >
                            {actionLoading === req.id ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} />}
                            <span>I received blood</span>
                          </button>
                        )}
                      </div>
                    )}

                    {req.status === 'Donation Pending Confirmation' && (
                      <div className="space-y-2.5">
                        <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-100 flex items-start space-x-2">
                          <AlertCircle size={14} className="text-purple-600 mt-0.5" />
                          <p className="text-[9px] text-purple-700 font-medium leading-relaxed">
                            Waiting for the other person to confirm. Donation count will update once both confirm.
                          </p>
                        </div>
                        {isDonor && !req.donorConfirmed && (
                          <button
                            onClick={() => handleConfirm(req.id, 'donor')}
                            disabled={actionLoading === req.id}
                            className="w-full bg-green-500 text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-green-100 active:scale-95 transition-all flex items-center justify-center space-x-2"
                          >
                            {actionLoading === req.id ? <Loader2 size={16} className="animate-spin" /> : <Droplet size={16} />}
                            <span>I donated blood</span>
                          </button>
                        )}
                        {isRequester && !req.senderConfirmed && (
                          <button
                            onClick={() => handleConfirm(req.id, 'sender')}
                            disabled={actionLoading === req.id}
                            className="w-full bg-blue-500 text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-blue-100 active:scale-95 transition-all flex items-center justify-center space-x-2"
                          >
                            {actionLoading === req.id ? <Loader2 size={16} className="animate-spin" /> : <Heart size={16} />}
                            <span>I received blood</span>
                          </button>
                        )}
                      </div>
                    )}

                    {req.status === 'Completed' && (
                      <div className="bg-green-50 p-2.5 rounded-xl border border-green-100 flex items-center justify-center space-x-2">
                        <CheckCircle2 size={14} className="text-green-600" />
                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">Donation Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
              <Activity size={32} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">No Activity Yet</h3>
              <p className="text-gray-500 text-xs max-w-[180px] mx-auto mt-0.5">
                Your blood requests and donation history will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
