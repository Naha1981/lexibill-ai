
import React from 'react';
import { SpinnerIcon, ZapIcon, LinkIcon, CopyIcon, ArrowLeftIcon } from '../icons';

interface ZapierSetupModalProps {
  apiKey: string;
  onClose: () => void;
  onSetupComplete: () => void;
  isLoading: boolean;
}

const ZapierSetupModal: React.FC<ZapierSetupModalProps> = ({
  apiKey,
  onClose,
  onSetupComplete,
  isLoading,
}) => {
  const lexibillZapierAppUrl = "https://zapier.com/apps/lexibill-ai/integrations (mock URL)";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        alert("Copied to clipboard!");
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert("Failed to copy API key. Please copy it manually.");
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" aria-modal="true" role="dialog">
      <div className="bg-[#122720] p-6 sm:p-8 rounded-xl shadow-2xl border border-[#2f6a55] w-full max-w-lg transform transition-all">
        <div className="flex items-center justify-center mb-6 text-center">
          <ZapIcon className="w-8 h-8 text-orange-500" />
          <h2 className="text-xl sm:text-2xl font-semibold text-white ml-3">Connect to Zapier</h2>
        </div>

        <div className="text-sm text-[#b2dfdb] space-y-3 mb-6">
          <p>Follow these steps to connect LexiBill AI to your Zapier account:</p>
          <ol className="list-decimal list-inside space-y-1 pl-2 text-xs">
            <li>Open <a href="https://zapier.com" target="_blank" rel="noopener noreferrer" className="text-[#019863] hover:underline">Zapier.com</a> in a new tab.</li>
            <li>Create a new Zap or edit an existing one.</li>
            <li>Search for and select the "LexiBill AI" app (or use the direct link below).</li>
            <li>When prompted, enter your unique API Key to authenticate.</li>
          </ol>
        </div>

        <div className="space-y-4 mb-6">
            <div>
                <label className="block text-xs font-medium text-[#8ecdb7] mb-1">LexiBill AI Zapier App URL (Mock):</label>
                <div className="flex items-center">
                    <input 
                        type="text" 
                        readOnly 
                        value={lexibillZapierAppUrl} 
                        className="form-input flex-grow px-3 py-2 rounded-l-lg bg-[#214a3c] border border-r-0 border-[#2f6a55] text-white text-xs focus:outline-none"
                    />
                    <button 
                        onClick={() => copyToClipboard(lexibillZapierAppUrl)}
                        title="Copy URL"
                        className="p-2.5 bg-[#2f6a55] text-[#8ecdb7] hover:bg-[#3b806a] rounded-r-lg border border-l-0 border-[#2f6a55]"
                    >
                        <CopyIcon className="w-4 h-4"/>
                    </button>
                </div>
            </div>
             <div>
                <label className="block text-xs font-medium text-[#8ecdb7] mb-1">Your Unique API Key:</label>
                 <div className="flex items-center">
                    <input 
                        type="text" 
                        readOnly 
                        value={apiKey} 
                        className="form-input flex-grow px-3 py-2 rounded-l-lg bg-[#214a3c] border border-r-0 border-[#2f6a55] text-white text-xs focus:outline-none"
                    />
                    <button 
                        onClick={() => copyToClipboard(apiKey)}
                        title="Copy API Key"
                        className="p-2.5 bg-[#2f6a55] text-[#8ecdb7] hover:bg-[#3b806a] rounded-r-lg border border-l-0 border-[#2f6a55]"
                    >
                        <CopyIcon className="w-4 h-4"/>
                    </button>
                </div>
            </div>
        </div>


        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 order-2 sm:order-1 sm:flex-none min-w-[120px] cursor-pointer items-center justify-center rounded-xl h-11 px-5 bg-[#506a61] text-white text-base font-bold hover:bg-[#3e524a] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSetupComplete}
            disabled={isLoading}
            className="flex-1 order-1 sm:order-2 sm:flex-none min-w-[120px] cursor-pointer items-center justify-center rounded-xl h-11 px-5 bg-[#019863] text-white text-base font-bold hover:bg-[#017a50] disabled:opacity-50"
          >
            {isLoading ? <SpinnerIcon className="w-5 h-5" /> : `Mark as Connected`}
          </button>
        </div>
         <p className="text-xs text-center text-gray-400 mt-6">
            <LinkIcon className="w-3 h-3 inline mr-1" /> Keep your API Key secure. This is a mock key for demonstration.
        </p>
      </div>
    </div>
  );
};

export default ZapierSetupModal;