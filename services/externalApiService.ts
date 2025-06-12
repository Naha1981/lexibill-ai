
// This service will contain STUBBED functions for external API interactions
// like QuickBooks, CRM, Stripe, CSV processing, PDF OCR, etc.

import { CSVBillingRecord, PDFIntakeFile } from '../types';

const generateLocalId = (): string => Date.now().toString(36) + Math.random().toString(36).substring(2);

/**
 * Simulates processing an uploaded CSV file.
 * In a real app, this would involve more robust parsing and validation.
 */
export const processCsvData = (file: File): Promise<CSVBillingRecord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const records: CSVBillingRecord[] = [];
        const lines = csvText.split(/\r\n|\n/);
        
        if (lines.length < 2) {
          resolve([]); // No data or only header
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          const values = line.split(',').map(v => v.trim());
          const record: CSVBillingRecord = { id: generateLocalId() }; // Add a unique ID
          headers.forEach((header, index) => {
            record[header] = values[index] || '';
          });
          records.push(record);
        }
        // Simulate some processing delay
        setTimeout(() => resolve(records), 500);
      } catch (error) {
        console.error("CSV parsing error:", error);
        reject(new Error("Failed to parse CSV file."));
      }
    };
    reader.onerror = () => {
      reject(new Error("Failed to read CSV file."));
    };
    reader.readAsText(file);
  });
};

/**
 * Simulates processing an uploaded PDF file for OCR.
 * In a real app, this would call a Document AI / OCR service.
 */
export const processPdfFile = (file: File): Promise<PDFIntakeFile> => {
  return new Promise((resolve) => {
    // Simulate OCR processing delay and outcome
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate for stub
      const newFileEntry: PDFIntakeFile = {
        id: generateLocalId(),
        fileName: file.name,
        fileSize: file.size,
        status: success ? 'ocr_complete' : 'ocr_error',
        extractedData: success ? {
          invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
          clientName: `Client ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          totalAmount: (Math.random() * 5000).toFixed(2),
          invoiceDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          stubbedNote: "This is stubbed OCR data."
        } : undefined,
        uploadDate: new Date(),
      };
      resolve(newFileEntry);
    }, 1000 + Math.random() * 1000); // Simulate variable processing time
  });
};

// Placeholder for QuickBooks API calls
export const fetchOutstandingInvoicesFromQuickBooks = async (): Promise<any[]> => {
  console.warn("fetchOutstandingInvoicesFromQuickBooks: Stubbed function called. No actual API call.");
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [
    // Return mock data structure similar to OutstandingInvoice type
  ];
};

// Placeholder for CRM API calls
export const flagClientInCRM = async (clientId: string, flag: string): Promise<boolean> => {
  console.warn(`flagClientInCRM: Stubbed for client ${clientId} with flag "${flag}". No actual API call.`);
  await new Promise(resolve => setTimeout(resolve, 500));
  return true; // Simulate success
};

// Placeholder for Stripe API calls
export const checkStripePaymentStatus = async (invoiceId: string): Promise<string> => {
  console.warn(`checkStripePaymentStatus: Stubbed for invoice ${invoiceId}. No actual API call.`);
  await new Promise(resolve => setTimeout(resolve, 700));
  return Math.random() > 0.5 ? "paid" : "pending"; // Simulate payment status
};
