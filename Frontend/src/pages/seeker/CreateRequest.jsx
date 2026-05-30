import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { ShieldAlert, AlertTriangle, Calendar, Plus, Minus, FileText, MapPin, Phone } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import seekerService from '../../services/seekerService';
import { getCityCoordinates, cn } from '../../lib/utils';
import { toast } from 'react-hot-toast';

// Zod Validation Schema
const requestSchema = zod.object({
  patientName: zod.string().min(2, 'Patient name is required (min 2 chars)'),
  bloodGroup: zod.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
    errorMap: () => ({ message: 'Please select a blood group' })
  }),
  unitsRequired: zod.coerce.number().min(1, 'At least 1 unit').max(20, 'Max 20 units'),
  hospitalName: zod.string().min(2, 'Hospital name is required'),
  hospitalAddress: zod.string().min(2, 'Hospital address is required'),
  city: zod.string().min(2, 'City is required'),
  state: zod.string().min(2, 'State is required'),
  urgencyLevel: zod.enum(['normal', 'moderate', 'urgent', 'critical']),
  contactNumber: zod.string().regex(/^\d{10}$/, 'Must be a 10-digit mobile number'),
  deadline: zod.string().min(1, 'Please select a valid deadline date/time'),
  notes: zod.string().optional(),
});

export const CreateRequest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSOSRequest, setIsSOSRequest] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read URL query parameters to pre-fill search terms from landing search box if present
  const urlBg = searchParams.get('bloodGroup') || '';
  const urlCity = searchParams.get('city') || '';
  const urlHospitalId = searchParams.get('hospitalId') || '';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      patientName: '',
      bloodGroup: urlBg,
      unitsRequired: 1,
      hospitalName: '',
      hospitalAddress: '',
      city: urlCity,
      state: '',
      urgencyLevel: 'normal',
      contactNumber: '',
      deadline: '',
      notes: '',
    }
  });

  const selectedBg = watch('bloodGroup');
  const selectedUrgency = watch('urgencyLevel');
  const selectedUnits = watch('unitsRequired');

  // If SOS Request toggle is enabled, force urgency to critical
  useEffect(() => {
    if (isSOSRequest) {
      setValue('urgencyLevel', 'critical');
    }
  }, [isSOSRequest, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const [lng, lat] = getCityCoordinates(data.city);
      const payload = {
        ...data,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        isSOSRequest,
        // Override urgency if SOS is toggled
        urgencyLevel: isSOSRequest ? 'critical' : data.urgencyLevel,
        ...(urlHospitalId ? { hospitalId: urlHospitalId } : {}),
      };

      await seekerService.createRequest(payload);
      toast.success(
        isSOSRequest 
          ? '🚨 CRITICAL SOS BROADCAST COMPLETED! Nearby nodes are notified.'
          : 'Emergency request registered successfully.'
      );
      navigate('/seeker/requests');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencies = [
    { value: 'normal', label: 'Normal', color: 'border-green-500/20 bg-green-500/5 text-green-400 select-none' },
    { value: 'moderate', label: 'Moderate', color: 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400 select-none' },
    { value: 'urgent', label: 'Urgent', color: 'border-orange-500/20 bg-orange-500/5 text-orange-400 select-none' },
    { value: 'critical', label: 'Critical / SOS', color: 'border-red-500/20 bg-red-500/5 text-red-400 select-none' }
  ];

  return (
    <DashboardLayout title="Create Blood Request">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-body">
        
        {/* Helper Instructions Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="border-white/5">
            <CardHeader>
              <CardTitle className="text-sm font-mono uppercase tracking-wider">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-text-muted leading-relaxed flex flex-col gap-3">
              <p>
                Provide detailed patient coordinates to locate corresponding blood donor slots.
              </p>
              <div className="flex gap-2 items-start bg-white/5 border border-white/5 p-3 rounded-lg mt-2 text-text-primary">
                <ShieldAlert className="w-4 h-4 shrink-0 text-blood-glow" />
                <div>
                  <span className="font-bold uppercase block">SOS Broadcast Feature</span>
                  Toggling the SOS marker escalates the request, pushing real-time alerts to all matched city nodes instantly.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Container Column */}
        <div className="lg:col-span-8">
          <Card className={cn(
            'border border-border/80 transition-all duration-300 shadow-card',
            isSOSRequest && 'border-critical shadow-blood/10 animate-sos-pulse-ring'
          )}>
            <CardHeader className="flex flex-row justify-between items-center pr-6 flex-wrap gap-4">
              <div>
                <CardTitle className="text-lg">Draft Dispatch Request</CardTitle>
                <CardDescription>Coordinate emergency blood units for patient care.</CardDescription>
              </div>
              
              {/* SOS Toggle Switch */}
              <div className="flex items-center gap-2 bg-white/5 border border-white/5 p-2 rounded-xl">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider font-mono">
                  🚨 SOS ALERT
                </span>
                <button
                  type="button"
                  onClick={() => setIsSOSRequest(!isSOSRequest)}
                  className={cn(
                    'w-10 h-5 rounded-full p-0.5 transition-all duration-200 outline-none flex',
                    isSOSRequest ? 'bg-critical justify-end' : 'bg-surface-3 border border-border justify-start'
                  )}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-white block shadow" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* 1. Patient info */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-blood uppercase tracking-wider font-mono border-b border-border/80 pb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Patient Information</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Patient Full Name"
                      placeholder="e.g. John Doe"
                      error={errors.patientName?.message}
                      {...register('patientName')}
                    />

                    {/* Stepper units selection */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        Units Required (350ml each)
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setValue('unitsRequired', Math.max(1, selectedUnits - 1))}
                          className="w-10 h-10 rounded-lg bg-surface-3 hover:bg-surface-4 border border-border flex items-center justify-center text-text-primary outline-none active:scale-90"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center text-lg font-bold font-mono text-text-primary">
                          {selectedUnits}
                        </span>
                        <button
                          type="button"
                          onClick={() => setValue('unitsRequired', Math.min(20, selectedUnits + 1))}
                          className="w-10 h-10 rounded-lg bg-surface-3 hover:bg-surface-4 border border-border flex items-center justify-center text-text-primary outline-none active:scale-90"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Blood group grid */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Patient Blood Group
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {bloodGroups.map((bg) => (
                        <button
                          key={bg}
                          type="button"
                          onClick={() => setValue('bloodGroup', bg)}
                          className={cn(
                            'py-2 px-3 rounded-lg border border-border bg-surface-3 hover:bg-white/5 font-mono font-bold text-sm text-text-muted transition-all active:scale-95',
                            selectedBg === bg && 'border-blood bg-blood/10 text-blood shadow-sm'
                          )}
                        >
                          {bg}
                        </button>
                      ))}
                    </div>
                    {errors.bloodGroup && (
                      <span className="text-xs text-critical font-semibold mt-1">
                        {errors.bloodGroup?.message}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Location Info */}
                <div className="space-y-4 pt-4 border-t border-border/40">
                  <h4 className="text-xs font-bold text-blood uppercase tracking-wider font-mono border-b border-border/80 pb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Location Coordinates</span>
                  </h4>

                  <Input
                    label="Hospital Name"
                    placeholder="e.g. City Care Research Center"
                    error={errors.hospitalName?.message}
                    {...register('hospitalName')}
                  />

                  <Input
                    label="Hospital Physical Address"
                    placeholder="e.g. 15th Main, 4th Block, Koramangala"
                    error={errors.hospitalAddress?.message}
                    {...register('hospitalAddress')}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="City"
                      placeholder="e.g. Bangalore"
                      error={errors.city?.message}
                      {...register('city')}
                    />

                    <Input
                      label="State"
                      placeholder="e.g. Karnataka"
                      error={errors.state?.message}
                      {...register('state')}
                    />
                  </div>
                </div>

                {/* 3. Urgency & Deadlines */}
                <div className="space-y-4 pt-4 border-t border-border/40">
                  <h4 className="text-xs font-bold text-blood uppercase tracking-wider font-mono border-b border-border/80 pb-1 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Urgency Level & Deadlines</span>
                  </h4>

                  {/* Urgency clickable radio cards */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Select Urgency Level
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      {urgencies.map((u) => {
                        const isSelected = selectedUrgency === u.value;
                        const isCriticalSOS = isSOSRequest && u.value === 'critical';
                        
                        return (
                          <button
                            key={u.value}
                            type="button"
                            disabled={isSOSRequest && u.value !== 'critical'}
                            onClick={() => setValue('urgencyLevel', u.value)}
                            className={cn(
                              'p-3 border rounded-xl flex flex-col items-center justify-center text-center font-body text-xs font-bold transition-all border-border bg-surface-3 outline-none disabled:opacity-30 disabled:pointer-events-none active:scale-95 text-text-muted hover:bg-white/5',
                              isSelected && u.color,
                              isSelected && 'border-current font-extrabold shadow-sm'
                            )}
                          >
                            <span>{u.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Request Expiry Deadline"
                      type="datetime-local"
                      error={errors.deadline?.message}
                      {...register('deadline')}
                    />

                    <Input
                      label="Coordinator Mobile Number"
                      placeholder="10-digit number"
                      icon={<Phone className="w-4 h-4" />}
                      error={errors.contactNumber?.message}
                      {...register('contactNumber')}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                      Additional Clinical Notes (Optional)
                    </label>
                    <textarea
                      placeholder="Specify ward number, patient doctor contact, or key instruction codes..."
                      rows="3"
                      className="w-full bg-surface-3 text-text-primary border border-border rounded-lg py-2.5 px-3 focus:border-blood focus:ring-1 focus:ring-blood/50 outline-none transition-all text-xs"
                      {...register('notes')}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-border/80 flex-wrap">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto text-xs uppercase tracking-wider font-display"
                    disabled={isSubmitting}
                    onClick={() => navigate('/seeker/dashboard')}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="submit"
                    variant={isSOSRequest ? 'danger' : 'primary'}
                    className={cn('w-full sm:w-auto text-xs uppercase tracking-wider font-display font-semibold', isSOSRequest && 'shadow-blood')}
                    isLoading={isSubmitting}
                    icon={<ShieldAlert className="w-4.5 h-4.5" />}
                  >
                    {isSOSRequest ? 'BROADCAST SOS ALERT' : 'Submit Request'}
                  </Button>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default CreateRequest;
