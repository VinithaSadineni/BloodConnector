import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Heart, Users, Zap, AlertCircle, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import BloodRequestCard from '../../components/common/BloodRequestCard'
import DonorCard from '../../components/common/DonorCard'
import HospitalCard from '../../components/common/HospitalCard'
import VerifiedBadge from '../../components/common/VerifiedBadge'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import * as RadixSwitch from '@radix-ui/react-switch'
import donorService from '../../services/donorService'
import searchService from '../../services/searchService'
import { useAuthStore } from '../../store/authStore'
import { toast } from 'react-hot-toast'

const DonorDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isAvailable, setIsAvailable] = useState(false)
  const [stats, setStats] = useState({
    totalDonations: 0,
    unitsProvided: 0,
    livesHelped: 0,
    eligibilityDays: 0,
  })
  const [nearbyEmergencies, setNearbyEmergencies] = useState([])
  const [eligibilityStatus, setEligibilityStatus] = useState('eligible')
  const [hospitals, setHospitals] = useState([])
  const [activeRequests, setActiveRequests] = useState([])

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const [dashRes, hospitalRes, requestRes] = await Promise.all([
        donorService.getDashboard(),
        searchService.searchHospitals({ limit: 4 }),
        searchService.getActiveRequests(),
      ])

      setStats(dashRes.stats || dashRes)
      setIsAvailable(dashRes.isAvailable || false)
      setEligibilityStatus(dashRes.eligibilityStatus || 'eligible')
      setNearbyEmergencies(dashRes.nearbyEmergencies || [])
      setHospitals(hospitalRes.hospitals || hospitalRes.data || hospitalRes || [])
      setActiveRequests(requestRes.requests || requestRes.data || requestRes || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAvailabilityToggle = async (checked) => {
    try {
      await donorService.toggleAvailability(checked)
      setIsAvailable(checked)
      toast.success(checked ? 'You are now available to donate!' : 'You are now unavailable')
    } catch (err) {
      console.error(err)
      toast.error('Failed to update availability')
    }
  }

  const handleAcceptEmergency = async (id) => {
    try {
      await donorService.acceptRequest(id)
      toast.success('Emergency request accepted!')
      fetchDashboardData()
    } catch (err) {
      console.error('Donor accept request failed:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to accept request'
      toast.error(errorMessage)
    }
  }

  const handleRejectEmergency = async (id) => {
    try {
      await donorService.rejectRequest(id)
      toast.success('Request declined')
      fetchDashboardData()
    } catch (err) {
      console.error('Donor reject request failed:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to decline request'
      toast.error(errorMessage)
    }
  }

  const getEligibilityMessage = () => {
    if (eligibilityStatus === 'eligible') {
      return '✓ ELIGIBLE TO DONATE NOW'
    } else if (eligibilityStatus === 'ineligible') {
      return `📅 ELIGIBLE IN ${stats.eligibilityDays} DAYS`
    } else {
      return '⚠️ TEMPORARILY INELIGIBLE'
    }
  }

  return (
    <DashboardLayout title="Donor Dashboard">
      <div className="space-y-6">
        {/* Availability Toggle */}
        <Card className="overflow-hidden border-t-2 border-t-blood">
          <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg uppercase tracking-wider text-text-primary mb-2">
                Your Availability Status
              </h3>
              <p className="text-sm text-text-muted">
                Toggle your status to let nearby hospitals and seekers know you're ready to help
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase text-text-muted mb-2">Status</p>
                <div
                  className={`px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isAvailable
                      ? 'bg-success/10 border border-success/20 text-success'
                      : 'bg-surface-2 border border-border/50 text-text-muted'
                  }`}
                >
                  {isAvailable ? '🟢 Available' : '⚪ Offline'}
                </div>
              </div>
              <RadixSwitch.Root
                checked={isAvailable}
                onCheckedChange={handleAvailabilityToggle}
                className={`w-14 h-7 px-0.5 rounded-full transition-all ${
                  isAvailable ? 'bg-blood' : 'bg-surface-3'
                } outline-none border border-border/50`}
              >
                <RadixSwitch.Thumb
                  className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform ${
                    isAvailable ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </RadixSwitch.Root>
            </div>
          </div>
        </Card>

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
              title="Total Donations"
              value={stats.totalDonations || 0}
              icon={Heart}
              trendColor="success"
              trend="+0"
            />
            <StatCard
              title="Units Provided"
              value={stats.unitsProvided || 0}
              icon={Zap}
              trendColor="info"
              trend="+0"
            />
            <StatCard
              title="Lives Helped"
              value={stats.livesHelped || 0}
              icon={Users}
              trendColor="success"
              trend="+0"
            />
            <StatCard
              title="Next Eligible"
              value={`${stats.eligibilityDays || 0}d`}
              icon={Activity}
              trendColor={eligibilityStatus === 'eligible' ? 'success' : 'warning'}
              trend="+0"
            />
          </div>
        )}

        {/* Eligibility Card */}
        <Card
          className={`border-t-2 ${
            eligibilityStatus === 'eligible' ? 'border-t-success' : 'border-t-warning'
          }`}
        >
          <div className="p-6 flex items-center gap-4">
            {eligibilityStatus === 'eligible' ? (
              <CheckCircle className="w-8 h-8 text-success flex-shrink-0" />
            ) : (
              <AlertCircle className="w-8 h-8 text-warning flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className="font-display uppercase tracking-wider text-text-primary font-bold">
                {getEligibilityMessage()}
              </h3>
              <p className="text-sm text-text-muted mt-1">
                {eligibilityStatus === 'eligible'
                  ? 'You are eligible to donate blood immediately. Your contribution could save a life today!'
                  : `After successful donation, you will be eligible again after ${stats.eligibilityDays} days.`}
              </p>
            </div>
            {user?.isVerified && (
              <div className="flex-shrink-0">
                <VerifiedBadge />
              </div>
            )}
          </div>
        </Card>

        {/* Nearby Emergency Requests */}
        <div>
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-border/50">
            <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">
              🚨 Nearby Emergency Requests
            </h3>
            <button
              onClick={() => navigate('/donor/nearby')}
              className="text-xs font-bold text-blood hover:text-blood-glow hover:underline transition-all"
            >
              View All →
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} variant="card" className="h-48" />
              ))}
            </div>
          ) : nearbyEmergencies.length === 0 ? (
            <EmptyState
              icon="🏥"
              title="No Nearby Emergencies"
              message="No active blood requests near you at the moment. Stay available to help when emergencies arise!"
              action={() => navigate('/donor/nearby')}
              actionLabel="Browse All Requests"
            />
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
            >
              {nearbyEmergencies.slice(0, 3).map((request, idx) => (
                <motion.div
                  key={request._id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="relative"
                >
                  <BloodRequestCard
                    request={request}
                    onAccept={handleAcceptEmergency}
                    onReject={handleRejectEmergency}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* CTA to View All Requests */}
        {nearbyEmergencies.length > 0 && (
          <Button
            variant="secondary"
            onClick={() => navigate('/donor/nearby')}
            className="w-full py-3 text-sm font-bold uppercase"
          >
            View All {nearbyEmergencies.length > 3 ? `${nearbyEmergencies.length} ` : ''}Emergency Requests →
          </Button>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Partner Hospitals</h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/') }>
              Explore Hospitals
            </Button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, index) => (
                <Skeleton key={index} variant="card" className="h-56" />
              ))}
            </div>
          ) : hospitals.length === 0 ? (
            <EmptyState
              title="No Partner Hospitals"
              message="We couldn't load nearby hospitals. Try again later."
              icon={Zap}
              action={() => fetchDashboardData()}
              actionLabel="Refresh"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Active Seeker Requests</h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/donor/nearby')}>
              Browse All
            </Button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(2)].map((_, index) => (
                <Skeleton key={index} variant="card" className="h-52" />
              ))}
            </div>
          ) : activeRequests.length === 0 ? (
            <EmptyState
              title="No Active Requests"
              message="No seeker requests are currently available. Check back in a few minutes."
              icon={Heart}
              action={() => fetchDashboardData()}
              actionLabel="Refresh"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRequests.slice(0, 3).map((request) => (
                <BloodRequestCard
                  key={request._id}
                  request={request}
                  onAccept={handleAcceptEmergency}
                  onReject={handleRejectEmergency}
                />
              ))}
            </div>
          )}
        </div>

        {/* Donation Streaks & Badges */}
        {user?.totalDonations > 0 && (
          <Card>
            <div className="p-6 space-y-4">
              <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Your Milestones</h3>
              <div className="grid grid-cols-3 gap-3">
                {user.totalDonations >= 1 && (
                  <div className="text-center p-3 bg-surface-2 rounded border border-border/50">
                    <span className="text-2xl">🎖️</span>
                    <p className="text-xs font-semibold text-text-muted mt-2">First Donation</p>
                  </div>
                )}
                {user.totalDonations >= 5 && (
                  <div className="text-center p-3 bg-surface-2 rounded border border-border/50">
                    <span className="text-2xl">🏅</span>
                    <p className="text-xs font-semibold text-text-muted mt-2">5 Donations</p>
                  </div>
                )}
                {user.totalDonations >= 10 && (
                  <div className="text-center p-3 bg-surface-2 rounded border border-border/50">
                    <span className="text-2xl">👑</span>
                    <p className="text-xs font-semibold text-text-muted mt-2">10 Donations</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default DonorDashboard
