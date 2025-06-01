
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from './services/supabaseClient';
import { Session } from '@supabase/supabase-js';
import { Client, Matter, TimeEntry, TimeEntryFormSubmitData } from './types';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage'; // Ensure AuthPage is created/updated
import MainAppView from './components/MainAppView';
import BillingNarrativePreview, { NarrativePreviewData } from './components/BillingNarrativePreview';
import ReportView from './components/ReportView';
import { generateBillingNarrative } from './services/geminiService';
import { SpinnerIcon, LexiBillLogoIcon } from './components/icons'; // For loading state

const App: React.FC = () => {
  const [authSession, setAuthSession] = useState<Session | null>(null);
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'app' | 'loading'>('loading');

  const [clients, setClients] = useState<Client[]>([]);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false); // For specific operations like form submit
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true); // For initial data load

  const [showNarrativePreview, setShowNarrativePreview] = useState<boolean>(false);
  const [currentNarrativeData, setCurrentNarrativeData] = useState<NarrativePreviewData | null>(null);

  const [showReportPreview, setShowReportPreview] = useState<boolean>(false);
  const [reportPreviewData, setReportPreviewData] = useState<{ entries: TimeEntry[]; matterName: string } | null>(null);

  // Handle Auth State Change
  useEffect(() => {
    setIsDataLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthSession(session);
      setCurrentView(session ? 'app' : 'landing'); // Go to app if session exists, else landing
      setIsDataLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthSession(session);
      if (session) {
        setCurrentView('app');
      } else {
        // If user logs out from 'app' view, or session expires, go to 'auth' view.
        // If they were on 'landing', stay on 'landing' or go to 'auth' as appropriate.
        setCurrentView('auth'); 
      }
      // Clear data if session becomes null
      if (!session) {
        setClients([]);
        setMatters([]);
        setTimeEntries([]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch initial data when user is authenticated
  const fetchInitialData = useCallback(async () => {
    if (!authSession) return;
    setIsDataLoading(true);
    try {
      const [clientsRes, mattersRes, timeEntriesRes] = await Promise.all([
        supabase.from('clients').select('*'), // RLS handles user_id filtering
        supabase.from('matters').select('*'), // RLS handles user_id filtering
        supabase.from('time_entries').select('*') // RLS handles user_id filtering
      ]);

      if (clientsRes.error) throw clientsRes.error;
      setClients(clientsRes.data?.map(c => ({ 
        id: c.id, 
        name: c.name, 
        defaultRate: c.default_rate 
      } as Client)) || []);

      if (mattersRes.error) throw mattersRes.error;
      setMatters(mattersRes.data?.map(m => ({ 
        id: m.id, 
        clientID: m.client_id, 
        name: m.name, 
        specificRate: m.specific_rate 
      } as Matter)) || []);

      if (timeEntriesRes.error) throw timeEntriesRes.error;
      setTimeEntries(timeEntriesRes.data?.map(te => ({
        id: te.id,
        clientID: te.client_id,
        matterID: te.matter_id,
        date: new Date(te.date),
        taskSummary: te.task_summary,
        billingNarrative: te.billing_narrative,
        duration: te.duration,
        rate: te.rate,
        notes: te.notes,
        isBilled: te.is_billed,
      } as TimeEntry)).sort((a,b) => b.date.getTime() - a.date.getTime()) || []);

    } catch (error: any) {
      console.error("Error fetching initial data:", error.message);
      alert(`Error fetching data: ${error.message}. Please ensure your database schema is up to date and RLS policies are set.`);
    } finally {
      setIsDataLoading(false);
    }
  }, [authSession]);

  useEffect(() => {
    if (authSession && currentView === 'app') {
      fetchInitialData();
    }
  }, [authSession, currentView, fetchInitialData]);


  const handleGetStarted = () => setCurrentView('auth');
  const navigateToHome = () => setCurrentView('landing'); // For AuthPage to go back to landing

  const handleAddMatterSupabase = async (newMatterData: { clientID: string; name: string; specificRate?: number }) => {
    if (!authSession) throw new Error("User not authenticated");
    const { clientID, name, specificRate } = newMatterData;
    
    const clientExists = clients.find(c => c.id === clientID);
    if (!clientExists) throw new Error(`Client with ID ${clientID} not found locally. Ensure clients are loaded.`);

    const { data, error } = await supabase.from('matters')
        .insert({
            client_id: clientID,
            user_id: authSession.user.id,
            name,
            specific_rate: specificRate
        })
        .select()
        .single();

    if (error) {
        console.error('Error adding matter to Supabase:', error);
        throw error;
    }
    if (data) {
        const addedMatter: Matter = {
            id: data.id,
            clientID: data.client_id,
            name: data.name,
            specificRate: data.specific_rate,
        };
        setMatters(prev => [...prev, addedMatter]);
        return addedMatter;
    }
    throw new Error("Failed to add matter: no data returned");
  };
  
  const handleTimeEntrySubmit = async (formData: TimeEntryFormSubmitData) => {
    setIsLoading(true);
    if (!authSession) {
      alert("Not authenticated. Please log in.");
      setIsLoading(false);
      return;
    }
    const client = clients.find(c => c.id === formData.clientID);
    if (!client) {
      console.error("Client not found for time entry.");
      alert("Selected client not found. Please refresh or check client list.");
      setIsLoading(false);
      return;
    }

    let finalMatterID: string;
    let matterNameForNarrative: string;
    let isNewMatter = false;
    let newMatterNameToSave: string | undefined = undefined;

    if (formData.newMatterName) {
      // Pre-generate an ID for UI purposes if needed, but Supabase will create the real one.
      // For the narrative preview, we need a stable temporary ID if the real one is not yet created.
      // Or, handleAddMatterSupabase can be called here and its ID used.
      // Let's try to create the matter here if it's new, before generating narrative.
      try {
        const createdMatter = await handleAddMatterSupabase({
          clientID: formData.clientID,
          name: formData.newMatterName
          // specificRate can be handled based on form logic or defaults
        });
        finalMatterID = createdMatter.id;
        matterNameForNarrative = createdMatter.name;
        newMatterNameToSave = createdMatter.name; // Though it's already saved
        isNewMatter = false; // It's no longer "pending" after this step
      } catch (error: any) {
        alert(`Failed to create new matter: ${error.message}`);
        setIsLoading(false);
        return;
      }
    } else if (formData.matterID) {
      const existingMatter = matters.find(m => m.id === formData.matterID);
      if (!existingMatter) {
        console.error("Existing Matter ID provided but not found.");
        alert("Selected matter not found. Please refresh or check matter list.");
        setIsLoading(false);
        return;
      }
      finalMatterID = existingMatter.id;
      matterNameForNarrative = existingMatter.name;
    } else {
      console.error("No matter information provided.");
      alert("Matter information is missing.");
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
        isNewMatterPending: isNewMatter, // This should be false if matter created above
        newMatterNameIfPending: newMatterNameToSave, // This also becomes less relevant
      };
      delete (narrativePreviewPayload as any).newMatterName; 

      setCurrentNarrativeData(narrativePreviewPayload);
      setShowNarrativePreview(true);
    } catch (error: any) {
      console.error("Error in time entry submission process:", error);
      alert(`Error generating narrative: ${error.message}`);
      // Optionally show preview with error
    } finally {
      setIsLoading(false);
    }
  };

  const handleNarrativeApprove = async (finalNarrative: string, approvedData: NarrativePreviewData) => {
    if (!authSession) {
      alert("Not authenticated. Please log in.");
      return;
    }
    setIsLoading(true);
    try {
      // Matter creation is now handled in handleTimeEntrySubmit if it's a new matter.
      // So, approvedData.matterID should always be a valid, existing matter ID here.

      const timeEntrySupabaseData = {
        user_id: authSession.user.id,
        matter_id: approvedData.matterID,
        client_id: approvedData.clientID,
        date: approvedData.date.toISOString().split('T')[0],
        task_summary: approvedData.taskSummary,
        billing_narrative: finalNarrative,
        duration: approvedData.duration,
        rate: approvedData.rate,
        notes: approvedData.notes,
        is_billed: false,
      };

      const { data: newTimeEntryData, error: timeEntryError } = await supabase
        .from('time_entries')
        .insert(timeEntrySupabaseData)
        .select()
        .single();

      if (timeEntryError) throw timeEntryError;

      if (newTimeEntryData) {
        const newEntry: TimeEntry = {
          id: newTimeEntryData.id,
          clientID: newTimeEntryData.client_id,
          matterID: newTimeEntryData.matter_id,
          date: new Date(newTimeEntryData.date),
          taskSummary: newTimeEntryData.task_summary,
          billingNarrative: newTimeEntryData.billing_narrative,
          duration: newTimeEntryData.duration,
          rate: newTimeEntryData.rate,
          notes: newTimeEntryData.notes,
          isBilled: newTimeEntryData.is_billed,
        };
        setTimeEntries(prev => [...prev, newEntry].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      }
      setShowNarrativePreview(false);
      setCurrentNarrativeData(null);
    } catch (error: any) {
      console.error("Error approving narrative and saving entry:", error.message);
      alert(`Error saving time entry: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNarrativeCancel = () => {
    setShowNarrativePreview(false);
    setCurrentNarrativeData(null);
  };
  
  // handleAddClient and handleAddMatter (for direct addition) would be similar, 
  // interacting with Supabase and updating state. For now, they are not directly invoked by current UI
  // except handleAddMatterSupabase which is used internally.
  const handleAddClient = async (client: Omit<Client, 'id'>) => {
    if (!authSession) return;
    const { error } = await supabase.from('clients').insert({ ...client, user_id: authSession.user.id });
    if (error) console.error(error); else fetchInitialData(); // Refetch
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
    field = field.replace(/\r\n|\r|\n/g, ' ');
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
        "",
        ["Total Hours:", escapeCsvField(totalHours.toFixed(1)), "", "", ""].join(','),
        ["Total Amount Billed (ZAR):", escapeCsvField(totalBilled.toFixed(2)), "", "", ""].join(',')
    ];
    const csvContent = [headers.join(','), ...csvRows, ...summaryRows].join('\n');
    const sanitizedMatterName = matterName.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `Billing_Report_${sanitizedMatterName}_${currentDate}.csv`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } else {
        alert("CSV download is not supported in your browser.");
    }
    setShowReportPreview(false);
    setReportPreviewData(null);
  };
  
  const handleEditReport = () => {
     setShowReportPreview(false);
     setReportPreviewData(null);
     alert("Editing entries: Functionality to edit specific entries from report preview can be added. For now, manage entries through main dashboard or re-log if needed.");
  };

  const handleLogout = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
      alert("Error logging out. Please try again.");
    }
    // onAuthStateChange will handle setting authSession to null and updating currentView
    setIsLoading(false);
  };

  // --- RENDER LOGIC ---
  if (currentView === 'loading' || (currentView === 'app' && isDataLoading && authSession)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#10231c] text-white">
        <LexiBillLogoIcon className="h-16 w-16 text-[#8ecdb7] mb-4" />
        <SpinnerIcon className="w-12 h-12" />
        <p className="mt-4 text-lg">Loading LexiBill AI...</p>
      </div>
    );
  }

  if (currentView === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  if (currentView === 'auth' && !authSession) {
    return <AuthPage supabaseClient={supabase} onNavigateToLanding={navigateToHome} />;
  }
  
  if (currentView === 'app' && authSession) {
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
        onLogout={handleLogout} // Changed from onNavigateHome
        isLoadingGlobal={isLoading || isDataLoading}
        onShowReportForMatter={handleShowReportForMatter}
        // onAddClient and onAddMatter are not directly used by MainAppView for forms currently
        // but their Supabase equivalents are used internally or can be for future UI.
      />
    );
  }
  
  // Fallback or if state is inconsistent (e.g., 'auth' but session exists)
  // This might indicate a need to refine view logic or redirect.
  // For now, redirecting to landing might be safest if in an unexpected state.
  if (!authSession && currentView === 'app') {
    setCurrentView('landing'); // Or 'auth'
    return <LandingPage onGetStarted={handleGetStarted} />;
  }
  if (authSession && currentView === 'auth') { // If user is authenticated but view is 'auth'
     setCurrentView('app'); // If session exists, should be in app
      return ( // Show loading while transitioning to app view
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#10231c] text-white">
            <LexiBillLogoIcon className="h-16 w-16 text-[#8ecdb7] mb-4" />
            <SpinnerIcon className="w-12 h-12" />
        </div>
      );
  }


  // Default return if none of the above conditions are met (should ideally not be reached with proper view logic)
  return <LandingPage onGetStarted={handleGetStarted} />;
};

export default App;
