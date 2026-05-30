import React, { useState, useEffect } from 'react'
import { Search, Filter, Trash2, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import VerifiedBadge from '../../components/common/VerifiedBadge'
import Skeleton from '../../components/ui/Skeleton'
import Modal from '../../components/ui/Modal'
import adminService from '../../services/adminService'
import { toast } from 'react-hot-toast'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [verifiedFilter, setVerifiedFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [page, roleFilter, verifiedFilter])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await adminService.getUsers({
        page,
        role: roleFilter === 'all' ? undefined : roleFilter,
        verified: verifiedFilter === 'all' ? undefined : verifiedFilter === 'true',
        search: searchTerm || undefined,
      })
      setUsers(response.users || response.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (value) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handleVerify = async () => {
    if (!selectedUser) return
    setIsProcessing(true)
    try {
      await adminService.verifyUser(selectedUser._id)
      toast.success('User verified!')
      setShowActionModal(false)
      fetchUsers()
    } catch (err) {
      console.error(err)
      toast.error('Failed to verify user')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUnverify = async () => {
    if (!selectedUser) return
    setIsProcessing(true)
    try {
      await adminService.unverifyUser(selectedUser._id)
      toast.success('Verification removed')
      setShowActionModal(false)
      fetchUsers()
    } catch (err) {
      console.error(err)
      toast.error('Failed to unverify user')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemove = async () => {
    if (!selectedUser) return
    setIsProcessing(true)
    try {
      await adminService.removeUser(selectedUser._id)
      toast.success('User removed')
      setShowActionModal(false)
      fetchUsers()
    } catch (err) {
      console.error(err)
      toast.error('Failed to remove user')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <DashboardLayout title="User Management">
      <div className="space-y-6">
        {/* Filters */}
        <Card className="border-t-2 border-t-blood">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-blood" />
              <h3 className="font-display text-sm uppercase tracking-wider text-text-primary">Filter & Search</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                placeholder="Search by name, email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />

              <Select
                label="Role"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setPage(1)
                }}
                options={[
                  { value: 'all', label: 'All Roles' },
                  { value: 'seeker', label: 'Blood Seeker' },
                  { value: 'donor', label: 'Blood Donor' },
                  { value: 'hospital', label: 'Hospital' },
                  { value: 'admin', label: 'Admin' },
                ]}
              />

              <Select
                label="Verified"
                value={verifiedFilter}
                onChange={(e) => {
                  setVerifiedFilter(e.target.value)
                  setPage(1)
                }}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'true', label: 'Verified Only' },
                  { value: 'false', label: 'Unverified Only' },
                ]}
              />
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          <div className="p-6 space-y-4">
            <h3 className="font-display text-lg uppercase tracking-wider text-text-primary mb-4">
              Users ({users.length})
            </h3>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} variant="line" className="h-16" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-text-muted py-8">No users found matching your filters</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">User</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">Email</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">Role</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">City</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">Status</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">Joined</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-border/30 hover:bg-surface-3/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar user={user} size="sm" />
                            <span className="text-text-primary font-semibold truncate">{user.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-text-muted text-xs truncate">{user.email}</td>
                        <td className="py-4 px-4">
                          <span className="text-xs font-bold uppercase px-2 py-1 rounded-full bg-blood/10 text-blood">
                            {user.role || user.userType}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-text-primary text-sm">{user.city || '-'}</td>
                        <td className="py-4 px-4">
                          {user.isVerified ? (
                            <VerifiedBadge size="sm" />
                          ) : (
                            <span className="text-xs font-bold uppercase px-2 py-1 rounded-full bg-warning/10 text-warning">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-text-muted text-xs">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : '-'}
                        </td>
                        <td className="py-4 px-4">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setActionType('view')
                              setShowActionModal(true)
                            }}
                            className="text-xs"
                          >
                            Manage
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        {/* Pagination */}
        {!isLoading && users.length > 0 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="text-xs"
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm text-text-muted">Page {page}</span>
            <Button
              variant="secondary"
              onClick={() => setPage(page + 1)}
              className="text-xs"
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Action Modal */}
      <Modal isOpen={showActionModal} onClose={() => setShowActionModal(false)}>
        {selectedUser && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-text-primary">User Actions</h2>

            <div className="bg-surface-2 p-4 rounded space-y-2">
              <p className="text-sm font-semibold text-text-primary">{selectedUser.name}</p>
              <p className="text-xs text-text-muted">{selectedUser.email}</p>
              <p className="text-xs font-bold uppercase text-blood">{selectedUser.role || selectedUser.userType}</p>
            </div>

            <div className="space-y-2">
              {!selectedUser.isVerified ? (
                <Button
                  variant="primary"
                  onClick={handleVerify}
                  disabled={isProcessing}
                  icon={<CheckCircle className="w-4 h-4" />}
                  className="w-full text-xs"
                >
                  {isProcessing ? 'Verifying...' : 'Verify User'}
                </Button>
              ) : (
                <Button
                  variant="warning"
                  onClick={handleUnverify}
                  disabled={isProcessing}
                  className="w-full text-xs"
                >
                  {isProcessing ? 'Unverifying...' : 'Remove Verification'}
                </Button>
              )}

              <Button
                variant="danger"
                onClick={handleRemove}
                disabled={isProcessing}
                icon={<Trash2 className="w-4 h-4" />}
                className="w-full text-xs"
              >
                {isProcessing ? 'Removing...' : 'Remove User'}
              </Button>

              <Button
                variant="secondary"
                onClick={() => setShowActionModal(false)}
                className="w-full text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}

export default UserManagement
