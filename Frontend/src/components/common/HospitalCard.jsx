import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardContent } from '../ui/Card';
import VerifiedBadge from './VerifiedBadge';
import { MapPin, Building2, Phone, Plus } from 'lucide-react';
import Button from '../ui/Button';

export const HospitalCard = ({ hospital, stock = [] }) => {
  const navigate = useNavigate();
  const institutionName = hospital.institutionName || hospital.name || 'Verified Institution';
  const institutionType = hospital.institutionType || 'hospital';
  const address = hospital.address || 'Medical Ward Road';
  const city = hospital.city || 'Bangalore';
  const isVerified = hospital.isVerified || hospital.verificationStatus === 'verified' || hospital.user?.isVerified;
  const phone = hospital.phone || hospital.user?.phone;
  const hospitalId = hospital._id || hospital.id;

  const handleMakeRequest = () => {
    navigate('/seeker/requests/new', { state: { hospitalId, hospitalName: institutionName } });
  };

  return (
    <Card hoverable className="w-full border-white/5 bg-surface-2/30 font-body flex flex-col gap-4">
      <CardContent className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex justify-between items-start gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blood/10 border border-blood/20 text-blood shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5 flex-wrap">
                {institutionName}
                {isVerified && <VerifiedBadge />}
              </h4>
              <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded bg-surface-3 border border-border text-text-muted font-bold uppercase tracking-wider font-mono">
                {institutionType}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-1.5 text-xs text-text-muted">
          <MapPin className="w-3.5 h-3.5 text-blood shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            {address}, <span className="font-semibold text-text-primary capitalize">{city}</span>
          </span>
        </div>

        {phone && (
          <div className="flex items-center gap-1.5 text-xs text-text-muted -mt-1">
            <Phone className="w-3.5 h-3.5 text-success shrink-0" />
            <span>
              Contact: <a href={`tel:${phone}`} className="font-semibold text-text-primary hover:underline">{phone}</a>
            </span>
          </div>
        )}

        {/* Available Blood Stock summary grid */}
        <div className="border-t border-border/40 pt-4 mt-auto">
          <h5 className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-2">
            Public Stock Levels
          </h5>
          {stock.length === 0 ? (
            <span className="text-[10px] text-text-muted/70 italic">Stock listings unavailable</span>
          ) : (
            <div className="grid grid-cols-4 gap-1.5">
              {stock.map((item) => (
                <div key={item.bloodGroup} className="flex flex-col items-center bg-white/5 border border-white/5 rounded-lg py-1">
                  <span className="text-[9px] font-bold text-text-primary font-mono">{item.bloodGroup}</span>
                  <span className="text-xs font-bold text-blood-glow font-mono mt-0.5">{item.availableUnits}u</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleMakeRequest}
          icon={<Plus className="w-3.5 h-3.5" />}
          className="w-full text-xs mt-2"
        >
          Make Request
        </Button>
      </CardContent>
    </Card>
  );
};

export default HospitalCard;
