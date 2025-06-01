
import React, { useState, useMemo } from 'react';
import { Client, Matter, TimeEntry, TimeEntryFormSubmitData } from '../types';
import TimeEntryForm from './TimeEntryForm';
import { LexiBillLogoIcon, ArrowLeftIcon, ReceiptIcon } from './icons';
import { BOT_NAME } from '../constants';

// Dashboard specific imports
import { calculateBillingSummaries, getBilledVsUnbilledData, getTopActiveMatters, getRevenueTrendData, getRecentTimeEntriesList, getBillingReminders } from '../utils/dashboardCalculations';
import BillingSummaryWidget from './dashboard/BillingSummaryWidget';
import BilledUnbilledPieChart from './dashboard/BilledUnbilledPieChart';
import TopMattersWidget from './dashboard/TopMattersWidget';
import RevenueTrendChartWidget from './dashboard/RevenueTrendChartWidget';
import RecentEntriesWidget from './dashboard/RecentEntriesWidget';
import BillingRemindersWidget from './dashboard/BillingRemindersWidget';


interface MainAppViewProps {
  clients: Client[];
  matters: Matter[];
  timeEntries: TimeEntry[];
  onTimeEntrySubmit: (formData: TimeEntryFormSubmitData) => void;
  onNavigateHome: () => void;
  isLoadingGlobal: boolean; // Renamed from isLoading to avoid conflict
  onShowReportForMatter: (matterId: string) => void;
  onAddClient: (client: Client) => void;
  onAddMatter: (matter: Matter) => void;
}

const MainAppView: React.FC<MainAppViewProps> = ({
  clients,
  matters,
  timeEntries,
  onTimeEntrySubmit,
  onNavigateHome,
  isLoadingGlobal,
  onShowReportForMatter,
  // onAddClient, // Kept for future use
  // onAddMatter,  // Kept for future use
}) => {
  // const [showAddClientForm, setShowAddClientForm] = useState(false); // Future use
  // const [showAddMatterForm, setShowAddMatterForm] = useState(false); // Future use

  // --- Dashboard Data Calculations ---
  const billingSummary = useMemo(() => calculateBillingSummaries(timeEntries), [timeEntries]);
  const billedUnbilledData = useMemo(() => getBilledVsUnbilledData(timeEntries), [timeEntries]);
  const topActiveMatters = useMemo(() => getTopActiveMatters(timeEntries, matters, clients, 5), [timeEntries, matters, clients]);
  const revenueTrendData = useMemo(() => getRevenueTrendData(timeEntries, 6), [timeEntries]);
  const recentEntriesList = useMemo(() => getRecentTimeEntriesList(timeEntries, matters, clients, 5), [timeEntries, matters, clients]);
  const billingReminders = useMemo(() => getBillingReminders(timeEntries, matters, clients), [timeEntries, matters, clients]);

  // For existing "Matters Overview" section
  const entriesByMatter: { [matterId: string]: TimeEntry[] } = useMemo(() => {
    return timeEntries.reduce((acc, entry) => {
      if (!acc[entry.matterID]) {
        acc[entry.matterID] = [];
      }
      acc[entry.matterID].push(entry);
      return acc;
    }, {} as { [matterId: string]: TimeEntry[] });
  }, [timeEntries]);


  return (
    <div className="relative flex flex-col size-full min-h-screen bg-[#10231c] justify-start overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center bg-[#10231c] p-4 pb-2 justify-between sticky top-0 z-20 w-full">
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
      <div className="px-4 pt-1 pb-3 bg-[#10231c] sticky top-[calc(4rem+0.5rem+1.5rem)] z-20 w-full">
        <div
          className="h-px bg-[#8ecdb7] animate-draw-line-lr"
          style={{ transformOrigin: 'left' }}
        ></div>
      </div>

      <main className="flex-grow overflow-y-auto chat-scrollbar px-4 py-6 space-y-8 z-0"> {/* Ensure main content is below sticky header/divider */}
        
        {/* === LAWYER DASHBOARD SECTION === */}
        <section className="pb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">At a Glance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <BillingSummaryWidget summary={billingSummary} />
            <BilledUnbilledPieChart data={billedUnbilledData} />
            <RecentEntriesWidget entries={recentEntriesList} />
            <TopMattersWidget matters={topActiveMatters} /> {/* lg:col-span-2 by default in its own definition */}
            <BillingRemindersWidget reminders={billingReminders} /> {/* lg:col-span-2 by default in its own definition */}
            <RevenueTrendChartWidget data={revenueTrendData} /> {/* lg:col-span-3 by default in its own definition */}
          </div>
        </section>

        {/* Time Entry Section */}
        <section className="bg-[#17352b] p-4 sm:p-6 rounded-xl shadow-lg border border-[#2f6a55]">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">Log New Time Entry</h2>
          <TimeEntryForm
            clients={clients}
            matters={matters}
            onSubmit={onTimeEntrySubmit}
            isLoading={isLoadingGlobal} // Use the global loading state
          />
        </section>

        {/* Matters Overview Section (Existing) */}
        <section className="bg-[#17352b] p-4 sm:p-6 rounded-xl shadow-lg border border-[#2f6a55]">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">Matters Overview</h2>
          {Object.keys(entriesByMatter).length === 0 && timeEntries.length === 0 && (
            <p className="text-[#8ecdb7]">No time entries logged yet. Use the form above to get started.</p>
          )}
          {Object.keys(entriesByMatter).length > 0 && (
            <div className="space-y-4">
            {Object.keys(entriesByMatter).map(matterId => {
              const matter = matters.find(m => m.id === matterId);
              const client = clients.find(c => c.id === matter?.clientID);
              const entriesForThisMatter = entriesByMatter[matterId];
              const totalHours = entriesForThisMatter.reduce((sum, entry) => sum + entry.duration, 0);
              const totalAmount = entriesForThisMatter.reduce((sum, entry) => sum + (entry.duration * entry.rate), 0);


              return (
                <div key={matterId} className="p-3 sm:p-4 bg-[#214a3c] rounded-lg">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                      <div className="mb-2 sm:mb-0">
                          <h3 className="text-lg sm:text-xl font-medium text-white">{matter?.name || 'Unknown Matter'}</h3>
                          <p className="text-sm text-[#8ecdb7]">{client?.name || 'Unknown Client'}</p>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-right">
                            <p className="text-sm text-white bg-[#019863] px-2 py-1 rounded">
                                Total: {totalHours.toFixed(1)} hrs
                            </p>
                            <p className="text-xs text-[#b2dfdb] mt-1">Value: R {totalAmount.toFixed(2)}</p>
                          </div>
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
                  {entriesForThisMatter.length > 0 && (
                    <details className="group">
                        <summary className="text-xs text-[#8ecdb7] cursor-pointer group-hover:text-white list-none">
                            <span className="group-open:hidden">Show recent entries ({Math.min(entriesForThisMatter.length, 3)})</span>
                            <span className="hidden group-open:inline">Hide recent entries</span>
                        </summary>
                        <ul className="mt-2 space-y-1 max-h-48 overflow-y-auto chat-scrollbar pr-2">
                        {entriesForThisMatter.slice(0, 3).map(entry => ( 
                            <li key={entry.id} className="text-xs text-[#b2dfdb] border-b border-[#2f6a55]/50 py-1 last:border-b-0">
                            {new Date(entry.date).toLocaleDateString('en-CA')}: {entry.taskSummary.substring(0,50)}{entry.taskSummary.length > 50 ? '...' : ''} ({entry.duration}h)
                            </li>
                        ))}
                        {entriesForThisMatter.length > 3 && <li className="text-xs text-[#8ecdb7] text-center pt-1">...and {entriesForThisMatter.length - 3} more entries. Click "Generate Report" to see all.</li>}
                        </ul>
                    </details>
                  )}
                </div>
              );
            })}
            </div>
          )}
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
