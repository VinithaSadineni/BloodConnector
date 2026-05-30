import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export const CityHeatmap = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : [
    { city: 'Bangalore', requests: 142 },
    { city: 'Mumbai', requests: 98 },
    { city: 'Delhi', requests: 84 },
    { city: 'Chennai', requests: 72 },
    { city: 'Hyderabad', requests: 65 },
    { city: 'Kolkata', requests: 48 },
    { city: 'Pune', requests: 42 },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-3 border border-border p-3.5 rounded-lg shadow-card font-body text-xs">
          <p className="font-bold text-text-primary">{payload[0].payload.city}</p>
          <p className="text-blood font-semibold mt-1">Total Requests: {payload[0].value}</p>
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
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid stroke="#1F2D3D" strokeDasharray="3 3" opacity={0.4} />
          <XAxis dataKey="city" stroke="#8899AA" fontSize={10} />
          <YAxis stroke="#8899AA" fontSize={10} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
          <Bar dataKey="requests" fill="#C8102E" radius={[4, 4, 0, 0]} maxBarSize={45} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CityHeatmap;
