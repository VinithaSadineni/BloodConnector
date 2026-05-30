import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Droplets, TrendingUp, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import BloodGroupBadge from '../../components/common/BloodGroupBadge'
import BloodRequestCard from '../../components/common/BloodRequestCard'
import DonorCard from '../../components/common/DonorCard'
import VerifiedBadge from '../../components/common/VerifiedBadge'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import hospitalService from '../../services/hospitalService'
import searchService from '../../services/searchService'
import { useAuthStore } from '../../store/authStore'
import { toast } from 'react-hot-toast'

const HospitalDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUnits: 0,
    incomingRequests: 0,
    fulfilledRequests: 0,
    activeAlerts: 0,
  })
  const [bloodStock, setBloodStock] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [donors, setDonors] = useState([])
  const [activeRequests, setActiveRequests] = useState([])
  const [showRequestVerification, setShowRequestVerification] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const [dashRes, stockRes, reqRes, donorRes, activeReqRes] = await Promise.all([
        hospitalService.getDashboard(),
        hospitalService.getBloodStock(),
        hospitalService.getIncomingRequests({ limit: 5 }),
        searchService.searchDonors({ limit: 4 }),
        searchService.getActiveRequests(),
      ])

      setStats(dashRes.stats || dashRes)
      setBloodStock(stockRes.stock || stockRes.data || [])
      setIncomingRequests(reqRes.requests || reqRes.data || [])
      setDonors(donorRes.donors || donorRes.data || donorRes || [])
      setActiveRequests(activeReqRes.requests || activeReqRes.data || activeReqRes || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestVerification = async () => {
    setIsVerifying(true)
    try {
      await hospitalService.requestVerification()
      toast.success('Verification request submitted! Admins will review shortly.')
      setShowRequestVerification(false)
      fetchDashboardData()
    } catch (err) {
      console.error(err)
      toast.error('Failed to request verification')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleApproveRequest = async (id) => {
    try {
      await hospitalService.approveRequest(id)
      toast.success('Request approved!')
      fetchDashboardData()
    } catch (err) {
      console.error(err)
      toast.error('Failed to approve request')
    }
  }

  const handleRejectRequest = async (id) => {
    try {
      await hospitalService.rejectRequest(id)
      toast.success('Request rejected')
      fetchDashboardData()
    } catch (err) {
      console.error(err)
      toast.error('Failed to reject request')
    }
  }

  // Count low stock items
  const lowStockCount = bloodStock.filter((item) => item.available < 5).length
  const criticalStockCount = bloodStock.filter((item) => item.available === 0).length

  return (
    <DashboardLayout title="Hospital Dashboard">
      <div className="space-y-6">
        {/* Verification Banner */}
        {!user?.isVerified && (
          <Card className="border-l-4 border-l-warning bg-warning/5">
            <div className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0" />
                <div>
                  <p className="font-bold text-warning uppercase text-xs tracking-wider">Verification Pending</p>
                  <p className="text-sm text-text-muted mt-1">
                    Get verified to unlock priority in request matching and build trust with blood donors.
                  </p>
                </div>
              </div>
              <Button
                variant="warning"
                onClick={() => setShowRequestVerification(true)}
                size="sm"
                className="whitespace-nowrap text-xs"
              >
                Request Verification
              </Button>
            </div>
          </Card>
        )}

        {/* Stats Row */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="card" className="h-32" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Units in Stock"
              value={stats.totalUnits || 0}
              icon={Droplets}
              trendColor="info"
              trend="+0"
            />
            <StatCard
              title="Incoming Requests"
              value={stats.incomingRequests || 0}
              icon={AlertCircle}
              trendColor={stats.incomingRequests > 5 ? 'critical' : 'warning'}
              trend="+0"
            />
            <StatCard
              title="Fulfilled This Month"
              value={stats.fulfilledRequests || 0}
              icon={TrendingUp}
              trendColor="success"
              trend="+0"
            />
            <StatCard
              title="Active Alerts"
              value={criticalStockCount}
              icon={Clock}
              trendColor={criticalStockCount > 0 ? 'critical' : 'success'}
              trend="+0"
            />
          </div>
        )}

        {/* Stock Level Indicator */}
        {lowStockCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-critical/5 border border-critical/30 rounded-lg flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-critical flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-critical text-xs uppercase">Low Stock Alert</p>
              <p className="text-sm text-text-muted mt-1">
                {criticalStockCount} blood group{criticalStockCount !== 1 ? 's' : ''} at critical level (0 units) and{' '}
                {lowStockCount - criticalStockCount} below 5 units.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => navigate('/hospital/stock')}
              className="text-xs whitespace-nowrap"
            >
              Manage Stock
            </Button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Blood Stock Overview */}
          <Card className="lg:col-span-2">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Blood Stock Overview</h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/hospital/stock')}
                  className="text-xs"
                >
                  Manage Stock
                </Button>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[...Array(8)].map((_, i) => (
                    <Skeleton key={i} variant="card" className="h-20" />
                  ))}
                </div>
              ) : bloodStock.length === 0 ? (
                <EmptyState
                  icon="🩸"
                  title="No Stock Data"
                  message="Start managing your blood stock inventory."
                  action={() => navigate('/hospital/stock')}
                  actionLabel="Add Stock"
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {bloodStock.map((item) => {
                    const statusColor =
                      item.available === 0
                        ? 'critical'
                        : item.available < 5
                          ? 'warning'
                          : 'success'
                    return (
                      <motion.div
                        key={item.bloodGroup}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-3 rounded-lg border-2 text-center ${
                          statusColor === 'critical'
                            ? 'border-critical/50 bg-critical/5'
                            : statusColor === 'warning'
                              ? 'border-warning/50 bg-warning/5'
                              : 'border-success/50 bg-success/5'
                        }`}
                      >
                        <BloodGroupBadge group={item.bloodGroup} size="md" />
                        <p
                          className={`text-xs font-bold mt-2 ${
                            statusColor === 'critical'
                              ? 'text-critical'
                              : statusColor === 'warning'
                                ? 'text-warning'
                                : 'text-success'
                          }`}
                        >
                          {item.available} units
                        </p>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </Card>

          {/* Quick Info */}
          <Card>
            <div className="p-6 space-y-4">
              <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Institution Info</h3>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-text-muted mb-1">Name</p>
                  <p className="text-text-primary font-semibold">{user?.institutionName}</p>
                </div>

                <div className="pt-3 border-t border-border/30">
                  <p className="text-xs font-semibold uppercase text-text-muted mb-1">Type</p>
                  <p className="text-text-primary capitalize">{user?.institutionType}</p>
                </div>

                <div className="pt-3 border-t border-border/30">
                  <p className="text-xs font-semibold uppercase text-text-muted mb-1">City</p>
                  <p className="text-text-primary">{user?.city}</p>
                </div>

                <div className="pt-3 border-t border-border/30">
                  <p className="text-xs font-semibold uppercase text-text-muted mb-1">Verification</p>
                  {user?.isVerified ? (
                    <VerifiedBadge />
                  ) : (
                    <div className="inline-flex px-2 py-1 rounded-full bg-warning/10 border border-warning/20">
                      <span className="text-xs font-bold uppercase text-warning">Pending</span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                variant="secondary"
                onClick={() => navigate('/hospital/profile')}
                className="w-full mt-4 text-xs"
              >
                View Full Profile
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Incoming Requests */}
        <div>
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-border/50">
            <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Recent Incoming Requests</h3>
            <button
              onClick={() => navigate('/hospital/requests')}
              className="text-xs font-bold text-blood hover:text-blood-glow hover:underline transition-all"
            >
              View All →
            </button>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} variant="line" className="h-20" />
              ))}
            </div>
          ) : incomingRequests.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No Incoming Requests"
              message="No blood requests have come in yet. You'll see them here when hospitals reach out."
            />
          ) : (
            <div className="space-y-3">
              {incomingRequests.slice(0, 3).map((request) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-surface-2 rounded-lg border border-border/50 hover:border-blood/30 transition-all cursor-pointer"
                  onClick={() => navigate('/hospital/requests')}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BloodGroupBadge group={request.bloodGroup} size="sm" />
                        <span className="text-xs font-semibold text-text-muted">{request.unitsRequired} units</span>
                      </div>
                      <p className="text-sm text-text-primary font-semibold">{request.patientName}</p>
                      <p className="text-xs text-text-muted">{request.seekerCity || 'Unknown location'}</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      handleApproveRequest(request._id);
                    }}>
                      Approve
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Available Donors</h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/') }>
              Explore Donors
            </Button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} variant="card" className="h-56" />
              ))}
            </div>
          ) : donors.length === 0 ? (
            <EmptyState
              title="No Donors Visible"
              message="We couldn't find donors right now. Please refresh later or check back for more availability."
              icon="❤️"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {donors.map((donor) => (
                <DonorCard key={donor._id || donor.user?._id} donor={donor} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Live Seeker Requests</h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/hospital/requests')}>
              View Requests
            </Button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, index) => (
                <Skeleton key={index} variant="card" className="h-56" />
              ))}
            </div>
          ) : activeRequests.length === 0 ? (
            <EmptyState
              title="No Active Requests"
              message="There aren't any live seeker requests at the moment."
              icon="🏥"
              action={() => fetchDashboardData()}
              actionLabel="Refresh"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRequests.slice(0, 3).map((request) => (
                <BloodRequestCard
                  key={request._id}
                  request={request}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Verification Modal */}
      <Modal isOpen={showRequestVerification} onClose={() => setShowRequestVerification(false)}>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-text-primary">Request Verification</h2>
          <p className="text-text-muted">
            Get your institution verified to gain priority in blood request matching and build trust with donors and
            patients.
          </p>
          <div className="space-y-2 text-sm text-text-muted bg-surface-2 p-4 rounded">
            <p>✓ Institution registration certificate</p>
            <p>✓ Blood bank license (if applicable)</p>
            <p>✓ Valid tax ID or registration number</p>
            <p>✓ Contact person verification</p>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowRequestVerification(false)}
              className="flex-1 text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRequestVerification}
              disabled={isVerifying}
              className="flex-1 text-xs"
            >
              {isVerifying ? 'Submitting...' : 'Submit Verification'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default HospitalDashboard
