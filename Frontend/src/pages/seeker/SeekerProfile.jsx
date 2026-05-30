import React, { useState, useEffect } from 'react'
import { Mail, Phone, MapPin, Calendar, Edit2, Loader } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import BloodGroupBadge from '../../components/common/BloodGroupBadge'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import seekerService from '../../services/seekerService'
import { useAuthStore } from '../../store/authStore'
import { toast } from 'react-hot-toast'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  address: z.string().optional(),
})

const SeekerProfile = () => {
  const { user, updateProfile } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [showAvatarModal, setShowAvatarModal] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      city: user?.city || '',
      state: user?.state || '',
      address: user?.address || '',
    },
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const profile = await seekerService.getProfile()
      setProfileData(profile)

      // Pre-fill form
      setValue('name', profile.name || '')
      setValue('email', profile.email || '')
      setValue('phone', profile.phone || '')
      setValue('city', profile.city || '')
      setValue('state', profile.state || '')
      setValue('address', profile.address || '')
    } catch (err) {
      console.error(err)
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data) => {
    setIsSaving(true)
    try {
      await seekerService.updateProfile(data)
      await updateProfile(data)
      toast.success('Profile updated successfully!')
      setIsEditing(false)
      fetchProfile()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout title="My Profile">
        <div className="space-y-6">
          <Skeleton variant="card" className="h-64" />
          <Skeleton variant="card" className="h-96" />
        </div>
      </DashboardLayout>
    )
  }

  const displayUser = profileData || user

  return (
    <DashboardLayout title="My Profile">
      <div className="space-y-6">
        {/* Profile Header Card */}
        <Card className="overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-blood/20 to-blood-dark/20 border-b border-border/50"></div>
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16">
              <div
                onClick={() => setShowAvatarModal(true)}
                className="cursor-pointer group relative"
              >
                <Avatar user={displayUser} size="2xl" />
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Edit2 className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="flex-1 mt-4 sm:mt-0">
                <h1 className="font-display text-3xl uppercase tracking-wider text-text-primary">
                  {displayUser?.name}
                </h1>
                <p className="text-text-muted text-sm mt-1">Blood Seeker • Patient Care Coordinator</p>
              </div>

              <Button
                variant="primary"
                onClick={() => setIsEditing(!isEditing)}
                icon={<Edit2 className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Contact & Location */}
          <div className="lg:col-span-2 space-y-4">
            {/* Contact Information */}
            <Card>
              <div className="p-6 space-y-4">
                <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Contact Information</h3>

                {!isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-blood flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold uppercase text-text-muted">Email</p>
                        <a
                          href={`mailto:${displayUser?.email}`}
                          className="text-text-primary hover:text-blood transition-colors"
                        >
                          {displayUser?.email}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-blood flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold uppercase text-text-muted">Phone</p>
                        <a
                          href={`tel:${displayUser?.phone}`}
                          className="text-text-primary hover:text-blood transition-colors font-mono"
                        >
                          {displayUser?.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-4">
                    <Input
                      label="Full Name"
                      placeholder="Your full name"
                      {...register('name')}
                      error={errors.name?.message}
                    />
                    <Input
                      label="Email"
                      type="email"
                      placeholder="your@email.com"
                      {...register('email')}
                      error={errors.email?.message}
                      disabled
                    />
                    <Input
                      label="Phone Number"
                      placeholder="10-digit phone number"
                      {...register('phone')}
                      error={errors.phone?.message}
                    />
                  </form>
                )}
              </div>
            </Card>

            {/* Location Information */}
            <Card>
              <div className="p-6 space-y-4">
                <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Location</h3>

                {!isEditing ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blood flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold uppercase text-text-muted">City & State</p>
                        <p className="text-text-primary">
                          {displayUser?.city}, {displayUser?.state}
                        </p>
                      </div>
                    </div>

                    {displayUser?.address && (
                      <div className="flex items-start gap-3 pt-3 border-t border-border/30">
                        <MapPin className="w-5 h-5 text-blood flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold uppercase text-text-muted">Address</p>
                          <p className="text-text-primary text-sm leading-relaxed">{displayUser.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="City"
                        placeholder="Your city"
                        {...register('city')}
                        error={errors.city?.message}
                      />
                      <Input
                        label="State"
                        placeholder="Your state"
                        {...register('state')}
                        error={errors.state?.message}
                      />
                    </div>
                    <Input
                      label="Address (Optional)"
                      placeholder="Street address"
                      {...register('address')}
                    />
                  </form>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column: Profile Stats & Requests */}
          <div className="space-y-4">
            {/* Account Information */}
            <Card>
              <div className="p-6 space-y-4">
                <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Account</h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-text-muted mb-1">Role</p>
                    <div className="inline-flex px-3 py-1 rounded-full bg-blood/10 border border-blood/20">
                      <span className="text-xs font-bold uppercase tracking-wider text-blood">Blood Seeker</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-text-muted mb-1">Member Since</p>
                    <p className="text-text-primary text-sm">
                      {displayUser?.createdAt
                        ? new Date(displayUser.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : 'Recently'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-text-muted mb-1">Verification Status</p>
                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      displayUser?.isVerified
                        ? 'bg-success/10 border border-success/20 text-success'
                        : 'bg-warning/10 border border-warning/20 text-warning'
                    }`}>
                      {displayUser?.isVerified ? '✓ Verified' : 'Pending Verification'}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card>
              <div className="p-6 space-y-4">
                <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Quick Stats</h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-text-muted">Total Requests</p>
                    <p className="text-xl font-bold text-blood">{displayUser?.totalRequests || 0}</p>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-border/30">
                    <p className="text-sm text-text-muted">Active Requests</p>
                    <p className="text-xl font-bold text-critical">{displayUser?.activeRequests || 0}</p>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-border/30">
                    <p className="text-sm text-text-muted">Completed</p>
                    <p className="text-xl font-bold text-success">{displayUser?.completedRequests || 0}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Edit Form Submit */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 pt-4"
          >
            <Button
              variant="secondary"
              onClick={() => setIsEditing(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit(onSubmit)}
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? <Loader className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </motion.div>
        )}
      </div>

      {/* Avatar Upload Modal */}
      <Modal isOpen={showAvatarModal} onClose={() => setShowAvatarModal(false)}>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-text-primary">Upload Avatar</h2>
          <p className="text-text-muted text-sm">
            Avatar upload feature would be integrated with your cloud storage (e.g., AWS S3, Cloudinary).
          </p>
          <div className="bg-surface-2 border-2 border-dashed border-border/50 rounded-lg p-8 text-center">
            <p className="text-text-muted text-sm">Drag & drop your image here or click to select</p>
          </div>
          <Button variant="secondary" onClick={() => setShowAvatarModal(false)} className="w-full">
            Close
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default SeekerProfile
