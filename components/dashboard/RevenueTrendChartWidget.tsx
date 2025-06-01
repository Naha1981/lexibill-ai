
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardCard from './DashboardCard';
import { RevenueDataPoint } from '../../types';

interface RevenueTrendChartWidgetProps {
  data: RevenueDataPoint[];
}

const RevenueTrendChartWidget: React.FC<RevenueTrendChartWidgetProps> = ({ data }) => {
   const hasData = data.some(d => d.revenue > 0);

  return (
    <DashboardCard title="Revenue Trend (Last 6 Months - Billed)" className="lg:col-span-3">
      { !hasData ? (
         <div className="flex items-center justify-center h-full min-h-[200px]">
            <p className="text-[#8ecdb7]">Not enough billed data to display revenue trend.</p>
        </div>
      ) : (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 20, // Adjusted for better label visibility
            left: 10, // Adjusted for better label visibility
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2f6a55" />
          <XAxis dataKey="month" tick={{ fill: '#8ecdb7', fontSize: 12 }} />
          <YAxis tickFormatter={(value) => `R${value/1000}k`} tick={{ fill: '#8ecdb7', fontSize: 12 }} />
          <Tooltip 
            formatter={(value: number) => [`R ${value.toFixed(2)}`, "Revenue"]} 
            wrapperStyle={{background: '#10231c', border: '1px solid #2f6a55', borderRadius: '0.5rem'}}
            labelStyle={{color: '#FFFFFF'}}
            itemStyle={{color: '#8ecdb7'}}
            cursor={{fill: 'rgba(142, 205, 183, 0.1)'}}
          />
          <Legend wrapperStyle={{color: '#8ecdb7'}}/>
          <Bar dataKey="revenue" fill="#019863" name="Monthly Revenue" barSize={30} />
        </BarChart>
      </ResponsiveContainer>
      )}
    </DashboardCard>
  );
};

export default RevenueTrendChartWidget;
