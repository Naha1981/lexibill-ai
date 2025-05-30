
export enum TaskType {
  CONSULTATION = "Consultation",
  DRAFTING = "Drafting",
  RESEARCH = "Research",
  MEETING = "Meeting",
  COMMUNICATION = "Communication",
  REVIEW_ANALYSIS = "Review & Analysis",
  COURT_APPEARANCE = "Court Appearance",
  ADMINISTRATIVE = "Administrative",
  OTHER = "Other", // This will be the default
}

export interface TimeEntry {
  id: string;
  matterID: string;
  date: Date;
  duration: number; // in hours
  description: string; // Raw user description
  taskType: TaskType; // Will default to OTHER
}

export interface Matter {
  matterID: string; // Name of the matter, serves as ID
  clientName: string; // For simplicity, same as matterID or derived
}

export interface ChatMessage {
  id:string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: Date;
  isHtml?: boolean;
}

export enum ChatFlowState {
  IDLE, // Technically, initial state before first message from bot
  AWAITING_MATTER_NAME,
  AWAITING_DURATION_DATE,
  AWAITING_DESCRIPTION,
  AWAITING_ENTRY_CONFIRMATION, // Confirms the single entry and asks "Log another, Edit, Done"
  AWAITING_INVOICE_DECISION_AFTER_DONE, // After "Done", asks "Generate invoice for [Matter]?"
  AWAITING_REPORT_MATTER_PROMPT, // If user says "generate invoice" without specifying matter
  AWAITING_EDIT_DESCRIPTION, // If user chooses to edit description during session
}

export interface CurrentEntryBuilder {
  matterID?: string;
  date?: Date;
  duration?: number;
  rawDescription?: string; // User's exact input
  // finalDescription is removed, rawDescription is used directly
  // taskType is removed, will default to OTHER when TimeEntry is created
}
