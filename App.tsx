
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Client, Matter, TimeEntry, TimeEntryFormSubmitData, 
  DashboardSnapshotData, OutstandingInvoice, RiskAlert, CollectionTarget,
  CSVBillingRecord, PDFIntakeFile, AIConsoleMessage, OverdueInvoiceForChase, DailyReportData,
  IntegrationSettings, AISettings, IntegrationService, IntegrationStatus, OAuthServiceType, ToastNotificationType // New Types
} from './types';
import AuthPage from './components/AuthPage';
import MainAppView from './components/MainAppView';
import BillingNarrativePreview, { NarrativePreviewData } from './components/BillingNarrativePreview';
import ReportView from './components/ReportView';
import LandingPage from './components/LandingPage';
import SmartChaseModal from './components/pro/SmartChaseModal';
import OAuthConnectionModal from './components/pro/OAuthConnectionModal'; // New Modal
import ZapierSetupModal from './components/pro/ZapierSetupModal'; // New Modal
import ToastNotification from './components/pro/ToastNotification'; // New Toast
import { generateBillingNarrative, generateSmartChaseEmail } from './services/geminiService';
import { processAIConsoleQuery } from './services/aiConsoleService'; 
import { SpinnerIcon } from './components/icons';
import { processCsvData, processPdfFile } from './services/externalApiService'; 

const LOCAL_STORAGE_KEYS = {
  LOGGED_IN_USER: 'lexibill_loggedInUser',
  CLIENTS: 'lexibill_clients',
  MATTERS: 'lexibill_matters',
  TIME_ENTRIES: 'lexibill_timeEntries',
  PDF_FILES: 'lexibill_pdfFiles', 
  AI_CONSOLE_MESSAGES: 'lexibill_aiConsoleMessages',
  INTEGRATION_SETTINGS: 'lexibill_integrationSettings', 
  AI_SETTINGS: 'lexibill_aiSettings'
};

const generateLocalId = (): string => Date.now().toString(36) + Math.random().toString(36).substring(2);

type ViewState = 'loading' | 'landing' | 'auth' | 'app';

const getMockDashboardSnapshot = (): DashboardSnapshotData => ({
  outstandingInvoices: [
    { id: 'inv_1', clientName: 'Tech Solutions Inc.', invoiceNumber: 'INV-00123', amountDue: 5500, dueDate: new Date(new Date().setDate(new Date().getDate() - 15)), daysOverdue: 15 },
    { id: 'inv_2', clientName: 'Global Corp Ltd.', invoiceNumber: 'INV-00124', amountDue: 12000, dueDate: new Date(new Date().setDate(new Date().getDate() - 30)), daysOverdue: 30 },
    { id: 'inv_3', clientName: 'Innovate Hub', invoiceNumber: 'INV-00128', amountDue: 750, dueDate: new Date(new Date().setDate(new Date().getDate() + 10)), daysOverdue: -10 },
  ],
  riskAlerts: [
    { id: 'risk_1', clientId: 'client_global_corp', clientName: 'Global Corp Ltd.', riskDescription: 'Payment overdue by 30 days. High churn risk.', suggestedAction: 'Initiate collection protocol. Consider offering payment plan.' },
    { id: 'risk_2', clientId: 'client_alpha_ventures', clientName: 'Alpha Ventures', riskDescription: 'Declining payment frequency over last 3 months.', suggestedAction: 'Schedule courtesy call to understand client status.' },
  ],
  collectionTargets: [
    { month: new Date(new Date().setMonth(new Date().getMonth() -1)).toLocaleString('default', { month: 'long', year: 'numeric'}), targetAmount: 50000, collectedAmount: 35000 },
    { month: new Date().toLocaleString('default', { month: 'long', year: 'numeric'}), targetAmount: 55000, collectedAmount: 12000 },
  ],
});

const initialIntegrationSettings: IntegrationSettings = {
  quickbooksStatus: 'disconnected',
  stripeStatus: 'disconnected',
  zapierStatus: 'disconnected',
  hubspotStatus: 'coming_soon',
  xeroStatus: 'coming_soon',
  gmailStatus: 'coming_soon',
  whatsappStatus: 'coming_soon',
};

const initialAISettings: AISettings = {
  enableNarrativeGeneration: true,
  enableSmartChase: true,
  enableTimeEstimation: false,
  enablePredictiveChurn: true, 
  enableAIInsightsDashboard: true, 
};

// Helper function to robustly parse arrays from localStorage
const parseLocalStorageArray = <T,>(key: string, itemReviver?: (item: any) => T): T[] => {
  const storedValue = localStorage.getItem(key);
  if (!storedValue) return [];
  try {
    const parsed = JSON.parse(storedValue);
    if (Array.isArray(parsed)) {
      return itemReviver ? parsed.map(itemReviver) : parsed as T[];
    }
    console.warn(`LocalStorage item for key "${key}" was not an array. Found:`, parsed, ". Defaulting to empty array.");
    return [];
  } catch (e) {
    console.error(`Error parsing localStorage for key "${key}":`, e, ". Defaulting to empty array.");
    return []; 
  }
};

// Helper function to robustly parse objects from localStorage
const parseLocalStorageObject = <T extends object>(key: string, defaultValue: T): T => {
  const storedValue = localStorage.getItem(key);
  if (!storedValue) return defaultValue;
  try {
    const parsed = JSON.parse(storedValue);
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return { ...defaultValue, ...(parsed as Partial<T>) }; 
    }
    console.warn(`LocalStorage item for key "${key}" was not a valid object. Found:`, parsed, ". Defaulting to initial value.");
    return defaultValue;
  } catch (e) {
    console.error(`Error parsing localStorage for key "${key}":`, e, ". Defaulting to initial value.");
    return defaultValue; 
  }
};


const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('loading');
  
  const [clients, setClients] = useState<Client[]>([]);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const [showNarrativePreview, setShowNarrativePreview] = useState<boolean>(false);
  const [currentNarrativeData, setCurrentNarrativeData] = useState<NarrativePreviewData | null>(null);
  const [showReportPreview, setShowReportPreview] = useState<boolean>(false);
  const [reportPreviewData, setReportPreviewData] = useState<{ entries: TimeEntry[]; matterName: string } | null>(null);

  const [dashboardSnapshot, setDashboardSnapshot] = useState<DashboardSnapshotData>(getMockDashboardSnapshot());
  const [importedCsvRecords, setImportedCsvRecords] = useState<CSVBillingRecord[]>([]);
  const [pdfIntakeFiles, setPdfIntakeFiles] = useState<PDFIntakeFile[]>([]);
  const [aiConsoleMessages, setAiConsoleMessages] = useState<AIConsoleMessage[]>([]);
  
  const [showSmartChaseModal, setShowSmartChaseModal] = useState<boolean>(false);
  const [smartChaseTarget, setSmartChaseTarget] = useState<OverdueInvoiceForChase | null>(null);
  const [showOAuthModal, setShowOAuthModal] = useState<false | OAuthServiceType>(false);
  const [showZapierModal, setShowZapierModal] = useState<boolean>(false);
  const [mockZapierApiKey] = useState<string>(`lexibill_mock_api_key_${generateLocalId().substring(0,12)}`);

  const [toastNotification, setToastNotification] = useState<ToastNotificationType | null>(null);
  
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>(initialIntegrationSettings);
  const [aiSettings, setAISettings] = useState<AISettings>(initialAISettings);


  const getErrorMessage = useCallback((error: unknown, context?: string): string => {
    let messageTextValue = 'An unknown error occurred';
    if (error instanceof Error) {
      messageTextValue = error.message;
    } else if (typeof error === 'string' && error.trim() !== '') {
      messageTextValue = error.trim();
    } else {
      try {
        const stringifiedErrorValue = JSON.stringify(error);
        if (stringifiedErrorValue !== '{}' && stringifiedErrorValue !== 'null' && stringifiedErrorValue !== '""') {
          messageTextValue = `An unexpected error occurred. Raw data: ${stringifiedErrorValue}`;
        }
      } catch (serializationError) { /* Ignore serialization error */ }
    }
    const prefixTextValue = context ? `${context}: ` : '';
    return `${prefixTextValue}${messageTextValue.replace(/\.$/, '')}. Check console for details.`;
  }, []);

  const showToast = useCallback((messageText: string, typeOption: ToastNotificationType['type'] = 'success', duration: number = 3000) => {
    const toastIdValue = generateLocalId();
    setToastNotification({ id: toastIdValue, message: messageText, type: typeOption });
    setTimeout(() => {
      setToastNotification(current => (current?.id === toastIdValue ? null : current));
    }, duration);
  }, []);


  useEffect(() => {
    setCurrentView('loading');
    try {
      const storedUser = localStorage.getItem(LOCAL_STORAGE_KEYS.LOGGED_IN_USER);
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUserName(userData.email); 
        setIsLoggedIn(true);

        setClients(parseLocalStorageArray<Client>(LOCAL_STORAGE_KEYS.CLIENTS));
        setMatters(parseLocalStorageArray<Matter>(LOCAL_STORAGE_KEYS.MATTERS));
        setTimeEntries(
          parseLocalStorageArray<TimeEntry>(LOCAL_STORAGE_KEYS.TIME_ENTRIES, (te: any) => ({ ...te, date: new Date(te.date) }))
            .sort((a,b) => b.date.getTime() - new Date(a.date).getTime())
        );
        setPdfIntakeFiles(
          parseLocalStorageArray<PDFIntakeFile>(LOCAL_STORAGE_KEYS.PDF_FILES, (f: any) => ({...f, uploadDate: new Date(f.uploadDate)}))
        );
        setAiConsoleMessages(
          parseLocalStorageArray<AIConsoleMessage>(LOCAL_STORAGE_KEYS.AI_CONSOLE_MESSAGES, (m: any) => ({...m, timestamp: new Date(m.timestamp)}))
        );

        setIntegrationSettings(parseLocalStorageObject<IntegrationSettings>(LOCAL_STORAGE_KEYS.INTEGRATION_SETTINGS, initialIntegrationSettings));
        setAISettings(parseLocalStorageObject<AISettings>(LOCAL_STORAGE_KEYS.AI_SETTINGS, initialAISettings));

        setDashboardSnapshot(getMockDashboardSnapshot()); 
        setCurrentView('app');
      } else {
        setCurrentView('landing');
      }
    } catch (error) { 
      console.error("Error loading initial app state:", getErrorMessage(error, "App initialization failed"));
      localStorage.clear(); 
      setCurrentView('landing');
    }
  }, [getErrorMessage]); 

  useEffect(() => { if (currentView !== 'loading' && isLoggedIn) localStorage.setItem(LOCAL_STORAGE_KEYS.CLIENTS, JSON.stringify(clients)); }, [clients, currentView, isLoggedIn]);
  useEffect(() => { if (currentView !== 'loading' && isLoggedIn) localStorage.setItem(LOCAL_STORAGE_KEYS.MATTERS, JSON.stringify(matters)); }, [matters, currentView, isLoggedIn]);
  useEffect(() => { if (currentView !== 'loading' && isLoggedIn) localStorage.setItem(LOCAL_STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(timeEntries)); }, [timeEntries, currentView, isLoggedIn]);
  useEffect(() => { if (currentView !== 'loading' && isLoggedIn) localStorage.setItem(LOCAL_STORAGE_KEYS.PDF_FILES, JSON.stringify(pdfIntakeFiles)); }, [pdfIntakeFiles, currentView, isLoggedIn]);
  useEffect(() => { if (currentView !== 'loading' && isLoggedIn) localStorage.setItem(LOCAL_STORAGE_KEYS.AI_CONSOLE_MESSAGES, JSON.stringify(aiConsoleMessages)); }, [aiConsoleMessages, currentView, isLoggedIn]);
  useEffect(() => { if (currentView !== 'loading' && isLoggedIn) localStorage.setItem(LOCAL_STORAGE_KEYS.INTEGRATION_SETTINGS, JSON.stringify(integrationSettings)); }, [integrationSettings, currentView, isLoggedIn]);
  useEffect(() => { if (currentView !== 'loading' && isLoggedIn) localStorage.setItem(LOCAL_STORAGE_KEYS.AI_SETTINGS, JSON.stringify(aiSettings)); }, [aiSettings, currentView, isLoggedIn]);


  const handleNavigateToAuth = () => {
    setCurrentView('auth');
    return; 
  };

  const handleLogin = (emailAddressValue: string) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.LOGGED_IN_USER, JSON.stringify({ email: emailAddressValue }));
      setUserName(emailAddressValue);
      setIsLoggedIn(true);
      
      setClients(parseLocalStorageArray<Client>(LOCAL_STORAGE_KEYS.CLIENTS));
      setMatters(parseLocalStorageArray<Matter>(LOCAL_STORAGE_KEYS.MATTERS));
      setTimeEntries(
        parseLocalStorageArray<TimeEntry>(LOCAL_STORAGE_KEYS.TIME_ENTRIES, (te: any) => ({ ...te, date: new Date(te.date) }))
          .sort((a,b) => b.date.getTime() - new Date(a.date).getTime())
      );
      setPdfIntakeFiles(
        parseLocalStorageArray<PDFIntakeFile>(LOCAL_STORAGE_KEYS.PDF_FILES, (f: any) => ({...f, uploadDate: new Date(f.uploadDate)}))
      );
      setAiConsoleMessages(
        parseLocalStorageArray<AIConsoleMessage>(LOCAL_STORAGE_KEYS.AI_CONSOLE_MESSAGES, (m: any) => ({...m, timestamp: new Date(m.timestamp)}))
      );
      
      setIntegrationSettings(parseLocalStorageObject<IntegrationSettings>(LOCAL_STORAGE_KEYS.INTEGRATION_SETTINGS, initialIntegrationSettings));
      setAISettings(parseLocalStorageObject<AISettings>(LOCAL_STORAGE_KEYS.AI_SETTINGS, initialAISettings));
      
      setDashboardSnapshot(getMockDashboardSnapshot()); 
      setCurrentView('app');
    } catch (error) { alert(getErrorMessage(error, "Failed to log in locally")); }
  };

  const handleLogout = (): Promise<void> => {
    setIsLoading(true);
    return new Promise((resolve, reject) => {
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.LOGGED_IN_USER);
        setIsLoggedIn(false); setUserName(null);
        setClients([]); setMatters([]); setTimeEntries([]);
        setPdfIntakeFiles([]); setAiConsoleMessages([]); setImportedCsvRecords([]);
        setIntegrationSettings(initialIntegrationSettings);
        setAISettings(initialAISettings);
        setCurrentView('landing');
        setIsLoading(false); resolve();
      } catch (error) { alert(getErrorMessage(error, "Error logging out")); setIsLoading(false); reject(error); }
    });
  };
  
  const handleAddClientLocal = async (newClientData: { name: string; defaultRate?: number }) => {
    const newClient: Client = { id: generateLocalId(), ...newClientData };
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  const handleAddMatterLocal = async (newMatterData: { clientID: string; name: string; specificRate?: number }) => {
    if (!clients.find(c => c.id === newMatterData.clientID)) throw new Error(`Client with ID ${newMatterData.clientID} not found.`);
    const newMatter: Matter = { id: generateLocalId(), ...newMatterData };
    setMatters(prev => [...prev, newMatter]);
    return newMatter;
  };
  
  const handleTimeEntrySubmit = async (formDataValue: TimeEntryFormSubmitData) => {
    setIsLoading(true);
    let currentClient: Client | undefined;
    let isNewClient = false;
    let newClientNameToSave: string | undefined = undefined;

    if (formDataValue.newClientName) {
      try { currentClient = await handleAddClientLocal({ name: formDataValue.newClientName, defaultRate: formDataValue.rate }); isNewClient = true; newClientNameToSave = currentClient.name; } 
      catch (error: unknown) { alert(getErrorMessage(error, "Failed to create new client")); setIsLoading(false); return; }
    } else if (formDataValue.clientID) {
      currentClient = clients.find(c => c.id === formDataValue.clientID);
      if (!currentClient) { alert("Selected client not found."); setIsLoading(false); return; }
    } else { alert("Client information is missing."); setIsLoading(false); return; }

    let finalMatterID: string;
    let matterNameForNarrative: string;
    let isNewMatter = false;
    let newMatterNameToSave: string | undefined = undefined;

    if (formDataValue.newMatterName) {
      try { const createdMatter = await handleAddMatterLocal({ clientID: currentClient.id, name: formDataValue.newMatterName }); finalMatterID = createdMatter.id; matterNameForNarrative = createdMatter.name; newMatterNameToSave = createdMatter.name; isNewMatter = true; } 
      catch (error: unknown) { alert(getErrorMessage(error, "Failed to create new matter")); setIsLoading(false); return; }
    } else if (formDataValue.matterID) {
      const existingMatter = matters.find(m => m.id === formDataValue.matterID && m.clientID === currentClient.id);
      if (!existingMatter) { alert("Selected matter not found."); setIsLoading(false); return; }
      finalMatterID = existingMatter.id; matterNameForNarrative = existingMatter.name;
    } else { alert("Matter information is missing."); setIsLoading(false); return; }

    try {
      const narrative = aiSettings.enableNarrativeGeneration 
        ? await generateBillingNarrative(formDataValue.taskSummary, currentClient.name, matterNameForNarrative, formDataValue.date, formDataValue.duration, formDataValue.rate)
        : `Narrative (AI Generation Disabled): ${formDataValue.taskSummary}`;
      setCurrentNarrativeData({ clientID: currentClient.id, matterID: finalMatterID, date: formDataValue.date, taskSummary: formDataValue.taskSummary, duration: formDataValue.duration, rate: formDataValue.rate, notes: formDataValue.notes, clientName: currentClient.name, matterName: matterNameForNarrative, generatedNarrative: narrative, isNewClientPending: isNewClient, newClientNameIfPending: newClientNameToSave, isNewMatterPending: isNewMatter, newMatterNameIfPending: newMatterNameToSave });
      setShowNarrativePreview(true);
    } catch (error: unknown) { alert(getErrorMessage(error, "Error generating narrative")); } 
    finally { setIsLoading(false); }
  };

  const handleNarrativeApprove = async (finalNarrative: string, approvedData: NarrativePreviewData) => {
    setIsLoading(true);
    try {
      const newTimeEntry: TimeEntry = { id: generateLocalId(), clientID: approvedData.clientID, matterID: approvedData.matterID, date: approvedData.date, taskSummary: approvedData.taskSummary, billingNarrative: finalNarrative, duration: approvedData.duration, rate: approvedData.rate, notes: approvedData.notes, isBilled: false };
      setTimeEntries(prev => [...prev, newTimeEntry].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setShowNarrativePreview(false); setCurrentNarrativeData(null);
    } catch (error: unknown) { alert(getErrorMessage(error, "Error saving time entry")); } 
    finally { setIsLoading(false); }
  };
  
  const handleNarrativeCancel = () => { setShowNarrativePreview(false); setCurrentNarrativeData(null); };
  const handleShowReportForMatter = (matterId: string) => {
    const matter = matters.find(m => m.id === matterId);
    if (!matter) return;
    const entriesForMatterValue = timeEntries.filter(entry => entry.matterID === matterId);
    if (entriesForMatterValue.length > 0) { setReportPreviewData({ entries: entriesForMatterValue, matterName: matter.name }); setShowReportPreview(true); } 
    else { alert(`No time entries for matter "${matter.name}".`); }
  };
  const handleCloseReport = () => { setShowReportPreview(false); setReportPreviewData(null); };

  const escapeCsvField = (fieldData: any): string => {
    if (fieldData === null || fieldData === undefined) return '';
    let fieldStrValue = String(fieldData); 
    fieldStrValue = fieldStrValue.replace(/\r\n|\r|\n/g, ' '); 
    if (fieldStrValue.includes(',') || fieldStrValue.includes('"') || fieldStrValue.includes("'")) {
       fieldStrValue = `"${fieldStrValue.replace(/"/g, '""')}"`;
    }
    return fieldStrValue;
  };

  const downloadCsv = (csvContent: string, filename: string) => {
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
      alert("CSV download not supported in your browser.");
    }
  };

  const handleConfirmReport = () => {
    if (!reportPreviewData) { alert("Error: Report data is missing."); return; }
    try {
      const { entries: reportEntries, matterName: reportMatterNameValue } = reportPreviewData;
      if (!Array.isArray(reportEntries)) throw new Error("Time entries data is not in expected format.");
      const sortedEntries = [...reportEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const headers = ["Date", "Billing Narrative", "Duration (Hours)", "Rate (ZAR/hour)", "Amount (ZAR)"];
      const csvRows = sortedEntries.map(entry => {
        if (!entry || typeof entry.duration !== 'number' || typeof entry.rate !== 'number' || !(entry.date instanceof Date) || typeof entry.billingNarrative !== 'string') return "INVALID_ENTRY_DATA,,,,";
        return [ escapeCsvField(new Date(entry.date).toLocaleDateString('en-CA')), escapeCsvField(entry.billingNarrative), escapeCsvField(entry.duration.toFixed(1)), escapeCsvField(entry.rate.toFixed(2)), escapeCsvField((entry.duration * entry.rate).toFixed(2)) ].join(',');
      });
      const totalHoursValue = sortedEntries.reduce((s, e) => s + (e && typeof e.duration === 'number' ? e.duration : 0), 0);
      const totalBilledValue = sortedEntries.reduce((s, e) => s + (e && typeof e.duration === 'number' && typeof e.rate === 'number' ? (e.duration * e.rate) : 0), 0);
      const summaryRows = ["", `Total Hours:,${escapeCsvField(totalHoursValue.toFixed(1))},,,`, `Total Amount Billed (ZAR):,${escapeCsvField(totalBilledValue.toFixed(2))},,,`];
      const csvContent = [headers.join(','), ...csvRows, ...summaryRows].join('\n');
      const filename = `Billing_Report_${reportMatterNameValue.replace(/[^a-zA-Z0-9_.-]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCsv(csvContent, filename);
      setShowReportPreview(false); setReportPreviewData(null);
    } catch (error: unknown) { alert(getErrorMessage(error, "Error generating report")); }
  };
  
  const handleEditReport = () => { setShowReportPreview(false); setReportPreviewData(null); alert("Edit entries from report preview not yet implemented."); };

  const handleCsvFileImport = async (fileValue: File) => {
    setIsLoading(true);
    try {
      const csvRecordsValue = await processCsvData(fileValue); 
      setImportedCsvRecords(csvRecordsValue);
      showToast(`${csvRecordsValue.length} records imported from ${fileValue.name}. AI processing stubbed.`, 'success');
    } catch (error) {
      showToast(getErrorMessage(error, "Error importing CSV"), 'error');
      setImportedCsvRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdfFileImport = async (filesValue: FileList) => {
    setIsLoading(true);
    const newPdfFiles: PDFIntakeFile[] = [];
    let successCountValue = 0;
    for (const fileItem of Array.from(filesValue)) {
        try {
            const processedFile = await processPdfFile(fileItem); 
            newPdfFiles.push(processedFile);
            if(processedFile.status === 'ocr_complete') successCountValue++;
        } catch (error) {
            showToast(getErrorMessage(error, `Error processing PDF ${fileItem.name}`), 'error');
             newPdfFiles.push({ id: generateLocalId(), fileName: fileItem.name, fileSize: fileItem.size, status: 'ocr_error', uploadDate: new Date() });
        }
    }
    setPdfIntakeFiles(prev => [...prev, ...newPdfFiles].sort((a,b) => b.uploadDate.getTime() - a.uploadDate.getTime()));
    setIsLoading(false);
    if(newPdfFiles.length > 0) showToast(`${successCountValue}/${newPdfFiles.length} PDF(s) processed (OCR stubbed).`, 'info');
  };
  
  const submitAIConsoleQuery = async (query: string) => {
    setIsLoading(true);
    const userMessage: AIConsoleMessage = { id: generateLocalId(), type: 'user', text: query, timestamp: new Date() };
    setAiConsoleMessages(prev => [...prev, userMessage]);

    try {
      const responseText = await processAIConsoleQuery(query, { clients, matters, timeEntries, dashboardSnapshot }); 
      const botMessage: AIConsoleMessage = { id: generateLocalId(), type: 'bot', text: responseText, timestamp: new Date() };
      setAiConsoleMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessageText = getErrorMessage(error, "AI Console query failed");
      const errorMessage: AIConsoleMessage = { id: generateLocalId(), type: 'error', text: errorMessageText, timestamp: new Date() };
      setAiConsoleMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSmartChaseModal = (invoiceDataValue: OverdueInvoiceForChase) => {
    setSmartChaseTarget(invoiceDataValue);
    setShowSmartChaseModal(true);
  };

  const handleCloseSmartChaseModal = () => {
    setShowSmartChaseModal(false);
    setSmartChaseTarget(null);
  };

  const handleGenerateSmartChaseEmail = async (invoiceDataValue: OverdueInvoiceForChase): Promise<string> => {
    setIsLoading(true);
    try {
       const emailText = aiSettings.enableSmartChase
        ? await generateSmartChaseEmail(invoiceDataValue, userName || "Craig Miller")
        : `Smart Chase Email (AI Disabled): Please follow up with ${invoiceDataValue.clientName} regarding invoice #${invoiceDataValue.invoiceNumber}.`;
      return emailText;
    } catch (error) {
      showToast(getErrorMessage(error, "Failed to generate Smart Chase email"), 'error');
      return `Failed to generate email content. Error: ${getErrorMessage(error)}`;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInitiateSmartChaseOutreach = (invoiceDataValue: OverdueInvoiceForChase, emailDraft: string) => {
    showToast(`Smart Chase initiated for ${invoiceDataValue.clientName} (Invoice ${invoiceDataValue.invoiceNumber})`, 'success');
    handleCloseSmartChaseModal();
  };

  const handleGenerateDailyPdfReport = () => {
    const today = new Date();
    const todaysEntries = timeEntries.filter(entry => 
        new Date(entry.date).toDateString() === today.toDateString()
    );
    const reportDataValue: DailyReportData = {
        dateGenerated: today,
        newEntriesCount: todaysEntries.length,
        totalBilledToday: Math.random() * 5000, 
        activeRiskAlerts: dashboardSnapshot.riskAlerts.slice(0, 2), 
        newOutstandingInvoices: dashboardSnapshot.outstandingInvoices.filter(inv => inv.daysOverdue > 0 && inv.daysOverdue < 5) 
    };
    showToast(`Daily PDF Summary (Stubbed): ${reportDataValue.newEntriesCount} new entries.`, 'info');
  };

  const handleExportFlaggedIssuesCsv = () => {
    const flaggedIssues: { type: string; client: string; details: string; priorityOrAction: string }[] = [];
  
    dashboardSnapshot.outstandingInvoices.forEach(inv => {
      if (inv.daysOverdue > 0) {
        const issue = {
          type: 'Overdue Invoice',
          client: inv.clientName,
          details: `Invoice ${inv.invoiceNumber} for ZAR ${inv.amountDue.toFixed(2)} is ${inv.daysOverdue} days overdue. Due: ${new Date(inv.dueDate).toLocaleDateString()}`,
          priorityOrAction: 'High Priority'
        };
        flaggedIssues.push(issue);
      }
    });
  
    dashboardSnapshot.riskAlerts.forEach(alertItem => {
      const issue = {
        type: 'Client Risk Alert',
        client: alertItem.clientName,
        details: alertItem.riskDescription,
        priorityOrAction: alertItem.suggestedAction || 'N/A'
      };
      flaggedIssues.push(issue);
    });
  
    if (flaggedIssues.length === 0) {
      showToast("No flagged issues to export.", 'info');
      return;
    }
  
    try {
      const headers = ["Type", "Client", "Details", "Suggested Action/Priority"];
      const csvRows = flaggedIssues.map(issue =>
        [
          escapeCsvField(issue.type),
          escapeCsvField(issue.client),
          escapeCsvField(issue.details),
          escapeCsvField(issue.priorityOrAction)
        ].join(',')
      );
      const csvContent = [headers.join(','), ...csvRows].join('\n');
      const filename = `Flagged_Issues_Report_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCsv(csvContent, filename);
      showToast("Flagged issues CSV exported successfully.", 'success');
    } catch (error) {
      showToast(getErrorMessage(error, "Error exporting flagged issues CSV"), 'error');
    }
  };

  const handleIntegrationAction = (serviceNameValue: IntegrationService, action: 'connect' | 'disconnect') => {
    const serviceKeyValue = `${serviceNameValue}Status` as keyof IntegrationSettings;

    if (action === 'disconnect') {
      setIsLoading(true);
      setTimeout(() => { 
        setIntegrationSettings(prev => ({ ...prev, [serviceKeyValue]: 'disconnected' }));
        showToast(`${serviceNameValue.charAt(0).toUpperCase() + serviceNameValue.slice(1)} disconnected. (Simulated)`, 'info');
        setIsLoading(false);
      }, 700);
    } else { 
      if (serviceNameValue === 'quickbooks' || serviceNameValue === 'stripe' || serviceNameValue === 'hubspot' || serviceNameValue === 'xero' || serviceNameValue === 'gmail') {
        setShowOAuthModal(serviceNameValue as OAuthServiceType);
      } else if (serviceNameValue === 'zapier') {
        setShowZapierModal(true);
      } else if (serviceNameValue === 'whatsapp') {
         showToast("WhatsApp API integration setup is complex. (Stubbed)", 'info');
      }
    }
  };
  
  const handleOAuthAuthorize = (serviceNameValue: OAuthServiceType) => {
    const serviceKeyValue = `${serviceNameValue.toLowerCase()}Status` as keyof IntegrationSettings;
    setIsLoading(true);
    setShowOAuthModal(false);
    setTimeout(() => { 
      setIntegrationSettings(prev => ({ ...prev, [serviceKeyValue]: 'connected' }));
      showToast(`${serviceNameValue} connected successfully. Syncing data… (Simulated)`, 'success');
      setIsLoading(false);
    }, 1500);
  };

  const handleZapierSetupComplete = () => {
    setIsLoading(true);
    setShowZapierModal(false);
    setTimeout(() => { 
      setIntegrationSettings(prev => ({ ...prev, zapierStatus: 'connected' }));
      showToast(`Zapier connection marked as complete. (Simulated)`, 'success');
      setIsLoading(false);
    }, 700);
  };
  
  const handleToggleAISetting = (settingKeyValue: keyof AISettings) => {
    setAISettings(prev => {
      const newValue = !prev[settingKeyValue];
      showToast(`${settingKeyValue.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ${newValue ? 'enabled' : 'disabled'}.`, 'info');
      return { ...prev, [settingKeyValue]: newValue };
    });
  };

  const handleSyncNow = () => {
    setIsLoading(true);
    showToast("Manual data sync initiated... (Simulated)", 'info');
    setTimeout(() => {
        setDashboardSnapshot(getMockDashboardSnapshot()); 
        showToast("Data sync complete. (Simulated)", 'success');
        setIsLoading(false);
    }, 2000);
  };


  if (currentView === 'loading') return <div className="flex flex-col items-center justify-center min-h-screen bg-[#10231c] text-white"><SpinnerIcon className="w-12 h-12 mb-4" /><p className="mt-2 text-lg">Initializing LexiBill AI...</p></div>;
  if (currentView === 'landing') return <LandingPage onNavigateToAuth={handleNavigateToAuth} />;
  if (currentView === 'auth') return <AuthPage onLogin={handleLogin} />;
  
  if (currentView === 'app') {
    return (
      <>
        {toastNotification && (
          <ToastNotification
            message={toastNotification.message}
            type={toastNotification.type}
            onDismiss={() => setToastNotification(null)}
          />
        )}
        {showNarrativePreview && currentNarrativeData && <BillingNarrativePreview narrativeData={currentNarrativeData} onApprove={handleNarrativeApprove} onCancel={handleNarrativeCancel} isLoading={isLoading} />}
        {showReportPreview && reportPreviewData && <ReportView entries={reportPreviewData.entries} matterName={reportPreviewData.matterName} onClose={handleCloseReport} onConfirm={handleConfirmReport} onEdit={handleEditReport} />}
        {showSmartChaseModal && smartChaseTarget && (
          <SmartChaseModal
            invoice={smartChaseTarget}
            onClose={handleCloseSmartChaseModal}
            onGenerateEmail={handleGenerateSmartChaseEmail}
            onSendOutreach={handleInitiateSmartChaseOutreach}
            isLoading={isLoading}
          />
        )}
        {showOAuthModal && (
          <OAuthConnectionModal
            serviceName={showOAuthModal as OAuthServiceType} // Type assertion
            onClose={() => setShowOAuthModal(false)}
            onAuthorize={handleOAuthAuthorize}
            isLoading={isLoading}
          />
        )}
        {showZapierModal && (
          <ZapierSetupModal
            apiKey={mockZapierApiKey}
            onClose={() => setShowZapierModal(false)}
            onSetupComplete={handleZapierSetupComplete}
            isLoading={isLoading}
          />
        )}
        
        <MainAppView
          userName={userName} 
          clients={clients} matters={matters} timeEntries={timeEntries}
          onTimeEntrySubmit={handleTimeEntrySubmit}
          onLogout={handleLogout} 
          isLoadingGlobal={isLoading} 
          onShowReportForMatter={handleShowReportForMatter}
          
          dashboardSnapshot={dashboardSnapshot}
          importedCsvRecords={importedCsvRecords}
          onCsvFileImport={handleCsvFileImport}
          pdfIntakeFiles={pdfIntakeFiles}
          onPdfFileImport={handlePdfFileImport}
          aiConsoleMessages={aiConsoleMessages}
          onAIConsoleQuery={submitAIConsoleQuery}
          
          onOpenSmartChaseModal={handleOpenSmartChaseModal}
          onGenerateDailyPdfReport={handleGenerateDailyPdfReport}
          onExportFlaggedIssuesCsv={handleExportFlaggedIssuesCsv}

          integrationSettings={integrationSettings}
          aiSettings={aiSettings}
          onIntegrationAction={handleIntegrationAction} 
          onToggleAISetting={handleToggleAISetting}
          onSyncNow={handleSyncNow} 
        />
      </>
    );
  }

  return <div className="flex flex-col items-center justify-center min-h-screen bg-[#10231c] text-white"><p>An unexpected state was reached. Please refresh.</p></div>;
};

export default App;
