import React, { useState, useEffect } from 'react'
import { Filter, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import BloodGroupBadge from '../../components/common/BloodGroupBadge'
import StatusBadge from '../../components/common/StatusBadge'
import UrgencyIndicator from '../../components/common/UrgencyIndicator'
import Skeleton from '../../components/ui/Skeleton'
import adminService from '../../services/adminService'
import { toast } from 'react-hot-toast'

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const RequestMonitor = () => {
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [bloodGroupFilter, setBloodGroupFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('')

  useEffect(() => {
    fetchRequests()
    const interval = setInterval(fetchRequests, 15000)
    return () => clearInterval(interval)
  }, [statusFilter, bloodGroupFilter])

  const fetchRequests = async () => {
    setIsLoading(true)
    try {
      const response = await adminService.getRequests({
        status: statusFilter === 'all' ? undefined : statusFilter,
        bloodGroup: bloodGroupFilter === 'all' ? undefined : bloodGroupFilter,
        city: cityFilter || undefined,
      })
      setRequests(response.requests || response.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load requests')
    } finally {
      setIsLoading(false)
    }
  }

  const sosRequests = requests.filter((r) => r.isSOSRequest)
  const regularRequests = requests.filter((r) => !r.isSOSRequest)

  return (
    <DashboardLayout title="Request Monitor">
      <div className="space-y-6">
        {/* Filters */}
        <Card className="border-t-2 border-t-blood">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-blood" />
              <h3 className="font-display text-sm uppercase tracking-wider text-text-primary">Filter Requests</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'active', label: 'Active' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'rejected', label: 'Rejected' },
                ]}
              />

              <Select
                label="Blood Group"
                value={bloodGroupFilter}
                onChange={(e) => setBloodGroupFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Blood Groups' },
                  ...bloodGroups.map((bg) => ({ value: bg, label: bg })),
                ]}
              />

              <Button
                variant="secondary"
                onClick={fetchRequests}
                className="mt-6 text-xs"
              >
                Refresh
              </Button>
            </div>
          </div>
        </Card>

        {/* Live Feed Stats */}
        {!isLoading && (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="p-4 bg-surface-2 rounded border border-border/50">
              <p className="text-xs font-semibold uppercase text-text-muted">Total Requests</p>
              <p className="text-2xl font-bold text-text-primary mt-2">{requests.length}</p>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="p-4 bg-surface-2 rounded border border-border/50">
              <p className="text-xs font-semibold uppercase text-text-muted">SOS Alerts</p>
              <p className="text-2xl font-bold text-critical mt-2">{sosRequests.length}</p>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="p-4 bg-surface-2 rounded border border-border/50">
              <p className="text-xs font-semibold uppercase text-text-muted">Active</p>
              <p className="text-2xl font-bold text-warning mt-2">{requests.filter((r) => r.status === 'active').length}</p>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} className="p-4 bg-surface-2 rounded border border-border/50">
              <p className="text-xs font-semibold uppercase text-text-muted">Completed</p>
              <p className="text-2xl font-bold text-success mt-2">{requests.filter((r) => r.status === 'completed').length}</p>
            </motion.div>
          </motion.div>
        )}

        {/* SOS Requests */}
        {sosRequests.length > 0 && (
          <div>
            <h3 className="font-display text-lg uppercase tracking-wider text-critical mb-4 flex items-center gap-2">
              <span className="animate-pulse">🚨</span> SOS Emergency Alerts ({sosRequests.length})
            </h3>
            <motion.div
              className="space-y-2"
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
                  className="p-4 bg-critical/5 rounded-lg border-l-4 border-l-critical"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <BloodGroupBadge bloodGroup={request.bloodGroup} size="sm" />
                        <span className="text-xs font-bold text-critical">EMERGENCY</span>
                        <span className="text-xs text-text-muted">{request.unitsRequired} units</span>
                      </div>
                      <p className="font-semibold text-text-primary">{request.patientName}</p>
                      <p className="text-xs text-text-muted">{request.hospitalName} • {request.seekerCity}</p>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Regular Requests Table */}
        <Card>
          <div className="p-6 space-y-4">
            <h3 className="font-display text-lg uppercase tracking-wider text-text-primary mb-4">
              All Requests ({requests.length})
            </h3>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} variant="line" className="h-16" />
                ))}
              </div>
            ) : requests.length === 0 ? (
              <p className="text-center text-text-muted py-8">No requests found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">ID</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">Patient</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">Blood</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">Urgency</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">Hospital</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">Status</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regularRequests.map((request) => (
                      <motion.tr
                        key={request._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-border/30 hover:bg-surface-3/50 transition-colors"
                      >
                        <td className="py-4 px-4 text-text-muted font-mono text-xs">{request._id?.slice(0, 6)}</td>
                        <td className="py-4 px-4">
                          <p className="font-semibold text-text-primary">{request.patientName}</p>
                          <p className="text-xs text-text-muted">{request.seekerCity}</p>
                        </td>
                        <td className="py-4 px-4">
                          <BloodGroupBadge bloodGroup={request.bloodGroup} size="sm" />
                        </td>
                        <td className="py-4 px-4">
                          <UrgencyIndicator urgency={request.urgencyLevel} />
                        </td>
                        <td className="py-4 px-4 text-text-muted text-xs truncate">{request.hospitalName}</td>
                        <td className="py-4 px-4">
                          <StatusBadge status={request.status} />
                        </td>
                        <td className="py-4 px-4 text-text-muted text-xs">
                          {request.createdAt
                            ? new Date(request.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '-'}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default RequestMonitor
