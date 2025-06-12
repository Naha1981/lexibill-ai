
import React, { useState, useEffect } from 'react';
import { OverdueInvoiceForChase } from '../../types';
import { MailIcon, SpinnerIcon, AlertCircleIcon, ArrowLeftIcon } from '../icons';

interface SmartChaseModalProps {
  invoice: OverdueInvoiceForChase;
  onClose: () => void;
  onGenerateEmail: (invoice: OverdueInvoiceForChase) => Promise<string>;
  onSendOutreach: (invoice: OverdueInvoiceForChase, emailDraft: string) => void;
  isLoading: boolean;
}

const SmartChaseModal: React.FC<SmartChaseModalProps> = ({
  invoice,
  onClose,
  onGenerateEmail,
  onSendOutreach,
  isLoading: globalLoading,
}) => {
  const [emailDraft, setEmailDraft] = useState<string>('');
  const [isGeneratingEmail, setIsGeneratingEmail] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Automatically generate email when modal opens for the given invoice
    const generateInitialEmail = async () => {
      if (invoice) {
        setIsGeneratingEmail(true);
        setError(null);
        try {
          const draft = await onGenerateEmail(invoice);
          setEmailDraft(draft);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Failed to generate email draft.");
          setEmailDraft("Could not generate email content. Please try again or draft manually.");
        } finally {
          setIsGeneratingEmail(false);
        }
      }
    };
    generateInitialEmail();
  }, [invoice, onGenerateEmail]);

  const handleRegenerateEmail = async () => {
    setIsGeneratingEmail(true);
    setError(null);
    try {
      const draft = await onGenerateEmail(invoice);
      setEmailDraft(draft);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to re-generate email draft.");
    } finally {
      setIsGeneratingEmail(false);
    }
  };

  const handleSend = () => {
    if (!emailDraft.trim() || emailDraft.startsWith("Could not generate")) {
        alert("Please ensure there is a valid email draft before sending.");
        return;
    }
    onSendOutreach(invoice, emailDraft);
  };
  
  const commonTextareaClasses = "form-textarea flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#019863] border border-[#2f6a55] bg-[#10231c] placeholder:text-[#8ecdb7] px-3 py-2 text-sm font-normal leading-normal";

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-[#17352b] p-6 rounded-xl shadow-2xl border border-[#2f6a55] w-full max-w-2xl transform transition-all">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <MailIcon className="w-6 h-6 mr-2 text-[#019863]" />
            AI Smart Chase Reminder
          </h2>
          <button onClick={onClose} className="text-[#8ecdb7] hover:text-white" aria-label="Close Smart Chase Modal">
            <ArrowLeftIcon className="w-5 h-5"/>
          </button>
        </div>

        <div className="mb-4 p-3 bg-[#214a3c] rounded-lg text-sm">
          <p className="text-white"><strong>Client:</strong> {invoice.clientName}</p>
          <p className="text-white"><strong>Invoice:</strong> #{invoice.invoiceNumber} (ZAR {invoice.amountDue.toFixed(2)})</p>
          <p className="text-red-400"><strong>Status:</strong> {invoice.daysOverdue} days overdue</p>
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-800/50 text-red-200 text-xs rounded-md flex items-center">
            <AlertCircleIcon className="w-4 h-4 mr-2"/> {error}
          </div>
        )}

        <div>
          <label htmlFor="emailDraft" className="block text-sm font-medium text-[#8ecdb7] mb-1">
            AI-Generated Email Draft (Editable):
          </label>
          <textarea
            id="emailDraft"
            value={emailDraft}
            onChange={(e) => setEmailDraft(e.target.value)}
            className={`${commonTextareaClasses} h-56 min-h-[150px]`}
            rows={8}
            disabled={isGeneratingEmail || globalLoading}
            aria-label="Editable AI-generated email draft"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t border-[#2f6a55]">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none order-2 sm:order-1 min-w-[100px] cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-[#506a61] text-white text-sm font-bold hover:bg-[#3e524a]"
            disabled={globalLoading || isGeneratingEmail}
          >
            Cancel
          </button>
          <button
            onClick={handleRegenerateEmail}
            className="flex-1 sm:flex-none order-1 sm:order-2 min-w-[120px] cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-[#2a5c4a] text-white text-sm font-bold hover:bg-[#316d58] disabled:opacity-50"
            disabled={globalLoading || isGeneratingEmail}
          >
            {isGeneratingEmail && !emailDraft ? <SpinnerIcon className="w-4 h-4" /> : 'Regenerate Draft'}
          </button>
          <button
            onClick={handleSend}
            className="flex-1 sm:flex-none order-3 min-w-[150px] cursor-pointer items-center justify-center rounded-xl h-10 px-4 bg-[#019863] text-white text-sm font-bold hover:bg-[#017a50] disabled:opacity-50"
            disabled={globalLoading || isGeneratingEmail || !emailDraft.trim() || emailDraft.startsWith("Could not generate")}
          >
            {(globalLoading && !isGeneratingEmail) ? <SpinnerIcon className="w-4 h-4" /> : 'Initiate Outreach'}
          </button>
        </div>
        <p className="text-xs text-center text-[#8ecdb7] mt-3">
            Review and edit the draft. "Initiate Outreach" simulates sending email, WhatsApp, and CRM tasks.
        </p>
      </div>
    </div>
  );
};

export default SmartChaseModal;
