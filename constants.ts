
export const BOT_NAME = "LexiBill AI";
export const GEMINI_TEXT_MODEL = "gemini-2.5-flash-preview-04-17"; // Remains for potential future use

export const INITIAL_BOT_MESSAGE = `Hello. I’m ${BOT_NAME}, your AI Legal Admin & Billing Assistant.
Clarity in Every Bill. Confidence in Every Client.

To get started, please enter the **Matter Name**.

You can also type:
* Done — to finish logging entries for the current matter
* Show entries — to review all logged time
* Generate invoice for [Matter Name] — to create a billing report
* Help — to see this message again`;

export const HELP_MESSAGE = `I’m ${BOT_NAME}. Here's how I can assist:

**Logging Time Entries:**
1.  Enter the **Matter Name**.
2.  I'll ask for **hours and date** (e.g., "2.5 hours on May 25").
3.  Then, provide a **description** of the work (e.g., "Reviewed disciplinary documents and drafted response letter"). Your exact wording is used.
4.  After each entry, you can choose to:
    *   Log another entry (for the same matter)
    *   Edit the entry (basic corrections for now)
    *   Type "Done"

**Commands:**
*   **Done**: Finishes logging for the current matter. I'll then ask if you want to generate an invoice.
*   **Show entries**: Displays all time entries logged so far, grouped by matter.
*   **Generate invoice for [Matter Name]**: Shows a preview of the billing report for the specified matter.
*   **Help**: Shows this guide again.

My goal is: Clarity in Every Bill. Confidence in Every Client.`;
