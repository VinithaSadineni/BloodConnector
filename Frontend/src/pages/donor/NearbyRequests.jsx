import React, { useState, useEffect } from 'react'
import { MapPin, Filter, Compass, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import BloodRequestCard from '../../components/common/BloodRequestCard'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import donorService from '../../services/donorService'
import { toast } from 'react-hot-toast'

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const radiusOptions = [
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
]

const NearbyRequests = () => {
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [bloodGroupFilter, setBloodGroupFilter] = useState('all')
  const [radiusFilter, setRadiusFilter] = useState(25)
  const [urgencyFilter, setUrgencyFilter] = useState('all')

  useEffect(() => {
    fetchNearbyRequests()
  }, [bloodGroupFilter, radiusFilter, urgencyFilter])

  const fetchNearbyRequests = async () => {
    setIsLoading(true)
    try {
      const response = await donorService.getNearbyRequests({
        bloodGroup: bloodGroupFilter === 'all' ? undefined : bloodGroupFilter,
        radius: radiusFilter,
        urgency: urgencyFilter === 'all' ? undefined : urgencyFilter,
      })
      setRequests(response.requests || response.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch nearby requests')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAcceptRequest = async (id) => {
    try {
      await donorService.acceptRequest(id)
      toast.success('Request accepted! Hospital will contact you soon.')
      setRequests(requests.filter((r) => r._id !== id))
    } catch (err) {
      console.error(err)
      toast.error('Failed to accept request')
    }
  }

  const handleRejectRequest = async (id) => {
    try {
      await donorService.rejectRequest(id)
      toast.success('Request declined')
      setRequests(requests.filter((r) => r._id !== id))
    } catch (err) {
      console.error(err)
      toast.error('Failed to decline request')
    }
  }

  // Sort by urgency (critical first)
  const sortedRequests = [...requests].sort((a, b) => {
    const urgencyOrder = { critical: 0, urgent: 1, moderate: 2, normal: 3 }
    return (urgencyOrder[a.urgencyLevel] || 3) - (urgencyOrder[b.urgencyLevel] || 3)
  })

  return (
    <DashboardLayout title="Nearby Emergency Requests">
      <div className="space-y-6">
        {/* Filters */}
        <Card className="border-t-2 border-t-blood">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-blood" />
              <h3 className="font-display text-sm uppercase tracking-wider text-text-primary">Find Blood Requests</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label="Blood Group"
                value={bloodGroupFilter}
                onChange={(e) => setBloodGroupFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Blood Groups' },
                  ...bloodGroups.map((bg) => ({ value: bg, label: bg })),
                ]}
              />

              <Select
                label="Search Radius"
                value={radiusFilter}
                onChange={(e) => setRadiusFilter(Number(e.target.value))}
                options={radiusOptions}
              />

              <Select
                label="Urgency Level"
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Urgencies' },
                  { value: 'critical', label: '🚨 Critical' },
                  { value: 'urgent', label: '⚠️ Urgent' },
                  { value: 'moderate', label: '⏰ Moderate' },
                  { value: 'normal', label: '✓ Normal' },
                ]}
              />

              <Button
                variant="secondary"
                onClick={fetchNearbyRequests}
                icon={<Compass className="w-4 h-4" />}
                className="mt-6"
              >
                Refresh
              </Button>
            </div>
          </div>
        </Card>

        {/* Results Info */}
        {!isLoading && requests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 p-3 bg-info/10 border border-info/30 rounded-lg"
          >
            <Compass className="w-4 h-4 text-info flex-shrink-0" />
            <p className="text-sm text-info font-semibold">
              Found {requests.length} blood request{requests.length !== 1 ? 's' : ''} within {radiusFilter}km of your
              location
            </p>
          </motion.div>
        )}

        {/* Map Placeholder */}
        <Card className="h-64 bg-gradient-to-br from-surface-3 to-surface-2 border-dashed border-2 border-border/50 flex items-center justify-center">
          <div className="text-center space-y-2">
            <MapPin className="w-12 h-12 text-text-muted/50 mx-auto" />
            <p className="text-text-muted font-semibold">Map Integration Placeholder</p>
            <p className="text-xs text-text-muted/70">
              Real-time map with request pins would be integrated here
            </p>
          </div>
        </Card>

        {/* Requests List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} variant="card" className="h-48" />
            ))}
          </div>
        ) : sortedRequests.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No Nearby Requests"
            message="There are no active blood requests matching your filters. Check back soon or adjust your filters."
            action={fetchNearbyRequests}
            actionLabel="Refresh"
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
            {sortedRequests.map((request, idx) => (
              <motion.div
                key={request._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <BloodRequestCard
                  request={request}
                  actionButtons={[
                    {
                      label: 'Accept',
                      onClick: () => handleAcceptRequest(request._id),
                      variant: 'primary',
                    },
                    {
                      label: 'Decline',
                      onClick: () => handleRejectRequest(request._id),
                      variant: 'secondary',
                    },
                  ]}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Critical SOS Banner */}
        {sortedRequests.some((r) => r.isSOSRequest) && (
          <Card className="border-t-4 border-t-critical bg-critical/5">
            <div className="p-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-critical flex-shrink-0 animate-pulse" />
              <div>
                <p className="font-bold text-critical text-sm uppercase tracking-wider">SOS Requests Present</p>
                <p className="text-xs text-text-muted mt-1">
                  Some of the requests below are marked as life-threatening emergencies. Please prioritize them.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default NearbyRequests
