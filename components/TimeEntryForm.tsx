
import React, { useState, useEffect, useMemo } from 'react';
import { Client, Matter, TimeEntry, TimeEntryFormSubmitData } from '../types';
import { SpinnerIcon } from './icons';

interface TimeEntryFormProps {
  clients: Client[];
  matters: Matter[];
  onSubmit: (formData: TimeEntryFormSubmitData) => void;
  isLoading: boolean;
  initialEntry?: Partial<Omit<TimeEntry, 'id' | 'billingNarrative' | 'isBilled'>>; // For editing later
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ clients, matters, onSubmit, isLoading, initialEntry }) => {
  const [selectedClientID, setSelectedClientID] = useState<string>(initialEntry?.clientID || '');
  const [matterInputText, setMatterInputText] = useState<string>(''); // User's text input for matter
  
  const [date, setDate] = useState<string>(initialEntry?.date ? initialEntry.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [taskSummary, setTaskSummary] = useState<string>(initialEntry?.taskSummary || '');
  const [duration, setDuration] = useState<string>(initialEntry?.duration?.toString() || '');
  const [rate, setRate] = useState<string>(initialEntry?.rate?.toString() || '');
  const [notes, setNotes] = useState<string>(initialEntry?.notes || '');

  const availableMattersForClient = useMemo(() => {
    return selectedClientID ? matters.filter(m => m.clientID === selectedClientID) : [];
  }, [selectedClientID, matters]);

  // Effect for initializing matterInputText if initialEntry and selectedClientID are present
  useEffect(() => {
    if (initialEntry?.matterID && selectedClientID) {
        const initialMatter = matters.find(m => m.id === initialEntry.matterID && m.clientID === selectedClientID);
        if (initialMatter) {
            setMatterInputText(initialMatter.name);
        }
    }
  }, [initialEntry, selectedClientID, matters]);


  // Effect for handling client changes and calculating rate
  useEffect(() => {
    const currentClient = clients.find(c => c.id === selectedClientID);
    let calculatedRateValue: number | undefined = undefined;

    if (currentClient) {
      const existingMatter = availableMattersForClient.find(
        m => m.name.toLowerCase() === matterInputText.trim().toLowerCase()
      );

      if (existingMatter) {
        calculatedRateValue = existingMatter.specificRate ?? currentClient.defaultRate;
      } else if (matterInputText.trim() !== '') { // New matter scenario
        calculatedRateValue = currentClient.defaultRate;
      } else { // No matter text, or client just selected
        calculatedRateValue = currentClient.defaultRate;
      }
    }
    
    // Only update rate if a calculated rate is found or if client is cleared
    // This allows manual input to persist unless client/matter changes provide a new default.
    if (calculatedRateValue !== undefined) {
      setRate(calculatedRateValue.toString());
    } else if (!selectedClientID) { // Clear rate if no client is selected
      setRate('');
    }
    // If initialEntry is present and has a rate, it's handled by useState initial value.
    // This effect primarily handles dynamic changes based on client/matter selection/typing.

  }, [selectedClientID, matterInputText, clients, availableMattersForClient, initialEntry?.rate]); // Removed initialEntry from main deps, added initialEntry.rate for specific case


  // Reset matter input when client changes
  useEffect(() => {
    setMatterInputText('');
    // Rate will be re-calculated by the above useEffect
  }, [selectedClientID]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientID || !matterInputText.trim() || !date || !taskSummary || !duration || !rate) {
      alert('Please fill in all required fields: Client, Matter, Date, Task Summary, Duration, and Rate.');
      return;
    }
    const entryDate = new Date(date + "T00:00:00");

    const existingMatter = availableMattersForClient.find(
      m => m.name.toLowerCase() === matterInputText.trim().toLowerCase()
    );

    const submissionData: TimeEntryFormSubmitData = {
      clientID: selectedClientID,
      date: entryDate,
      taskSummary,
      duration: parseFloat(duration),
      rate: parseFloat(rate),
      notes,
    };

    if (existingMatter) {
      submissionData.matterID = existingMatter.id;
    } else {
      submissionData.newMatterName = matterInputText.trim();
    }

    onSubmit(submissionData);
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
            onChange={(e) => setSelectedClientID(e.target.value)}
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
          <label htmlFor="matter" className={commonLabelClasses}>Matter (Type new or select existing) *</label>
          <input
            type="text"
            id="matter"
            list="matters-datalist"
            value={matterInputText}
            onChange={(e) => setMatterInputText(e.target.value)}
            className={commonInputClasses}
            placeholder={selectedClientID ? "Type or select matter" : "Select client first"}
            disabled={!selectedClientID}
            required
          />
          <datalist id="matters-datalist">
            {availableMattersForClient.map(matter => (
              <option key={matter.id} value={matter.name} />
            ))}
          </datalist>
           {!selectedClientID && <p className="text-xs text-[#8ecdb7] mt-1">Please select a client first.</p>}
           {selectedClientID && availableMattersForClient.length === 0 && matterInputText === '' && <p className="text-xs text-[#8ecdb7] mt-1">No existing matters for this client. Type to create a new one.</p>}
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