import React, { useState, useEffect } from 'react'
import { MapPin, Calendar, Edit2, Loader } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import BloodGroupBadge from '../../components/common/BloodGroupBadge'
import VerifiedBadge from '../../components/common/VerifiedBadge'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import donorService from '../../services/donorService'
import { useAuthStore } from '../../store/authStore'
import { toast } from 'react-hot-toast'

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
  age: z.number().min(18).max(65),
  gender: z.enum(['male', 'female', 'other']),
  weight: z.number().min(40, 'Weight must be at least 40 kg').max(150, 'Weight must be less than 150 kg'),
  city: z.string().min(2),
  lastDonationDate: z.string().optional(),
  medicalConditions: z.string().optional(),
})

const DonorProfile = () => {
  const { user, updateProfile } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

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
      bloodGroup: user?.bloodGroup || 'A+',
      age: user?.age || 25,
      gender: user?.gender || 'male',
      weight: user?.weight || 60,
      city: user?.city || '',
      lastDonationDate: user?.lastDonationDate || '',
      medicalConditions: Array.isArray(user?.medicalConditions)
        ? user.medicalConditions.join(', ')
        : user?.medicalConditions || '',
    },
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const response = await donorService.getProfile()
      const profile = response.profile || response.data || response
      setProfileData(profile)

      // Pre-fill form
      setValue('name', profile.name || '')
      setValue('email', profile.email || '')
      setValue('phone', profile.phone || '')
      setValue('bloodGroup', profile.bloodGroup || '')
      setValue('age', profile.age || '')
      setValue('gender', profile.gender || 'male')
      setValue('weight', profile.weight || '')
      setValue('city', profile.city || '')
      setValue('lastDonationDate', profile.lastDonationDate || '')
      setValue('medicalConditions', Array.isArray(profile.medicalConditions) ? profile.medicalConditions.join(', ') : profile.medicalConditions || '')
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
      const payload = {
        ...data,
        medicalConditions: data.medicalConditions
          ? data.medicalConditions.split(',').map((item) => item.trim()).filter(Boolean)
          : []
      }
      await donorService.updateProfile(payload)
      await updateProfile(payload)
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

  const handleRequestVerification = async () => {
    setIsVerifying(true)
    try {
      await donorService.requestVerification()
      toast.success('Verification request submitted! Admin will review shortly.')
      setShowVerifyModal(false)
      fetchProfile()
    } catch (err) {
      console.error(err)
      toast.error('Failed to request verification')
    } finally {
      setIsVerifying(false)
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
        {/* Profile Header */}
        <Card className="overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-blood/20 to-blood-dark/20 border-b border-border/50"></div>
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16">
              <Avatar user={displayUser} size="2xl" />
              <div className="flex-1 mt-4 sm:mt-0">
                <h1 className="font-display text-3xl uppercase tracking-wider text-text-primary">
                  {displayUser?.name}
                </h1>
                <p className="text-text-muted text-sm mt-1">Blood Donor {displayUser?.isVerified && '• Verified'}</p>
              </div>

              {!displayUser?.isVerified && (
                <Button
                  variant="warning"
                  onClick={() => setShowVerifyModal(true)}
                  className="w-full sm:w-auto text-xs"
                >
                  Request Verification
                </Button>
              )}

              <Button
                variant="primary"
                onClick={() => setIsEditing(!isEditing)}
                icon={<Edit2 className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Personal Information */}
          <div className="lg:col-span-2 space-y-4">
            {/* Blood Group & Health Info */}
            <Card>
              <div className="p-6 space-y-4">
                <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Health Information</h3>

                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase text-text-muted mb-2">Blood Group</p>
                        <BloodGroupBadge bloodGroup={displayUser?.bloodGroup} size="lg" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-text-muted mb-2">Age</p>
                        <p className="text-text-primary font-bold text-lg">{displayUser?.age} years</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase text-text-muted mb-1">Gender</p>
                        <p className="text-text-primary">{displayUser?.gender}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-text-muted mb-1">Total Donations</p>
                        <p className="text-text-primary font-bold">{displayUser?.totalDonations || 0}</p>
                      </div>
                    </div>

                    {displayUser?.lastDonationDate && (
                      <div className="pt-3 border-t border-border/30">
                        <p className="text-xs font-semibold uppercase text-text-muted mb-1">Last Donation</p>
                        <p className="text-text-primary">
                          {new Date(displayUser.lastDonationDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {displayUser?.medicalConditions && (
                      <div className="pt-3 border-t border-border/30">
                        <p className="text-xs font-semibold uppercase text-text-muted mb-2">Medical Conditions</p>
                        <p className="text-text-primary text-sm">{displayUser.medicalConditions}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Blood Group"
                        {...register('bloodGroup')}
                        options={bloodGroups.map((bg) => ({ value: bg, label: bg }))}
                      />
                      <Input
                        label="Age"
                        type="number"
                        min="18"
                        max="65"
                        {...register('age', { valueAsNumber: true })}
                        error={errors.age?.message}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Gender"
                        {...register('gender')}
                        options={[
                          { value: 'male', label: 'Male' },
                          { value: 'female', label: 'Female' },
                          { value: 'other', label: 'Other' },
                        ]}
                      />
                      <Input
                        label="Weight (kg)"
                        type="number"
                        min="40"
                        max="150"
                        {...register('weight', { valueAsNumber: true })}
                        error={errors.weight?.message}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Last Donation Date"
                        type="date"
                        {...register('lastDonationDate')}
                      />
                      <Input
                        label="City"
                        {...register('city')}
                        error={errors.city?.message}
                      />
                    </div>

                    <Input
                      label="Medical Conditions (Optional)"
                      placeholder="e.g., None, Diabetes, etc."
                      {...register('medicalConditions')}
                    />
                  </form>
                )}
              </div>
            </Card>

            {/* Contact Information */}
            <Card>
              <div className="p-6 space-y-4">
                <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Contact Information</h3>

                {!isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-text-muted mb-1">Email</p>
                      <a href={`mailto:${displayUser?.email}`} className="text-blood hover:underline">
                        {displayUser?.email}
                      </a>
                    </div>
                    <div className="pt-3 border-t border-border/30">
                      <p className="text-xs font-semibold uppercase text-text-muted mb-1">Phone</p>
                      <a href={`tel:${displayUser?.phone}`} className="text-blood hover:underline font-mono">
                        {displayUser?.phone}
                      </a>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-4">
                    <Input
                      label="Name"
                      {...register('name')}
                      error={errors.name?.message}
                    />
                    <Input
                      label="Email"
                      type="email"
                      {...register('email')}
                      disabled
                      error={errors.email?.message}
                    />
                    <Input
                      label="Phone"
                      {...register('phone')}
                      error={errors.phone?.message}
                    />
                    <Input
                      label="City"
                      {...register('city')}
                      error={errors.city?.message}
                    />
                  </form>
                )}
              </div>
            </Card>
          </div>

          {/* Right: Statistics & Status */}
          <div className="space-y-4">
            {/* Account Status */}
            <Card>
              <div className="p-6 space-y-4">
                <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Account Status</h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-text-muted mb-2">Role</p>
                    <div className="inline-flex px-3 py-1 rounded-full bg-blood/10 border border-blood/20">
                      <span className="text-xs font-bold uppercase tracking-wider text-blood">Blood Donor</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase text-text-muted mb-2">Verification</p>
                    {displayUser?.isVerified ? (
                      <VerifiedBadge />
                    ) : (
                      <div className="inline-flex px-3 py-1 rounded-full bg-warning/10 border border-warning/20">
                        <span className="text-xs font-bold uppercase tracking-wider text-warning">Pending</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-border/30">
                    <p className="text-xs font-semibold uppercase text-text-muted mb-1">Member Since</p>
                    <p className="text-text-primary text-sm">
                      {displayUser?.createdAt
                        ? new Date(displayUser.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Recently'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Donation Stats */}
            <Card>
              <div className="p-6 space-y-3">
                <h3 className="font-display text-lg uppercase tracking-wider text-text-primary mb-4">Donation Stats</h3>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-text-muted">Total Donations</p>
                  <p className="text-2xl font-bold text-blood">{displayUser?.totalDonations || 0}</p>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border/30">
                  <p className="text-sm text-text-muted">Units Provided</p>
                  <p className="text-2xl font-bold text-success">{displayUser?.unitsProvided || 0}</p>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border/30">
                  <p className="text-sm text-text-muted">Lives Helped</p>
                  <p className="text-2xl font-bold text-info">{displayUser?.livesHelped || 0}</p>
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
            <Button variant="secondary" onClick={() => setIsEditing(false)} className="flex-1">
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

      {/* Verification Modal */}
      <Modal isOpen={showVerifyModal} onClose={() => setShowVerifyModal(false)}>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-text-primary">Request Verification</h2>
          <p className="text-text-muted">
            Complete verification to gain increased trust and be prioritized for blood requests. Our admin team will
            review your application within 24 hours.
          </p>
          <div className="space-y-2 text-sm text-text-muted">
            <p>✓ Valid ID proof</p>
            <p>✓ Medical clearance (if required)</p>
            <p>✓ Donation eligibility confirmation</p>
          </div>
          <div className="flex gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowVerifyModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRequestVerification}
              disabled={isVerifying}
              className="flex-1"
            >
              {isVerifying ? <Loader className="w-4 h-4 animate-spin" /> : 'Request Verification'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default DonorProfile
