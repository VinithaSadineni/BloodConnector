import React from 'react';
import Card, { CardContent } from '../ui/Card';
import Avatar from '../ui/Avatar';
import BloodGroupBadge from './BloodGroupBadge';
import VerifiedBadge from './VerifiedBadge';
import { MapPin, Award } from 'lucide-react';

export const DonorCard = ({ donor }) => {
  // donor profile details
  const { user, bloodGroup, totalDonations, isAvailable } = donor;
  const userName = user?.name || donor.name || 'Verified Donor';
  const userCity = user?.city || donor.city || 'Bangalore';
  const isVerified = user?.isVerified || donor.isVerified;

  return (
    <Card hoverable className="min-w-[260px] max-w-[280px] shrink-0 border-white/5 relative bg-surface-2/30">
      {isAvailable && (
        <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-success rounded-bl-md shadow-sm" title="Available to Donate" />
      )}
      <CardContent className="p-5 flex flex-col items-center text-center font-body">
        <Avatar name={userName} size="lg" status={isAvailable ? 'available' : 'unavailable'} />
        
        <div className="flex items-center gap-1.5 mt-3 justify-center">
          <h4 className="text-sm font-bold text-text-primary truncate max-w-[150px]">{userName}</h4>
          {isVerified && <VerifiedBadge />}
        </div>
        
        <div className="flex items-center gap-1 mt-1 text-[11px] text-text-muted justify-center">
          <MapPin className="w-3 h-3 text-blood shrink-0" />
          <span className="capitalize">{userCity}</span>
        </div>

        <div className="mt-4 flex items-center justify-center gap-4 w-full border-t border-border/40 pt-3">
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-text-muted/80 uppercase tracking-wider font-semibold">Group</span>
            <BloodGroupBadge group={bloodGroup} size="sm" className="mt-1" />
          </div>
          
          <div className="w-px h-8 bg-border/40" />

          <div className="flex flex-col items-center">
            <span className="text-[9px] text-text-muted/80 uppercase tracking-wider font-semibold">Donations</span>
            <span className="text-sm font-bold text-text-primary flex items-center gap-1 mt-0.5 font-mono">
              <Award className="w-3.5 h-3.5 text-warning" />
              {totalDonations || 0}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DonorCard;
