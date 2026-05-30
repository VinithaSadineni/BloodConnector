import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts';

export const RequestStatusPie = ({ data = [] }) => {
  const chartData = data.length > 0 ? data : [
    { name: 'Completed', value: 58, color: '#00D68F' },
    { name: 'Pending', value: 24, color: '#FFB020' },
    { name: 'Active', value: 18, color: '#C8102E' },
    { name: 'Rejected', value: 8, color: '#FF3D71' },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-3 border border-border p-3.5 rounded-lg shadow-card font-body text-xs">
          <p className="font-bold text-text-primary">{payload[0].name}</p>
          <p className="font-semibold mt-1" style={{ color: payload[0].payload.color }}>
            Count: {payload[0].value} ({((payload[0].value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72 flex justify-center items-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-xs text-text-muted font-body font-semibold">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RequestStatusPie;
