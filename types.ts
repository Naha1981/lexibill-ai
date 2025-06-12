

export interface Client {
  id: string;
  name: string;
  defaultRate?: number; // Hourly rate in ZAR
  // Add other client-specific details here if needed: email, phone, address etc.
}

export interface Matter {
  id:string;
  clientID: string; // Foreign key to Client
  name: string;
  specificRate?: number; // Hourly rate in ZAR, overrides client defaultRate if set
  // Add other matter-specific details: description, status, etc.
}

export interface TimeEntry {
  id: string;
  clientID: string;
  matterID: string;
  date: Date;
  taskSummary: string; // Raw user input about what was done
  billingNarrative: string; // AI-generated (and potentially user-edited) narrative for invoice
  duration: number; // in hours
  rate: number; // Actual rate applied for this entry (in ZAR per hour)
  notes?: string; // Optional internal notes
  isBilled?: boolean; // Has this entry been included in an invoice?
}

// Data structure for submitting the time entry form
export interface TimeEntryFormSubmitData {
  clientID?: string;       // ID if an existing client is chosen/matched
  newClientName?: string;  // Name if a new client is being created
  matterID?: string;       // ID if an existing matter is chosen/matched from datalist
  newMatterName?: string;  // Name if a new matter is being created (typed directly)
  date: Date;
  taskSummary: string;
  duration: number;
  rate: number;
  notes?: string;
}

// --- DASHBOARD SPECIFIC TYPES (v1) ---

export interface BillingSummary {
  weeklyTotalAmount: number;
  monthlyTotalAmount: number;
  weeklyTotalHours: number;
  monthlyTotalHours: number;
}

export interface BilledUnbilledDataPoint {
  name: 'Billed' | 'Unbilled';
  value: number; // Typically hours
  fill: string; // Color for the chart segment
}

export interface TopMatterData {
  id: string;
  name: string;
  clientName: string;
  totalHours: number;
  totalAmount: number;
}

export interface RevenueDataPoint {
  month: string; // e.g., "Jan '23"
  revenue: number;
}

export interface RecentEntryDisplayData {
  id: string;
  date: string; // Formatted date
  summary: string;
  duration: number;
  matterName: string;
  clientName: string;
  amount: number;
}

export type ReminderType = 'unbilled_entry_old' | 'matter_stale_unbilled';

export interface BillingReminder {
  id: string; // Unique ID for the reminder (e.g., entry.id or matter.id + type)
  type: ReminderType;
  message: string;
  relatedId: string; // ID of the TimeEntry or Matter
  date?: Date; // Relevant date for sorting or display
}

// --- LEXIBILL AI PRO EDITION TYPES (v2) ---

export interface OutstandingInvoice {
  id: string;
  clientName: string;
  invoiceNumber: string;
  amountDue: number;
  dueDate: Date;
  daysOverdue: number;
}

export interface RiskAlert {
  id: string;
  clientId: string; // Corrected: Assuming this should be clientId not clientName for ID purposes
  clientName: string;
  riskDescription: string;
  suggestedAction?: string;
}

export interface CollectionTarget {
  month: string;
  targetAmount: number;
  collectedAmount: number;
}

export interface DashboardSnapshotData {
  outstandingInvoices: OutstandingInvoice[];
  riskAlerts: RiskAlert[];
  collectionTargets: CollectionTarget[];
}

export type CSVBillingRecord = Record<string, string | number>; // Flexible for various CSV structures

export interface PDFIntakeFile {
  id: string;
  fileName: string;
  fileSize: number;
  status: 'pending_ocr' | 'ocr_complete' | 'ocr_error';
  extractedData?: Record<string, any>; // Placeholder for OCR results
  uploadDate: Date;
}

export interface AIConsoleMessage {
  id: string;
  type: 'user' | 'bot' | 'error';
  text: string;
  timestamp: Date;
  data?: any; // For displaying structured data like tables
}

// --- CRAIG'S DAILY ROUTINE ENHANCEMENT TYPES ---
export interface OverdueInvoiceForChase extends OutstandingInvoice {
  // Can add specific fields needed for chase if different from OutstandingInvoice
}

export interface DailyReportData {
  dateGenerated: Date;
  newEntriesCount: number;
  totalBilledToday: number; // Mocked for now
  activeRiskAlerts: RiskAlert[];
  newOutstandingInvoices: OutstandingInvoice[]; // Today's new overdue items
}

// --- INTEGRATIONS & AI SETTINGS TYPES ---
export type IntegrationService = 'quickbooks' | 'stripe' | 'zapier' | 'hubspot' | 'xero' | 'gmail' | 'whatsapp'; // Added more services
export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'coming_soon'; // Added coming_soon

export interface IntegrationSettings {
  quickbooksStatus: IntegrationStatus;
  stripeStatus: IntegrationStatus;
  zapierStatus: IntegrationStatus;
  hubspotStatus: IntegrationStatus; // Added
  xeroStatus: IntegrationStatus; // Added
  gmailStatus: IntegrationStatus; // Added
  whatsappStatus: IntegrationStatus; // Added
}

export interface AISettings {
  enableNarrativeGeneration: boolean; // Corresponds to existing core feature
  enableSmartChase: boolean;
  enableTimeEstimation: boolean; // Example from PRD
  enablePredictiveChurn: boolean; // Added from PRD (Step 6)
  enableAIInsightsDashboard: boolean; // Added from PRD (Step 6)
}

// --- MODAL & NOTIFICATION TYPES ---
export type OAuthServiceType = 'QuickBooks' | 'Stripe' | 'HubSpot' | 'Xero' | 'Gmail'; // Services using OAuth-like flow

export interface ToastNotificationType {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}