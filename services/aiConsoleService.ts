
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_TEXT_MODEL } from "../constants";
import { Client, Matter, TimeEntry, DashboardSnapshotData } from '../types';

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn(
    "API_KEY for Gemini not found. AI Console features will be limited or use fallbacks."
  );
}

interface LocalDataContext {
  clients: Client[];
  matters: Matter[];
  timeEntries: TimeEntry[];
  dashboardSnapshot: DashboardSnapshotData; // Added for more context
}

const SYSTEM_PROMPT_CONSOLE = `You are an AI assistant for LexiBill AI Pro. Your task is to understand user queries about their billing data and determine the intent.
Based on the intent, you will respond directly if it's a simple greeting or a query you can answer from general knowledge.

If the query requires specific data from the LexiBill system, try to identify the core entities, properties, and conditions.
For example:
- "list all clients" -> respond with a structured request for "clients_all"
- "show me matters for client [Client Name]" -> respond with structured request "matters_for_client" and the client name.
- "details for client [Client Name]" -> respond with structured request "client_details" and the client name.
- "how many time entries for matter [Matter Name]?" -> respond "time_entries_for_matter_count" and matter name.
- "list unbilled time entries" -> respond "time_entries_unbilled_all"
- "show overdue invoices" -> respond "invoices_overdue"
- "summarize unbilled time for client [Client Name]" -> respond "unbilled_summary_client" and client name.

If the query is too complex or requires data not available (e.g., "predict next month's revenue" or "integrate with QuickBooks"), state that the feature is under development or the query is too complex for the current capabilities.
Keep responses concise. If returning a structured request, use a simple keyword or phrase that the system can parse.
If you can directly answer from the provided context (like simple counts or listings), do so.
Always be helpful and professional.
`;

export const processAIConsoleQuery = async (
  query: string,
  localData: LocalDataContext
): Promise<string> => {
  const lowerQuery = query.toLowerCase().trim();

  // --- Start of Enhanced Local Command Parsing ---
  if (lowerQuery === "list all clients") {
    if (localData.clients.length === 0) return "No clients found.";
    return `Clients:\n${localData.clients.map(c => `- ${c.name} (ID: ${c.id}, Rate: R${c.defaultRate || 'N/A'})`).join('\n')}`;
  }
  if (lowerQuery === "list all matters") {
    if (localData.matters.length === 0) return "No matters found.";
    return `Matters:\n${localData.matters.map(m => {
      const client = localData.clients.find(c => c.id === m.clientID);
      return `- ${m.name} (Client: ${client?.name || 'Unknown'}, Rate: R${m.specificRate || (client?.defaultRate || 'N/A')})`;
    }).join('\n')}`;
  }
  if (lowerQuery.startsWith("details for client ")) {
    const clientName = query.substring("details for client ".length).trim();
    const client = localData.clients.find(c => c.name.toLowerCase() === clientName.toLowerCase());
    if (!client) return `Client "${clientName}" not found.`;
    const mattersForClient = localData.matters.filter(m => m.clientID === client.id);
    const timeEntriesForClient = localData.timeEntries.filter(te => te.clientID === client.id);
    return `Client: ${client.name}\nDefault Rate: R${client.defaultRate || 'N/A'}\nMatters: ${mattersForClient.length > 0 ? mattersForClient.map(m => m.name).join(', ') : 'None'}\nTotal Time Entries: ${timeEntriesForClient.length}`;
  }
  if (lowerQuery === "show overdue invoices") {
    const overdue = localData.dashboardSnapshot.outstandingInvoices.filter(inv => inv.daysOverdue > 0);
    if (overdue.length === 0) return "No overdue invoices found. Great job!";
    return `Overdue Invoices (${overdue.length}):\n${overdue.map(inv => `- ${inv.clientName}: #${inv.invoiceNumber}, Amount: R${inv.amountDue.toFixed(2)}, Overdue: ${inv.daysOverdue} days`).join('\n')}`;
  }
  if (lowerQuery === "list unbilled time entries") {
    const unbilledEntries = localData.timeEntries.filter(te => !te.isBilled);
    if (unbilledEntries.length === 0) return "No unbilled time entries found.";
    return `Unbilled Time Entries (${unbilledEntries.length}):\n${unbilledEntries.map(te => {
      const client = localData.clients.find(c => c.id === te.clientID)?.name || 'Unknown Client';
      const matter = localData.matters.find(m => m.id === te.matterID)?.name || 'Unknown Matter';
      return `- ${new Date(te.date).toLocaleDateString('en-CA')} for ${matter} (${client}): ${te.taskSummary.substring(0,30)}... (${te.duration}h @ R${te.rate})`
    }).slice(0,10).join('\n')}${unbilledEntries.length > 10 ? '\n...and more.' : ''}`;
  }
   if (lowerQuery.startsWith("unbilled time for client ")) {
    const clientName = query.substring("unbilled time for client ".length).trim();
    const client = localData.clients.find(c => c.name.toLowerCase() === clientName.toLowerCase());
    if (!client) return `Client "${clientName}" not found.`;
    const unbilledForClient = localData.timeEntries.filter(te => te.clientID === client.id && !te.isBilled);
    if (unbilledForClient.length === 0) return `No unbilled time entries found for ${client.name}.`;
    const totalUnbilledHours = unbilledForClient.reduce((sum, te) => sum + te.duration, 0);
    const totalUnbilledValue = unbilledForClient.reduce((sum, te) => sum + (te.duration * te.rate), 0);
    return `Unbilled time for ${client.name}: ${totalUnbilledHours.toFixed(1)} hours, valued at R${totalUnbilledValue.toFixed(2)} across ${unbilledForClient.length} entries.`;
  }
  // --- End of Enhanced Local Command Parsing ---


  if (!ai) {
    return Promise.resolve(
      "AI features are currently limited as the AI client is not initialized (API_KEY may be missing). Please try a very simple query about local data or check configuration."
    );
  }
  
  // For more complex queries, try Gemini
  try {
    const userPromptForAI = `User query: "${query}"

Context:
- Available Clients: ${localData.clients.map(c => c.name).join(', ') || 'None'}
- Available Matters: ${localData.matters.map(m => m.name).join(', ') || 'None'}
- Total Time Entries: ${localData.timeEntries.length}
- Overdue Invoices: ${localData.dashboardSnapshot.outstandingInvoices.filter(inv => inv.daysOverdue > 0).length}
- Risk Alerts: ${localData.dashboardSnapshot.riskAlerts.length}

Based on this query and your role, what is the user's intent or what information are they looking for?
If you can answer directly using the summarized context (e.g. counts), do so.
If it's a data request that requires filtering/listing beyond the simple commands I can handle locally (like "clients who paid late more than 3 times"), state that you are processing the request and will provide details. For now, you don't need to perform the actual complex filtering, just acknowledge the type of request.
If it's a command I can handle locally (like "list all clients"), you can just respond with "Understood, processing locally."
Otherwise, provide a helpful textual response or ask for clarification.
`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: userPromptForAI,
      config: {
        systemInstruction: SYSTEM_PROMPT_CONSOLE,
        temperature: 0.4, 
      }
    });
    
    let aiResponseText = response.text.trim();
    aiResponseText = aiResponseText.replace(/^```(json|text)?\s*\n?([\s\S]*?)\n?\s*```$/s, '$2').trim();
    
    return aiResponseText || "I received an empty response from the AI. Please try rephrasing your query.";

  } catch (error) {
    console.error("Error during AI Console query processing with Gemini:", error);
    let message = "Sorry, I encountered an error trying to understand that.";
    if (error instanceof Error) message += ` Details: ${error.message}`;
    return message;
  }
};
