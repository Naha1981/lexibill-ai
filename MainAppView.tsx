
import React, { useState, useMemo, useCallback } from 'react';
import { 
  Client, Matter, TimeEntry, TimeEntryFormSubmitData, 
  DashboardSnapshotData, CSVBillingRecord, PDFIntakeFile, AIConsoleMessage 
} from '../types';
import TimeEntryForm from './TimeEntryForm';
import { ArrowLeftIcon, ReceiptIcon, SpinnerIcon, RobotIcon, UploadCloudIcon, FileTextIcon, MessageSquareIcon, ChevronDownIcon, ChevronUpIcon } from './icons'; // Added new icons
import { BOT_NAME } from '../constants';

// Pro Edition Components
import DashboardSnapshotView from './pro/DashboardSnapshotView';
import CSVImportView from './pro/CSVImportView';
import OCRIntakeView from './pro/OCRIntakeView';
import AIConsoleView from './pro/AIConsoleView';


interface MainAppViewProps {
  userName?: string | null;
  clients: Client[];
  matters: Matter[];
  timeEntries: TimeEntry[];
  onTimeEntrySubmit: (formData: TimeEntryFormSubmitData) => void;
  onLogout: () => Promise<void>; 
  isLoadingGlobal: boolean;
  onShowReportForMatter: (matterId: string) => void;
  
  // Pro Edition Props
  dashboardSnapshot: DashboardSnapshotData;
  importedCsvRecords: CSVBillingRecord[];
  onCsvFileImport: (file: File) => void;
  pdfIntakeFiles: PDFIntakeFile[];
  onPdfFileImport: (files: FileList) => void;
  aiConsoleMessages: AIConsoleMessage[];
  onAIConsoleQuery: (query: string) => void;
}

const MainAppView: React.FC<MainAppViewProps> = ({
  userName, clients, matters, timeEntries,
  onTimeEntrySubmit, onLogout, isLoadingGlobal, onShowReportForMatter,
  dashboardSnapshot, importedCsvRecords, onCsvFileImport,
  pdfIntakeFiles, onPdfFileImport, aiConsoleMessages, onAIConsoleQuery
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    timeEntry: false,
    mattersOverview: false,
    csvImport: true, // Open by default
    ocrIntake: true, // Open by default
    aiConsole: true, // Open by default
  });

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  const handleLogoutClick = async () => {
    setIsLoggingOut(true);
    await onLogout();
    // isLoggingOut will be reset by parent if navigation occurs or can be reset here if staying on same conceptual page
  };

  const clientsWithTheirMatters = useMemo(() => {
    return clients.map(client => ({
      ...client,
      matters: matters.filter(matter => matter.clientID === client.id).map(matter => {
        const entriesForMatter = timeEntries.filter(entry => entry.matterID === matter.id);
        const totalHours = entriesForMatter.reduce((sum, entry) => sum + entry.duration, 0);
        const totalAmount = entriesForMatter.reduce((sum, entry) => sum + (entry.duration * entry.rate), 0);
        const recentEntriesPreview = entriesForMatter.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0,3);
        return { ...matter, totalHours, totalAmount, entryCount: entriesForMatter.length, recentEntriesPreview };
      }),
    })).sort((a,b) => a.name.localeCompare(b.name));
  }, [clients, matters, timeEntries]);

  const handleMatterSelectFromDashboard = useCallback((matterId: string) => { // Kept for future use if top matters widget returns
    setExpandedSections(prev => ({ ...prev, mattersOverview: true }));
    // Scroll and highlight logic (ensure element IDs match)
    setTimeout(() => { // Ensure section is rendered
        const elementId = `matter-overview-item-${matterId}`;
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('matter-highlight-animation');
          setTimeout(() => element.classList.remove('matter-highlight-animation'), 1800);
          const detailsElement = element.closest('details');
          if (detailsElement && !detailsElement.open) {
            const parentDetails = element.closest('.matter-item-container')?.querySelector('details');
            if (parentDetails && !parentDetails.open) parentDetails.open = true;
          }
        }
    }, 100);
  }, []);

  const SectionHeader: React.FC<{ title: string; sectionKey: string; icon?: React.ReactNode }> = ({ title, sectionKey, icon }) => (
    <div 
      className="flex justify-between items-center cursor-pointer py-3 px-1 hover:bg-[#1f4236] rounded-md"
      onClick={() => toggleSection(sectionKey)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleSection(sectionKey)}
      aria-expanded={expandedSections[sectionKey]}
      aria-controls={`section-content-${sectionKey}`}
    >
      <div className="flex items-center">
        {icon && <span className="mr-3 text-[#019863]">{icon}</span>}
        <h2 className="text-xl sm:text-2xl font-semibold text-white">{title}</h2>
      </div>
      {expandedSections[sectionKey] ? <ChevronUpIcon className="w-6 h-6 text-[#8ecdb7]" /> : <ChevronDownIcon className="w-6 h-6 text-[#8ecdb7]" />}
    </div>
  );


  return (
    <div className="relative flex flex-col size-full min-h-screen bg-[#10231c] justify-start overflow-x-hidden">
      <header className="flex items-center bg-[#10231c] p-4 pb-2 justify-between sticky top-0 z-20 w-full">
        <button onClick={handleLogoutClick} disabled={isLoggingOut} className="text-white flex size-12 shrink-0 items-center justify-center hover:bg-[#1a3a2f] rounded-full transition-colors disabled:opacity-50" aria-label="Logout">
          {isLoggingOut ? <SpinnerIcon className="w-5 h-5" /> : <ArrowLeftIcon className="w-6 h-6" />} 
        </button>
        <div className="flex-1 flex flex-col items-center justify-center py-1 text-center">
          <h1 className="text-white text-2xl font-bold leading-tight tracking-[-0.015em] pt-2">LexiBill AI Pro</h1>
          {userName && <p className="text-sm text-white mt-1">Welcome, {userName.split(' ')[0]}!</p>}
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center" aria-hidden="true"></div>
      </header>
      <div className="px-4 pt-1 pb-3 bg-[#10231c] sticky top-[calc(4rem+0.5rem+1.5rem)] z-20 w-full">
        <div className="h-px bg-[#8ecdb7] animate-draw-line-lr" style={{ transformOrigin: 'left' }}></div>
      </div>

      <main className="flex-grow overflow-y-auto chat-scrollbar px-4 py-6 space-y-8 z-0">
        {isLoadingGlobal && !isLoggingOut && ( 
           <div className="fixed inset-0 bg-[#10231c]/70 flex items-center justify-center z-50">
             <SpinnerIcon className="w-10 h-10 text-white" />
           </div>
        )}
        
        {/* Pro Edition Dashboard Snapshot */}
        <DashboardSnapshotView snapshotData={dashboardSnapshot} />

        {/* --- Collapsible Sections for Pro Features --- */}
        <section className="bg-[#122720] p-4 sm:p-6 rounded-xl shadow-lg border border-[#2f6a55]">
            <SectionHeader title="Import Billing Data (CSV)" sectionKey="csvImport" icon={<UploadCloudIcon className="w-6 h-6" />} />
            {expandedSections.csvImport && (
                <div id="section-content-csvImport" className="mt-4">
                    <CSVImportView 
                        onFileUpload={onCsvFileImport} 
                        importedRecords={importedCsvRecords} 
                        isLoading={isLoadingGlobal} 
                    />
                </div>
            )}
        </section>

        <section className="bg-[#122720] p-4 sm:p-6 rounded-xl shadow-lg border border-[#2f6a55]">
             <SectionHeader title="PDF Invoice OCR Intake" sectionKey="ocrIntake" icon={<FileTextIcon className="w-6 h-6" />} />
            {expandedSections.ocrIntake && (
                <div id="section-content-ocrIntake" className="mt-4">
                    <OCRIntakeView 
                        onFileChange={onPdfFileImport} 
                        uploadedFiles={pdfIntakeFiles} 
                        isLoading={isLoadingGlobal} 
                    />
                </div>
            )}
        </section>

        <section className="bg-[#122720] p-4 sm:p-6 rounded-xl shadow-lg border border-[#2f6a55]">
            <SectionHeader title="Ask LexiBill AI" sectionKey="aiConsole" icon={<MessageSquareIcon className="w-6 h-6" />} />
            {expandedSections.aiConsole && (
                <div id="section-content-aiConsole" className="mt-4">
                    <AIConsoleView 
                        messages={aiConsoleMessages} 
                        onSendMessage={onAIConsoleQuery} 
                        isLoading={isLoadingGlobal} 
                    />
                </div>
            )}
        </section>


        {/* --- Original App Features (Collapsible) --- */}
        <section className="bg-[#17352b] p-4 sm:p-6 rounded-xl shadow-lg border border-[#2f6a55]">
            <SectionHeader title="Log New Time Entry" sectionKey="timeEntry" icon={<RobotIcon className="w-6 h-6" />} />
            {expandedSections.timeEntry && (
                <div id="section-content-timeEntry" className="mt-4">
                    <TimeEntryForm clients={clients} matters={matters} onSubmit={onTimeEntrySubmit} isLoading={isLoadingGlobal && !isLoggingOut} />
                </div>
            )}
        </section>

        <section className="bg-[#17352b] p-4 sm:p-6 rounded-xl shadow-lg border border-[#2f6a55]">
          <SectionHeader title="Matters Overview & Reports" sectionKey="mattersOverview" icon={<ReceiptIcon className="w-6 h-6" />} />
          {expandedSections.mattersOverview && (
            <div id="section-content-mattersOverview" className="mt-4">
              {clientsWithTheirMatters.length === 0 && !isLoadingGlobal && <p className="text-[#8ecdb7]">No clients or matters. Add clients and log time.</p>}
              {isLoadingGlobal && clientsWithTheirMatters.length === 0 && <div className="text-center py-4"><SpinnerIcon className="w-8 h-8 text-[#8ecdb7] mx-auto" /><p className="text-[#8ecdb7] mt-2">Loading matters...</p></div>}
              {clientsWithTheirMatters.map(client => (
                <div key={client.id} className="mb-6 last:mb-0">
                  <h3 className="text-lg font-semibold text-[#c5e8df] border-b border-[#2f6a55] pb-2 mb-3">Client: {client.name}</h3>
                  {client.matters.length === 0 && <p className="text-sm text-[#8ecdb7] pl-2">No matters for this client.</p>}
                  <div className="space-y-4">
                    {client.matters.map(matter => (
                      <div key={matter.id} id={`matter-overview-item-${matter.id}`} className="p-3 sm:p-4 bg-[#214a3c] rounded-lg ml-0 md:ml-2 matter-item-container">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                          <div className="mb-2 sm:mb-0"><h4 className="text-md sm:text-lg font-medium text-white">{matter.name}</h4></div>
                          <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="text-right"><p className="text-sm text-white bg-[#019863] px-2 py-1 rounded">Total: {matter.totalHours.toFixed(1)} hrs</p><p className="text-xs text-[#b2dfdb] mt-1">Value: R {matter.totalAmount.toFixed(2)}</p></div>
                            <button onClick={() => onShowReportForMatter(matter.id)} className="p-2 text-[#8ecdb7] hover:text-white transition-colors rounded-full hover:bg-[#1a3a2f] disabled:opacity-50 disabled:cursor-not-allowed" title="Generate Report" aria-label={`Generate Report for ${matter.name}`} disabled={matter.entryCount === 0 || isLoadingGlobal}><ReceiptIcon className="w-5 h-5" /></button>
                          </div>
                        </div>
                        {matter.entryCount > 0 && (
                          <details className="group">
                            <summary className="text-xs text-[#8ecdb7] cursor-pointer group-hover:text-white list-none">
                              <span className="group-open:hidden">Show recent entries ({Math.min(matter.entryCount, 3)})</span>
                              <span className="hidden group-open:inline">Hide recent entries</span>
                            </summary>
                            <ul className="mt-2 space-y-1 max-h-48 overflow-y-auto chat-scrollbar pr-2">
                              {matter.recentEntriesPreview.map(entry => <li key={entry.id} className="text-xs text-[#b2dfdb] border-b border-[#2f6a55]/50 py-1 last:border-b-0">{new Date(entry.date).toLocaleDateString('en-CA')}: {entry.taskSummary.substring(0,50)}{entry.taskSummary.length > 50 ? '...' : ''} ({entry.duration}h)</li>)}
                              {matter.entryCount > 3 && <li className="text-xs text-[#8ecdb7] text-center pt-1">...and {matter.entryCount - 3} more. Click "Generate Report".</li>}
                            </ul>
                          </details>
                        )}
                        {matter.entryCount === 0 && <p className="text-xs text-[#8ecdb7] mt-1">No time entries.</p>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="bg-[#10231c] text-center py-4 sticky bottom-0 z-10 w-full">
        <p className="text-[#8ecdb7] text-xs">&copy; {new Date().getFullYear()} {BOT_NAME} Pro Edition. Billing Intelligence, Simplified.</p>
      </footer>
    </div>
  );
};

export default MainAppView;
