
import React, { useState, useEffect, useCallback } from 'react';
import { Client, Matter, TimeEntry, TimeEntryFormSubmitData } from './types';
import LandingPage from './components/LandingPage';
import MainAppView from './components/MainAppView';
import BillingNarrativePreview, { NarrativePreviewData } from './components/BillingNarrativePreview';
import ReportView from './components/ReportView';
import { generateBillingNarrative } from './services/geminiService';
import { BOT_NAME } from './constants';

const generateId = () => Math.random().toString(36).substr(2, 9);

// Provide empty arrays as fallback if localStorage is empty or on first load.
// This is important for the dashboard calculations not to crash.
const initialClients: Client[] = JSON.parse(localStorage.getItem('lexibill_clients') || 'null') || [
  { id: 'client-1', name: 'Acme Corp Legal', defaultRate: 2500 },
  { id: 'client-2', name: 'Beta Solutions Inc.', defaultRate: 2200 },
  { id: 'client-3', name: 'Gamma Consulting Group', defaultRate: 3000 },
];
const initialMatters: Matter[] = JSON.parse(localStorage.getItem('lexibill_matters') || 'null') || [
  { id: 'matter-1a', clientID: 'client-1', name: 'Contract Dispute Q4 2023', specificRate: 2600 },
  { id: 'matter-1b', clientID: 'client-1', name: 'Intellectual Property Registration - Project Phoenix' },
  { id: 'matter-2a', clientID: 'client-2', name: 'Employment Agreement Review - J. Doe', specificRate: 2250 },
  { id: 'matter-3a', clientID: 'client-3', name: 'Merger & Acquisition Due Diligence - Target X' },
  { id: 'matter-3b', clientID: 'client-3', name: 'Regulatory Compliance Audit 2024', specificRate: 3200 },
];
const initialTimeEntries: TimeEntry[] = (JSON.parse(localStorage.getItem('lexibill_timeEntries') || 'null') || []).map((entry: any) => ({
    ...entry,
    date: new Date(entry.date) // Ensure date is a Date object
}));


const App: React.FC = () => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [matters, setMatters] = useState<Matter[]>(initialMatters);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(initialTimeEntries);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showLanding, setShowLanding] = useState<boolean>(true);
  
  const [showNarrativePreview, setShowNarrativePreview] = useState<boolean>(false);
  const [currentNarrativeData, setCurrentNarrativeData] = useState<NarrativePreviewData | null>(null);

  const [showReportPreview, setShowReportPreview] = useState<boolean>(false);
  const [reportPreviewData, setReportPreviewData] = useState<{ entries: TimeEntry[]; matterName: string } | null>(null);

  // Persist to localStorage (simple example, replace with backend later)
  useEffect(() => {
    localStorage.setItem('lexibill_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('lexibill_matters', JSON.stringify(matters));
  }, [matters]);

  useEffect(() => {
    localStorage.setItem('lexibill_timeEntries', JSON.stringify(timeEntries));
  }, [timeEntries]);


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

  const handleTimeEntrySubmit = async (formData: TimeEntryFormSubmitData) => {
    setIsLoading(true);
    const client = clients.find(c => c.id === formData.clientID);

    if (!client) {
      console.error("Client not found for time entry.");
      setIsLoading(false);
      return;
    }

    let finalMatterID: string;
    let matterNameForNarrative: string;
    let isNewMatter = false;
    let newMatterNameToSave: string | undefined = undefined;

    if (formData.newMatterName) {
      finalMatterID = generateId(); 
      matterNameForNarrative = formData.newMatterName;
      isNewMatter = true;
      newMatterNameToSave = formData.newMatterName;
    } else if (formData.matterID) {
      const existingMatter = matters.find(m => m.id === formData.matterID);
      if (!existingMatter) {
        console.error("Existing Matter ID provided but not found.");
        setIsLoading(false);
        return;
      }
      finalMatterID = existingMatter.id;
      matterNameForNarrative = existingMatter.name;
    } else {
      console.error("No matter information provided.");
      setIsLoading(false);
      return;
    }

    try {
      const narrative = await generateBillingNarrative(
        formData.taskSummary,
        client.name,
        matterNameForNarrative, 
        formData.date,
        formData.duration
      );

      const narrativePreviewPayload: NarrativePreviewData = {
        ...formData, 
        matterID: finalMatterID, 
        clientName: client.name,
        matterName: matterNameForNarrative,
        generatedNarrative: narrative,
        isNewMatterPending: isNewMatter,
        newMatterNameIfPending: newMatterNameToSave,
      };
      delete (narrativePreviewPayload as any).newMatterName; 


      setCurrentNarrativeData(narrativePreviewPayload);
      setShowNarrativePreview(true);
    } catch (error) {
      console.error("Error in time entry submission process:", error);
      const errorNarrativePreviewPayload: NarrativePreviewData = {
         ...formData,
        matterID: finalMatterID,
        clientName: client.name,
        matterName: matterNameForNarrative,
        generatedNarrative: `Error generating AI narrative. Original summary: ${formData.taskSummary}`,
        isNewMatterPending: isNewMatter,
        newMatterNameIfPending: newMatterNameToSave,
      };
      delete (errorNarrativePreviewPayload as any).newMatterName;


      setCurrentNarrativeData(errorNarrativePreviewPayload);
      setShowNarrativePreview(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNarrativeApprove = (finalNarrative: string, approvedData: NarrativePreviewData) => {
    if (approvedData.isNewMatterPending && approvedData.newMatterNameIfPending) {
      const newMatter: Matter = {
        id: approvedData.matterID, 
        clientID: approvedData.clientID,
        name: approvedData.newMatterNameIfPending,
        // New matters inherit client's default rate initially, no specificRate
      };
      handleAddMatter(newMatter); 
    }

    const newTimeEntry: TimeEntry = {
      id: generateId(),
      clientID: approvedData.clientID,
      matterID: approvedData.matterID, 
      date: approvedData.date, // This is already a Date object from TimeEntryForm
      taskSummary: approvedData.taskSummary,
      billingNarrative: finalNarrative,
      duration: approvedData.duration,
      rate: approvedData.rate,
      notes: approvedData.notes,
      isBilled: false, // New entries are unbilled by default
    };
    setTimeEntries(prev => [...prev, newTimeEntry].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setShowNarrativePreview(false);
    setCurrentNarrativeData(null);
  };

  const handleNarrativeCancel = () => {
    setShowNarrativePreview(false);
    setCurrentNarrativeData(null);
  };

  const handleAddClient = (client: Client) => {
    setClients(prev => [...prev, client]);
  };
  const handleAddMatter = (matter: Matter) => {
    setMatters(prev => [...prev, matter]);
  };


  const handleShowReportForMatter = (matterId: string) => {
    const matter = matters.find(m => m.id === matterId);
    if (!matter) return;
    const entriesForMatter = timeEntries.filter(entry => entry.matterID === matterId);
    if (entriesForMatter.length > 0) {
        setReportPreviewData({ entries: entriesForMatter, matterName: matter.name });
        setShowReportPreview(true);
    } else {
        alert(`No time entries found for matter "${matter.name}".`);
    }
  };
  
  const handleCloseReport = () => {
    setShowReportPreview(false);
    setReportPreviewData(null);
  };

  const escapeCsvField = (fieldData: any): string => {
    let field = String(fieldData);
    // Replace newlines with a space for simpler CSV.
    field = field.replace(/\r\n|\r|\n/g, ' ');
    // If the field contains a comma, double quote, or newline (after potential replacement),
    // enclose it in double quotes and escape any existing double quotes by doubling them.
    if (field.includes(',') || field.includes('"')) {
      field = `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  };

  const handleConfirmReport = () => {
    if (!reportPreviewData) return;

    const { entries, matterName } = reportPreviewData;
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const headers = ["Date", "Billing Narrative", "Duration (Hours)", "Rate (ZAR/hour)", "Amount (ZAR)"];
    
    const csvRows = sortedEntries.map(entry => [
      escapeCsvField(new Date(entry.date).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })),
      escapeCsvField(entry.billingNarrative),
      escapeCsvField(entry.duration.toFixed(1)),
      escapeCsvField(entry.rate.toFixed(2)),
      escapeCsvField((entry.duration * entry.rate).toFixed(2))
    ].join(','));

    const totalHours = sortedEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const totalBilled = sortedEntries.reduce((sum, entry) => sum + (entry.duration * entry.rate), 0);

    const summaryRows = [
        "", // Empty line for separation
        ["Total Hours:", escapeCsvField(totalHours.toFixed(1)), "", "", ""].join(','),
        ["Total Amount Billed (ZAR):", escapeCsvField(totalBilled.toFixed(2)), "", "", ""].join(',')
    ];
    
    const csvContent = [headers.join(','), ...csvRows, ...summaryRows].join('\n');
    
    const sanitizedMatterName = matterName.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `Billing_Report_${sanitizedMatterName}_${currentDate}.csv`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) { // Feature detection
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up
    } else {
        alert("CSV download is not supported in your browser.");
    }

    setShowReportPreview(false);
    setReportPreviewData(null);
  };
  
  const handleEditReport = () => {
     // For now, just closes the report view. Could navigate to a specific entry editing view.
     setShowReportPreview(false);
     setReportPreviewData(null);
     // Future: Could set state to highlight entries from this report in the main list for editing.
     alert("Editing entries: Close report preview. Entries can be managed from the main dashboard (future feature) or by re-logging if needed.");
  };


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
        onConfirm={handleConfirmReport}
        onEdit={handleEditReport}
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
      isLoadingGlobal={isLoading} // Renamed to avoid conflict with internal isLoading states in MainAppView
      onShowReportForMatter={handleShowReportForMatter}
      onAddClient={handleAddClient} // These are not used yet but good for future client/matter management UI
      onAddMatter={handleAddMatter}
    />
  );
};

export default App;
