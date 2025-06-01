
import React, { useState, useEffect } from 'react';
import { TimeEntry, Client, Matter } from '../types'; // Assuming these might be needed for context display
import { ArrowLeftIcon, SpinnerIcon, LexiBillLogoIcon } from './icons';

// This combines the original form data with the generated narrative for the preview
export interface NarrativePreviewData extends Omit<TimeEntry, 'id' | 'billingNarrative' | 'isBilled'> {
  generatedNarrative: string;
}

interface BillingNarrativePreviewProps {
  narrativeData: NarrativePreviewData;
  onApprove: (finalNarrative: string, originalEntryData: Omit<NarrativePreviewData, 'generatedNarrative'>) => void;
  onCancel: () => void;
  isLoading: boolean; // For showing spinner during approval if any async action happens
}

const BillingNarrativePreview: React.FC<BillingNarrativePreviewProps> = ({
  narrativeData,
  onApprove,
  onCancel,
  isLoading,
}) => {
  const [editableNarrative, setEditableNarrative] = useState(narrativeData.generatedNarrative);

  useEffect(() => {
    setEditableNarrative(narrativeData.generatedNarrative);
  }, [narrativeData.generatedNarrative]);

  const handleApproveClick = () => {
    const { generatedNarrative, ...originalEntryData } = narrativeData;
    onApprove(editableNarrative, originalEntryData);
  };
  
  const commonLabelClasses = "block text-sm font-medium text-[#8ecdb7] mb-1";
  const commonValueClasses = "text-white text-base";
  const commonTextareaClasses = "form-textarea flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#019863] border border-[#2f6a55] bg-[#214a3c] placeholder:text-[#8ecdb7] px-3 py-2 text-base font-normal leading-normal";


  return (
    <div className="relative flex flex-col size-full min-h-screen bg-[#10231c] justify-start overflow-x-hidden">
      <header className="flex items-center bg-[#10231c] p-4 pb-2 justify-between sticky top-0 z-10 w-full">
        <button 
          onClick={onCancel} 
          className="text-white flex size-12 shrink-0 items-center justify-center hover:bg-[#1a3a2f] rounded-full transition-colors" 
          aria-label="Back to time entry form"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <div className="flex-1 flex flex-col items-center justify-center py-1">
          <LexiBillLogoIcon className="h-8 w-8 text-[#8ecdb7] mb-1" />
          <h1 className="text-white text-xl font-bold leading-tight tracking-[-0.015em]">
            Review Billing Narrative
          </h1>
        </div>
        <div className="flex size-12 shrink-0 items-center justify-center" aria-hidden="true">
          {/* Spacer */}
        </div>
      </header>
      <div className="px-4 pt-1 pb-3 bg-[#10231c] sticky top-[calc(4rem+0.5rem+1.5rem)] z-10 w-full">
        <div
          className="h-px bg-[#8ecdb7] animate-draw-line-lr"
          style={{ transformOrigin: 'left' }}
        ></div>
      </div>

      <main className="flex-grow overflow-y-auto chat-scrollbar px-4 py-6">
        <div className="bg-[#17352b] p-6 rounded-xl shadow-lg border border-[#2f6a55] max-w-3xl mx-auto">
          <p className="text-[#8ecdb7] text-sm mb-4">
            Below is the AI-generated billing narrative based on your task summary. Review it carefully. You can edit the narrative directly in the text area before approving.
          </p>

          {/* Display original entry details for context */}
          <div className="mb-6 p-4 bg-[#214a3c] rounded-lg space-y-2">
            <h3 className="text-lg font-semibold text-white mb-2">Original Entry Details:</h3>
            <div>
              <span className={`${commonLabelClasses} inline-block mr-2`}>Date:</span>
              <span className={commonValueClasses}>{new Date(narrativeData.date).toLocaleDateString('en-CA')}</span>
            </div>
            <div>
              <span className={`${commonLabelClasses} inline-block mr-2`}>Task Summary:</span>
              <span className={commonValueClasses}>{narrativeData.taskSummary}</span>
            </div>
            <div>
              <span className={`${commonLabelClasses} inline-block mr-2`}>Duration:</span>
              <span className={commonValueClasses}>{narrativeData.duration} hour(s)</span>
            </div>
             <div>
              <span className={`${commonLabelClasses} inline-block mr-2`}>Rate:</span>
              <span className={commonValueClasses}>R {narrativeData.rate.toFixed(2)}</span>
            </div>
            {narrativeData.notes && (
                 <div>
                    <span className={`${commonLabelClasses} inline-block mr-2`}>Internal Notes:</span>
                    <span className={commonValueClasses}>{narrativeData.notes}</span>
                </div>
            )}
          </div>
          
          <div>
            <label htmlFor="billingNarrative" className={`${commonLabelClasses} text-lg`}>Generated Billing Narrative (Editable):</label>
            <textarea
              id="billingNarrative"
              value={editableNarrative}
              onChange={(e) => setEditableNarrative(e.target.value)}
              className={`${commonTextareaClasses} h-48 min-h-[100px]`}
              rows={6}
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-[#2f6a55]">
            <button
              onClick={onCancel}
              className="flex flex-1 sm:flex-none min-w-[84px] max-w-full sm:max-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-11 px-5 bg-[#506a61] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#3e524a]"
              disabled={isLoading}
            >
              Cancel & Edit Entry
            </button>
            <button
              onClick={handleApproveClick}
              className="flex flex-1 sm:flex-none min-w-[84px] max-w-full sm:max-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-11 px-5 bg-[#019863] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#017a50] disabled:opacity-50"
              disabled={isLoading || !editableNarrative.trim()}
            >
              {isLoading ? <SpinnerIcon className="w-5 h-5" /> : 'Approve & Save Entry'}
            </button>
          </div>
        </div>
      </main>
       <footer className="bg-[#10231c] text-center py-4 sticky bottom-0 z-10 w-full mt-auto">
        <p className="text-[#8ecdb7] text-xs">
         Ensure the narrative is accurate and professional before approving.
        </p>
      </footer>
    </div>
  );
};

export default BillingNarrativePreview;
