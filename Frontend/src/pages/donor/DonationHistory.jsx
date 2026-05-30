import React, { useState, useEffect } from 'react'
import { Heart, TrendingUp, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import BloodGroupBadge from '../../components/common/BloodGroupBadge'
import StatusBadge from '../../components/common/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import donorService from '../../services/donorService'
import { toast } from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

const DonationHistory = () => {
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalUnits: 0,
    mostDonatedBloodGroup: null,
    lastDonationDate: null,
  })

  useEffect(() => {
    fetchDonationHistory()
  }, [])

  const fetchDonationHistory = async () => {
    setIsLoading(true)
    try {
      const response = await donorService.getHistory()
      const data = response.history || response.data || []
      setHistory(data)

      // Calculate stats
      if (data.length > 0) {
        const totalUnits = data.reduce((sum, d) => sum + (d.unitsProvided || 0), 0)
        const bloodGroupCounts = {}
        data.forEach((d) => {
          bloodGroupCounts[d.bloodGroup] = (bloodGroupCounts[d.bloodGroup] || 0) + 1
        })
        const mostDonatedBloodGroup = Object.entries(bloodGroupCounts).sort(([, a], [, b]) => b - a)[0]?.[0]

        setStats({
          totalDonations: data.length,
          totalUnits,
          mostDonatedBloodGroup,
          lastDonationDate: data[0]?.donationDate || null,
        })
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load donation history')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout title="Donation History">
      <div className="space-y-6">
        {/* Stats Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="card" className="h-24" />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
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
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Card className="p-4 border-t-2 border-t-blood">
                <div className="flex items-center gap-3">
                  <Heart className="w-6 h-6 text-blood flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold uppercase text-text-muted">Total Donations</p>
                    <p className="text-2xl font-bold text-text-primary">{stats.totalDonations}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Card className="p-4 border-t-2 border-t-success">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-text-muted">Units Provided</p>
                  <p className="text-2xl font-bold text-success">{stats.totalUnits}</p>
                </div>
              </Card>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Card className="p-4 border-t-2 border-t-info">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-text-muted">Most Donated</p>
                  {stats.mostDonatedBloodGroup ? (
                    <BloodGroupBadge bloodGroup={stats.mostDonatedBloodGroup} size="lg" />
                  ) : (
                    <p className="text-text-muted text-sm">-</p>
                  )}
                </div>
              </Card>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <Card className="p-4 border-t-2 border-t-warning">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase text-text-muted">Last Donation</p>
                  <p className="text-sm text-text-primary font-semibold">
                    {stats.lastDonationDate
                      ? formatDistanceToNow(new Date(stats.lastDonationDate), { addSuffix: true })
                      : 'Never'}
                  </p>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* History Table */}
        <Card>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blood" />
              <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">
                Your Donations ({history.length})
              </h3>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} variant="line" className="h-16" />
                ))}
              </div>
            ) : history.length === 0 ? (
              <EmptyState
                icon="❤️"
                title="No Donations Yet"
                message="Your donation history is empty. Sign up, get verified, and start saving lives!"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">Date</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">Patient City</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">Hospital</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">Blood Group</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">Units</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((donation, idx) => (
                      <motion.tr
                        key={donation._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-b border-border/30 hover:bg-surface-3/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          {new Date(donation.donationDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-4 px-4 text-text-primary">{donation.patientCity || '-'}</td>
                        <td className="py-4 px-4 text-text-muted text-xs">{donation.hospitalName || '-'}</td>
                        <td className="py-4 px-4">
                          <BloodGroupBadge bloodGroup={donation.bloodGroup} size="sm" />
                        </td>
                        <td className="py-4 px-4 font-bold text-blood">{donation.unitsProvided} units</td>
                        <td className="py-4 px-4">
                          <StatusBadge status={donation.status || 'completed'} />
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        {/* Impact Summary */}
        {history.length > 0 && (
          <Card className="bg-gradient-to-r from-blood/10 to-blood-dark/10 border border-blood/30">
            <div className="p-6 space-y-3">
              <h3 className="font-display text-lg uppercase tracking-wider text-text-primary flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blood" />
                Your Impact
              </h3>
              <p className="text-text-primary leading-relaxed">
                You've made <span className="font-bold text-blood">{stats.totalDonations} donation(s)</span> and
                provided <span className="font-bold text-blood">{stats.totalUnits} units</span> of blood. Your
                generosity has potentially saved up to <span className="font-bold text-success">3-5 lives</span> per
                donation!
              </p>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default DonationHistory
