import React, { useState, useMemo, useCallback } from 'react';
import { Client, Matter, TimeEntry, TimeEntryFormSubmitData } from '../types';
import TimeEntryForm from './TimeEntryForm';
import { LexiBillLogoIcon, ArrowLeftIcon, ReceiptIcon, SpinnerIcon } from './icons'; // Added SpinnerIcon
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
  onLogout: () => Promise<void>; // Changed from onNavigateHome
  isLoadingGlobal: boolean;
  onShowReportForMatter: (matterId: string) => void;
  // onAddClient and onAddMatter are not directly invoked for forms here yet
}

const MainAppView: React.FC<MainAppViewProps> = ({
  clients,
  matters,
  timeEntries,
  onTimeEntrySubmit,
  onLogout,
  isLoadingGlobal,
  onShowReportForMatter,
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = async () => {
    setIsLoggingOut(true);
    await onLogout();
    // No need to setIsLoggingOut(false) as component will unmount or view will change
  };

  // --- Dashboard Data Calculations ---
  const billingSummary = useMemo(() => calculateBillingSummaries(timeEntries), [timeEntries]);
  const billedUnbilledData = useMemo(() => getBilledVsUnbilledData(timeEntries), [timeEntries]);
  const topActiveMatters = useMemo(() => getTopActiveMatters(timeEntries, matters, clients, 5), [timeEntries, matters, clients]);
  const revenueTrendData = useMemo(() => getRevenueTrendData(timeEntries, 6), [timeEntries]);
  const recentEntriesList = useMemo(() => getRecentTimeEntriesList(timeEntries, matters, clients, 5), [timeEntries, matters, clients]);
  const billingReminders = useMemo(() => getBillingReminders(timeEntries, matters, clients), [timeEntries, matters, clients]);

  const clientsWithTheirMatters = useMemo(() => {
    return clients.map(client => {
      const mattersForClient = matters
        .filter(matter => matter.clientID === client.id)
        .map(matter => {
          const entriesForMatter = timeEntries.filter(entry => entry.matterID === matter.id);
          const totalHours = entriesForMatter.reduce((sum, entry) => sum + entry.duration, 0);
          const totalAmount = entriesForMatter.reduce((sum, entry) => sum + (entry.duration * entry.rate), 0);
          const recentEntriesPreview = entriesForMatter
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 3);
          
          return {
            ...matter,
            totalHours,
            totalAmount,
            entryCount: entriesForMatter.length,
            recentEntriesPreview,
          };
        });
      return {
        ...client,
        matters: mattersForClient,
      };
    }).sort((a,b) => a.name.localeCompare(b.name));
  }, [clients, matters, timeEntries]);

  const handleMatterSelectFromDashboard = useCallback((matterId: string) => {
    const elementId = `matter-overview-item-${matterId}`;
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('matter-highlight-animation');
      setTimeout(() => {
        element.classList.remove('matter-highlight-animation');
      }, 1800);
      
      const detailsElement = element.closest('details');
      if (detailsElement && !detailsElement.open) {
        const parentDetails = element.closest('.matter-item-container')?.querySelector('details');
         if (parentDetails && !parentDetails.open) {
            parentDetails.open = true;
        }
      }
    } else {
      console.warn(`Element with ID ${elementId} not found for scrolling.`);
    }
  }, []);


  return (
    <div className="relative flex flex-col size-full min-h-screen bg-[#10231c] justify-start overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center bg-[#10231c] p-4 pb-2 justify-between sticky top-0 z-20 w-full">
        <button 
          onClick={handleLogoutClick} 
          disabled={isLoggingOut}
          className="text-white flex size-12 shrink-0 items-center justify-center hover:bg-[#1a3a2f] rounded-full transition-colors disabled:opacity-50" 
          aria-label="Logout"
        >
          {isLoggingOut ? <SpinnerIcon className="w-5 h-5" /> : <ArrowLeftIcon className="w-6 h-6 transform rotate-180" />} 
          {/* Rotate arrow for logout */}
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

      <main className="flex-grow overflow-y-auto chat-scrollbar px-4 py-6 space-y-8 z-0">
        {isLoadingGlobal && !isLoggingOut && ( // Show global loading only if not specific to logout
           <div className="fixed inset-0 bg-[#10231c]/50 flex items-center justify-center z-50">
             <SpinnerIcon className="w-10 h-10 text-white" />
           </div>
        )}
        
        <section className="bg-[#122720] p-4 sm:p-6 rounded-xl shadow-lg border border-[#2f6a55]">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">At a Glance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <BillingSummaryWidget summary={billingSummary} />
            <BilledUnbilledPieChart data={billedUnbilledData} />
            <RecentEntriesWidget entries={recentEntriesList} />
            <TopMattersWidget matters={topActiveMatters} onMatterClick={handleMatterSelectFromDashboard} />
            <BillingRemindersWidget reminders={billingReminders} />
            <RevenueTrendChartWidget data={revenueTrendData} />
          </div>
        </section>

        <section className="bg-[#17352b] p-4 sm:p-6 rounded-xl shadow-lg border border-[#2f6a55]">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">Log New Time Entry</h2>
          <TimeEntryForm
            clients={clients}
            matters={matters}
            onSubmit={onTimeEntrySubmit}
            isLoading={isLoadingGlobal && !isLoggingOut} // Pass global loading state
          />
        </section>

        <section className="bg-[#17352b] p-4 sm:p-6 rounded-xl shadow-lg border border-[#2f6a55]">
          <h2 className="text-xl sm:text-2xl font-semibold text-white mb-4">Matters Overview</h2>
          {clientsWithTheirMatters.length === 0 && !isLoadingGlobal && (
            <p className="text-[#8ecdb7]">No clients or matters found. Add clients and log time to see an overview.</p>
          )}
           {isLoadingGlobal && clientsWithTheirMatters.length === 0 && (
             <div className="text-center py-4">
                <SpinnerIcon className="w-8 h-8 text-[#8ecdb7] mx-auto" />
                <p className="text-[#8ecdb7] mt-2">Loading matters...</p>
            </div>
          )}
          {clientsWithTheirMatters.map(client => (
            <div key={client.id} className="mb-6 last:mb-0">
              <h3 className="text-lg font-semibold text-[#c5e8df] border-b border-[#2f6a55] pb-2 mb-3">
                Client: {client.name}
              </h3>
              {client.matters.length === 0 && (
                <p className="text-sm text-[#8ecdb7] pl-2">No matters found for this client.</p>
              )}
              <div className="space-y-4">
                {client.matters.map(matter => (
                  <div 
                    key={matter.id} 
                    id={`matter-overview-item-${matter.id}`}
                    className="p-3 sm:p-4 bg-[#214a3c] rounded-lg ml-0 md:ml-2 matter-item-container"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                        <div className="mb-2 sm:mb-0">
                            <h4 className="text-md sm:text-lg font-medium text-white">{matter.name}</h4>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="text-right">
                              <p className="text-sm text-white bg-[#019863] px-2 py-1 rounded">
                                  Total: {matter.totalHours.toFixed(1)} hrs
                              </p>
                              <p className="text-xs text-[#b2dfdb] mt-1">Value: R {matter.totalAmount.toFixed(2)}</p>
                            </div>
                            <button
                                onClick={() => onShowReportForMatter(matter.id)}
                                className="p-2 text-[#8ecdb7] hover:text-white transition-colors rounded-full hover:bg-[#1a3a2f] disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Generate Report for this Matter"
                                aria-label={`Generate Report for ${matter.name}`}
                                disabled={matter.entryCount === 0 || isLoadingGlobal}
                            >
                                <ReceiptIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    {matter.entryCount > 0 && (
                      <details className="group">
                          <summary className="text-xs text-[#8ecdb7] cursor-pointer group-hover:text-white list-none">
                              <span className="group-open:hidden">Show recent entries ({Math.min(matter.entryCount, 3)})</span>
                              <span className="hidden group-open:inline">Hide recent entries</span>
                          </summary>
                          <ul className="mt-2 space-y-1 max-h-48 overflow-y-auto chat-scrollbar pr-2">
                          {matter.recentEntriesPreview.map(entry => ( 
                              <li key={entry.id} className="text-xs text-[#b2dfdb] border-b border-[#2f6a55]/50 py-1 last:border-b-0">
                              {new Date(entry.date).toLocaleDateString('en-CA')}: {entry.taskSummary.substring(0,50)}{entry.taskSummary.length > 50 ? '...' : ''} ({entry.duration}h)
                              </li>
                          ))}
                          {matter.entryCount > 3 && <li className="text-xs text-[#8ecdb7] text-center pt-1">...and {matter.entryCount - 3} more entries. Click "Generate Report" to see all.</li>}
                          </ul>
                      </details>
                    )}
                    {matter.entryCount === 0 && (
                        <p className="text-xs text-[#8ecdb7] mt-1">No time entries for this matter yet.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
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
