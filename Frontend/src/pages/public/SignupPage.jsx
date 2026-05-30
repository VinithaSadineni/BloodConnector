import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import {
  Eye, EyeOff, User, Mail, Lock, Phone,
  ShieldCheck, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

const registrationSchema = zod.object({
  name: zod.string().min(2, 'Name must be at least 2 characters'),
  email: zod.string().min(1, 'Email is required').email('Invalid email format'),
  phone: zod.string().regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
  password: zod.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least 1 uppercase letter')
    .regex(/[0-9]/, 'Must contain at least 1 number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least 1 special character'),
  confirmPassword: zod.string().min(1, 'Please confirm your password'),
  role: zod.string().min(1, 'Select the role while registration'),
  hospitalName: zod.string().optional(),
  licenseNumber: zod.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).superRefine((data, ctx) => {
  if (data.role === 'hospital') {
    if (!data.hospitalName) {
      ctx.addIssue({ code: 'custom', message: 'Hospital Name is required', path: ['hospitalName'] });
    }
    if (!data.licenseNumber) {
      ctx.addIssue({ code: 'custom', message: 'License Number is required', path: ['licenseNumber'] });
    }
  }
});

const roleInfo = {
  seeker: {
    title: 'Blood Seeker',
    description: 'As a seeker, you can post emergency blood requests and request urgent support from nearby donors and hospitals.',
  },
  donor: {
    title: 'Blood Donor',
    description: 'As a donor, you can receive nearby blood requests and offer donation support when you are available.',
  },
  hospital: {
    title: 'Hospital / Blood Bank',
    description: 'As a hospital/bank, you can manage inventory, receive patient requests, and participate in local supply coordination.',
  },
  admin: {
    title: 'System Admin',
    description: 'As an admin, you can oversee user verification, monitor system health, and manage platform governance.',
  },
};

export const SignupPage = () => {
  const navigate = useNavigate();
  const { register: authRegister, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'seeker',
      hospitalName: '',
      licenseNumber: '',
    }
  });

  const currentRole = watch('role');

  const onSubmit = async (data) => {
    const registerPayload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: data.role,
      ...(data.role === 'hospital' && {
        hospitalName: data.hospitalName,
        licenseNumber: data.licenseNumber,
      }),
    };
    try {
      await authRegister(registerPayload);
      toast.success('Registration successful');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    }
  };

  const info = roleInfo[currentRole] || roleInfo.seeker;

  return (
    <div className="min-h-screen bg-surface flex font-body">
      <div className="hidden lg:flex lg:col-span-5 w-[42%] relative overflow-hidden bg-gradient-to-br from-blood-dark via-surface-2 to-surface flex-col justify-between p-12 border-r border-border/80">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blood/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blood-glow/5 rounded-full blur-3xl pointer-events-none" />

        <Link to="/" className="flex items-center gap-2.5 z-10 w-fit hover:opacity-80 transition-opacity duration-200">
          <svg className="w-8 h-8 text-blood fill-current drop-shadow-[0_0_8px_rgba(200,16,46,0.6)]" viewBox="0 0 24 24">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
          <span className="font-display text-2xl tracking-wider text-text-primary uppercase">
            EMERGENCY <span className="text-blood">CONNECTOR</span>
          </span>
        </Link>

        <div className="z-10 flex flex-col gap-4 max-w-sm mt-12 mb-12">
          <span className="text-4xl text-blood font-bold leading-none font-display uppercase tracking-wide">
            "Every Drop Saves"
          </span>
          <p className="text-sm text-text-muted leading-relaxed font-light">
            Become an essential node in the emergency blood care coordination network. Sign up today, complete verification, and save lives.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <div className="w-8 h-[1px] bg-blood" />
            <span className="text-[10px] text-blood-glow font-mono uppercase tracking-widest font-bold">
              Secure Registry Node
            </span>
          </div>
        </div>

        <div className="z-10 text-[10px] text-text-muted">
          &copy; {new Date().getFullYear()} Emergency Blood Connector. Registered node security protocols active.
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 py-12 relative overflow-y-auto">
        <div className="lg:hidden absolute top-6 left-6">
          <Link to="/" className="flex items-center gap-2">
            <svg className="w-6 h-6 text-blood fill-current" viewBox="0 0 24 24">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
            <span className="font-display text-lg tracking-wider text-text-primary uppercase">
              EMERGENCY <span className="text-blood">CONNECTOR</span>
            </span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-text-primary uppercase tracking-wide">
                One-step Registration
              </h2>
              <p className="text-xs text-text-muted">
                Register once and choose your role from the dropdown. The experience adapts to your selected role.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Full Representative Name"
                placeholder="e.g. Vikram Malhotra"
                icon={<User className="w-4 h-4" />}
                error={errors.name?.message}
                {...register('name')}
              />

              <Input
                label="Secure Email Address"
                placeholder="name@ebc.com"
                type="email"
                icon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Contact Mobile Number"
                placeholder="10-digit number"
                icon={<Phone className="w-4 h-4" />}
                error={errors.phone?.message}
                {...register('phone')}
              />

              <Select
                label="Select Role"
                placeholder="Select the role while registration"
                options={['seeker', 'donor', 'hospital', 'admin']}
                error={errors.role?.message}
                {...register('role')}
              />

              {currentRole === 'hospital' && (
                <>
                  <Input
                    label="Hospital Name"
                    placeholder="Enter full hospital name"
                    error={errors.hospitalName?.message}
                    {...register('hospitalName')}
                  />
                  <Input
                    label="License Number"
                    placeholder="Enter registration license"
                    error={errors.licenseNumber?.message}
                    {...register('licenseNumber')}
                  />
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label="Password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    icon={<Lock className="w-4 h-4" />}
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[34px] text-text-muted hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    label="Confirm Password"
                    placeholder="••••••••"
                    type={showConfirmPassword ? 'text' : 'password'}
                    icon={<Lock className="w-4 h-4" />}
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[34px] text-text-muted hover:text-text-primary"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-border/70 bg-surface-2 p-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-text-primary">
                    {info.title}
                  </p>
                  <p className="mt-2 text-xs text-text-muted leading-relaxed">
                    {info.description}
                  </p>
                </div>
                <div className="rounded-full bg-blood/10 text-blood w-10 h-10 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 font-display uppercase tracking-widest font-bold text-sm"
                isLoading={isLoading}
                icon={<ShieldCheck className="w-4 h-4" />}
              >
                Register Account
              </Button>
              <div className="text-xs text-center text-text-muted">
                Already registered?{' '}
                <Link to="/login" className="text-blood hover:text-blood-glow font-semibold transition-colors">
                  Login
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
