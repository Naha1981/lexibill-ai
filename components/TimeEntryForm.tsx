import React, { useState, useEffect, useMemo } from 'react';
import { Client, Matter, TimeEntry, TimeEntryFormSubmitData } from '../types';
import { SpinnerIcon } from './icons';

interface TimeEntryFormProps {
  clients: Client[];
  matters: Matter[];
  onSubmit: (formData: TimeEntryFormSubmitData) => void;
  isLoading: boolean;
  initialEntry?: Partial<Omit<TimeEntry, 'id' | 'billingNarrative' | 'isBilled'>>;
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ clients, matters, onSubmit, isLoading, initialEntry }) => {
  const [clientInputText, setClientInputText] = useState<string>('');
  const [matterInputText, setMatterInputText] = useState<string>('');
  
  const [date, setDate] = useState<string>(initialEntry?.date ? initialEntry.date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [taskSummary, setTaskSummary] = useState<string>(initialEntry?.taskSummary || '');
  const [duration, setDuration] = useState<string>(initialEntry?.duration?.toString() || '');
  const [rate, setRate] = useState<string>(initialEntry?.rate?.toString() || '');
  const [notes, setNotes] = useState<string>(initialEntry?.notes || '');

  const identifiedClient = useMemo(() => {
    return clients.find(c => c.name.toLowerCase() === clientInputText.trim().toLowerCase());
  }, [clientInputText, clients]);

  const availableMattersForClient = useMemo(() => {
    // Only provide matters if a client is identified. Otherwise, it's an empty list.
    return identifiedClient ? matters.filter(m => m.clientID === identifiedClient.id) : [];
  }, [identifiedClient, matters]);

  useEffect(() => {
    if (initialEntry?.clientID) {
        const initialClient = clients.find(c => c.id === initialEntry.clientID);
        if (initialClient) {
            setClientInputText(initialClient.name);
            if (initialEntry.matterID) {
                const initialMatter = matters.find(m => m.id === initialEntry.matterID && m.clientID === initialClient.id);
                if (initialMatter) {
                    setMatterInputText(initialMatter.name);
                }
            }
        }
    }
  }, [initialEntry, clients, matters]);


  useEffect(() => {
    let calculatedRateValue: number | undefined = undefined;

    if (identifiedClient) {
      const existingMatter = availableMattersForClient.find(
        m => m.name.toLowerCase() === matterInputText.trim().toLowerCase()
      );

      if (existingMatter) {
        calculatedRateValue = existingMatter.specificRate ?? identifiedClient.defaultRate;
      } else if (matterInputText.trim() !== '') { // New matter scenario for existing client
        calculatedRateValue = identifiedClient.defaultRate;
      } else { // Client identified, no matter text yet
        calculatedRateValue = identifiedClient.defaultRate;
      }
    } else if (clientInputText.trim() !== '') {
        // New client, rate should be manually entered or cleared
        // but don't clear if user is typing rate themselves.
        // Only clear if a previous default was set.
        if (parseFloat(rate) > 0 && !initialEntry?.rate) { // Avoid clearing if initialEntry had a rate
          // setRate(''); // Decided against auto-clearing here, can be confusing. Let manual input prevail.
        }
    }
    
    if (calculatedRateValue !== undefined) {
      setRate(calculatedRateValue.toString());
    } else if (!clientInputText.trim()) {
       // If client input is cleared, and no initial rate, clear the rate.
      if (!initialEntry?.rate) setRate('');
    }

  }, [clientInputText, matterInputText, identifiedClient, availableMattersForClient, initialEntry?.rate, rate]);


  useEffect(() => {
    // When client input changes, clear matter input and allow rate to be recalculated.
    // This prevents stale matter suggestions if client is changed after a matter was typed/selected.
    setMatterInputText('');
    // Rate recalculation is handled by the effect above based on the new clientInputText.
  }, [clientInputText]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientInputText.trim() || !matterInputText.trim() || !date || !taskSummary || !duration || !rate) {
      alert('Please fill in all required fields: Client, Matter, Date, Task Summary, Duration, and Rate.');
      return;
    }
    const entryDate = new Date(date + "T00:00:00"); // Ensure date is set to midnight in local timezone

    const submissionData: TimeEntryFormSubmitData = {
      date: entryDate,
      taskSummary,
      duration: parseFloat(duration),
      rate: parseFloat(rate),
      notes,
    };

    if (identifiedClient) {
      submissionData.clientID = identifiedClient.id;
    } else {
      submissionData.newClientName = clientInputText.trim();
    }

    const existingMatter = availableMattersForClient.find(
      m => m.name.toLowerCase() === matterInputText.trim().toLowerCase()
    );

    if (existingMatter && identifiedClient) { // Ensure matter belongs to identified client
      submissionData.matterID = existingMatter.id;
    } else {
      submissionData.newMatterName = matterInputText.trim();
    }
    
    // Prevent submitting newMatterName if client is also new AND matter is typed
    // but no existing matter could be found (because availableMattersForClient would be empty)
    if (!identifiedClient && submissionData.newClientName && !submissionData.matterID) {
        // This is a new client, so the matter must also be treated as new for this client
        submissionData.newMatterName = matterInputText.trim();
        delete submissionData.matterID; // Ensure matterID is not set if it's a new client
    }


    onSubmit(submissionData);
  };
  
  const commonInputClasses = "form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#019863] border border-[#2f6a55] bg-[#214a3c] h-11 placeholder:text-[#8ecdb7] px-3 text-base font-normal leading-normal";
  const commonLabelClasses = "block text-sm font-medium text-[#8ecdb7] mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="client" className={commonLabelClasses}>Client (Type new or select existing) *</label>
          <input
            type="text"
            id="client"
            list="clients-datalist"
            value={clientInputText}
            onChange={(e) => setClientInputText(e.target.value)}
            className={commonInputClasses}
            placeholder="Type or select client"
            required
          />
          <datalist id="clients-datalist">
            {clients.map(client => (
              <option key={client.id} value={client.name} />
            ))}
          </datalist>
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
            placeholder={clientInputText.trim() ? "Type or select matter" : "Type matter name (client also needed)"}
            // removed: disabled={!clientInputText.trim()}
            required
          />
          <datalist id="matters-datalist">
            {availableMattersForClient.map(matter => (
              <option key={matter.id} value={matter.name} />
            ))}
          </datalist>
           {!clientInputText.trim() && matterInputText.trim() !== '' && (
             <p className="text-xs text-yellow-400 mt-1">Client name is also required to save this entry.</p>
           )}
           {clientInputText.trim() && identifiedClient && availableMattersForClient.length === 0 && matterInputText.trim() === '' && (
             <p className="text-xs text-[#8ecdb7] mt-1">No existing matters for client "{identifiedClient.name}". Type to create a new one.</p>
           )}
           {clientInputText.trim() && !identifiedClient && matterInputText.trim() === '' && (
             <p className="text-xs text-[#8ecdb7] mt-1">New client "{clientInputText.trim()}" detected. Type matter name to create it.</p>
           )}
           {clientInputText.trim() &&
            identifiedClient &&
            matterInputText.trim() !== '' &&
            !availableMattersForClient.some(m => m.name.toLowerCase() === matterInputText.trim().toLowerCase()) && (
            <p className="text-xs text-[#8ecdb7] mt-1">
              This will create a new matter: "{matterInputText.trim()}" for client "{identifiedClient.name}".
            </p>
           )}
           {clientInputText.trim() &&
            !identifiedClient && // New client
            matterInputText.trim() !== '' && ( // Matter text is also present
            <p className="text-xs text-[#8ecdb7] mt-1">
              This will create a new client: "{clientInputText.trim()}" and a new matter: "{matterInputText.trim()}".
            </p>
           )}
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
