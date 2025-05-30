
import React, { useState, useEffect, useCallback } from 'react';
import { ChatMessage, TimeEntry, ChatFlowState, CurrentEntryBuilder, TaskType } from './types';
import ChatInterface from './components/ChatInterface';
import ReportView from './components/ReportView';
import LandingPage from './components/LandingPage'; // Import LandingPage
// import { enhanceDescriptionWithAI, categorizeTaskWithAI } from './services/geminiService'; // AI services no longer used for description/categorization
import { INITIAL_BOT_MESSAGE, HELP_MESSAGE, BOT_NAME } from './constants';

const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  
  const [currentChatFlowState, setCurrentChatFlowState] = useState<ChatFlowState>(ChatFlowState.IDLE);
  const [currentEntryBuilder, setCurrentEntryBuilder] = useState<CurrentEntryBuilder>({});
  
  // States for multi-turn entry logging per matter
  const [sessionMatterID, setSessionMatterID] = useState<string | null>(null);
  const [sessionEntries, setSessionEntries] = useState<CurrentEntryBuilder[]>([]); // Store builders for current session
  const [lastCompletedMatterID, setLastCompletedMatterID] = useState<string | null>(null);


  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showReportPreview, setShowReportPreview] = useState<boolean>(false);
  const [reportPreviewData, setReportPreviewData] = useState<{ entries: TimeEntry[]; matterName: string } | null>(null);
  const [showLanding, setShowLanding] = useState<boolean>(true);

  const addMessage = useCallback((sender: 'user' | 'bot' | 'system', text: string, isHtml: boolean = false) => {
    setMessages(prev => [...prev, { id: generateId(), sender, text, timestamp: new Date(), isHtml }]);
  }, []);

  const navigateToHome = useCallback(() => {
    setShowLanding(true);
    setShowReportPreview(false);
    setReportPreviewData(null);
    // Reset chat specific states when going home
    setCurrentChatFlowState(ChatFlowState.IDLE);
    setCurrentEntryBuilder({});
    setSessionMatterID(null);
    setSessionEntries([]);
    setLastCompletedMatterID(null);
     // Optionally clear messages or keep history
    // setMessages([]); 
  }, []);

  useEffect(() => {
    if (!showLanding && messages.length === 0) {
       const isInitialMessagePresent = messages.some(msg => msg.text.includes("Hello. I’m LexiBill") && msg.sender === 'bot');
       if (!isInitialMessagePresent) {
        addMessage('bot', INITIAL_BOT_MESSAGE, true);
        setCurrentChatFlowState(ChatFlowState.AWAITING_MATTER_NAME);
       }
    }
  }, [showLanding, messages, addMessage]);


  const handleGetStarted = () => {
    setShowLanding(false);
    // Ensure initial message is re-added if chat was previously cleared or is empty
    if (messages.length === 0 || !messages.some(msg => msg.text.includes("Hello. I’m LexiBill"))) {
        addMessage('bot', INITIAL_BOT_MESSAGE, true);
    }
    setCurrentChatFlowState(ChatFlowState.AWAITING_MATTER_NAME);
  };

  const resetChatFlowForNewMatter = useCallback(() => {
    setCurrentChatFlowState(ChatFlowState.AWAITING_MATTER_NAME);
    setCurrentEntryBuilder({});
    setSessionMatterID(null); // Clear session matter as well if starting completely fresh
    setSessionEntries([]);
    // lastCompletedMatterID is kept to potentially resume invoicing for it
  }, []);
  
  const resetCurrentEntryBuilder = useCallback(() => {
    setCurrentEntryBuilder({});
    // Keep sessionMatterID for subsequent entries within the same "Done" block
  }, []);


  const handleCloseReport = () => {
    const closedReportMatterName = reportPreviewData?.matterName || "Unknown Matter";
    setShowReportPreview(false);
    setReportPreviewData(null);
    addMessage('system', `Closed report preview for ${closedReportMatterName}.`);
    addMessage('bot', `Okay, preview closed. What would you like to do next? You can log time for a new matter by entering its name, or type "Help".`);
    setCurrentChatFlowState(ChatFlowState.AWAITING_MATTER_NAME);
  };

  const handleConfirmReport = () => {
    const confirmedMatterName = reportPreviewData?.matterName || "Unknown Matter";
    const entriesForReport = reportPreviewData?.entries || [];
    
    setShowReportPreview(false);
    setReportPreviewData(null);
    
    let summaryText = `✅ Final billing report generated for **${confirmedMatterName}**\n\n**Summary:**\n\n`;
    const totalHours = entriesForReport.reduce((sum, entry) => sum + entry.duration, 0);
    summaryText += `* Total Time: ${totalHours} hour${totalHours !== 1 ? 's' : ''}\n`;
    summaryText += `* Entries included:\n`;
    entriesForReport.forEach(entry => {
        summaryText += `  * ${entry.date.toLocaleDateString('en-CA')}: ${entry.description}\n`;
    });
    summaryText += `\nWould you like to:\n* Download PDF\n* Email to client\n* Save to drive\n\n(Note: These features are planned for a future update.)`;

    addMessage('bot', summaryText);
    setCurrentChatFlowState(ChatFlowState.AWAITING_MATTER_NAME); // Ready for a new matter
    addMessage('bot', `You can now log time for a new matter or type "Help".`);
  };
  
  const handleEditReport = () => {
    setShowReportPreview(false);
    addMessage('bot', "Editing entries directly from the report preview is planned for a future update. For now, you can cancel and re-log entries if needed, or make manual adjustments after generating the report. Would you like to 'Cancel' the preview or 'Confirm' as is?");
    // The ReportView itself will handle the "Confirm" or "Cancel" (onClose) from this point
  };

  const processUserInput = useCallback(async (userInput: string) => {
    addMessage('user', userInput);
    setIsLoading(true);

    const lowerInput = userInput.toLowerCase();

    // Global commands
    if (lowerInput === 'help') {
      addMessage('bot', HELP_MESSAGE, true);
      setIsLoading(false);
      return;
    }

    if (lowerInput.startsWith('generate invoice for ')) {
      const matterName = userInput.substring('generate invoice for '.length).trim();
      if (matterName) {
        const entriesForMatter = timeEntries.filter(entry => entry.matterID.toLowerCase() === matterName.toLowerCase());
        if (entriesForMatter.length > 0) {
            setReportPreviewData({ entries: entriesForMatter, matterName });
            setShowReportPreview(true);
            addMessage('system', `Displaying billing report preview for ${matterName}.`);
        } else {
            addMessage('bot', `No time entries found for matter "${matterName}".`);
        }
      } else {
        addMessage('bot', "Please specify the matter name for the invoice (e.g., 'Generate invoice for Acme Corp').");
      }
      setIsLoading(false);
      return;
    }
    
    if (lowerInput === 'show entries') {
        if (timeEntries.length === 0 && sessionEntries.length === 0) {
            addMessage('bot', "You haven't logged any time entries yet.");
        } else {
            let entriesText = "Here are your logged entries:\n\n";
            const allDisplayableEntries: {matterID: string, date: Date, duration: number, description: string}[] = [
                ...timeEntries,
                ...sessionEntries
                    .filter(se => se.matterID && se.date && se.duration && se.rawDescription)
                    .map(se => ({ // Convert session builders to displayable format
                        id: generateId(),
                        matterID: se.matterID!,
                        date: se.date!,
                        duration: se.duration!,
                        description: se.rawDescription!,
                        taskType: TaskType.OTHER, // Default for session entries not yet saved
                    }))
            ];

            if (allDisplayableEntries.length === 0) {
                 addMessage('bot', "You haven't logged any time entries yet.");
                 setIsLoading(false);
                 return;
            }

            const groupedEntries: { [matterID: string]: typeof allDisplayableEntries } = {};
            allDisplayableEntries.forEach(entry => {
                if (!groupedEntries[entry.matterID]) {
                    groupedEntries[entry.matterID] = [];
                }
                groupedEntries[entry.matterID].push(entry);
            });

            Object.keys(groupedEntries).forEach(matterID => {
                entriesText += `**Matter: ${matterID}**\n`;
                groupedEntries[matterID].forEach((entry, index) => {
                    entriesText += `* ${entry.date.toLocaleDateString('en-CA')} — ${entry.duration} hour${entry.duration !== 1 ? 's' : ''}\n  ${entry.description}\n`;
                });
                entriesText += "\n";
            });
            addMessage('bot', entriesText);
        }
        setIsLoading(false);
        return;
    }


    switch (currentChatFlowState) {
      case ChatFlowState.AWAITING_MATTER_NAME:
        setSessionMatterID(userInput.trim());
        setCurrentEntryBuilder({ matterID: userInput.trim() });
        addMessage('bot', `Got it. Matter: **${userInput.trim()}**\nLet’s log your time.\nHow many hours did you work, and on what date?`);
        setCurrentChatFlowState(ChatFlowState.AWAITING_DURATION_DATE);
        break;
      
      case ChatFlowState.AWAITING_DURATION_DATE:
        if (!sessionMatterID && !currentEntryBuilder.matterID) {
             addMessage('bot', "It seems we don't have a Matter Name yet. Please provide the Matter Name first.");
             setCurrentChatFlowState(ChatFlowState.AWAITING_MATTER_NAME);
             setIsLoading(false);
             return;
        }
        const durationDateRegex = /(\d+(\.\d+)?)\s*h(?:ours?)?\s*(?:on\s*(.+))?/i;
        const match = userInput.match(durationDateRegex);
        let duration: number;
        let date: Date;

        if (match) {
          duration = parseFloat(match[1]);
          let dateStr = match[4] ? match[4].trim() : 'today';
          date = new Date(); // Default to today
          if (dateStr.toLowerCase() !== 'today') {
            if (dateStr.toLowerCase() === 'yesterday') {
                date.setDate(date.getDate() - 1);
            } else {
                const parsedDate = new Date(dateStr);
                if (!isNaN(parsedDate.getTime())) {
                    if (dateStr.match(/^\w+\s+\d+$/) && parsedDate.getFullYear() === new Date(0).getFullYear()) {
                         parsedDate.setFullYear(new Date().getFullYear());
                    }
                    date = parsedDate;
                } else {
                    addMessage('bot', "I couldn't understand that date. Please try a format like 'May 29', 'YYYY-MM-DD', 'today', or 'yesterday'.");
                    setIsLoading(false);
                    return;
                }
            }
          }
          if (isNaN(date.getTime())) {
             addMessage('bot', "Invalid date provided. Please try again, e.g., '1.5 hours on May 29, 2024'.");
             setIsLoading(false);
             return;
          }

          setCurrentEntryBuilder(prev => ({ ...prev, duration, date, matterID: prev.matterID || sessionMatterID }));
          addMessage('bot', `Noted: ${duration} hour${duration !== 1 ? 's' : ''} on ${date.toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })}\nWhat did you work on?`);
          setCurrentChatFlowState(ChatFlowState.AWAITING_DESCRIPTION);
        } else {
          addMessage('bot', "I didn't catch that. Please tell me the time and date like '2.5 hours on May 25'.");
        }
        break;

      case ChatFlowState.AWAITING_DESCRIPTION:
        const rawDescription = userInput.trim();
        setCurrentEntryBuilder(prev => ({ ...prev, rawDescription }));
        
        const entryToConfirm = { ...currentEntryBuilder, rawDescription };

        if (entryToConfirm.date && entryToConfirm.duration && entryToConfirm.rawDescription) {
            const confirmationMessage = `Here’s your time entry:\n\n* **Date**: ${entryToConfirm.date.toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })}\n* **Time**: ${entryToConfirm.duration} hour${entryToConfirm.duration !== 1 ? 's' : ''}\n* **Description**: ${entryToConfirm.rawDescription}\n\nWould you like to:\n* Log another entry\n* Edit this entry\n* Type "Done" to finish logging for this matter`;
            addMessage('bot', confirmationMessage);
            setCurrentChatFlowState(ChatFlowState.AWAITING_ENTRY_CONFIRMATION);
        } else {
            addMessage('bot', "Something seems missing in the entry. Let's re-enter the description, or you can type 'Done' to restart for this matter.");
        }
        break;
      
      case ChatFlowState.AWAITING_ENTRY_CONFIRMATION:
        const currentConfirmedEntry = { ...currentEntryBuilder };
         if (lowerInput === 'log another entry') {
            if (currentConfirmedEntry.matterID && currentConfirmedEntry.date && currentConfirmedEntry.duration && currentConfirmedEntry.rawDescription) {
                setSessionEntries(prev => [...prev, currentConfirmedEntry]);
                addMessage('bot', `Entry added:\n\n* **Date**: ${currentConfirmedEntry.date.toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })}\n* **Time**: ${currentConfirmedEntry.duration} hour${currentConfirmedEntry.duration !== 1 ? 's' : ''}\n* **Description**: ${currentConfirmedEntry.rawDescription}\n\nOkay, for the same matter (**${sessionMatterID || currentConfirmedEntry.matterID}**), how many hours and on what date for the next entry?`);
                resetCurrentEntryBuilder(); // Reset for the new entry, but keep sessionMatterID
                setCurrentChatFlowState(ChatFlowState.AWAITING_DURATION_DATE);
            } else {
                 addMessage('bot', "Some details are missing from the current entry. Please type 'Edit this entry' to correct it, or 'Done' to finish.");
            }
        } else if (lowerInput === 'edit this entry') {
            addMessage('bot', "Editing an entry directly in this session is planned for a future update. For now, if you type 'Done', all entries for this matter will be saved. If you spot an error before that, you can describe the correction needed for the last unconfirmed entry (e.g., 'change description to ...', 'change hours to ...'), or type 'Done' and re-log the specific entry later. What would you like to do?");
            // Keep currentChatFlowState as AWAITING_ENTRY_CONFIRMATION or a new AWAITING_EDIT_CHOICE
        } else if (lowerInput === 'done') {
            // Add the currently built entry to sessionEntries if valid
            if (currentConfirmedEntry.matterID && currentConfirmedEntry.date && currentConfirmedEntry.duration && currentConfirmedEntry.rawDescription) {
                setSessionEntries(prev => [...prev, currentConfirmedEntry]);
            }
            
            const finalSessionMatterID = sessionMatterID || currentConfirmedEntry.matterID;
            if (!finalSessionMatterID) {
                addMessage('bot', "It seems we don't have a matter name for these entries. Please start by providing a Matter Name.");
                resetChatFlowForNewMatter();
                setIsLoading(false);
                return;
            }

            const entriesToSave = sessionEntries.length > 0 ? sessionEntries : 
                                  (currentConfirmedEntry.matterID ? [currentConfirmedEntry] : []);

            if (entriesToSave.length > 0) {
                const newTimeEntries: TimeEntry[] = entriesToSave
                    .filter(e => e.matterID && e.date && e.duration && e.rawDescription) // Ensure all parts are defined
                    .map(entry => ({
                        id: generateId(),
                        matterID: entry.matterID!,
                        date: entry.date!,
                        duration: entry.duration!,
                        description: entry.rawDescription!, // Store raw description
                        taskType: TaskType.OTHER, // Default task type
                    }));
                setTimeEntries(prev => [...prev, ...newTimeEntries]);
                addMessage('bot', `All entries for **${finalSessionMatterID}** have been saved.`);
                setLastCompletedMatterID(finalSessionMatterID); // Remember for invoice prompt
            } else {
                addMessage('bot', `No entries were logged for **${finalSessionMatterID}**.`);
            }
            
            addMessage('bot', `Would you like to generate an invoice for **${finalSessionMatterID}** now? (Yes/No)`);
            setCurrentChatFlowState(ChatFlowState.AWAITING_INVOICE_DECISION_AFTER_DONE);
            setSessionMatterID(null); // Clear sessionMatterID after "Done"
            setSessionEntries([]);    // Clear session entries
            resetCurrentEntryBuilder();

        } else {
          addMessage('bot', "Please respond with 'Log another entry', 'Edit this entry', or 'Done'.");
        }
        break;

      case ChatFlowState.AWAITING_INVOICE_DECISION_AFTER_DONE:
        if (lowerInput === 'yes' && lastCompletedMatterID) {
            const entriesForMatter = timeEntries.filter(entry => entry.matterID.toLowerCase() === lastCompletedMatterID.toLowerCase());
            if (entriesForMatter.length > 0) {
                setReportPreviewData({ entries: entriesForMatter, matterName: lastCompletedMatterID });
                setShowReportPreview(true);
                addMessage('system', `Displaying billing report preview for ${lastCompletedMatterID}.`);
            } else {
                addMessage('bot', `No time entries found for matter "${lastCompletedMatterID}". Strange, we just saved some! Let me check.`);
                 // This case should ideally not happen if entries were just saved.
            }
        } else if (lowerInput === 'no') {
            addMessage('bot', "Okay. You can log time for a new matter or type 'Help'.");
            resetChatFlowForNewMatter();
        } else {
            addMessage('bot', `Please answer 'Yes' or 'No'. Or, you can start logging for a new matter or type 'Help'.`);
        }
        // Regardless of yes/no, transition to a state ready for a new matter or other commands
        if (lowerInput === 'yes' || lowerInput === 'no') {
            setCurrentChatFlowState(ChatFlowState.AWAITING_MATTER_NAME);
        }
        break;
      
      case ChatFlowState.AWAITING_EDIT_DESCRIPTION: // This state might be deprecated by simplified edit flow
        const newRawDescription = userInput;
        setCurrentEntryBuilder(prev => ({ ...prev, rawDescription: newRawDescription }));
        const editedEntryToConfirm = { ...currentEntryBuilder, rawDescription: newRawDescription };
        if (editedEntryToConfirm.date && editedEntryToConfirm.duration && editedEntryToConfirm.rawDescription) {
            const confirmationMessage = `Here’s your updated time entry:\n\n* **Date**: ${editedEntryToConfirm.date.toLocaleDateString('en-CA', { month: 'long', day: 'numeric' })}\n* **Time**: ${editedEntryToConfirm.duration} hour${editedEntryToConfirm.duration !== 1 ? 's' : ''}\n* **Description**: ${editedEntryToConfirm.rawDescription}\n\nWould you like to:\n* Log another entry\n* Edit this entry\n* Type "Done" to finish logging for this matter`;
            addMessage('bot', confirmationMessage);
            setCurrentChatFlowState(ChatFlowState.AWAITING_ENTRY_CONFIRMATION);
        } else {
             addMessage('bot', "Something went wrong with the edit. Let's try that again or type 'Done'.");
        }
        break;

      default:
        addMessage('bot', "I'm not sure how to handle that. Please enter a Matter Name to begin logging, or type 'Help' for options.");
        setCurrentChatFlowState(ChatFlowState.AWAITING_MATTER_NAME); // Default to expecting a matter name
    }
    setIsLoading(false);
  }, [
    addMessage, currentChatFlowState, currentEntryBuilder, timeEntries, 
    sessionMatterID, sessionEntries, lastCompletedMatterID, 
    resetCurrentEntryBuilder, resetChatFlowForNewMatter
  ]);


  if (showLanding) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="relative flex flex-col size-full min-h-screen bg-[#10231c] justify-between overflow-x-hidden">
      {showReportPreview && reportPreviewData ? (
        <ReportView
          entries={reportPreviewData.entries}
          matterName={reportPreviewData.matterName}
          onClose={handleCloseReport}
          onConfirm={handleConfirmReport}
          onEdit={handleEditReport}
        />
      ) : (
        <ChatInterface 
          messages={messages} 
          onSendMessage={processUserInput} 
          isLoading={isLoading}
          onNavigateHome={navigateToHome}
        />
      )}
    </div>
  );
};

export default App;
