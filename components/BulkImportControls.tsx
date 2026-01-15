import React, { useState, useRef } from 'react';
import { Student } from '../types';
import { parseCSV } from '../utils/csvParser';
import { bulkUpsertStudentsApi } from '../services/students';
import { UploadCloud, AlertCircle } from 'lucide-react';

interface BulkImportControlsProps {
  onImportSuccess: () => void;
}

const BulkImportControls: React.FC<BulkImportControlsProps> = ({ onImportSuccess }) => {
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);

    try {
      const rawData = await parseCSV(file);
      const parsedStudents = rawData.filter((row: any) => row.enrollNo) as Student[];

      if (parsedStudents.length === 0) {
        throw new Error("CSV file is empty or contains no valid student records (missing enrollNo).");
      }

      await bulkUpsertStudentsApi(parsedStudents);
      onImportSuccess();

    } catch (err: any) {
      console.error('Import failed:', err);
      let errorMessage = 'An unexpected error occurred during import.';
      if (err.response && err.response.data && err.response.data.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setImportError(errorMessage);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/40 shadow-xl shadow-slate-900/5 group hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Student Data Management</h3>
          <p className="text-sm font-medium text-slate-500 mt-1">Import, view, and manage student records via CSV.</p>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            disabled={isImporting}
          />
          <button
            onClick={handleImportClick}
            disabled={isImporting}
            className="flex items-center justify-center px-4 py-2.5 bg-university-900 text-white font-bold rounded-lg shadow-sm hover:bg-university-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200"
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            {isImporting ? 'Importing...' : 'Import from CSV'}
          </button>
        </div>
      </div>
      {importError && (
        <div className="mt-4 flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          <AlertCircle className="w-4 h-4 mr-2" />
          {importError}
        </div>
      )}
    </div>
  );
};

export default BulkImportControls;
