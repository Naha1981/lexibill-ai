
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_TEXT_MODEL } from "../constants";
import { OverdueInvoiceForChase } from "../types"; // Added for Smart Chase

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn(
    "API_KEY for Gemini not found in environment variables. AI narrative generation will use a fallback. Ensure API_KEY is set in your execution environment for AI features."
  );
}

const SYSTEM_PROMPT_NARRATIVE = `You are LexiBill AI, an intelligent assistant built to generate clear, professional, and detailed legal billing narratives for lawyers based on structured form data for a single time entry.

Your task is to convert structured input for one time entry into a single, human-readable billing narrative paragraph that is clear, client-friendly, and professional — without repeating or rewording the original description unnecessarily.

❗IMPORTANT GUIDELINES:
*   Do NOT refine or rewrite the task description from the input.
*   Maintain a professional tone suitable for legal clients.
*   The narrative must clearly explain for the single entry:
    *   What was done (using the provided description)
    *   Why it was important (you may infer this based on common legal tasks, or focus on clearly stating the action if 'why' is not obvious from the input)
    *   The duration and implied cost (e.g., by mentioning the time spent and rate; explicit cost calculation is not required in the narrative itself, but the context of billing is key).
*   Format the output as a single, detailed paragraph for the entry. Do NOT use bullet points or lists.
*   Avoid jargon or vague language.
*   The narrative should start directly with the description of the work, for example: "Attended to..." or "Drafted..." or "Consulted on...".
*   Do not include headers like "Billing Report for..." or totals, as this is for a single entry's narrative.`;

/**
 * Generates a detailed, human-like billing narrative using Gemini AI.
 * @param taskSummary Brief description of the task performed.
 * @param clientName Name of the client.
 * @param matterName Name of the matter.
 * @param date Date the work was performed.
 * @param timeSpent Duration of the work in hours.
 * @param rate Hourly rate for the work.
 * @returns A promise that resolves to the AI-generated billing narrative string.
 */
export const generateBillingNarrative = async (
  taskSummary: string,
  clientName: string,
  matterName: string,
  date: Date,
  timeSpent: number,
  rate: number // Added rate parameter
): Promise<string> => {
  if (!ai) {
    console.error("Gemini AI client not initialized (API_KEY likely missing). Using fallback narrative.");
    // Fallback narrative remains simple and doesn't use the rate for now
    return Promise.resolve(
      `Work performed on ${date.toLocaleDateString('en-ZA')}: ${taskSummary} (${timeSpent}h for ${clientName} - ${matterName}). (AI Narrative Generation Unavailable)`
    );
  }

  const entryData = {
    client_name: clientName,
    matter_name: matterName,
    entry: {
      date: date.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }),
      description: taskSummary,
      hours: timeSpent,
      hourly_rate: rate, // Include rate in the data for AI
    }
  };

  const userPrompt = `Generate a billing narrative for the following single time entry. Ensure the narrative is a single, professional paragraph explaining what was done, its importance (if inferable), and reflecting the time spent and context of the hourly rate. Focus on the task itself. Do not add any headers or introductory/concluding remarks beyond the narrative for this specific entry. Here is the data:\n\n${JSON.stringify(entryData, null, 2)}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT_NARRATIVE,
      }
    });
    
    let narrative = response.text.trim();
    // Clean up any accidental markdown-like formatting from the model
    narrative = narrative.replace(/^```(json|text)?\s*\n?([\s\S]*?)\n?\s*```$/s, '$2').trim();

    if (!narrative) {
        console.error("Gemini API returned an empty narrative. Using fallback.");
        return `Billing narrative generation failed (empty response from AI). Task: ${taskSummary}.`;
    }
    return narrative;
  } catch (error) {
    console.error("Error during Gemini API call for billing narrative:", error);
    return `Error during AI narrative generation: API call failed. Task: ${taskSummary}. Please review and edit manually.`;
  }
};


const SYSTEM_PROMPT_SMART_CHASE = `You are LexiBill AI, an expert legal billing assistant. Your task is to generate a polite yet firm reminder email to a client regarding an overdue invoice.
The tone should be professional and encourage prompt payment. The email should include the invoice number, amount due, and client's name.
Do not invent any new information. Stick to the details provided.
The email should have a clear subject line and a professional closing.
Example Subject: Gentle Reminder: Overdue Invoice #[Invoice Number]
Example Closing:
Best regards,
Craig Miller
LexiBill AI Pro Services
(Note: Do not actually sign with 'LexiBill AI Pro Services', use 'Craig Miller' or a generic firm name if not provided)
`;

export const generateSmartChaseEmail = async (
  invoice: OverdueInvoiceForChase,
  senderName: string = "Craig Miller" // Default sender name
): Promise<string> => {
  if (!ai) {
    console.error("Gemini AI client not initialized (API_KEY likely missing). Using fallback email.");
    return Promise.resolve(
      `Subject: Reminder: Invoice ${invoice.invoiceNumber}

Dear ${invoice.clientName},

This is a friendly reminder that invoice #${invoice.invoiceNumber} for ZAR ${invoice.amountDue.toFixed(2)} is now past its due date of ${new Date(invoice.dueDate).toLocaleDateString('en-ZA')}.

Please let us know if payment has been made or if you require any assistance.

(AI Email Generation Unavailable)

Sincerely,
${senderName}`
    );
  }

  const emailDetails = {
    client_name: invoice.clientName,
    invoice_number: invoice.invoiceNumber,
    amount_due: invoice.amountDue.toFixed(2),
    due_date: new Date(invoice.dueDate).toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' }),
    days_overdue: invoice.daysOverdue,
    sender_name: senderName
  };

  const userPrompt = `Generate a reminder email for the following overdue invoice. Ensure the email is polite, professional, and firm.
Include all relevant details: client name, invoice number, amount due, and due date.
Data:
${JSON.stringify(emailDetails, null, 2)}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_PROMPT_SMART_CHASE,
        temperature: 0.5, // Allow for some natural variation while being professional
      }
    });
    
    let emailText = response.text.trim();
    // Basic cleanup
    emailText = emailText.replace(/^```(text|email)?\s*\n?([\s\S]*?)\n?\s*```$/s, '$2').trim();

    if (!emailText) {
        console.error("Gemini API returned an empty email draft. Using fallback.");
        return `Subject: Overdue Invoice ${invoice.invoiceNumber} - Action Required
Dear ${invoice.clientName},
Our records indicate that invoice #${invoice.invoiceNumber} for ZAR ${invoice.amountDue.toFixed(2)} is overdue. Please arrange for payment at your earliest convenience.
(AI Email Generation Failed)
Sincerely, ${senderName}`;
    }
    return emailText;
  } catch (error) {
    console.error("Error during Gemini API call for smart chase email:", error);
    return `Error during AI email generation: API call failed for invoice ${invoice.invoiceNumber}. Please draft manually. (Details: ${error instanceof Error ? error.message : String(error)})`;
  }
};
