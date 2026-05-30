import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Eye, EyeOff, Mail, Lock, ShieldAlert, Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-hot-toast';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

// Validation Schema using Zod
const loginSchema = zod.object({
  email: zod.string().min(1, 'Email is required').email('Invalid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
});

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name}! Access coordinates initialized.`);
      
      // Redirect to correct dashboard based on role
      switch (user.role) {
        case 'seeker':
          navigate('/seeker/dashboard');
          break;
        case 'donor':
          navigate('/donor/dashboard');
          break;
        case 'hospital':
          navigate('/hospital/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          navigate('/seeker/dashboard');
      }
    } catch (err) {
      console.error(err);
      // Errors are already displayed in toast via axios response interceptor
    }
  };

  return (
    <div className="min-h-screen bg-surface flex font-body">
      
      {/* Brand Panel (Left Side - Desktop only) */}
      <div className="hidden lg:flex lg:col-span-5 w-[42%] relative overflow-hidden bg-gradient-to-br from-blood-dark via-surface-2 to-surface flex-col justify-between p-12 border-r border-border/80">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blood/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blood-glow/5 rounded-full blur-3xl pointer-events-none" />

        {/* Header branding */}
        <Link to="/" className="flex items-center gap-2.5 z-10 w-fit">
          <svg className="w-8 h-8 text-blood fill-current drop-shadow-[0_0_8px_rgba(200,16,46,0.6)]" viewBox="0 0 24 24">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
          <span className="font-display text-2xl tracking-wider text-text-primary uppercase">
            EMERGENCY <span className="text-blood">CONNECTOR</span>
          </span>
        </Link>

        {/* Centered high-impact quote */}
        <div className="z-10 flex flex-col gap-4 max-w-sm mt-12 mb-12">
          <span className="text-5xl text-blood font-bold leading-none font-display uppercase tracking-wide">
            "Saves A Life"
          </span>
          <p className="text-sm text-text-muted leading-relaxed font-light">
            "The donation of blood is the ultimate act of solidarity. In critical care dispatching, every elapsed second dictates patient outcomes."
          </p>
          <div className="flex items-center gap-2 mt-4">
            <div className="w-8 h-[1px] bg-blood" />
            <span className="text-[10px] text-blood-glow font-mono uppercase tracking-widest font-bold">
              Critical Command System
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div className="z-10 text-[10px] text-text-muted">
          &copy; {new Date().getFullYear()} Emergency Blood Connector. Secure connection authenticated.
        </div>
      </div>

      {/* Form Panel (Right Side - Desktop & full mobile) */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 py-12 relative">
        
        {/* Branding shortcut for mobile view */}
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

        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-text-primary uppercase tracking-wide">
              Operator Sign In
            </h2>
            <p className="text-xs text-text-muted">
              Access the real-time emergency healthcare coordination dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="space-y-4">
              <Input
                label="Registered Email Address"
                placeholder="operator@ebc.com"
                type="email"
                icon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

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
                  className="absolute right-3 top-[34px] text-text-muted hover:text-text-primary focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-medium">
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 bg-surface-3 border-border rounded text-blood focus:ring-blood/50 outline-none cursor-pointer"
                />
                <label htmlFor="remember-me" className="text-text-muted cursor-pointer select-none">
                  Keep me authenticated
                </label>
              </div>

              <a href="#" className="text-blood hover:text-blood-glow transition-colors">
                Recover Credentials
              </a>
            </div>

            <div className="flex flex-col gap-4">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 font-display uppercase tracking-widest font-bold text-sm"
                isLoading={isLoading}
              >
                Establish Authentication
              </Button>
              <div className="text-xs text-center text-text-muted">
                New operator?{' '}
                <Link to="/signup" className="text-blood hover:text-blood-glow font-semibold transition-colors">
                  Create an account
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
