import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock, AlertCircle, CheckCircle, XCircle, Loader } from 'lucide-react'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import BloodGroupBadge from '../../components/common/BloodGroupBadge'
import StatusBadge from '../../components/common/StatusBadge'
import UrgencyIndicator from '../../components/common/UrgencyIndicator'
import VerifiedBadge from '../../components/common/VerifiedBadge'
import Avatar from '../../components/ui/Avatar'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import seekerService from '../../services/seekerService'
import { toast } from 'react-hot-toast'
import formatDistanceToNow from 'date-fns/esm/formatDistanceToNow/index.js';

const RequestDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDonorsLoading, setIsDonorsLoading] = useState(false)
  const [donors, setDonors] = useState([])
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  useEffect(() => {
    fetchRequestDetail()
  }, [id])

  const fetchRequestDetail = async () => {
    setIsLoading(true)
    try {
      const response = await seekerService.getRequestById(id)
      const data = response.request || response.data || response
      setRequest(data)
      // Fetch donors who responded to this request
      if (data.respondents?.length > 0) {
        setDonors(data.respondents)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load request details')
      navigate('/seeker/requests')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelRequest = async () => {
    setIsCancelling(true)
    try {
      await seekerService.cancelRequest(id)
      toast.success('Request cancelled successfully')
      navigate('/seeker/requests')
    } catch (err) {
      console.error(err)
      toast.error('Failed to cancel request')
    } finally {
      setIsCancelling(false)
      setShowCancelModal(false)
    }
  }

  const handleAcceptDonor = async (donorId) => {
    try {
      await seekerService.acceptDonor(id, donorId)
      toast.success('Donor accepted!')
      fetchRequestDetail()
    } catch (err) {
      console.error(err)
      toast.error('Failed to accept donor')
    }
  }

  const handleRejectDonor = async (donorId) => {
    try {
      await seekerService.rejectDonor(id, donorId)
      toast.success('Donor rejected')
      fetchRequestDetail()
    } catch (err) {
      console.error(err)
      toast.error('Failed to reject donor')
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout title="Request Details">
        <div className="space-y-6">
          <Skeleton variant="card" className="h-96" />
          <Skeleton variant="card" className="h-64" />
        </div>
      </DashboardLayout>
    )
  }

  if (!request) {
    return (
      <DashboardLayout title="Request Details">
        <div className="text-center py-12">
          <p className="text-text-muted">Request not found</p>
        </div>
      </DashboardLayout>
    )
  }

  const statusTimeline = ['pending', 'accepted', 'processing', 'completed']
  const currentStatusIndex = statusTimeline.indexOf(request.status?.toLowerCase())

  return (
    <DashboardLayout title="Request Details">
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/seeker/requests')}
          className="flex items-center gap-2 text-blood hover:text-blood-glow transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-semibold">Back to Requests</span>
        </button>

        {/* Status Timeline */}
        <Card>
          <div className="p-6 space-y-4">
            <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Status Timeline</h3>
            <div className="flex items-center gap-2 overflow-x-auto">
              {statusTimeline.map((status, idx) => (
                <div key={status} className="flex items-center gap-2 flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      idx <= currentStatusIndex
                        ? 'bg-blood text-white'
                        : 'bg-surface-3 text-text-muted border border-border/50'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span className="text-xs font-semibold uppercase text-text-muted whitespace-nowrap">{status}</span>
                  {idx < statusTimeline.length - 1 && (
                    <div
                      className={`w-12 h-0.5 ${
                        idx < currentStatusIndex ? 'bg-blood' : 'bg-surface-3'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Main Request Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Request Info */}
          <div className="lg:col-span-2 space-y-4">
            {/* Patient & Blood Info */}
            <Card>
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-display text-lg uppercase tracking-wider text-text-primary mb-4">Patient Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase text-text-muted mb-1">Patient Name</p>
                        <p className="text-text-primary font-semibold">{request.patientName}</p>
                      </div>
                      <BloodGroupBadge bloodGroup={request.bloodGroup} size="lg" />
                    </div>
                  </div>
                </div>

                <hr className="border-border/30" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-text-muted mb-1">Units Required</p>
                    <p className="text-2xl font-bold text-blood">{request.unitsRequired}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-text-muted mb-1">Urgency Level</p>
                    <UrgencyIndicator urgency={request.urgencyLevel} />
                  </div>
                </div>
              </div>
            </Card>

            {/* Location & Contact */}
            <Card>
              <div className="p-6 space-y-4">
                <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Location & Contact</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-blood flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold uppercase text-text-muted">Hospital</p>
                      <p className="text-text-primary font-semibold">{request.hospitalName}</p>
                      <p className="text-sm text-text-muted">{request.hospitalAddress}</p>
                      <p className="text-sm text-text-muted">
                        {request.city}, {request.state}
                      </p>
                    </div>
                  </div>
                </div>

                <hr className="border-border/30" />

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-text-muted">Contact Number</p>
                  <a
                    href={`tel:${request.contactNumber}`}
                    className="text-blood hover:text-blood-glow font-semibold transition-colors"
                  >
                    {request.contactNumber}
                  </a>
                </div>

                {request.additionalNotes && (
                  <>
                    <hr className="border-border/30" />
                    <div>
                      <p className="text-xs font-semibold uppercase text-text-muted mb-2">Additional Notes</p>
                      <p className="text-text-primary text-sm leading-relaxed">{request.additionalNotes}</p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Deadline */}
            <Card>
              <div className="p-6 flex items-center gap-4">
                <Clock className="w-6 h-6 text-blood flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold uppercase text-text-muted">Deadline</p>
                  <p className="text-text-primary font-semibold">
                    {new Date(request.deadline).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Status & Actions */}
          <div className="space-y-4">
            {/* Status Card */}
            <Card>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-text-muted mb-2">Current Status</p>
                  <StatusBadge status={request.status} />
                </div>

                <hr className="border-border/30" />

                <div>
                  <p className="text-xs font-semibold uppercase text-text-muted mb-2">Posted</p>
                  <p className="text-sm text-text-primary">{formatDistanceToNow(new Date(request.createdAt))} ago</p>
                </div>

                {request.status?.toLowerCase() !== 'completed' &&
                  request.status?.toLowerCase() !== 'cancelled' && (
                    <>
                      <hr className="border-border/30" />
                      <Button
                        variant="danger"
                        onClick={() => setShowCancelModal(true)}
                        className="w-full text-xs"
                      >
                        Cancel Request
                      </Button>
                    </>
                  )}
              </div>
            </Card>

            {/* SOS Status */}
            {request.isSOSRequest && (
              <Card className="border-t-2 border-t-blood">
                <div className="p-4 flex items-center gap-3 bg-blood/5">
                  <AlertCircle className="w-5 h-5 text-critical flex-shrink-0 animate-pulse" />
                  <span className="font-bold text-xs uppercase tracking-wider text-critical">SOS Emergency Alert</span>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Donors Who Responded */}
        {donors.length > 0 && (
          <Card>
            <div className="p-6 space-y-4">
              <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">
                Donors Who Responded ({donors.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {donors.map((donor, idx) => (
                  <motion.div
                    key={donor._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 bg-surface-2 rounded-lg border border-border/50 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar user={donor} size="lg" />
                      <div className="flex-1">
                        <p className="font-semibold text-text-primary flex items-center gap-2">
                          {donor.name}
                          {donor.isVerified && <VerifiedBadge size="sm" />}
                        </p>
                        <p className="text-xs text-text-muted">{donor.city}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-text-muted font-semibold mb-1">Blood Group</p>
                        <BloodGroupBadge bloodGroup={donor.bloodGroup} size="sm" />
                      </div>
                      <div>
                        <p className="text-text-muted font-semibold mb-1">Donations</p>
                        <p className="text-text-primary font-bold">{donor.totalDonations || 0}</p>
                      </div>
                    </div>

                    {request.status?.toLowerCase() === 'pending' && (
                      <div className="flex gap-2 pt-2 border-t border-border/30">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleAcceptDonor(donor._id)}
                          icon={<CheckCircle className="w-3 h-3" />}
                          className="flex-1 text-xs"
                        >
                          Accept
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleRejectDonor(donor._id)}
                          icon={<XCircle className="w-3 h-3" />}
                          className="flex-1 text-xs"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Cancel Modal */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)}>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-text-primary">Cancel Request?</h2>
          <p className="text-text-muted">
            Are you sure you want to cancel this blood request? This action cannot be undone.
          </p>
          <div className="flex gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowCancelModal(false)}
              className="flex-1"
            >
              Keep Request
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelRequest}
              disabled={isCancelling}
              className="flex-1"
            >
              {isCancelling ? <Loader className="w-4 h-4 animate-spin" /> : 'Cancel Request'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default RequestDetail
