import React from 'react';
import Select from '../ui/Select';
import Input from '../ui/Input';
import Button from '../ui/Button';

export const SearchFilters = ({
  bloodGroup,
  setBloodGroup,
  city,
  setCity,
  radius,
  setRadius,
  urgency,
  setUrgency,
  onReset
}) => {
  return (
    <div className="glass-panel rounded-xl border border-white/5 p-4 flex flex-col md:flex-row gap-4 items-end font-body w-full">
      <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Select
          label="Blood Group"
          placeholder="All Groups"
          value={bloodGroup}
          onChange={(e) => setBloodGroup(e.target.value)}
          options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
        />

        <Input
          label="City / Location"
          placeholder="e.g. Bangalore"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <Select
          label="Search Radius"
          placeholder="Select Distance"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          options={[
            { label: '10 km', value: '10' },
            { label: '25 km', value: '25' },
            { label: '50 km', value: '50' },
          ]}
        />

        <Select
          label="Urgency Level"
          placeholder="All Levels"
          value={urgency}
          onChange={(e) => setUrgency(e.target.value)}
          options={[
            { label: 'Critical / SOS', value: 'critical' },
            { label: 'Urgent', value: 'urgent' },
            { label: 'Moderate', value: 'moderate' },
            { label: 'Normal', value: 'normal' },
          ]}
        />
      </div>

      {onReset && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="w-full md:w-auto h-[42px] px-4 shrink-0 border-white/10 text-xs font-semibold uppercase tracking-wider font-display"
        >
          Reset Filters
        </Button>
      )}
    </div>
  );
};

export default SearchFilters;
