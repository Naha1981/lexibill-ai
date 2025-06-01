
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardCard from './DashboardCard';
import { BilledUnbilledDataPoint } from '../../types';

interface BilledUnbilledPieChartProps {
  data: BilledUnbilledDataPoint[];
}

const BilledUnbilledPieChart: React.FC<BilledUnbilledPieChartProps> = ({ data }) => {
  const totalHours = data.reduce((sum, item) => sum + item.value, 0);
  if (totalHours === 0) {
    return (
        <DashboardCard title="Time Status">
            <div className="flex items-center justify-center h-full">
                <p className="text-[#8ecdb7]">No time entries to display status.</p>
            </div>
        </DashboardCard>
    );
  }
  return (
    <DashboardCard title="Time Status (Hours)">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value.toFixed(1)} hrs`, "Hours"]} wrapperStyle={{background: '#10231c', border: '1px solid #2f6a55', borderRadius: '0.5rem'}}/>
          <Legend wrapperStyle={{color: '#8ecdb7'}}/>
        </PieChart>
      </ResponsiveContainer>
    </DashboardCard>
  );
};

export default BilledUnbilledPieChart;
