import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Avatar from '../../components/ui/Avatar'
import BloodGroupBadge from '../../components/common/BloodGroupBadge'
import VerifiedBadge from '../../components/common/VerifiedBadge'
import Skeleton from '../../components/ui/Skeleton'
import Modal from '../../components/ui/Modal'
import adminService from '../../services/adminService'
import { toast } from 'react-hot-toast'

const VerificationQueue = () => {
  const [pendingVerifications, setPendingVerifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('donors')
  const [selectedItem, setSelectedItem] = useState(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchPendingVerifications()
    const interval = setInterval(fetchPendingVerifications, 20000)
    return () => clearInterval(interval)
  }, [activeTab])

  const fetchPendingVerifications = async () => {
    setIsLoading(true)
    try {
      const response = await adminService.getPendingVerifications(activeTab === 'donors' ? 'donor' : 'hospital')
      setPendingVerifications(response || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load verification queue')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selectedItem) return
    setIsProcessing(true)
    try {
      if (activeTab === 'donors') {
        await adminService.verifyUser(selectedItem._id)
      } else {
        await adminService.verifyHospital(selectedItem._id)
      }
      toast.success(activeTab === 'donors' ? 'User verified!' : 'Hospital verified!')
      setShowActionModal(false)
      fetchPendingVerifications()
    } catch (err) {
      console.error(err)
      toast.error(activeTab === 'donors' ? 'Failed to verify user' : 'Failed to verify hospital')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedItem) return
    setIsProcessing(true)
    try {
      const type = activeTab === 'donors' ? 'donor' : 'hospital'
      await adminService.rejectVerification(selectedItem._id, type)
      toast.success(activeTab === 'donors' ? 'Application rejected' : 'Hospital verification rejected')
      setShowActionModal(false)
      fetchPendingVerifications()
    } catch (err) {
      console.error(err)
      toast.error(activeTab === 'donors' ? 'Failed to reject verification' : 'Failed to reject hospital verification')
    } finally {
      setIsProcessing(false)
    }
  }

  const tabs = [
    { id: 'donors', label: '🩸 Blood Donors', count: activeTab === 'donors' ? pendingVerifications.length : 0 },
    { id: 'hospitals', label: '🏥 Hospitals & Banks', count: activeTab === 'hospitals' ? pendingVerifications.length : 0 },
  ]

  return (
    <DashboardLayout title="Verification Queue">
      <div className="space-y-6">
        {/* Progress Info */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-info/5 border border-info/30 rounded-lg flex items-center gap-3"
        >
          <CheckCircle className="w-5 h-5 text-info flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-info text-xs uppercase">Pending Verifications</p>
            <p className="text-sm text-text-muted mt-1">
              {pendingVerifications.length} {activeTab === 'donors' ? 'donor' : 'institution'} {pendingVerifications.length === 1 ? 'is' : 'are'} awaiting verification. Review their profiles and approve or reject accordingly.
            </p>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border/50 pb-2">
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

        {/* Verification Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="card" className="h-64" />
            ))}
          </div>
        ) : pendingVerifications.length === 0 ? (
          <Card className="text-center py-12">
            <div className="space-y-3">
              <CheckCircle className="w-12 h-12 text-success mx-auto" />
              <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Queue is Clear!</h3>
              <p className="text-text-muted text-sm">
                All {activeTab === 'donors' ? 'donor' : 'institution'} verifications have been processed.
              </p>
            </div>
          </Card>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
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
            {pendingVerifications.map((item, idx) => (
              <motion.div
                key={item._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <Card className="border-l-4 border-l-warning overflow-hidden">
                  <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <Avatar user={item} size="lg" />
                      <div className="flex-1">
                        <p className="font-semibold text-text-primary">{item.name}</p>
                        <p className="text-xs text-text-muted capitalize">
                          {activeTab === 'donors' ? `Blood Donor • ${item.bloodGroup}` : `${item.institutionType?.replace('_', ' ')} Institution`}
                        </p>
                      </div>
                    </div>

                    <hr className="border-border/30" />

                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-xs font-semibold uppercase text-text-muted mb-1">Email</p>
                        <p className="text-text-primary">{item.email}</p>
                      </div>

                      {activeTab === 'donors' && (
                        <>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold uppercase text-text-muted">Blood Group:</p>
                            <BloodGroupBadge bloodGroup={item.bloodGroup} size="sm" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase text-text-muted">Age:</p>
                            <p className="text-text-primary">{item.age} years</p>
                          </div>
                        </>
                      )}

                      {activeTab === 'hospitals' && (
                        <div>
                          <p className="text-xs font-semibold uppercase text-text-muted">Registration ID:</p>
                          <p className="text-text-primary font-mono text-xs">{item.registrationNumber}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-semibold uppercase text-text-muted">City</p>
                        <p className="text-text-primary">{item.city}</p>
                      </div>
                    </div>

                    <hr className="border-border/30" />

                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        onClick={() => {
                          setSelectedItem(item)
                          setActionType('approve')
                          setShowActionModal(true)
                        }}
                        icon={<CheckCircle className="w-4 h-4" />}
                        className="flex-1 text-xs"
                      >
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSelectedItem(item)
                          setActionType('reject')
                          setShowActionModal(true)
                        }}
                        icon={<XCircle className="w-4 h-4" />}
                        className="flex-1 text-xs"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Action Modal */}
      <Modal isOpen={showActionModal} onClose={() => setShowActionModal(false)}>
        {selectedItem && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary">
              {actionType === 'approve' ? 'Approve Verification' : 'Reject Application'}
            </h2>

            <div className="bg-surface-2 p-4 rounded space-y-2">
              <p className="text-sm font-semibold text-text-primary">{selectedItem.name}</p>
              <p className="text-xs text-text-muted">{selectedItem.email}</p>
              {activeTab === 'donors' && <BloodGroupBadge bloodGroup={selectedItem.bloodGroup} size="sm" />}
            </div>

            <p className="text-text-muted text-sm">
              {actionType === 'approve'
                ? 'Approving will grant this user verified status and increase their visibility to other users.'
                : 'Rejecting will deny verification and notify the user.'}
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

export default VerificationQueue
