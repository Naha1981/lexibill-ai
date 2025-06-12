
import React, { useState, useCallback } from 'react';
import { PDFIntakeFile } from '../../types';
import { FileTextIcon, UploadCloudIcon, SpinnerIcon, CheckCircleIcon, AlertCircleIcon, EyeIcon, Trash2Icon } from '../icons';

interface OCRIntakeViewProps {
  onFileChange: (files: FileList) => void;
  uploadedFiles: PDFIntakeFile[];
  isLoading: boolean;
}

const OCRIntakeView: React.FC<OCRIntakeViewProps> = ({ onFileChange, uploadedFiles, isLoading }) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onFileChange(event.target.files);
      event.target.value = ''; // Reset file input
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const pdfFiles = Array.from(event.dataTransfer.files).filter(file => file.type === "application/pdf");
      if (pdfFiles.length > 0) {
        // Create a new FileList - this is a bit hacky as FileList is normally read-only
        const dataTransfer = new DataTransfer();
        pdfFiles.forEach(file => dataTransfer.items.add(file));
        onFileChange(dataTransfer.files);
      } else {
        alert("Please upload PDF files only.");
      }
    }
  }, [onFileChange]);

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
  
  const getStatusIcon = (status: PDFIntakeFile['status']) => {
    switch(status) {
        case 'pending_ocr': return <SpinnerIcon className="w-4 h-4 text-yellow-400 animate-spin" />;
        case 'ocr_complete': return <CheckCircleIcon className="w-4 h-4 text-green-400" />;
        case 'ocr_error': return <AlertCircleIcon className="w-4 h-4 text-red-400" />;
        default: return null;
    }
  };

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
          id="pdf-upload"
          accept=".pdf"
          multiple
          onChange={handleFilesSelected}
          className="hidden"
          aria-label="Upload PDF invoices"
        />
        <label htmlFor="pdf-upload" className="font-medium text-white cursor-pointer hover:text-[#019863]">
          Drag & drop PDF invoices here, or click to select files
        </label>
        <p className="text-xs text-[#8ecdb7] mt-1">Upload scanned invoices for OCR data extraction.</p>
      </div>
      
      {isLoading && (
         <div className="flex items-center justify-center p-4">
            <SpinnerIcon className="w-6 h-6 text-[#8ecdb7]" /> 
            <p className="ml-2 text-[#8ecdb7]">Processing PDF(s)...</p>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-white mb-2">Uploaded PDFs for OCR</h4>
          <ul className="space-y-2">
            {uploadedFiles.map(file => (
              <li key={file.id} className="p-3 bg-[#214a3c] rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <FileTextIcon className="w-6 h-6 text-[#8ecdb7] mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-white">{file.fileName}</p>
                    <p className="text-xs text-[#b2dfdb]">
                      {(file.fileSize / 1024).toFixed(1)} KB - Uploaded: {new Date(file.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#17352b] text-[#b2dfdb] flex items-center">
                        {getStatusIcon(file.status)}
                        <span className="ml-1">{file.status.replace('_', ' ').toUpperCase()}</span>
                    </span>
                    {/* Placeholder buttons for actions */}
                    {file.status === 'ocr_complete' && (
                        <button title="View Extracted Data (Stubbed)" className="p-1 text-[#8ecdb7] hover:text-white"><EyeIcon className="w-4 h-4"/></button>
                    )}
                    <button title="Remove (Stubbed)" className="p-1 text-red-400 hover:text-red-300"><Trash2Icon className="w-4 h-4"/></button>
                </div>
              </li>
            ))}
          </ul>
           <div className="mt-4 p-3 bg-[#214a3c] rounded-lg text-sm text-[#b2dfdb]">
             <AlertCircleIcon className="w-5 h-5 inline mr-2 text-yellow-400" />
             OCR processing and data extraction are currently stubbed. Actual Document AI integration is required for full functionality.
          </div>
        </div>
      )}
       {!isLoading && uploadedFiles.length === 0 && (
           <p className="text-sm text-center text-[#8ecdb7] py-4">Upload PDF files to begin OCR intake.</p>
       )}
    </div>
  );
};

export default OCRIntakeView;
