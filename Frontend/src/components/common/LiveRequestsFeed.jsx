import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocketEvent } from '../../hooks/useSocket';
import searchService from '../../services/searchService';
import { formatTimeAgo } from '../../lib/utils';
import { AlertCircle, ArrowRight } from 'lucide-react';
import Modal from '../ui/Modal';
import BloodGroupBadge from './BloodGroupBadge';
import UrgencyIndicator from './UrgencyIndicator';
import Button from '../ui/Button';

export const LiveRequestsFeed = () => {
  const [feed, setFeed] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Load active emergency requests on mount
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const response = await searchService.getActiveRequests();
        const active = response.requests || response.data || [];
        // Filter for SOS requests
        setFeed(active.filter(r => r.urgencyLevel === 'critical' || r.isSOSRequest).slice(0, 10));
      } catch (err) {
        console.error('Failed to load initial active emergency feeds:', err);
      }
    };
    fetchInitial();
  }, []);

  // Listen to socket triggers
  useSocketEvent('new_sos_alert', (data) => {
    const request = data.request || data;
    setFeed(prev => {
      const exists = prev.some(r => r._id === request._id);
      if (exists) return prev;
      return [request, ...prev.slice(0, 9)];
    });
  });

  // Intercept the custom events from socketStore
  useEffect(() => {
    const handleSOS = (e) => {
      const request = e.detail;
      setFeed(prev => {
        const exists = prev.some(r => r._id === request._id);
        if (exists) return prev;
        return [request, ...prev.slice(0, 9)];
      });
    };
    window.addEventListener('new-sos-alert', handleSOS);
    return () => window.removeEventListener('new-sos-alert', handleSOS);
  }, []);

  // Set up 4-second ticker rotation
  useEffect(() => {
    if (feed.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % feed.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [feed]);

  if (feed.length === 0) {
    return (
      <div className="h-10 bg-blood/10 border-y border-border/80 px-4 flex items-center gap-2 justify-center text-xs text-text-muted font-body animate-pulse select-none z-10 relative">
        <AlertCircle className="w-4 h-4 text-blood shrink-0" />
        <span>Monitoring localized frequencies. No active emergency SOS streams...</span>
      </div>
    );
  }

  const active = feed[currentIndex];

  return (
    <>
      <div
        onClick={() => setSelectedRequest(active)}
        className="h-10 bg-blood/15 border-y border-border hover:bg-blood/20 cursor-pointer transition-colors px-4 flex items-center justify-between text-xs text-white font-body relative overflow-hidden group select-none z-10"
      >
        <div className="flex items-center gap-3 w-full justify-center sm:justify-start">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-critical opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-critical"></span>
          </span>
          <span className="font-bold text-critical font-mono uppercase tracking-wider bg-critical/10 px-1.5 py-0.5 rounded border border-critical/20">
            LIVE SOS
          </span>
          <div className="truncate max-w-[280px] sm:max-w-md">
            <span className="font-bold text-blood-glow font-mono mr-1">[{active.bloodGroup}]</span>
            Patient needs <span className="font-bold text-text-primary">{active.unitsRequired} units</span> in <span className="font-bold text-text-primary capitalize">{active.city}</span> — <span className="text-[10px] text-text-muted">{formatTimeAgo(active.createdAt)}</span>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-blood-glow group-hover:translate-x-1 transition-transform">
          <span>Respond</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Selected Request Detail modal */}
      {selectedRequest && (
        <Modal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          title={`🚨 EMERGENCY SOS: ${selectedRequest.bloodGroup} REQUIRED`}
          description="Immediate support needed at the following medical facility."
          footer={
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRequest(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setSelectedRequest(null);
                  navigate('/signup');
                }}
              >
                Respond now
              </Button>
            </div>
          }
        >
          <div className="space-y-4 font-body">
            <div className="grid grid-cols-2 gap-4 border-b border-border pb-4">
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Patient</span>
                <span className="text-sm font-bold text-text-primary">{selectedRequest.patientName}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Blood Group</span>
                <BloodGroupBadge group={selectedRequest.bloodGroup} size="sm" className="mt-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-border pb-4">
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Units Required</span>
                <span className="text-sm font-bold text-blood-glow font-mono">{selectedRequest.unitsRequired} units</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Urgency</span>
                <UrgencyIndicator level={selectedRequest.urgencyLevel} className="mt-1" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Hospital & Location</span>
              <p className="text-xs text-text-primary leading-relaxed font-semibold">
                {selectedRequest.hospitalName}
              </p>
              <p className="text-xs text-text-muted capitalize">
                {selectedRequest.city}
              </p>
            </div>

            {selectedRequest.notes && (
              <div className="p-3 bg-white/5 border border-white/5 rounded-lg text-xs text-text-muted leading-relaxed">
                <span className="font-bold text-text-primary block mb-1">Additional Notes</span>
                {selectedRequest.notes}
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};

export default LiveRequestsFeed;
