
import React, { useState, useCallback } from 'react';
import { CSVBillingRecord } from '../../types';
import { UploadCloudIcon, SpinnerIcon, FileTextIcon, CheckCircleIcon, AlertCircleIcon } from '../icons'; // Added more icons

interface CSVImportViewProps {
  onFileUpload: (file: File) => void;
  importedRecords: CSVBillingRecord[];
  isLoading: boolean;
}

const CSVImportView: React.FC<CSVImportViewProps> = ({ onFileUpload, importedRecords, isLoading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      if (event.dataTransfer.files[0].type === "text/csv") {
        setSelectedFile(event.dataTransfer.files[0]);
      } else {
        alert("Please upload a CSV file.");
      }
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
  }, []);

  const handleSubmit = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    } else {
      alert('Please select a CSV file to upload.');
    }
  };

  const commonInputClasses = "form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#019863] border border-[#2f6a55] bg-[#214a3c] h-11 placeholder:text-[#8ecdb7] px-3 text-base font-normal leading-normal";

  return (
    <div className="space-y-4">
      <div 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`p-6 border-2 ${dragOver ? 'border-[#019863]' : 'border-dashed border-[#2f6a55]'} rounded-lg text-center cursor-pointer transition-colors bg-[#1a3a2f]/30 hover:bg-[#1a3a2f]/50`}
      >
        <UploadCloudIcon className={`w-12 h-12 mx-auto mb-3 ${dragOver ? 'text-[#019863]' : 'text-[#8ecdb7]'}`} />
        <input
          type="file"
          id="csv-upload"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload CSV file"
        />
        <label htmlFor="csv-upload" className="font-medium text-white cursor-pointer hover:text-[#019863]">
          {selectedFile ? `Selected: ${selectedFile.name}` : "Drag & drop CSV file here, or click to select"}
        </label>
        <p className="text-xs text-[#8ecdb7] mt-1">Upload client billing records or time logs.</p>
      </div>

      {selectedFile && (
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !selectedFile}
            className="flex items-center justify-center min-w-[150px] cursor-pointer rounded-xl h-11 px-5 bg-[#019863] text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#017a50] disabled:opacity-50"
          >
            {isLoading ? <SpinnerIcon className="w-5 h-5" /> : 'Process CSV File'}
          </button>
        </div>
      )}

      {importedRecords.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-white mb-2">Imported Records Preview (Max 10 rows)</h4>
          <div className="overflow-x-auto chat-scrollbar rounded-lg border border-[#2f6a55]">
            <table className="min-w-full text-sm text-left text-[#b2dfdb]">
              <thead className="text-xs text-white uppercase bg-[#214a3c]">
                <tr>
                  {Object.keys(importedRecords[0]).map(key => (
                    <th key={key} scope="col" className="px-4 py-2">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {importedRecords.slice(0, 10).map((record, index) => (
                  <tr key={record.id || index} className="bg-[#17352b] border-b border-[#2f6a55] hover:bg-[#1f4236]">
                    {Object.values(record).map((value, i) => (
                      <td key={i} className="px-4 py-2 whitespace-nowrap">{String(value)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
           {importedRecords.length > 10 && <p className="text-xs text-[#8ecdb7] mt-2 text-right">Showing first 10 of {importedRecords.length} records.</p>}
          <div className="mt-4 p-3 bg-[#214a3c] rounded-lg text-sm text-[#b2dfdb]">
            <CheckCircleIcon className="w-5 h-5 inline mr-2 text-green-400" />
            CSV data parsed. 
            <span className="font-semibold text-white"> Next Steps (Stubbed):</span> AI classification, error correction, duplicate flagging, and sales agent assignment would occur here.
          </div>
        </div>
      )}
       {!selectedFile && importedRecords.length === 0 && (
         <p className="text-sm text-center text-[#8ecdb7] py-4">Upload a CSV file to see preview and processing options.</p>
       )}
    </div>
  );
};

export default CSVImportView;
