
import React from 'react';
import { OAuthServiceType } from '../../types';
import { SpinnerIcon, LinkIcon, ArrowLeftIcon, LockIcon } from '../icons';

interface OAuthConnectionModalProps {
  serviceName: OAuthServiceType;
  onClose: () => void;
  onAuthorize: (service: OAuthServiceType) => void;
  isLoading: boolean;
}

const OAuthConnectionModal: React.FC<OAuthConnectionModalProps> = ({
  serviceName,
  onClose,
  onAuthorize,
  isLoading,
}) => {
  const serviceLogos: Record<OAuthServiceType, React.ReactNode> = {
    QuickBooks: <LinkIcon className="w-8 h-8 text-green-500" />, // Placeholder, replace with actual logo
    Stripe: <LinkIcon className="w-8 h-8 text-indigo-500" />,    // Placeholder
    HubSpot: <LinkIcon className="w-8 h-8 text-orange-500" />,   // Placeholder
    Xero: <LinkIcon className="w-8 h-8 text-blue-500" />,        // Placeholder
    Gmail: <LinkIcon className="w-8 h-8 text-red-500" />,        // Placeholder
  };

  const permissions: Record<OAuthServiceType, string[]> = {
    QuickBooks: ["Access invoices", "Manage customers", "Read payments", "View account balances"],
    Stripe: ["Read transaction history", "View customer records", "Create payment events"],
    HubSpot: ["Read contacts", "Log activities", "Manage deals"],
    Xero: ["Access invoices", "Manage contacts", "Read bank transactions"],
    Gmail: ["Read email metadata", "Draft emails", "Send emails on your behalf"],
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" aria-modal="true" role="dialog">
      <div className="bg-[#122720] p-6 sm:p-8 rounded-xl shadow-2xl border border-[#2f6a55] w-full max-w-lg transform transition-all">
        <div className="flex items-center justify-center mb-6 text-center">
          {serviceLogos[serviceName]}
          <h2 className="text-xl sm:text-2xl font-semibold text-white ml-3">Connect to {serviceName}</h2>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-[#b2dfdb]">
            You are about to connect LexiBill AI to your {serviceName} account.
            This will allow LexiBill AI to (simulated):
          </p>
          <ul className="list-disc list-inside text-xs text-[#8ecdb7] mt-2 text-left max-w-xs mx-auto">
            {permissions[serviceName].map(perm => <li key={perm}>{perm}</li>)}
          </ul>
        </div>
        
        {/* Simulated Login Form */}
        <div className="space-y-4 mb-6">
            <div>
                <label htmlFor={`${serviceName}-email`} className="block text-xs font-medium text-[#8ecdb7] mb-1">
                    {serviceName} Email (Simulation)
                </label>
                <input 
                    type="email" 
                    id={`${serviceName}-email`}
                    defaultValue={`craig@example-lexibill.com`}
                    className="form-input w-full px-3 py-2 rounded-lg bg-[#214a3c] border border-[#2f6a55] text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#019863]" 
                    placeholder={`Your ${serviceName} email`}
                />
            </div>
            <div>
                <label htmlFor={`${serviceName}-password`} className="block text-xs font-medium text-[#8ecdb7] mb-1">
                    {serviceName} Password (Simulation)
                </label>
                 <input 
                    type="password" 
                    id={`${serviceName}-password`}
                    defaultValue="password123"
                    className="form-input w-full px-3 py-2 rounded-lg bg-[#214a3c] border border-[#2f6a55] text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#019863]" 
                    placeholder="Your password"
                />
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
            onClick={() => onAuthorize(serviceName)}
            disabled={isLoading}
            className="flex-1 order-1 sm:order-2 sm:flex-none min-w-[120px] cursor-pointer items-center justify-center rounded-xl h-11 px-5 bg-[#019863] text-white text-base font-bold hover:bg-[#017a50] disabled:opacity-50"
          >
            {isLoading ? <SpinnerIcon className="w-5 h-5" /> : `Authorize LexiBill AI`}
          </button>
        </div>
         <p className="text-xs text-center text-gray-400 mt-6">
            <LockIcon className="w-3 h-3 inline mr-1" /> This is a simulated authentication. No real data is sent.
        </p>
      </div>
    </div>
  );
};

export default OAuthConnectionModal;