import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Plus, ClipboardList, CheckCircle, Clock, Heart, Building2 } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import BloodRequestCard from '../../components/common/BloodRequestCard';
import DonorCard from '../../components/common/DonorCard';
import HospitalCard from '../../components/common/HospitalCard';
import EmptyState from '../../components/ui/EmptyState';
import CardSkeleton from '../../components/ui/Skeleton';
import seekerService from '../../services/seekerService';
import searchService from '../../services/searchService';
import { toast } from 'react-hot-toast';

export const SeekerDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    pending: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [donors, setDonors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, requestsRes, donorRes, hospitalRes] = await Promise.all([
        seekerService.getDashboard(),
        seekerService.getRequests({ limit: 3 }),
        searchService.searchDonors({ limit: 4 }),
        searchService.searchHospitals({ limit: 4 }),
      ]);

      // Backend returns { success, data: { stats: { totalRequests, pendingRequests, processingRequests, completedRequests, sosRequests }, recentRequests } }
      const dashboardData = dashboardRes?.data || dashboardRes?.data?.data || dashboardRes;
      const statsPayload = dashboardData?.stats || dashboardData?.data?.stats || dashboardRes?.data?.data?.stats || {};

      // Map backend stats to UI fields
      const total = statsPayload.totalRequests || 0;
      const pending = statsPayload.pendingRequests || 0;
      const processing = statsPayload.processingRequests || 0;
      const completed = statsPayload.completedRequests || 0;
      const active = (pending || 0) + (processing || 0);

      setStats({ total, active, completed, pending });

      // Recent requests: prefer explicit recentRequests from dashboard, otherwise fallback to separate requests call
      const recent = dashboardData?.recentRequests || dashboardRes?.data?.recentRequests || requestsRes?.data || requestsRes?.data?.data || requestsRes;
      setRecentRequests(Array.isArray(recent) ? recent : (recent?.data || []));
      setDonors(donorRes.donors || donorRes.data || donorRes || []);
      setHospitals(hospitalRes.hospitals || hospitalRes.data || hospitalRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen for socket events to keep dashboard synced
    const handleStatusSync = () => fetchDashboardData();
    window.addEventListener('request-status-update', handleStatusSync);
    window.addEventListener('request-accepted', handleStatusSync);
    
    return () => {
      window.removeEventListener('request-status-update', handleStatusSync);
      window.removeEventListener('request-accepted', handleStatusSync);
    };
  }, []);

  const handleCancelRequest = async (id) => {
    if (window.confirm('Are you sure you want to cancel this emergency request?')) {
      try {
        await seekerService.cancelRequest(id);
        toast.success('Blood request cancelled successfully.');
        fetchDashboardData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <DashboardLayout title="Seeker Dashboard">
      
      {/* Quick Request shortcuts card */}
      <Card className="border-t-2 border-t-blood shadow-blood/5 overflow-hidden">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-blood/10 border border-blood/20 text-blood animate-pulse shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider font-mono">
                Urgent Patient Care Coordinator
              </h3>
              <p className="text-xs text-text-muted mt-0.5 max-w-md leading-relaxed">
                Need units of blood for an active patient? Click the action button to draft and broadcast a localized emergency SOS request immediately.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/seeker/requests/new')}
            icon={<Plus className="w-4 h-4" />}
            className="w-full sm:w-auto text-xs uppercase tracking-wider font-display font-semibold py-3 px-5 shrink-0"
          >
            New Request
          </Button>
        </CardContent>
      </Card>

      {/* Stats Indicators Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Posted"
          value={stats.total}
          icon={ClipboardList}
          trendColor="info"
          trend="+0"
        />
        <StatCard
          title="Active Emergencies"
          value={stats.active}
          icon={Activity}
          trendColor="critical"
          trend="+0"
        />
        <StatCard
          title="Completed Help"
          value={stats.completed}
          icon={CheckCircle}
          trendColor="success"
          trend="+0"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pending}
          icon={Clock}
          trendColor="warning"
          trend="+0"
        />
      </div>

      {/* Recent requests list */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end border-b border-border/80 pb-3">
          <h3 className="font-display text-lg tracking-wider text-text-primary uppercase">
            Your Recent Requests
          </h3>
          <Link
            to="/seeker/requests"
            className="text-xs font-bold text-blood hover:text-blood-glow hover:underline transition-all flex items-center gap-1.5"
          >
            <span>View All Requests</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            <CardSkeleton className="h-40" />
            <CardSkeleton className="h-40" />
          </div>
        ) : recentRequests.length === 0 ? (
          <EmptyState
            title="No Active Requests"
            message="You haven't posted any blood requests yet. If you need coordination assistance, create an emergency request."
            icon={ClipboardList}
            actionLabel="Create Request Now"
            onAction={() => navigate('/seeker/requests/new')}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {recentRequests.map((req) => (
              <BloodRequestCard
                key={req._id}
                request={req}
                onCancel={handleCancelRequest}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Verified Donors</h3>
          <Button variant="outline" size="sm" onClick={() => navigate('/seeker/requests/new')}>
            Request Support
          </Button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, index) => (
              <CardSkeleton key={index} className="h-56" />
            ))}
          </div>
        ) : donors.length === 0 ? (
          <EmptyState
            title="No Donors Available"
            message="We couldn't find matched donors right now. Please check back soon or modify your search criteria."
            icon={Heart}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {donors.map((donor) => (
              <DonorCard key={donor._id || donor.user?._id} donor={donor} />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Partner Hospitals</h3>
          <Button variant="outline" size="sm" onClick={() => navigate('/') }>
            Explore Hospitals
          </Button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(2)].map((_, index) => (
              <CardSkeleton key={index} className="h-64" />
            ))}
          </div>
        ) : hospitals.length === 0 ? (
          <EmptyState
            title="No Hospitals Found"
            message="No nearby hospitals are available to display right now."
            icon={Building2}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hospitals.map((hospital) => (
              <HospitalCard
                key={hospital._id || hospital.user?._id}
                hospital={hospital}
                stock={hospital.stock || []}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SeekerDashboard;
