import React, { useState, useEffect } from 'react'
import { AlertCircle, Users, CheckCircle, TrendingUp, Activity } from 'lucide-react'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import LiveRequestsFeed from '../../components/common/LiveRequestsFeed'
import adminService from '../../services/adminService'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonors: 0,
    totalHospitals: 0,
    activeRequests: 0,
    sosAlertsToday: 0,
    completedDonations: 0,
  })
  const [recentRequests, setRecentRequests] = useState([])
  const [pendingVerifications, setPendingVerifications] = useState([])
  const [systemStatus, setSystemStatus] = useState({
    dbConnected: true,
    socketConnected: true,
    activeSessions: 0,
  })

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const response = await adminService.getDashboard()
      setStats(response.stats || response)
      setRecentRequests((response.recentRequests || []).slice(0, 5))
      setPendingVerifications((response.pendingVerifications || []).slice(0, 5))
      setSystemStatus(response.systemStatus || {})
    } catch (err) {
      console.error(err)
      toast.error('Failed to load admin dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6">
        {/* System Status */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-success/20 to-info/20 p-4 border-b border-border/50">
            <p className="font-bold text-success text-xs uppercase tracking-wider">System Status: All Systems Operational</p>
          </div>
          <div className="p-4 grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
              <span className="text-xs text-text-muted">Database Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success animate-pulse"></div>
              <span className="text-xs text-text-muted">Socket.IO Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-text-muted">{systemStatus.activeSessions || 0} Active Sessions</p>
            </div>
          </div>
        </Card>

        {/* Stats Row */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} variant="card" className="h-32" />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-6 gap-4"
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
            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
              <StatCard
                title="Total Users"
                value={stats.totalUsers || 0}
                icon={Users}
                trendColor="info"
              />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
              <StatCard
                title="Total Donors"
                value={stats.totalDonors || 0}
                icon={Activity}
                trendColor="success"
              />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
              <StatCard
                title="Total Hospitals"
                value={stats.totalHospitals || 0}
                icon={CheckCircle}
                trendColor="info"
              />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
              <StatCard
                title="Active Requests"
                value={stats.activeRequests || 0}
                icon={AlertCircle}
                trendColor={stats.activeRequests > 10 ? 'critical' : 'warning'}
              />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
              <StatCard
                title="SOS Alerts (Today)"
                value={stats.sosAlertsToday || 0}
                icon={AlertCircle}
                trendColor="critical"
              />
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
              <StatCard
                title="Donations (Today)"
                value={stats.completedDonations || 0}
                icon={TrendingUp}
                trendColor="success"
              />
            </motion.div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Emergency Feed */}
          <div className="lg:col-span-2">
            <LiveRequestsFeed title="Live Emergency Requests Feed" limit={10} />
          </div>

          {/* Pending Verifications */}
          <Card>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">
                  Verification Queue
                </h3>
                <Link
                  to="/admin/verify"
                  className="text-xs font-bold text-blood hover:text-blood-glow"
                >
                  View All →
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} variant="line" className="h-12" />
                  ))}
                </div>
              ) : pendingVerifications.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-6">No pending verifications</p>
              ) : (
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
                  {pendingVerifications.map((item, idx) => (
                    <motion.div
                      key={item._id}
                      variants={{
                        hidden: { opacity: 0, x: -20 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      className="p-3 bg-surface-2 rounded border-l-2 border-l-warning hover:border-l-blood transition-colors"
                    >
                      <p className="text-sm font-semibold text-text-primary truncate">{item.name}</p>
                      <p className="text-xs text-text-muted capitalize">{item.role || item.userType}</p>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              <Button variant="secondary" as={Link} to="/admin/verify" className="w-full text-xs mt-4">
                Review All Verifications →
              </Button>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <div className="p-6 space-y-3">
            <h3 className="font-display text-lg uppercase tracking-wider text-text-primary mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Link to="/admin/verify">
                <Button variant="secondary" className="w-full text-xs">
                  Verify User
                </Button>
              </Link>
              <Link to="/admin/requests">
                <Button variant="secondary" className="w-full text-xs">
                  View Requests
                </Button>
              </Link>
              <Link to="/admin/users">
                <Button variant="secondary" className="w-full text-xs">
                  Manage Users
                </Button>
              </Link>
              <Link to="/admin/analytics">
                <Button variant="secondary" className="w-full text-xs">
                  Analytics
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard
