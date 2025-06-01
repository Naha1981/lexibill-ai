
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_TEXT_MODEL } from "../constants";

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn(
    "API_KEY for Gemini not found in environment variables. AI features will be disabled."
  );
}

/**
 * Generates a detailed, human-like billing narrative using Gemini AI.
 * @param taskSummary Brief description of the task performed.
 * @param clientName Name of the client.
 * @param matterName Name of the matter.
 * @param date Date the work was performed.
 * @param timeSpent Duration of the work in hours.
 * @returns A promise that resolves to the AI-generated billing narrative string.
 */
export const generateBillingNarrative = async (
  taskSummary: string,
  clientName: string,
  matterName: string,
  date: Date,
  timeSpent: number
): Promise<string> => {
  if (!ai) {
    console.error("Gemini AI client not initialized. Cannot generate narrative.");
    // Fallback to a simple narrative if AI is not available
    return Promise.resolve(
      `Work performed on ${date.toLocaleDateString('en-ZA')}: ${taskSummary} (${timeSpent}h for ${clientName} - ${matterName}). (AI Narrative Generation Failed)`
    );
  }

  const prompt = `
You are an AI assistant for a law firm in South Africa, specializing in generating professional billing narratives.
Your task is to convert a concise task summary provided by a lawyer into a detailed, human-readable billing narrative suitable for a client invoice.

Client Name: ${clientName}
Matter Name: ${matterName}
Date of Work: ${date.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })}
Time Spent: ${timeSpent} hour${timeSpent !== 1 ? 's' : ''}

Task Summary from Lawyer:
"${taskSummary}"

Please generate a billing narrative based on the above information.
The narrative MUST:
1. Be a single, coherent paragraph of formal text. Ensure it is well-structured and flows naturally.
2. NOT use bullet points, numbered lists, or any similar itemized formatting.
3. Clearly incorporate the context: who the work was for (Client Name), what it related to (Matter Name), the specific actions taken as described in the task summary, and imply the purpose or result of those actions.
4. Use professional language appropriate for legal billing in South Africa. Be formal and precise.
5. Be detailed enough for the client to understand the value of the work performed. Expand slightly on the task summary if necessary to achieve a complete narrative, but do not invent new facts.
6. Do not repeat the "Client Name:", "Matter Name:", "Date of Work:", "Time Spent:" labels in your narrative. Integrate this information naturally and seamlessly within the paragraph.
7. The narrative should start directly with the description of the work, for example: "Attended to..." or "Drafted..." or "Consulted on...".

Generated Billing Narrative:
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      // config: { thinkingConfig: { thinkingBudget: 0 } } // Consider disabling thinking for faster, potentially less nuanced responses if speed is critical. For narrative generation, quality is likely preferred.
    });
    
    let narrative = response.text.trim();
    // Clean up any accidental markdown-like formatting from the model if it slips through
    narrative = narrative.replace(/^```(json|text)?\s*\n?([\s\S]*?)\n?\s*```$/s, '$2').trim();

    if (!narrative) {
        console.error("Gemini API returned an empty narrative.");
        return `Failed to generate AI narrative. Task: ${taskSummary}.`;
    }
    return narrative;
  } catch (error) {
    console.error("Error generating billing narrative with Gemini:", error);
    return `Error during AI narrative generation. Task: ${taskSummary}. Please review and edit manually.`;
  }
};
