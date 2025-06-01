
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
  clientID: string;
  matterID?: string;       // ID if an existing matter is chosen/matched from datalist
  newMatterName?: string;  // Name if a new matter is being created (typed directly)
  date: Date;
  taskSummary: string;
  duration: number;
  rate: number;
  notes?: string;
}

// --- DASHBOARD SPECIFIC TYPES ---

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
