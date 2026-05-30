import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Filter, Search, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import BloodRequestCard from '../../components/common/BloodRequestCard'
import EmptyState from '../../components/ui/EmptyState'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Skeleton from '../../components/ui/Skeleton'
import seekerService from '../../services/seekerService'
import { toast } from 'react-hot-toast'

const MyRequests = () => {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [bloodGroupFilter, setBloodGroupFilter] = useState('all')
  const [viewMode, setViewMode] = useState('card')

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  const fetchRequests = async (filters = {}) => {
    setIsLoading(true)
    try {
      const response = await seekerService.getRequests({
        status: activeTab === 'all' ? undefined : activeTab,
        bloodGroup: bloodGroupFilter === 'all' ? undefined : bloodGroupFilter,
        search: searchTerm || undefined,
        ...filters,
      })
      setRequests(response.requests || response.data || [])
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch requests')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [activeTab, bloodGroupFilter])

  const handleSearch = (value) => {
    setSearchTerm(value)
    setTimeout(() => fetchRequests({ search: value }), 300)
  }

  const handleCancelRequest = async (id) => {
    if (window.confirm('Are you sure you want to cancel this request?')) {
      try {
        await seekerService.cancelRequest(id)
        toast.success('Request cancelled successfully')
        fetchRequests()
      } catch (err) {
        console.error(err)
        toast.error('Failed to cancel request')
      }
    }
  }

  const tabs = [
    { id: 'all', label: 'All', icon: null },
    { id: 'pending', label: 'Pending', icon: null },
    { id: 'active', label: 'Active', icon: null },
    { id: 'completed', label: 'Completed', icon: null },
    { id: 'rejected', label: 'Rejected', icon: null },
  ]

  const filteredRequests = requests.filter((req) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      req.patientName?.toLowerCase().includes(search) ||
      req.hospitalName?.toLowerCase().includes(search) ||
      req.city?.toLowerCase().includes(search)
    )
  })

  return (
    <DashboardLayout title="My Blood Requests">
      <div className="space-y-6">
        {/* Filter Section */}
        <div className="bg-surface-3 rounded-lg p-4 border border-border/50 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-blood" />
            <h3 className="font-display text-sm uppercase tracking-wider text-text-primary">Filters & Search</h3>
          </div>

          {/* Search Bar */}
          <Input
            placeholder="Search by patient name, hospital, or city..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full"
            icon={<Search className="w-4 h-4" />}
          />

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Select
              label="Blood Group"
              value={bloodGroupFilter}
              onChange={(e) => setBloodGroupFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Blood Groups' },
                ...bloodGroups.map((bg) => ({ value: bg, label: bg })),
              ]}
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">
                View Mode
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('card')}
                  className={`flex-1 px-3 py-2 rounded text-xs font-semibold uppercase transition-all ${
                    viewMode === 'card'
                      ? 'bg-blood text-white'
                      : 'bg-surface-2 text-text-muted hover:text-text-primary border border-border/50'
                  }`}
                >
                  Card
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex-1 px-3 py-2 rounded text-xs font-semibold uppercase transition-all ${
                    viewMode === 'list'
                      ? 'bg-blood text-white'
                      : 'bg-surface-2 text-text-muted hover:text-text-primary border border-border/50'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

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

        {/* Requests Grid/List */}
        {isLoading ? (
          <div className={`grid gap-4 ${viewMode === 'card' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} variant="card" />
            ))}
          </div>
        ) : filteredRequests.length === 0 ? (
          <EmptyState
            icon="📋"
            title={activeTab === 'all' ? 'No Requests Yet' : `No ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Requests`}
            message="You haven't created any blood requests yet. Click the button below to start one."
            action={() => navigate('/seeker/requests/new')}
            actionLabel="Create New Request"
          />
        ) : (
          <motion.div
            className={`grid gap-4 ${viewMode === 'card' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
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
            {filteredRequests.map((request, index) => (
              <motion.div
                key={request._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.3 }}
              >
                <BloodRequestCard
                  request={request}
                  onCancel={() => handleCancelRequest(request._id)}
                  onClick={() => navigate(`/seeker/requests/${request._id}`)}
                  compact={viewMode === 'list'}
                />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination Info */}
        {!isLoading && filteredRequests.length > 0 && (
          <div className="text-center text-sm text-text-muted py-4">
            Showing {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default MyRequests
