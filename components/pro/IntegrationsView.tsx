
import React from 'react';
import { IntegrationSettings, AISettings, IntegrationService, IntegrationStatus, OAuthServiceType } from '../../types';
import { SpinnerIcon, LinkIcon, ZapIcon, PowerIcon, CheckCircleIcon, AlertCircleIcon, SettingsIcon, InfoIcon, RefreshCwIcon, TestTubeIcon, BriefcaseIcon, MessageCircleIcon } from '../icons'; // Added new icons

interface IntegrationsViewProps {
  integrationSettings: IntegrationSettings;
  aiSettings: AISettings;
  onIntegrationAction: (service: IntegrationService, action: 'connect' | 'disconnect') => void;
  onToggleAISetting: (setting: keyof AISettings) => void;
  isLoading: boolean;
  onSyncNow: () => void;
}

const IntegrationsView: React.FC<IntegrationsViewProps> = ({
  integrationSettings,
  aiSettings,
  onIntegrationAction,
  onToggleAISetting,
  isLoading,
  onSyncNow,
}) => {

  const getServiceIcon = (serviceKey: IntegrationService): React.ReactNode => {
    switch(serviceKey) {
        case 'quickbooks': return <LinkIcon className="w-6 h-6" />; // Replace with actual QuickBooks icon if available
        case 'stripe': return <LinkIcon className="w-6 h-6" />; // Replace with actual Stripe icon
        case 'zapier': return <ZapIcon className="w-6 h-6" />;
        case 'hubspot': return <BriefcaseIcon className="w-6 h-6" />; // Generic business icon
        case 'xero': return <LinkIcon className="w-6 h-6" />; // Generic link icon
        case 'gmail': return <MessageCircleIcon className="w-6 h-6" />; // Generic message icon
        case 'whatsapp': return <MessageCircleIcon className="w-6 h-6" />; // Generic message icon
        default: return <LinkIcon className="w-6 h-6" />;
    }
  }

  const IntegrationCard: React.FC<{
    serviceName: string;
    serviceKey: IntegrationService;
    status: IntegrationStatus;
    description: string;
  }> = ({ serviceName, serviceKey, status, description }) => (
    <div className="bg-[#214a3c] p-4 rounded-lg flex items-center justify-between border border-[#2f6a55]">
      <div className="flex items-center">
        <span className="text-[#019863] mr-3">{getServiceIcon(serviceKey)}</span>
        <div>
          <h4 className="text-md font-semibold text-white">{serviceName}</h4>
          <p className="text-xs text-[#b2dfdb]">{description}</p>
          {status !== 'coming_soon' && (
            <p className={`text-xs font-medium mt-0.5 ${status === 'connected' ? 'text-green-400' : 'text-yellow-400'}`}>
              Status: {status.charAt(0).toUpperCase() + status.slice(1)}
              {status === 'connected' && <CheckCircleIcon className="w-3 h-3 inline ml-1" />}
              {status === 'disconnected' && <AlertCircleIcon className="w-3 h-3 inline ml-1" />}
            </p>
          )}
           {status === 'coming_soon' && (
             <p className="text-xs font-medium mt-0.5 text-sky-400">
                Status: Coming Soon <InfoIcon className="w-3 h-3 inline ml-1" />
            </p>
           )}
        </div>
      </div>
      {status !== 'coming_soon' && (
        <button
          onClick={() => onIntegrationAction(serviceKey, status === 'connected' ? 'disconnect' : 'connect')}
          disabled={isLoading}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors disabled:opacity-60
                      ${status === 'connected' 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'}`}
        >
          {isLoading && <SpinnerIcon className="w-4 h-4 inline mr-1 animate-spin" />}
          {status === 'connected' ? 'Disconnect' : 'Connect'}
        </button>
      )}
       {status === 'coming_soon' && (
         <span className="px-3 py-1.5 text-xs font-semibold rounded-md bg-gray-600 text-gray-300 cursor-not-allowed">
            Notify Me
        </span>
       )}
    </div>
  );

  const AISettingToggle: React.FC<{
    label: string;
    settingKey: keyof AISettings;
    currentValue: boolean;
    description?: string;
  }> = ({ label, settingKey, currentValue, description }) => (
    <div className="bg-[#214a3c] p-4 rounded-lg flex items-center justify-between border border-[#2f6a55]">
      <div>
        <h4 className="text-md font-semibold text-white">{label}</h4>
        {description && <p className="text-xs text-[#b2dfdb] mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onToggleAISetting(settingKey)}
        disabled={isLoading}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#17352b] focus:ring-[#019863]
                    ${currentValue ? 'bg-[#019863]' : 'bg-[#506a61]'}`}
        role="switch"
        aria-checked={currentValue}
      >
        <span className="sr-only">Toggle {label}</span>
        <span
          className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform
                      ${currentValue ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
    </div>
  );

  const integrationServices: {name: string, key: IntegrationService, description: string}[] = [
    { name: "QuickBooks", key: "quickbooks", description: "Sync invoices, payments, customers, and balances."},
    { name: "Stripe", key: "stripe", description: "Real-time payment status, transaction history, and receipts."},
    { name: "Zapier", key: "zapier", description: "Custom automations with 6,000+ apps using API key."},
    { name: "HubSpot", key: "hubspot", description: "Sync client data and communication for better CRM."},
    { name: "Xero", key: "xero", description: "Alternative accounting sync for invoices and contacts."},
    { name: "Gmail", key: "gmail", description: "Draft emails or log communications related to matters."},
    { name: "WhatsApp API", key: "whatsapp", description: "Send automated reminders or notifications (requires setup)." },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">External Service Integrations</h3>
        <p className="text-sm text-[#b2dfdb] mb-4">
          Connect LexiBill AI with your favorite tools. Connection flows are simulated.
        </p>
        <div className="space-y-3">
          {integrationServices.map(service => (
             <IntegrationCard
                key={service.key}
                serviceName={service.name}
                serviceKey={service.key}
                status={integrationSettings[`${service.key}Status` as keyof IntegrationSettings]}
                description={service.description}
            />
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[#2f6a55]">
         <h3 className="text-lg font-semibold text-white mb-3">Data Sync & Testing</h3>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
                onClick={onSyncNow}
                disabled={isLoading}
                className="flex items-center justify-center p-3 bg-[#2a5c4a] text-white rounded-lg hover:bg-[#316d58] transition-colors disabled:opacity-50"
            >
                <RefreshCwIcon className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`}/> Sync All Data Now (Stubbed)
            </button>
             <button
                onClick={() => alert("Integration Test Area: This feature will allow you to simulate workflows and test connections. (Coming Soon)")}
                disabled={isLoading}
                className="flex items-center justify-center p-3 bg-[#2a5c4a] text-white rounded-lg hover:bg-[#316d58] transition-colors disabled:opacity-50"
            >
                <TestTubeIcon className="w-5 h-5 mr-2"/> Open Test Area (Stubbed)
            </button>
         </div>
      </div>


      <div className="mt-6 pt-4 border-t border-[#2f6a55]">
        <h3 className="text-lg font-semibold text-white mb-3">AI Feature Settings</h3>
        <p className="text-sm text-[#b2dfdb] mb-4">
          Customize how AI assists you in LexiBill AI. Settings are saved locally.
        </p>
        <div className="space-y-3">
          <AISettingToggle
            label="Enable Predictive Churn Alerts"
            settingKey="enablePredictiveChurn"
            currentValue={aiSettings.enablePredictiveChurn}
            description="AI analyzes client patterns to flag potential churn risks."
          />
          <AISettingToggle
            label="Enable Smart Email Reminders"
            settingKey="enableSmartChase"
            currentValue={aiSettings.enableSmartChase}
            description="Allow AI to draft reminder emails for overdue invoices."
          />
          <AISettingToggle
            label="Enable AI Insights in Dashboards"
            settingKey="enableAIInsightsDashboard"
            currentValue={aiSettings.enableAIInsightsDashboard}
            description="Show AI-driven summaries and suggestions on your dashboard."
          />
           <AISettingToggle
            label="AI Narrative Generation"
            settingKey="enableNarrativeGeneration"
            currentValue={aiSettings.enableNarrativeGeneration}
            description="Use AI to automatically draft billing narratives from task summaries."
          />
          <AISettingToggle
            label="AI Time Estimation (Experimental)"
            settingKey="enableTimeEstimation"
            currentValue={aiSettings.enableTimeEstimation}
            description="Get AI-powered time estimates for new tasks (based on mock data)."
          />
        </div>
      </div>
      <p className="text-xs text-center text-[#8ecdb7] pt-4">
        All integration and AI settings are stored locally in your browser.
      </p>
    </div>
  );
};

export default IntegrationsView;