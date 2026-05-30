import React, { useState, useEffect } from 'react'
import { Filter, CheckCircle, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import BloodRequestCard from '../../components/common/BloodRequestCard'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import Modal from '../../components/ui/Modal'
import BloodGroupBadge from '../../components/common/BloodGroupBadge'
import StatusBadge from '../../components/common/StatusBadge'
import hospitalService from '../../services/hospitalService'
import { toast } from 'react-hot-toast'

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const IncomingRequests = () => {
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [bloodGroupFilter, setBloodGroupFilter] = useState('all')
  const [urgencyFilter, setUrgencyFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchIncomingRequests()
  }, [activeTab, bloodGroupFilter, urgencyFilter])

  const fetchIncomingRequests = async () => {
    setIsLoading(true)
    try {
      const response = await hospitalService.getIncomingRequests({
        status: activeTab === 'all' ? undefined : activeTab,
        bloodGroup: bloodGroupFilter === 'all' ? undefined : bloodGroupFilter,
        urgency: urgencyFilter === 'all' ? undefined : urgencyFilter,
      })
      // API returns { success, count, data: [...] }
      const requests = response.data || response || [];
      setRequests(Array.isArray(requests) ? requests : []);
    } catch (err) {
      console.error('Failed to fetch requests:', err)
      toast.error(err?.response?.data?.message || 'Failed to fetch requests')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedRequest) return
    setIsProcessing(true)
    try {
      await hospitalService.approveRequest(selectedRequest._id)
      toast.success('Request approved successfully!')
      setShowActionModal(false)
      fetchIncomingRequests()
    } catch (err) {
      console.error('Approve request error:', err)
      toast.error(err?.response?.data?.message || 'Failed to approve request')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return
    setIsProcessing(true)
    try {
      await hospitalService.rejectRequest(selectedRequest._id)
      toast.success('Request rejected successfully')
      setShowActionModal(false)
      fetchIncomingRequests()
    } catch (err) {
      console.error('Reject request error:', err)
      toast.error(err?.response?.data?.message || 'Failed to reject request')
    } finally {
      setIsProcessing(false)
    }
  }

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
  ]

  const sosRequests = requests.filter((r) => r.isSOSRequest)
  const regularRequests = requests.filter((r) => !r.isSOSRequest)

  return (
    <DashboardLayout title="Incoming Blood Requests">
      <div className="space-y-6">
        {/* Filters */}
        <Card className="border-t-2 border-t-blood">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-blood" />
              <h3 className="font-display text-sm uppercase tracking-wider text-text-primary">Filter Requests</h3>
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
                label="Urgency"
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
                onClick={fetchIncomingRequests}
                className="mt-6 text-xs"
              >
                Refresh
              </Button>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 border-b border-border/50 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-blood text-blood'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* SOS Requests Section */}
        {sosRequests.length > 0 && (
          <div>
            <h3 className="font-display text-lg uppercase tracking-wider text-critical mb-4 flex items-center gap-2">
              <span className="animate-pulse">🚨</span> Emergency SOS Requests ({sosRequests.length})
            </h3>
            <motion.div
              className="space-y-3"
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
              {sosRequests.map((request) => (
                <motion.div
                  key={request._id}
                  variants={{
                    hidden: { opacity: 0, x: -20 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  onClick={() => {
                    setSelectedRequest(request)
                    setActionType(null)
                  }}
                  className="p-4 bg-critical/5 rounded-lg border-l-4 border-l-critical hover:border-l-blood transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BloodGroupBadge bloodGroup={request.bloodGroup} size="sm" />
                        <span className="text-xs font-semibold text-critical">EMERGENCY</span>
                        <span className="text-xs font-semibold text-text-muted">{request.unitsRequired} units</span>
                      </div>
                      <p className="font-semibold text-text-primary">{request.patientName}</p>
                      <p className="text-xs text-text-muted">{request.hospitalName} • {request.seekerCity}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedRequest(request)
                          setActionType('approve')
                          setShowActionModal(true)
                        }}
                        icon={<CheckCircle className="w-3 h-3" />}
                        className="text-xs"
                      >
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedRequest(request)
                          setActionType('reject')
                          setShowActionModal(true)
                        }}
                        icon={<XCircle className="w-3 h-3" />}
                        className="text-xs"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Regular Requests */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="line" className="h-20" />
            ))}
          </div>
        ) : regularRequests.length === 0 ? (
          <EmptyState
            icon="📋"
            title={activeTab === 'all' ? 'No Incoming Requests' : `No ${activeTab} Requests`}
            message="No blood requests are currently waiting for your hospital's response."
          />
        ) : (
          <motion.div
            className="space-y-3"
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
            {regularRequests.map((request) => (
              <motion.div
                key={request._id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="p-4 bg-surface-2 rounded-lg border border-border/50 hover:border-blood/30 transition-all cursor-pointer"
                onClick={() => setSelectedRequest(request)}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <BloodGroupBadge bloodGroup={request.bloodGroup} size="sm" />
                      <StatusBadge status={request.status} />
                      <span className="text-xs font-semibold text-text-muted">{request.unitsRequired} units</span>
                    </div>
                    <p className="font-semibold text-text-primary">{request.patientName}</p>
                    <p className="text-xs text-text-muted">{request.hospitalName} • {request.seekerCity}</p>
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedRequest(request)
                          setActionType('approve')
                          setShowActionModal(true)
                        }}
                        icon={<CheckCircle className="w-3 h-3" />}
                        className="text-xs"
                      >
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedRequest(request)
                          setActionType('reject')
                          setShowActionModal(true)
                        }}
                        icon={<XCircle className="w-3 h-3" />}
                        className="text-xs"
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Action Modal */}
      <Modal isOpen={showActionModal} onClose={() => setShowActionModal(false)}>
        {selectedRequest && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary">
              {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
            </h2>

            <div className="bg-surface-2 p-4 rounded space-y-2">
              <div className="flex items-center gap-2">
                <BloodGroupBadge bloodGroup={selectedRequest.bloodGroup} size="sm" />
                <span className="text-sm font-semibold text-text-primary">{selectedRequest.patientName}</span>
              </div>
              <p className="text-sm text-text-muted">{selectedRequest.unitsRequired} units required</p>
              <p className="text-sm text-text-muted">{selectedRequest.hospitalName}</p>
            </div>

            <p className="text-text-muted text-sm">
              {actionType === 'approve'
                ? 'Are you sure you want to approve this blood request?'
                : 'Are you sure you want to reject this blood request?'}
            </p>

            <div className="flex gap-2 pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowActionModal(false)}
                className="flex-1 text-xs"
              >
                Cancel
              </Button>
              <Button
                variant={actionType === 'approve' ? 'primary' : 'danger'}
                onClick={actionType === 'approve' ? handleApprove : handleReject}
                disabled={isProcessing}
                className="flex-1 text-xs"
              >
                {isProcessing ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}

export default IncomingRequests
