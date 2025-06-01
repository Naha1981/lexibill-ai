
import React from 'react';
import DashboardCard from './DashboardCard';
import { TopMatterData } from '../../types';
import { ReceiptIcon } from '../icons'; // Re-using icon

interface TopMattersWidgetProps {
  matters: TopMatterData[];
}

const TopMattersWidget: React.FC<TopMattersWidgetProps> = ({ matters }) => {
  return (
    <DashboardCard title="Top Active Matters (by Hours)" className="lg:col-span-2" titleIcon={<ReceiptIcon className="w-5 h-5" />}>
      {matters.length === 0 ? (
        <p className="text-[#8ecdb7]">No active matters with logged time.</p>
      ) : (
        <ul className="space-y-2">
          {matters.map((matter) => (
            <li key={matter.id} className="p-2 bg-[#214a3c] rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-white">{matter.name}</p>
                  <p className="text-xs text-[#8ecdb7]">{matter.clientName}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold text-white">{matter.totalHours.toFixed(1)} hrs</p>
                    <p className="text-xs text-[#b2dfdb]">R {matter.totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
};

export default TopMattersWidget;
