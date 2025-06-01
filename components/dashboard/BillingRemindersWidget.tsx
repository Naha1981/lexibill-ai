import React from 'react';
import DashboardCard from './DashboardCard';
import { BillingReminder } from '../../types';
import { NotificationsActiveIcon } from '../icons'; // Changed from AlertTriangleIcon

interface BillingRemindersWidgetProps {
  reminders: BillingReminder[];
}

const BillingRemindersWidget: React.FC<BillingRemindersWidgetProps> = ({ reminders }) => {
  return (
    <DashboardCard title="Billing Reminders" className="lg:col-span-2" titleIcon={<NotificationsActiveIcon className="w-5 h-5 text-yellow-400" />}>
      {reminders.length === 0 ? (
        <p className="text-[#8ecdb7]">No urgent billing reminders. Great job!</p>
      ) : (
        <ul className="space-y-2 max-h-60 overflow-y-auto chat-scrollbar pr-2">
          {reminders.map((reminder) => (
            <li key={reminder.id} className="p-2 bg-[#2c5045] rounded-md flex items-start">
              <NotificationsActiveIcon className="w-4 h-4 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-white">{reminder.message}</p>
                {reminder.date && (
                    <p className="text-xs text-yellow-200 opacity-75">
                        {reminder.type === 'unbilled_entry_old' ? 'Entry Date: ' : 'Last Activity: '}
                        {new Date(reminder.date).toLocaleDateString('en-CA')}
                    </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </DashboardCard>
  );
};

export default BillingRemindersWidget;