import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Calendar, Heart, ShieldAlert, Check, X, ClipboardList } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { formatTimeAgo, formatDate } from '../../lib/utils';
import Card, { CardContent } from '../ui/Card';
import Button from '../ui/Button';
import BloodGroupBadge from './BloodGroupBadge';
import StatusBadge from './StatusBadge';
import UrgencyIndicator from './UrgencyIndicator';

export const BloodRequestCard = ({
  request,
  onAccept,
  onCancel,
  onComplete,
  onReject,
  onApprove,
  isActionLoading = false
}) => {
  const { role, user } = useAuth();
  const navigate = useNavigate();
  
  const {
    _id,
    patientName,
    bloodGroup,
    unitsRequired,
    urgencyLevel,
    hospitalName,
    city,
    status,
    isSOSRequest,
    createdAt,
    deadline,
    seeker,
    acceptedBy = []
  } = request;

  const isCritical = urgencyLevel === 'critical' || isSOSRequest;

  // Check if current user (donor) has already accepted this request
  const hasDonorAccepted = acceptedBy.some(donorId => 
    donorId === user?._id || donorId?._id === user?._id
  );

  return (
    <Card
      hoverable
      className={`border-l-4 overflow-hidden ${isCritical ? 'border-l-critical shadow-blood/10' : 'border-l-border/60'}`}
    >
      <CardContent className="p-5 font-body">
        {/* Card Header row */}
        <div className="flex justify-between items-start gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <BloodGroupBadge group={bloodGroup} size="lg" />
            <div>
              <h4 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                {patientName}
                {isSOSRequest && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-critical/15 border border-critical/30 text-critical font-bold uppercase tracking-wider animate-pulse">
                    SOS
                  </span>
                )}
              </h4>
              <p className="text-[10px] text-text-muted mt-0.5">
                Posted {formatTimeAgo(createdAt)}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status={status} />
            <UrgencyIndicator level={urgencyLevel} showIcon={false} />
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5 text-xs text-text-muted border-t border-border/40 pt-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-blood shrink-0" />
            <span className="truncate" title={`${hospitalName}, ${city}`}>
              {hospitalName}, <span className="font-semibold text-text-primary">{city}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ClipboardList className="w-3.5 h-3.5 text-info shrink-0" />
            <span>
              Units: <span className="font-semibold text-text-primary">{unitsRequired} units</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-warning shrink-0" />
            <span className="truncate">
              Deadline: <span className="font-semibold text-text-primary">{deadline ? formatDate(deadline) : 'N/A'}</span>
            </span>
          </div>

          {seeker?.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-success shrink-0" />
              <span>
                Contact: <a href={`tel:${seeker.phone}`} className="font-semibold text-text-primary hover:underline">{seeker.phone}</a>
              </span>
            </div>
          )}
        </div>

        {/* Card Footer action bar based on current User Role */}
        <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-border/40 flex-wrap">
          {/* Left footer segment: donor tracking info */}
          <div className="text-[10px] text-text-muted/80">
            {acceptedBy.length > 0 ? (
              <span className="text-success font-semibold flex items-center gap-1">
                ❤️ {acceptedBy.length} Donor(s) coordinated
              </span>
            ) : (
              <span>No donors coordinated yet</span>
            )}
          </div>

          {/* Right footer segment: Role specific actions */}
          <div className="flex gap-2">
            {/* 1. SEEKER Actions */}
            {role === 'seeker' && seeker?._id === user?._id && (
              <>
                {status === 'pending' && onCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-critical/30 hover:bg-critical/5 text-critical"
                    disabled={isActionLoading}
                    onClick={() => onCancel(_id)}
                  >
                    Cancel Request
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                  onClick={() => navigate(`/seeker/requests/${_id}`)}
                >
                  Track Status
                </Button>
              </>
            )}

            {/* 2. DONOR Actions */}
            {role === 'donor' && (
              <>
                {/* Accept request action */}
                {status === 'pending' && !hasDonorAccepted && onAccept && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs bg-success hover:bg-emerald-600 shadow-none"
                    disabled={isActionLoading}
                    onClick={() => onAccept(_id)}
                    icon={<Heart className="w-3.5 h-3.5 fill-current" />}
                  >
                    Accept Help
                  </Button>
                )}

                {/* Accept options when already accepted */}
                {hasDonorAccepted && status === 'accepted' && (
                  <div className="flex gap-2">
                    {onReject && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-critical/30 text-critical hover:bg-critical/5"
                        disabled={isActionLoading}
                        onClick={() => onReject(_id)}
                      >
                        Opt Out
                      </Button>
                    )}
                    {onComplete && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-xs bg-success hover:bg-emerald-600"
                        disabled={isActionLoading}
                        onClick={() => onComplete(_id)}
                        icon={<Check className="w-3.5 h-3.5" />}
                      >
                        Complete Donation
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* 3. HOSPITAL Actions */}
            {role === 'hospital' && (
              <>
                {status === 'pending' && (
                  <div className="flex gap-2">
                    {onReject && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs border-critical/30 text-critical"
                        disabled={isActionLoading}
                        onClick={() => onReject(_id)}
                      >
                        Decline
                      </Button>
                    )}
                    {onApprove && (
                      <Button
                        variant="primary"
                        size="sm"
                        className="text-xs bg-success hover:bg-emerald-600"
                        disabled={isActionLoading}
                        onClick={() => onApprove(_id)}
                        icon={<Check className="w-3.5 h-3.5" />}
                      >
                        Approve Support
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* 4. ADMIN Actions */}
            {role === 'admin' && (
              <>
                {status !== 'cancelled' && status !== 'completed' && onCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-critical/30 text-critical hover:bg-critical/5"
                    disabled={isActionLoading}
                    onClick={() => onCancel(_id)}
                  >
                    Block Request
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs"
                  onClick={() => navigate(`/seeker/requests/${_id}`)}
                >
                  Audit details
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BloodRequestCard;
