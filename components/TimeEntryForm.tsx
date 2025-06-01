
import React, { useState, useEffect, useMemo } from 'react';
import { Client, Matter, TimeEntry } from '../types';
import { SpinnerIcon } from './icons';

interface TimeEntryFormProps {
  clients: Client[];
  matters: Matter[];
  onSubmit: (formData: Omit<TimeEntry, 'id' | 'billingNarrative' | 'isBilled'>) => void;
  isLoading: boolean;
  initialEntry?: Partial<Omit<TimeEntry, 'id' | 'billingNarrative' | 'isBilled'>>; // For editing later
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ clients, matters, onSubmit, isLoading, initialEntry }) => {
  const [selectedClientID, setSelectedClientID] = useState<string>(initialEntry?.clientID || '');
  const [selectedMatterID, setSelectedMatterID] = useState<string>(initialEntry?.matterID || '');
  const [date, setDate] = useState<string>(initialEntry?.date ? initialEntry.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [taskSummary, setTaskSummary] = useState<string>(initialEntry?.taskSummary || '');
  const [duration, setDuration] = useState<string>(initialEntry?.duration?.toString() || '');
  const [rate, setRate] = useState<string>(initialEntry?.rate?.toString() || '');
  const [notes, setNotes] = useState<string>(initialEntry?.notes || '');

  const availableMatters = useMemo(() => {
    return selectedClientID ? matters.filter(m => m.clientID === selectedClientID) : [];
  }, [selectedClientID, matters]);

  useEffect(() => {
    if (selectedClientID) {
      const client = clients.find(c => c.id === selectedClientID);
      const matter = availableMatters.find(m => m.id === selectedMatterID);
      const calculatedRate = matter?.specificRate || client?.defaultRate;
      setRate(calculatedRate ? calculatedRate.toString() : '');
    } else {
      setRate('');
    }
    // If client changes, reset matter if current matter doesn't belong to new client
    if (selectedClientID && selectedMatterID && !availableMatters.find(m => m.id === selectedMatterID)) {
        setSelectedMatterID('');
    }
  }, [selectedClientID, selectedMatterID, clients, availableMatters]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientID || !selectedMatterID || !date || !taskSummary || !duration || !rate) {
      alert('Please fill in all required fields: Client, Matter, Date, Task Summary, Duration, and Rate.');
      return;
    }
    const entryDate = new Date(date + "T00:00:00"); // Ensure date is parsed correctly, avoid timezone issues by setting time.

    onSubmit({
      clientID: selectedClientID,
      matterID: selectedMatterID,
      date: entryDate,
      taskSummary,
      duration: parseFloat(duration),
      rate: parseFloat(rate),
      notes,
    });
    // Optionally reset form fields here, or parent component handles it
    // setTaskSummary(''); setDuration(''); setNotes(''); // Don't reset client/matter/date for quick successive entries
  };
  
  const commonInputClasses = "form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#019863] border border-[#2f6a55] bg-[#214a3c] h-11 placeholder:text-[#8ecdb7] px-3 text-base font-normal leading-normal";
  const commonLabelClasses = "block text-sm font-medium text-[#8ecdb7] mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="client" className={commonLabelClasses}>Client *</label>
          <select
            id="client"
            value={selectedClientID}
            onChange={(e) => { setSelectedClientID(e.target.value); setSelectedMatterID('');}} // Reset matter when client changes
            className={commonInputClasses}
            required
          >
            <option value="" disabled>Select a client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="matter" className={commonLabelClasses}>Matter *</label>
          <select
            id="matter"
            value={selectedMatterID}
            onChange={(e) => setSelectedMatterID(e.target.value)}
            className={commonInputClasses}
            disabled={!selectedClientID || availableMatters.length === 0}
            required
          >
            <option value="" disabled>Select a matter</option>
            {availableMatters.map(matter => (
              <option key={matter.id} value={matter.id}>{matter.name}</option>
            ))}
          </select>
           {!selectedClientID && <p className="text-xs text-[#8ecdb7] mt-1">Please select a client first.</p>}
           {selectedClientID && availableMatters.length === 0 && <p className="text-xs text-[#8ecdb7] mt-1">No matters found for this client. Add one first.</p>}
        </div>
      </div>

      <div>
        <label htmlFor="date" className={commonLabelClasses}>Date *</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={commonInputClasses}
          required
        />
      </div>

      <div>
        <label htmlFor="taskSummary" className={commonLabelClasses}>Task Summary *</label>
        <textarea
          id="taskSummary"
          value={taskSummary}
          onChange={(e) => setTaskSummary(e.target.value)}
          className={`${commonInputClasses} h-24`}
          placeholder="Briefly describe the work done (e.g., Drafted response to disciplinary hearing notice)..."
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="duration" className={commonLabelClasses}>Time Spent (hours) *</label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className={commonInputClasses}
            placeholder="e.g., 1.5"
            step="0.1"
            min="0.1"
            required
          />
        </div>
        <div>
          <label htmlFor="rate" className={commonLabelClasses}>Rate (ZAR/hour) *</label>
          <input
            type="number"
            id="rate"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className={commonInputClasses}
            placeholder="e.g., 2500"
            step="0.01"
            min="0"
            required
            readOnly={!!(clients.find(c=>c.id === selectedClientID)?.defaultRate || matters.find(m=>m.id === selectedMatterID)?.specificRate)} // Make read-only if pre-filled
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className={commonLabelClasses}>Internal Notes (Optional)</label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={`${commonInputClasses} h-20`}
          placeholder="Any internal notes for this time entry..."
          rows={2}
        />
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="flex items-center justify-center min-w-[120px] cursor-pointer rounded-xl h-11 px-5 bg-[#019863] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#017a50] disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? <SpinnerIcon className="w-5 h-5" /> : 'Generate Billing Narrative'}
        </button>
      </div>
    </form>
  );
};

export default TimeEntryForm;
