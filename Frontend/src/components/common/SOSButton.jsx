import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { ShieldAlert, AlertTriangle } from 'lucide-react';
import { cn, getCityCoordinates } from '../../lib/utils';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import seekerService from '../../services/seekerService';
import { toast } from 'react-hot-toast';

const sosSchema = zod.object({
  patientName: zod.string().min(2, 'Patient name is required (min 2 chars)'),
  bloodGroup: zod.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
    errorMap: () => ({ message: 'Please select a valid blood group' })
  }),
  unitsRequired: zod.coerce.number().min(1, 'Min 1 unit').max(20, 'Max 20 units'),
  hospitalName: zod.string().min(2, 'Hospital name is required'),
  city: zod.string().min(2, 'City is required'),
  contactNumber: zod.string().regex(/^\d{10}$/, 'Must be a 10-digit mobile number'),
});

export const SOSButton = ({ className }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(sosSchema),
    defaultValues: {
      patientName: '',
      bloodGroup: '',
      unitsRequired: 1,
      hospitalName: '',
      city: '',
      contactNumber: '',
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Calculate coordinates for backend geospatial query
      const [lng, lat] = getCityCoordinates(data.city);
      const sosPayload = {
        ...data,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        isSOSRequest: true,
        urgencyLevel: 'critical',
        deadline: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours deadline for SOS
        notes: '🚨 IMMEDIATE EMERGENCY SOS BROADCAST SENT FROM DASHBOARD COMMAND TOOL.'
      };

      await seekerService.createRequest(sosPayload);
      toast.success('🚨 CRITICAL SOS BROADCASTED SUCCESSFULLY! Nearby donors are being notified.');
      reset();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      // Errors are toasted automatically in axios interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={cn(
          'w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blood hover:bg-blood-dark text-white flex items-center justify-center animate-sos-pulse-ring focus:outline-none transition-all active:scale-90 border border-transparent shadow-blood select-none z-10',
          className
        )}
        title="TRIGGER CRITICAL SOS"
      >
        <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="🚨 TRIGGER CRITICAL SOS BROADCAST"
        description="Submit this form to instantly alert all verified blood donors and hospitals in your city."
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-critical/10 border border-critical/30 rounded-xl p-3.5 flex items-start gap-3 text-xs text-critical">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold uppercase block">Life-Threatening Emergency Confirmation</span>
              This will trigger a real-time, city-wide notification broadcast (Socket.IO + Dashboard popups) to all available matched donors and partnering blood banks. Do not use for testing or non-emergencies.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Patient Full Name"
              placeholder="e.g. John Doe"
              error={errors.patientName?.message}
              {...register('patientName')}
            />

            <Select
              label="Required Blood Group"
              placeholder="Select Type"
              options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
              error={errors.bloodGroup?.message}
              {...register('bloodGroup')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Units Required (350ml/unit)"
              type="number"
              min="1"
              max="20"
              error={errors.unitsRequired?.message}
              {...register('unitsRequired')}
            />

            <Input
              label="Contact Number"
              placeholder="10-digit number"
              error={errors.contactNumber?.message}
              {...register('contactNumber')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Hospital Name"
              placeholder="e.g. City Care Hospital"
              error={errors.hospitalName?.message}
              {...register('hospitalName')}
            />

            <Input
              label="City"
              placeholder="e.g. Bangalore"
              error={errors.city?.message}
              {...register('city')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border/80">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={isSubmitting}
              icon={<ShieldAlert className="w-4 h-4" />}
            >
              BROADCAST SOS
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default SOSButton;
