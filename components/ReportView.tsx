
import React from 'react';
import { TimeEntry, TaskType } from '../types';
import { ArrowLeftIcon } from './icons';

interface ReportViewProps {
  entries: TimeEntry[];
  matterName: string;
  onClose: () => void;
  onConfirm: () => void;
  onEdit: () => void;
}

const ReportView: React.FC<ReportViewProps> = ({ entries, matterName, onClose, onConfirm, onEdit }) => {
  const sortedEntries = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());
  const totalHours = sortedEntries.reduce((sum, entry) => sum + entry.duration, 0);

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#10231c] justify-between overflow-x-hidden">
      {/* Header */}
      <div>
        <header className="flex items-center bg-[#10231c] p-4 pb-2 justify-between sticky top-0 z-20">
          <button onClick={onClose} className="text-white flex size-12 shrink-0 items-center justify-center hover:bg-[#1a3a2f] rounded-full transition-colors" aria-label="Close report preview">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            Billing Report Preview
          </h2>
        </header>

        {/* Content Area */}
        <div className="overflow-y-auto chat-scrollbar flex-grow pb-4">
          <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
            Matter: {matterName}
          </h3>
          {sortedEntries.length === 0 ? (
            <p className="text-[#8ecdb7] px-4 py-3">No time entries found for this matter.</p>
          ) : (
            <ul className="px-4">
              {sortedEntries.map((entry) => (
                <li key={entry.id} className="py-3 border-b border-[#1a3a2f] last:border-b-0">
                  <p className="text-white text-base font-medium leading-normal">
                    {entry.date.toLocaleDateString('en-CA')} — {entry.duration} hour{entry.duration !== 1 ? 's' : ''}
                  </p>
                  <p className="text-[#8ecdb7] text-sm font-normal leading-normal mt-1 whitespace-pre-wrap">
                    {entry.description} 
                  </p>
                  {/* TaskType display removed: <p className="text-gray-400 text-xs">({entry.taskType})</p> */}
                </li>
              ))}
            </ul>
          )}
          {sortedEntries.length > 0 && (
            <div className="px-4 pt-4 mt-2 border-t border-[#2f6a55]">
              <p className="text-white text-md font-bold">
                Total Time: {totalHours.toFixed(1)} hour{totalHours !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer with Actions */}
      <div className="bg-[#10231c] sticky bottom-0 z-10 pt-2">
         <p className="text-[#8ecdb7] text-center text-sm mb-2 px-4">Would you like to:</p>
        <div className="flex flex-col sm:flex-row sm:justify-stretch gap-3 px-4 py-3">
          <button
            onClick={onConfirm}
            className="flex flex-1 min-w-[84px] max-w-full sm:max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-[#019863] text-white text-base font-bold leading-normal tracking-[0.015em]"
          >
            <span className="truncate">Confirm to generate final report</span>
          </button>
          <button
            onClick={onEdit} // This will trigger the App.tsx handler which explains limitations
            className="flex flex-1 min-w-[84px] max-w-full sm:max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-[#214a3c] text-white text-base font-bold leading-normal tracking-[0.015em]"
          >
            <span className="truncate">Edit any entries</span>
          </button>
           <button
            onClick={onClose} // Added explicit cancel button as per flow
            className="flex flex-1 min-w-[84px] max-w-full sm:max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-[#506a61] text-white text-base font-bold leading-normal tracking-[0.015em]"
          >
            <span className="truncate">Cancel</span>
          </button>
        </div>
        <div className="h-5 bg-[#10231c]"></div> {/* Bottom padding */}
      </div>
    </div>
  );
};

export default ReportView;
