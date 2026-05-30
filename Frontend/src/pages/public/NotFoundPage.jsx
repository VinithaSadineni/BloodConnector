import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home, ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center font-body relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blood/10 rounded-full blur-3xl pointer-events-none" />

      <div className="z-10 max-w-md w-full glass-panel border-white/5 rounded-2xl p-8 flex flex-col items-center gap-6 shadow-blood-lg">
        <div className="p-4 rounded-full bg-critical/10 border border-critical/20 text-critical animate-bounce">
          <AlertCircle className="w-12 h-12" />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="font-display text-5xl text-text-primary tracking-wider uppercase">
            Code 404
          </h1>
          <h2 className="text-sm font-bold text-critical font-mono uppercase tracking-widest">
            Frequency Not Found
          </h2>
          <p className="text-xs text-text-muted mt-2 leading-relaxed max-w-xs mx-auto">
            The coordinates you requested do not map to any active dispatcher node in the Emergency Blood care system.
          </p>
        </div>

        <div className="flex gap-4 w-full pt-4">
          <Button
            variant="outline"
            className="flex-1 text-xs uppercase tracking-wider font-display border-white/10"
            onClick={() => navigate(-1)}
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
          <Button
            variant="primary"
            className="flex-1 text-xs uppercase tracking-wider font-display"
            onClick={() => navigate('/')}
            icon={<Home className="w-4 h-4" />}
          >
            Home Base
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
