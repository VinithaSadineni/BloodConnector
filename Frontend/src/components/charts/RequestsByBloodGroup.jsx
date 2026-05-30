import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { bloodGroupColor } from '../../lib/utils';

export const RequestsByBloodGroup = ({ data = [] }) => {
  // Fallback mock data if none provided
  const chartData = data.length > 0 ? data : [
    { name: 'O+', value: 45 },
    { name: 'O-', value: 12 },
    { name: 'A+', value: 38 },
    { name: 'A-', value: 8 },
    { name: 'B+', value: 29 },
    { name: 'B-', value: 6 },
    { name: 'AB+', value: 18 },
    { name: 'AB-', value: 3 },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-3 border border-border p-3.5 rounded-lg shadow-card font-body text-xs leading-relaxed">
          <p className="font-bold text-text-primary">Blood Type: {payload[0].payload.name}</p>
          <p className="text-blood font-semibold mt-1">Requests: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <XAxis type="number" stroke="#8899AA" fontSize={10} fontStyle="italic" />
          <YAxis dataKey="name" type="category" stroke="#8899AA" fontSize={12} fontWeight="bold" width={40} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => {
              const colors = bloodGroupColor(entry.name);
              return (
                <Cell key={`cell-${index}`} fill={colors.hex || '#C8102E'} opacity={0.8} />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RequestsByBloodGroup;
