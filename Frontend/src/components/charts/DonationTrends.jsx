import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export const DonationTrends = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : [
    { month: 'Jan', donations: 84 },
    { month: 'Feb', donations: 96 },
    { month: 'Mar', donations: 124 },
    { month: 'Apr', donations: 110 },
    { month: 'May', donations: 145 },
    { month: 'Jun', donations: 168 },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-3 border border-border p-3.5 rounded-lg shadow-card font-body text-xs">
          <p className="font-bold text-text-primary">{payload[0].payload.month}</p>
          <p className="text-success font-semibold mt-1">Donations: {payload[0].value} units</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00D68F" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00D68F" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1F2D3D" strokeDasharray="3 3" opacity={0.4} />
          <XAxis dataKey="month" stroke="#8899AA" fontSize={10} />
          <YAxis stroke="#8899AA" fontSize={10} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="donations"
            stroke="#00D68F"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorDonations)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonationTrends;
