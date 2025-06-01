import React from 'react';
import DashboardCard from './DashboardCard';
import { TopMatterData } from '../../types';
import { ActiveIcon } from '../icons'; // Changed from ReceiptIcon

interface TopMattersWidgetProps {
  matters: TopMatterData[];
  onMatterClick: (matterId: string) => void;
}

const TopMattersWidget: React.FC<TopMattersWidgetProps> = ({ matters, onMatterClick }) => {
  return (
    <DashboardCard title="Top Active Matters (by Hours)" className="lg:col-span-2" titleIcon={<ActiveIcon className="w-5 h-5" />}>
      {matters.length === 0 ? (
        <p className="text-[#8ecdb7]">No active matters with logged time.</p>
      ) : (
        <ul className="space-y-2">
          {matters.map((matter) => (
            <li 
              key={matter.id} 
              className="p-2 bg-[#214a3c] rounded-md transition-all duration-200 ease-in-out hover:bg-[#2a5c4a] focus:outline-none focus:ring-2 focus:ring-[#019863] focus:ring-offset-2 focus:ring-offset-[#17352b] cursor-pointer"
              onClick={() => onMatterClick(matter.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onMatterClick(matter.id); }}
              role="button"
              tabIndex={0}
              aria-label={`View details for matter: ${matter.name}`}
            >
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