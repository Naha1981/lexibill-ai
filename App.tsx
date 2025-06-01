
import React, { useState, useEffect, useCallback } from 'react';
import { Client, Matter, TimeEntry } from './types';
import LandingPage from './components/LandingPage';
import MainAppView from './components/MainAppView'; // New main view
import BillingNarrativePreview, { NarrativePreviewData } from './components/BillingNarrativePreview'; // New component
import ReportView from './components/ReportView'; // Kept for future invoice generation
import { generateBillingNarrative } from './services/geminiService';
import { BOT_NAME } from './constants'; // BOT_NAME might be used in headers or footers

const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock initial data - in a real app, this would come from a backend or local storage
const initialClients: Client[] = [
  { id: 'client-1', name: 'Acme Corp Legal', defaultRate: 2500 },
  { id: 'client-2', name: 'Beta Solutions Inc.', defaultRate: 2200 },
  { id: 'client-3', name: 'Gamma Consulting Group', defaultRate: 3000 },
];
const initialMatters: Matter[] = [
  { id: 'matter-1a', clientID: 'client-1', name: 'Contract Dispute Q4 2023', specificRate: 2600 },
  { id: 'matter-1b', clientID: 'client-1', name: 'Intellectual Property Registration - Project Phoenix' },
  { id: 'matter-2a', clientID: 'client-2', name: 'Employment Agreement Review - J. Doe', specificRate: 2250 },
  { id: 'matter-3a', clientID: 'client-3', name: 'Merger & Acquisition Due Diligence - Target X' },
  { id: 'matter-3b', clientID: 'client-3', name: 'Regulatory Compliance Audit 2024', specificRate: 3200 },
];


const App: React.FC = () => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [matters, setMatters] = useState<Matter[]>(initialMatters);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showLanding, setShowLanding] = useState<boolean>(true);
  
  const [showNarrativePreview, setShowNarrativePreview] = useState<boolean>(false);
  const [currentNarrativeData, setCurrentNarrativeData] = useState<NarrativePreviewData | null>(null);

  const [showReportPreview, setShowReportPreview] = useState<boolean>(false);
  const [reportPreviewData, setReportPreviewData] = useState<{ entries: TimeEntry[]; matterName: string } | null>(null);


  const handleGetStarted = () => {
    setShowLanding(false);
  };

  const navigateToHome = useCallback(() => {
    setShowLanding(true);
    setShowNarrativePreview(false);
    setCurrentNarrativeData(null);
    setShowReportPreview(false);
    setReportPreviewData(null);
  }, []);

  const handleTimeEntrySubmit = async (formData: Omit<TimeEntry, 'id' | 'billingNarrative' | 'isBilled'>) => {
    setIsLoading(true);
    const client = clients.find(c => c.id === formData.clientID);
    const matter = matters.find(m => m.id === formData.matterID);

    if (!client || !matter) {
      console.error("Client or Matter not found for time entry.");
      // TODO: Show user-friendly error message
      setIsLoading(false);
      return;
    }

    try {
      const narrative = await generateBillingNarrative(
        formData.taskSummary,
        client.name,
        matter.name,
        formData.date,
        formData.duration
      );
      setCurrentNarrativeData({ ...formData, generatedNarrative: narrative });
      setShowNarrativePreview(true);
    } catch (error) {
      console.error("Error in time entry submission process:", error);
      // TODO: Show user-friendly error message
      // Potentially allow manual narrative entry if AI fails
      setCurrentNarrativeData({ ...formData, generatedNarrative: `Error generating AI narrative. Original summary: ${formData.taskSummary}` });
      setShowNarrativePreview(true); // Show preview even with error, so user can edit
    } finally {
      setIsLoading(false);
    }
  };

  const handleNarrativeApprove = (finalNarrative: string, originalEntryData: Omit<NarrativePreviewData, 'generatedNarrative'>) => {
    const newTimeEntry: TimeEntry = {
      ...originalEntryData,
      id: generateId(),
      billingNarrative: finalNarrative,
      isBilled: false,
    };
    setTimeEntries(prev => [...prev, newTimeEntry].sort((a,b) => b.date.getTime() - a.date.getTime())); // Sort by most recent
    setShowNarrativePreview(false);
    setCurrentNarrativeData(null);
    // TODO: Add a success message/toast notification
  };

  const handleNarrativeCancel = () => {
    setShowNarrativePreview(false);
    setCurrentNarrativeData(null);
  };

  // --- Client and Matter Management (Placeholders for now) ---
  const handleAddClient = (client: Client) => {
    setClients(prev => [...prev, client]);
  };
  const handleAddMatter = (matter: Matter) => {
    setMatters(prev => [...prev, matter]);
  };
   // --- End Client and Matter Management ---


  // --- ReportView Handlers (adapted for new flow) ---
  const handleShowReportForMatter = (matterId: string) => {
    const matter = matters.find(m => m.id === matterId);
    if (!matter) return;
    const entriesForMatter = timeEntries.filter(entry => entry.matterID === matterId);
    if (entriesForMatter.length > 0) {
        setReportPreviewData({ entries: entriesForMatter, matterName: matter.name });
        setShowReportPreview(true);
    } else {
        // TODO: Show message "No entries for this matter"
        alert(`No time entries found for matter "${matter.name}".`);
    }
  };
  
  const handleCloseReport = () => {
    setShowReportPreview(false);
    setReportPreviewData(null);
    // No chat message needed here
  };

  const handleConfirmReport = () => { // "Confirm" here means "Finalize" or "Download"
    const confirmedMatterName = reportPreviewData?.matterName || "Unknown Matter";
    // In a real app, this would trigger PDF generation/download or email
    alert(`Billing report for ${confirmedMatterName} would be generated/downloaded here.`);
    setShowReportPreview(false);
    setReportPreviewData(null);
  };
  
  const handleEditReport = () => { // "Edit" here means go back and edit individual entries
     alert("Editing entries directly from the report preview is planned. For now, please close the preview and manage entries individually.");
    // This could close the preview and take the user to a list of entries for that matter.
  };
  // --- End ReportView Handlers ---


  if (showLanding) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (showNarrativePreview && currentNarrativeData) {
    return (
      <BillingNarrativePreview
        narrativeData={currentNarrativeData}
        onApprove={handleNarrativeApprove}
        onCancel={handleNarrativeCancel}
        isLoading={isLoading}
      />
    );
  }

  if (showReportPreview && reportPreviewData) {
    return (
      <ReportView
        entries={reportPreviewData.entries}
        matterName={reportPreviewData.matterName}
        onClose={handleCloseReport}
        onConfirm={handleConfirmReport} // "Confirm" generates final report
        onEdit={handleEditReport} // "Edit" logic to be defined
      />
    );
  }

  return (
    <MainAppView
      clients={clients}
      matters={matters}
      timeEntries={timeEntries}
      onTimeEntrySubmit={handleTimeEntrySubmit}
      onNavigateHome={navigateToHome}
      isLoading={isLoading}
      onShowReportForMatter={handleShowReportForMatter}
      // Pass add client/matter handlers if implementing basic forms in MainAppView
      onAddClient={handleAddClient}
      onAddMatter={handleAddMatter}
    />
  );
};

export default App;
