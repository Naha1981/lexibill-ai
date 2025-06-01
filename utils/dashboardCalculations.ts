
import { TimeEntry, Matter, Client, BillingSummary, BilledUnbilledDataPoint, TopMatterData, RevenueDataPoint, RecentEntryDisplayData, BillingReminder, ReminderType } from '../types';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const calculateBillingSummaries = (timeEntries: TimeEntry[]): BillingSummary => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Weekly: Monday is 1, Sunday is 0. Adjust to Mon (0) - Sun (6)
  const dayOfWeek = (now.getDay() + 6) % 7; 
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  let weeklyTotalAmount = 0;
  let weeklyTotalHours = 0;
  let monthlyTotalAmount = 0;
  let monthlyTotalHours = 0;

  timeEntries.forEach(entry => {
    const entryDate = new Date(entry.date);
    const amount = entry.duration * entry.rate;

    // Monthly
    if (entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear) {
      monthlyTotalAmount += amount;
      monthlyTotalHours += entry.duration;
    }

    // Weekly
    if (entryDate >= startOfWeek && entryDate <= endOfWeek) {
      weeklyTotalAmount += amount;
      weeklyTotalHours += entry.duration;
    }
  });

  return { weeklyTotalAmount, monthlyTotalAmount, weeklyTotalHours, monthlyTotalHours };
};

export const getBilledVsUnbilledData = (timeEntries: TimeEntry[]): BilledUnbilledDataPoint[] => {
  let billedHours = 0;
  let unbilledHours = 0;

  timeEntries.forEach(entry => {
    if (entry.isBilled) {
      billedHours += entry.duration;
    } else {
      unbilledHours += entry.duration;
    }
  });

  return [
    { name: 'Billed', value: billedHours, fill: '#019863' }, // Green
    { name: 'Unbilled', value: unbilledHours, fill: '#ff8c00' }, // Orange
  ];
};

export const getTopActiveMatters = (timeEntries: TimeEntry[], matters: Matter[], clients: Client[], count: number = 5): TopMatterData[] => {
  const matterStats: { [matterId: string]: { totalHours: number, totalAmount: number } } = {};

  timeEntries.forEach(entry => {
    if (!matterStats[entry.matterID]) {
      matterStats[entry.matterID] = { totalHours: 0, totalAmount: 0 };
    }
    matterStats[entry.matterID].totalHours += entry.duration;
    matterStats[entry.matterID].totalAmount += entry.duration * entry.rate;
  });

  const sortedMatters = Object.keys(matterStats)
    .map(matterId => {
      const matter = matters.find(m => m.id === matterId);
      if (!matter) return null;
      const client = clients.find(c => c.id === matter.clientID);
      return {
        id: matter.id,
        name: matter.name,
        clientName: client?.name || 'Unknown Client',
        totalHours: matterStats[matterId].totalHours,
        totalAmount: matterStats[matterId].totalAmount,
      };
    })
    .filter(m => m !== null) as TopMatterData[];

  return sortedMatters.sort((a, b) => b.totalHours - a.totalHours).slice(0, count);
};

export const getRevenueTrendData = (timeEntries: TimeEntry[], monthsCount: number = 6): RevenueDataPoint[] => {
  const now = new Date();
  const revenueByMonth: { [monthKey: string]: number } = {}; // "YYYY-MM" -> revenue
  const monthLabels: { [monthKey: string]: string } = {}; // "YYYY-MM" -> "Mon 'YY"

  // Initialize last monthsCount months
  for (let i = 0; i < monthsCount; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    revenueByMonth[monthKey] = 0;
    monthLabels[monthKey] = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
  
  timeEntries.forEach(entry => {
    if (entry.isBilled) { // Only count billed entries towards revenue
      const entryDate = new Date(entry.date);
      const year = entryDate.getFullYear();
      const month = entryDate.getMonth();
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

      if (revenueByMonth.hasOwnProperty(monthKey)) {
        revenueByMonth[monthKey] += entry.duration * entry.rate;
      }
    }
  });
  
  return Object.keys(revenueByMonth)
    .map(monthKey => ({
      month: monthLabels[monthKey],
      revenue: revenueByMonth[monthKey],
    }))
    .sort((a,b) => { // Sort by date, ensuring correct order for chart
        const [aMon, aYear] = a.month.split(" '");
        const [bMon, bYear] = b.month.split(" '");
        const dateA = new Date(`${aMon} 1, 20${aYear}`);
        const dateB = new Date(`${bMon} 1, 20${bYear}`);
        return dateA.getTime() - dateB.getTime();
    });
};


export const getRecentTimeEntriesList = (timeEntries: TimeEntry[], matters: Matter[], clients: Client[], count: number = 5): RecentEntryDisplayData[] => {
  return timeEntries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, count)
    .map(entry => {
      const matter = matters.find(m => m.id === entry.matterID);
      const client = clients.find(c => c.id === entry.clientID);
      return {
        id: entry.id,
        date: new Date(entry.date).toLocaleDateString('en-CA'),
        summary: entry.taskSummary.length > 50 ? entry.taskSummary.substring(0, 47) + '...' : entry.taskSummary,
        duration: entry.duration,
        matterName: matter?.name || 'Unknown Matter',
        clientName: client?.name || 'Unknown Client',
        amount: entry.duration * entry.rate,
      };
    });
};

export const getBillingReminders = (timeEntries: TimeEntry[], matters: Matter[], clients: Client[]): BillingReminder[] => {
  const reminders: BillingReminder[] = [];
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * MS_PER_DAY);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * MS_PER_DAY);

  // Reminder 1: Unbilled entries older than 30 days
  timeEntries.forEach(entry => {
    if (!entry.isBilled && new Date(entry.date) < thirtyDaysAgo) {
      const client = clients.find(c => c.id === entry.clientID);
      const matter = matters.find(m => m.id === entry.matterID);
      reminders.push({
        id: `entry-${entry.id}-old`,
        type: 'unbilled_entry_old',
        message: `Unbilled entry from ${new Date(entry.date).toLocaleDateString('en-CA')} for ${matter?.name || 'Unknown Matter'} (${client?.name || 'Unknown Client'}) is over 30 days old.`,
        relatedId: entry.id,
        date: new Date(entry.date),
      });
    }
  });

  // Reminder 2: Active matters with unbilled time and no recent activity
  const matterLastActivity: { [matterId: string]: Date } = {};
  const matterHasUnbilled: { [matterId: string]: boolean } = {};

  timeEntries.forEach(entry => {
    const entryDate = new Date(entry.date);
    if (!matterLastActivity[entry.matterID] || entryDate > matterLastActivity[entry.matterID]) {
      matterLastActivity[entry.matterID] = entryDate;
    }
    if (!entry.isBilled) {
      matterHasUnbilled[entry.matterID] = true;
    }
  });

  matters.forEach(matter => {
    if (matterHasUnbilled[matter.id] && (!matterLastActivity[matter.id] || matterLastActivity[matter.id] < fourteenDaysAgo)) {
       const client = clients.find(c => c.id === matter.clientID);
      reminders.push({
        id: `matter-${matter.id}-stale`,
        type: 'matter_stale_unbilled',
        message: `Matter "${matter.name}" (${client?.name || 'Unknown Client'}) has unbilled time and no new entries in the last 14 days.`,
        relatedId: matter.id,
        date: matterLastActivity[matter.id] || undefined, // Use last activity date for sorting if available
      });
    }
  });
  
  // Sort reminders, most recent (for entries) or most stale (for matters) first
  return reminders.sort((a, b) => {
    const dateA = a.date || new Date(0); // Default old date if none
    const dateB = b.date || new Date(0);
    if (a.type === b.type) {
        return a.type.includes('entry') ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    }
    return (a.type.localeCompare(b.type)); // Group by type
  });
};
