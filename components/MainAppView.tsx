
import React, { useState } from 'react';
import { Client, Matter, TimeEntry } from '../types';
import TimeEntryForm from './TimeEntryForm';
import { LexiBillLogoIcon, ArrowLeftIcon, ReceiptIcon } from './icons'; // Assuming icons are relevant
import { BOT_NAME } from '../constants'; // Added import for BOT_NAME

interface MainAppViewProps {
  clients: Client[];
  matters: Matter[];
  timeEntries: TimeEntry[];
  onTimeEntrySubmit: (formData: Omit<TimeEntry, 'id' | 'billingNarrative' | 'isBilled'>) => void;
  onNavigateHome: () => void;
  isLoading: boolean;
  onShowReportForMatter: (matterId: string) => void;
  onAddClient: (client: Client) => void; // Placeholder
  onAddMatter: (matter: Matter) => void;   // Placeholder
}

const MainAppView: React.FC<MainAppViewProps> = ({
  clients,
  matters,
  timeEntries,
  onTimeEntrySubmit,
  onNavigateHome,
  isLoading,
  onShowReportForMatter,
  onAddClient,
  onAddMatter,
}) => {
  // Basic state for showing/hiding client/matter forms (example)
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [showAddMatterForm, setShowAddMatterForm] = useState(false);

  // Group time entries by matter for display
  const entriesByMatter: { [matterId: string]: TimeEntry[] } = timeEntries.reduce((acc, entry) => {
    if (!acc[entry.matterID]) {
      acc[entry.matterID] = [];
    }
    acc[entry.matterID].push(entry);
    return acc;
  }, {} as { [matterId: string]: TimeEntry[] });


  return (
    <div className="relative flex flex-col size-full min-h-screen bg-[#10231c] justify-start overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center bg-[#10231c] p-4 pb-2 justify-between sticky top-0 z-10 w-full">
        <button 
          onClick={onNavigateHome} 
          className="text-white flex size-12 shrink-0 items-center justify-center hover:bg-[#1a3a2f] rounded-full transition-colors" 
          aria-label="Back to landing page"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div className="flex-1 flex flex-col items-center justify-center py-1">
          <LexiBillLogoIcon className="h-8 w-8 text-[#8ecdb7] mb-1" />
          <h1 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">
            LexiBill AI Dashboard
          </h1>
          <p className="text-[#8ecdb7] text-xs leading-tight mt-0.5">
            Log Time & Manage Billing
          </p>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center" aria-hidden="true">
          {/* Spacer */}
        </div>
      </header>
      <div className="px-4 pt-1 pb-3 bg-[#10231c] sticky top-[calc(4rem+0.5rem+1.5rem)] z-10 w-full"> {/* Adjust top based on header height */}
        <div
          className="h-px bg-[#8ecdb7] animate-draw-line-lr"
          style={{ transformOrigin: 'left' }}
        ></div>
      </div>

      <main className="flex-grow overflow-y-auto chat-scrollbar px-4 py-6 space-y-8">
        {/* Time Entry Section */}
        <section className="bg-[#17352b] p-6 rounded-xl shadow-lg border border-[#2f6a55]">
          <h2 className="text-2xl font-semibold text-white mb-4">Log New Time Entry</h2>
          <TimeEntryForm
            clients={clients}
            matters={matters}
            onSubmit={onTimeEntrySubmit}
            isLoading={isLoading}
          />
        </section>

        {/* Client/Matter Management (Basic Example) - Could be modals or separate views */}
        {/* 
        <section className="bg-[#17352b] p-6 rounded-xl shadow-lg border border-[#2f6a55]">
          <h2 className="text-2xl font-semibold text-white mb-4">Manage Clients & Matters</h2>
          <div className="space-x-2">
            <button onClick={() => setShowAddClientForm(true)} className="px-4 py-2 bg-[#019863] text-white rounded-lg hover:bg-[#017a50]">Add Client</button>
            <button onClick={() => setShowAddMatterForm(true)} className="px-4 py-2 bg-[#019863] text-white rounded-lg hover:bg-[#017a50]">Add Matter</button>
          </div>
          {showAddClientForm && <p className="text-white mt-2">Client form would appear here...</p>}
          {showAddMatterForm && <p className="text-white mt-2">Matter form would appear here...</p>}
        </section>
        */}

        {/* Recent Time Entries / Matters Overview */}
        <section className="bg-[#17352b] p-6 rounded-xl shadow-lg border border-[#2f6a55]">
          <h2 className="text-2xl font-semibold text-white mb-4">Matters Overview & Recent Entries</h2>
          {Object.keys(entriesByMatter).length === 0 && timeEntries.length === 0 && (
            <p className="text-[#8ecdb7]">No time entries logged yet. Use the form above to get started.</p>
          )}
          {Object.keys(entriesByMatter).map(matterId => {
            const matter = matters.find(m => m.id === matterId);
            const client = clients.find(c => c.id === matter?.clientID);
            const entriesForThisMatter = entriesByMatter[matterId];
            const totalHours = entriesForThisMatter.reduce((sum, entry) => sum + entry.duration, 0);

            return (
              <div key={matterId} className="mb-6 p-4 bg-[#214a3c] rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <div>
                        <h3 className="text-xl font-medium text-white">{matter?.name || 'Unknown Matter'}</h3>
                        <p className="text-sm text-[#8ecdb7]">{client?.name || 'Unknown Client'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-white bg-[#019863] px-2 py-1 rounded">
                            Total: {totalHours.toFixed(1)} hrs
                        </span>
                        <button
                            onClick={() => onShowReportForMatter(matterId)}
                            className="p-2 text-[#8ecdb7] hover:text-white transition-colors rounded-full hover:bg-[#1a3a2f]"
                            title="Generate Report for this Matter"
                            aria-label={`Generate Report for ${matter?.name}`}
                        >
                            <ReceiptIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <ul className="space-y-1 max-h-60 overflow-y-auto chat-scrollbar pr-2">
                  {entriesForThisMatter.slice(0, 5).map(entry => ( // Show last 5 entries for brevity
                    <li key={entry.id} className="text-xs text-[#b2dfdb] border-b border-[#2f6a55] py-1 last:border-b-0">
                      {entry.date.toLocaleDateString('en-CA')}: {entry.taskSummary.substring(0,50)}{entry.taskSummary.length > 50 ? '...' : ''} ({entry.duration}h)
                    </li>
                  ))}
                   {entriesForThisMatter.length > 5 && <li className="text-xs text-[#8ecdb7] text-center pt-1">...and {entriesForThisMatter.length - 5} more entries.</li>}
                </ul>
              </div>
            );
          })}
        </section>
      </main>

      <footer className="bg-[#10231c] text-center py-4 sticky bottom-0 z-10 w-full">
        <p className="text-[#8ecdb7] text-xs">
          &copy; {new Date().getFullYear()} {BOT_NAME}. Clarity in Every Bill. Confidence in Every Client.
        </p>
      </footer>
    </div>
  );
};

export default MainAppView;
