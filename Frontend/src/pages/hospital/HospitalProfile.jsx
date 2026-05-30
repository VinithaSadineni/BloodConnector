import React, { useState, useEffect } from 'react'
import { Mail, Edit2, Loader } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import VerifiedBadge from '../../components/common/VerifiedBadge'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import hospitalService from '../../services/hospitalService'
import { useAuthStore } from '../../store/authStore'
import { toast } from 'react-hot-toast'

const profileSchema = z.object({
  institutionName: z.string().min(2, 'Institution name is required'),
  institutionType: z.enum(['hospital', 'blood_bank', 'clinic']),
  registrationNumber: z.string().min(2, 'Registration number is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(4, 'Pincode is required'),
  contactPerson: z.string().min(2, 'Contact person name is required'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
})

const HospitalProfile = () => {
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
      institutionName: user?.institutionName || '',
      institutionType: user?.institutionType || 'hospital',
      registrationNumber: user?.registrationNumber || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      pincode: user?.pincode || '',
      contactPerson: user?.contactPerson || '',
      phone: user?.phone || '',
      website: user?.website || '',
    },
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setIsLoading(true)
    try {
      const response = await hospitalService.getProfile();
      const profile = (response.data && response.data.data) || response.data || {};
      setProfileData(profile)

      // Pre-fill form
      setValue('institutionName', profile.institutionName || '')
      setValue('institutionType', profile.institutionType || 'hospital')
      setValue('registrationNumber', profile.registrationNumber || '')
      setValue('address', profile.address || '')
      setValue('city', profile.city || '')
      setValue('state', profile.state || '')
      setValue('pincode', profile.pincode || '')
      setValue('contactPerson', profile.contactPerson || '')
      setValue('phone', profile.phone || '')
      setValue('website', profile.website || '')
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
      await hospitalService.updateProfile(data)
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

  const handleRequestVerification = async () => {
    setIsVerifying(true)
    try {
      await hospitalService.requestVerification()
      toast.success('Verification request submitted!')
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
      <DashboardLayout title="Institution Profile">
        <div className="space-y-6">
          <Skeleton variant="card" className="h-64" />
          <Skeleton variant="card" className="h-96" />
        </div>
      </DashboardLayout>
    )
  }

  const displayUser = profileData || user

  return (
    <DashboardLayout title="Institution Profile">
      <div className="space-y-6">
        {/* Header Card */}
        <Card className="overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-blood/20 to-blood-dark/20 border-b border-border/50"></div>
          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12">
              <div className="w-20 h-20 rounded-full bg-surface-3 border-2 border-blood flex items-center justify-center text-2xl">
                🏥
              </div>
              <div className="flex-1 mt-4 sm:mt-0">
                <h1 className="font-display text-3xl uppercase tracking-wider text-text-primary">
                  {displayUser?.institutionName}
                </h1>
                <p className="text-text-muted text-sm mt-1">
                  {displayUser?.institutionType?.replace('_', ' ')} • {displayUser?.city}
                </p>
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
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Institution Details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Basic Information */}
            <Card>
              <div className="p-6 space-y-4">
                <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Institution Information</h3>

                {!isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-text-muted mb-1">Institution Name</p>
                      <p className="text-text-primary font-semibold">{displayUser?.institutionName}</p>
                    </div>
                    <div className="pt-3 border-t border-border/30 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase text-text-muted mb-1">Type</p>
                        <p className="text-text-primary capitalize">{displayUser?.institutionType?.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-text-muted mb-1">Registration Number</p>
                        <p className="text-text-primary font-mono text-sm">{displayUser?.registrationNumber}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-4">
                    <Input
                      label="Institution Name"
                      {...register('institutionName')}
                      error={errors.institutionName?.message}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Type"
                        {...register('institutionType')}
                        options={[
                          { value: 'hospital', label: 'Hospital' },
                          { value: 'blood_bank', label: 'Blood Bank' },
                          { value: 'clinic', label: 'Clinic' },
                        ]}
                      />
                      <Input
                        label="Registration Number"
                        {...register('registrationNumber')}
                        error={errors.registrationNumber?.message}
                      />
                    </div>
                  </form>
                )}
              </div>
            </Card>

            {/* Address & Location */}
            <Card>
              <div className="p-6 space-y-4">
                <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Location</h3>

                {!isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-text-muted mb-1">Address</p>
                      <p className="text-text-primary leading-relaxed">{displayUser?.address}</p>
                    </div>
                    <div className="pt-3 border-t border-border/30 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase text-text-muted mb-1">City</p>
                        <p className="text-text-primary">{displayUser?.city}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-text-muted mb-1">State</p>
                        <p className="text-text-primary">{displayUser?.state}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-4">
                    <Input
                      label="Address"
                      {...register('address')}
                      error={errors.address?.message}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="City"
                        {...register('city')}
                        error={errors.city?.message}
                      />
                      <Input
                        label="State"
                        {...register('state')}
                        error={errors.state?.message}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Pincode"
                        {...register('pincode')}
                        error={errors.pincode?.message}
                      />
                      <Input
                        label="Contact Phone"
                        {...register('phone')}
                        error={errors.phone?.message}
                      />
                    </div>
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
                      <p className="text-xs font-semibold uppercase text-text-muted mb-1">Contact Person</p>
                      <p className="text-text-primary font-semibold">{displayUser?.contactPerson}</p>
                    </div>
                    <div className="pt-3 border-t border-border/30">
                      <p className="text-xs font-semibold uppercase text-text-muted mb-1">Phone</p>
                      <a
                        href={`tel:${displayUser?.phone || displayUser?.contactPhone}`}
                        className="text-blood hover:text-blood-glow font-mono"
                      >
                        {displayUser?.phone || displayUser?.contactPhone}
                      </a>
                    </div>
                    {displayUser?.website && (
                      <div className="pt-3 border-t border-border/30">
                        <p className="text-xs font-semibold uppercase text-text-muted mb-1">Website</p>
                        <a
                          href={displayUser.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blood hover:text-blood-glow break-all"
                        >
                          {displayUser.website}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <form className="space-y-4">
                    <Input
                      label="Contact Person"
                      {...register('contactPerson')}
                      error={errors.contactPerson?.message}
                    />
                    <Input
                      label="Contact Phone"
                      {...register('phone')}
                      error={errors.phone?.message}
                    />
                    <Input
                      label="Website (Optional)"
                      {...register('website')}
                      error={errors.website?.message}
                    />
                  </form>
                )}
              </div>
            </Card>
          </div>

          {/* Right: Status & Stats */}
          <div className="space-y-4">
            {/* Verification Status */}
            <Card>
              <div className="p-6 space-y-4">
                <h3 className="font-display text-lg uppercase tracking-wider text-text-primary">Status</h3>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-text-muted mb-2">Verification</p>
                    {displayUser?.isVerified ? (
                      <VerifiedBadge />
                    ) : (
                      <div className="inline-flex px-3 py-1 rounded-full bg-warning/10 border border-warning/20">
                        <span className="text-xs font-bold uppercase text-warning">Pending</span>
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

            {/* Quick Stats */}
            <Card>
              <div className="p-6 space-y-3">
                <h3 className="font-display text-lg uppercase tracking-wider text-text-primary mb-4">Activity</h3>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-text-muted">Total Requests Fulfilled</p>
                  <p className="text-2xl font-bold text-blood">{displayUser?.requestsFulfilled || 0}</p>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border/30">
                  <p className="text-sm text-text-muted">Pending Requests</p>
                  <p className="text-2xl font-bold text-warning">{displayUser?.pendingRequests || 0}</p>
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

      {/* Verification Modal */}
      <Modal isOpen={showVerifyModal} onClose={() => setShowVerifyModal(false)}>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-text-primary">Request Verification</h2>
          <p className="text-text-muted">
            Get your institution verified to gain priority in blood request matching and build trust.
          </p>
          <div className="space-y-2 text-sm text-text-muted bg-surface-2 p-4 rounded">
            <p>✓ Institution registration certificate</p>
            <p>✓ Blood bank license (if applicable)</p>
            <p>✓ Valid tax ID or registration number</p>
            <p>✓ Contact person verification</p>
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowVerifyModal(false)}
              className="flex-1 text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRequestVerification}
              disabled={isVerifying}
              className="flex-1 text-xs"
            >
              {isVerifying ? 'Submitting...' : 'Submit Verification'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}

export default HospitalProfile
