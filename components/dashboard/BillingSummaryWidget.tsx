import React from 'react';
import DashboardCard from './DashboardCard';
import { BillingSummary } from '../../types';
import { BillIcon } from '../icons'; // Changed from ReceiptIcon

interface BillingSummaryWidgetProps {
  summary: BillingSummary;
}

const BillingSummaryWidget: React.FC<BillingSummaryWidgetProps> = ({ summary }) => {
  const formatCurrency = (amount: number) => `R ${amount.toFixed(2)}`;
  const formatHours = (hours: number) => `${hours.toFixed(1)} hr${hours !== 1 ? 's' : ''}`;

  return (
    <DashboardCard title="Billing Summary" titleIcon={<BillIcon className="w-5 h-5" />}>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-[#8ecdb7]">This Week</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(summary.weeklyTotalAmount)}</p>
          <p className="text-sm text-[#b2dfdb]">{formatHours(summary.weeklyTotalHours)}</p>
        </div>
        <div className="pt-2 border-t border-[#2f6a55]">
          <p className="text-sm text-[#8ecdb7]">This Month</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(summary.monthlyTotalAmount)}</p>
          <p className="text-sm text-[#b2dfdb]">{formatHours(summary.monthlyTotalHours)}</p>
        </div>
      </div>
    </DashboardCard>
  );
};

export default BillingSummaryWidget;