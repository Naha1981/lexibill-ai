
import React from 'react';
import { DashboardSnapshotData, OutstandingInvoice, RiskAlert, CollectionTarget, OverdueInvoiceForChase } from '../../types';
import { BillIcon, AlertCircleIcon, ExternalLinkIcon, ClockIcon, MailIcon } from '../icons'; 

interface DashboardSnapshotViewProps {
  snapshotData: DashboardSnapshotData;
  onInitiateSmartChase: (invoice: OverdueInvoiceForChase) => void;
}

const DashboardCard: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string; actionButton?: React.ReactNode }> = ({ title, icon, children, className, actionButton }) => (
  <div className={`bg-[#17352b] p-4 sm:p-5 rounded-xl shadow-lg border border-[#2f6a55] flex flex-col ${className}`}>
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center">
        {icon && <span className="mr-2 text-[#019863]">{icon}</span>}
        <h3 className="text-md font-semibold text-white">{title}</h3>
      </div>
      {actionButton}
    </div>
    <div className="flex-grow"> {/* Ensure children take up available space */}
        {children}
    </div>
  </div>
);

const formatDate = (date: Date): string => new Date(date).toLocaleDateString('en-CA');
const formatCurrency = (amount: number): string => `R ${amount.toFixed(2)}`;

const DashboardSnapshotView: React.FC<DashboardSnapshotViewProps> = ({ snapshotData, onInitiateSmartChase }) => {
  const overdueInvoicesForChase = snapshotData.outstandingInvoices.filter(inv => inv.daysOverdue > 13); // Example: 14+ days overdue

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Dashboard Snapshot</h2>
        <p className="text-sm text-[#b2dfdb] mt-1 sm:mt-0">Overview of your billing health. Data is currently mocked.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <DashboardCard 
          title="Outstanding Invoices" 
          icon={<BillIcon className="w-5 h-5" />}
          actionButton={overdueInvoicesForChase.length > 0 ? (
            <button 
                onClick={() => onInitiateSmartChase(overdueInvoicesForChase[0])} // Example: opens modal for the first one
                className="text-xs bg-[#017a50] text-white py-1 px-2 rounded-md hover:bg-[#019863] flex items-center"
                title="Open Smart Chase for overdue invoices"
            >
                <MailIcon className="w-3 h-3 mr-1"/> Smart Chase
            </button>
          ) : undefined}
        >
          {snapshotData.outstandingInvoices.length === 0 ? (
            <p className="text-sm text-[#8ecdb7] flex items-center justify-center h-full">No outstanding invoices. Great!</p>
          ) : (
            <ul className="space-y-2 text-xs max-h-60 overflow-y-auto chat-scrollbar pr-1">
              {snapshotData.outstandingInvoices.map(inv => (
                <li key={inv.id} className="p-2 bg-[#214a3c] rounded-md hover:bg-[#2a5c4a] cursor-pointer" onClick={() => { if (inv.daysOverdue > 13) onInitiateSmartChase(inv); else alert(`Invoice ${inv.invoiceNumber} for ${inv.clientName} is not yet eligible for Smart Chase (due in ${-inv.daysOverdue} days).`); }}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-white truncate max-w-[120px] sm:max-w-[150px]" title={inv.clientName}>{inv.clientName}</span>
                    <span className={`font-semibold ${inv.daysOverdue > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {formatCurrency(inv.amountDue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[#b2dfdb] mt-0.5">
                    <span>Due: {formatDate(inv.dueDate)}</span>
                    {inv.daysOverdue > 0 && <span className="text-red-300">Overdue: {inv.daysOverdue} days</span>}
                    {inv.daysOverdue <= 0 && <span>Due in: {-inv.daysOverdue} days</span>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard title="⚠️ Risk Alerts" icon={<AlertCircleIcon className="w-5 h-5 text-yellow-400" />}>
          {snapshotData.riskAlerts.length === 0 ? (
            <p className="text-sm text-[#8ecdb7] flex items-center justify-center h-full">No immediate risk alerts.</p>
          ) : (
            <ul className="space-y-2 text-xs max-h-60 overflow-y-auto chat-scrollbar pr-1">
              {snapshotData.riskAlerts.map(alert => (
                <li key={alert.id} className="p-2 bg-[#2c5045] rounded-md">
                  <p className="font-medium text-yellow-300">{alert.clientName}</p>
                  <p className="text-yellow-100 opacity-90">{alert.riskDescription}</p>
                  {alert.suggestedAction && <p className="text-xs text-yellow-200 opacity-75 mt-0.5">Suggest: {alert.suggestedAction}</p>}
                </li>
              ))}
            </ul>
          )}
        </DashboardCard>

        <DashboardCard title="Collection Targets" icon={<ClockIcon className="w-5 h-5" />}>
         <div className="space-y-3 pt-1"> {/* Added pt-1 for slight alignment with other cards' content start */}
            {snapshotData.collectionTargets.map(target => (
              <div key={target.month} className="text-xs">
                <p className="font-medium text-white mb-0.5">{target.month}</p>
                <div className="w-full bg-[#214a3c] rounded-full h-2.5 my-1">
                  <div 
                    className="bg-[#019863] h-2.5 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${Math.min((target.collectedAmount / target.targetAmount) * 100, 100)}%` }}
                    aria-valuenow={(target.collectedAmount / target.targetAmount) * 100}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    role="progressbar"
                    aria-label={`${target.month} collection progress`}
                  ></div>
                </div>
                <div className="flex justify-between text-[#b2dfdb] mt-1">
                    <span>Collected: {formatCurrency(target.collectedAmount)}</span>
                    <span>Target: {formatCurrency(target.targetAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
      <p className="text-xs text-center text-[#8ecdb7] pt-2">
        <ExternalLinkIcon className="w-3 h-3 inline mr-1" />
        This dashboard will integrate with QuickBooks & CRM for live data in future versions.
      </p>
    </section>
  );
};

export default DashboardSnapshotView;
