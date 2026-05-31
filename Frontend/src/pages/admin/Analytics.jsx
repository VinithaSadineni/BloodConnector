import React, { useState, useEffect } from 'react'
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Skeleton from '../../components/ui/Skeleton'
import adminService from '../../services/adminService'
import { toast } from 'react-hot-toast'

const Analytics = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')
  const [data, setData] = useState({
    requestsByBloodGroup: [],
    donationTrends: [],
    requestStatusDistribution: [],
    cityHeatmap: [],
    summary: {},
  })

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await adminService.getAnalytics({
        timeRange: parseInt(timeRange),
      })
      const payload = response.data || response;
      setData({
        requestsByBloodGroup: payload.requestsByBloodGroup || [],
        donationTrends: payload.donationTrends || [],
        requestStatusDistribution: payload.requestStatusDistribution || [],
        cityHeatmap: payload.cityHeatmap || [],
        summary: payload.summary || {},
      })
    } catch (err) {
      console.error(err)
      toast.error('Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }

  const timeRangeOptions = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
  ]

  const colors = ['#C8102E', '#00A3E0', '#FFB81C', '#6CC24A', '#F26522', '#9B59B6', '#E74C3C', '#3498DB']
  const statusColors = {
    pending: '#FFB81C',
    active: '#00A3E0',
    completed: '#6CC24A',
    rejected: '#E74C3C',
  }

  return (
    <DashboardLayout title="Analytics & Insights">
      <div className="space-y-6">
        {/* Time Range Selector */}
        <Card className="border-t-2 border-t-blood">
          <div className="p-6">
            <h3 className="font-display text-sm uppercase tracking-wider text-text-primary mb-4">Time Range</h3>
            <div className="flex gap-2 flex-wrap">
              {timeRangeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={timeRange === option.value ? 'primary' : 'secondary'}
                  onClick={() => setTimeRange(option.value)}
                  className="text-xs"
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Charts Row 1 */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
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
          {/* Requests by Blood Group */}
          <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            <Card>
              <div className="p-6 space-y-4">
                <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">
                  Requests by Blood Group
                </h3>
                {isLoading ? (
                  <Skeleton variant="card" className="h-64" />
                ) : data.requestsByBloodGroup.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.requestsByBloodGroup} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis type="number" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                      <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1f2e',
                          border: '1px solid rgba(200,16,46,0.3)',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="count" fill="#C8102E" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-text-muted py-8">No data available</p>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Donation Trends */}
          <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            <Card>
              <div className="p-6 space-y-4">
                <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">
                  Donation Trends
                </h3>
                {isLoading ? (
                  <Skeleton variant="card" className="h-64" />
                ) : data.donationTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={data.donationTrends}>
                      <defs>
                        <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C8102E" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#C8102E" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                      <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1f2e',
                          border: '1px solid rgba(200,16,46,0.3)',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="donations"
                        stroke="#C8102E"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorDonations)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-text-muted py-8">No data available</p>
                )}
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Charts Row 2 */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
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
          {/* Request Status Distribution */}
          <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            <Card>
              <div className="p-6 space-y-4">
                <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">
                  Request Status Breakdown
                </h3>
                {isLoading ? (
                  <Skeleton variant="card" className="h-64" />
                ) : data.requestStatusDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={data.requestStatusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.requestStatusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={statusColors[entry.name] || colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1f2e',
                          border: '1px solid rgba(200,16,46,0.3)',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-text-muted py-8">No data available</p>
                )}
              </div>
            </Card>
          </motion.div>

          {/* City Heatmap */}
          <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            <Card>
              <div className="p-6 space-y-4">
                <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">
                  Top Cities by Request Volume
                </h3>
                {isLoading ? (
                  <Skeleton variant="card" className="h-64" />
                ) : data.cityHeatmap.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={data.cityHeatmap}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="city" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} angle={-45} />
                      <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1f2e',
                          border: '1px solid rgba(200,16,46,0.3)',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="requests" fill="#00A3E0" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-text-muted py-8">No data available</p>
                )}
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Summary Stats */}
        {!isLoading && (
          <Card>
            <div className="p-6 space-y-4">
              <h3 className="font-display text-lg uppercase tracking-wider text-text-primary mb-4">
                Summary Statistics
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 font-bold uppercase text-xs text-text-muted">Metric</th>
                      <th className="text-right py-3 px-4 font-bold uppercase text-xs text-text-muted">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.summary || {}).map(([key, value]) => (
                      <tr key={key} className="border-b border-border/30 hover:bg-surface-3/50">
                        <td className="py-4 px-4 text-text-primary capitalize">{key.replace(/_/g, ' ')}</td>
                        <td className="py-4 px-4 text-right font-semibold text-blood">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default Analytics
