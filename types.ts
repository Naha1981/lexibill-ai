
export interface Client {
  id: string;
  name: string;
  defaultRate?: number; // Hourly rate in ZAR
  // Add other client-specific details here if needed: email, phone, address etc.
}

export interface Matter {
  id: string;
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

// TaskType enum is removed as AI generates free-form narrative.
// ChatMessage, ChatFlowState, CurrentEntryBuilder are removed.
