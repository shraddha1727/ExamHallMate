import React, { useState, useEffect } from 'react';
import { Report } from '../types';
import { fetchReportsApi, resolveReportApi } from '../services/reports';
import { getCurrentRole } from '../services/auth';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const role = getCurrentRole();

  useEffect(() => {
    const loadReports = async () => {
      if (role === 'SuperAdmin') {
        try {
          const reports = await fetchReportsApi();
          setReports(reports);
        } catch (error) {
          console.error("Failed to fetch reports:", error);
        }
      }
    };
    loadReports();
  }, [role]);

  const handleResolve = async (id: string) => {
    try {
      await resolveReportApi(id);
      const reports = await fetchReportsApi();
      setReports(reports);
    } catch (error) {
      console.error("Failed to resolve report:", error);
    }
  };

  if (role === 'Teacher') {
    return <div className="p-10 text-center text-red-500">Access Denied: Admins Only.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Issue Reports</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {reports.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
            <p>No active issues reported.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reports.map(report => (
              <div key={report.id} className="p-6 flex items-start justify-between hover:bg-slate-50">
                 <div className="flex items-start">
                   <AlertTriangle className={`w-5 h-5 mr-4 mt-1 ${report.status === 'Open' ? 'text-red-500' : 'text-green-500'}`} />
                   <div>
                     <p className="font-bold text-slate-800 text-lg">{report.message}</p>
                     <p className="text-sm text-slate-500 mt-1">
                       Reported by {report.teacherId} in Room {report.roomId}
                     </p>
                     <p className="text-xs text-slate-400 mt-2">
                       {new Date(report.createdAt).toLocaleString()}
                     </p>
                   </div>
                 </div>
                 <div>
                   {report.status === 'Open' ? (
                     <button 
                       onClick={() => handleResolve(report.id)}
                       className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900"
                     >
                       Mark Resolved
                     </button>
                   ) : (
                     <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase border border-green-200">
                       Resolved
                     </span>
                   )}
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
