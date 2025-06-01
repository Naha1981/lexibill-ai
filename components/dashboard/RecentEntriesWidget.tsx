
import React from 'react';
import DashboardCard from './DashboardCard';
import { RecentEntryDisplayData } from '../../types';
import { ClockIcon } from '../icons';

interface RecentEntriesWidgetProps {
  entries: RecentEntryDisplayData[];
}

const RecentEntriesWidget: React.FC<RecentEntriesWidgetProps> = ({ entries }) => {
  return (
    <DashboardCard title="Recent Time Entries" titleIcon={<ClockIcon className="w-5 h-5" />}>
      {entries.length === 0 ? (
        <p className="text-[#8ecdb7]">No recent time entries.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {entries.map((entry) => (
            <li key={entry.id} className="p-2 bg-[#214a3c] rounded-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-white">{entry.summary}</p>
                  <p className="text-xs text-[#8ecdb7]">{entry.matterName} ({entry.clientName})</p>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs text-white">{entry.date}</p>
                    <p className="text-xs text-[#b2dfdb]">{entry.duration} hrs</p>
                    <p className="text-xs text-white font-semibold">R {entry.amount.toFixed(2)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
};

export default RecentEntriesWidget;
