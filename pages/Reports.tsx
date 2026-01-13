import React, { useState, useEffect } from 'react';
import { Report } from '../types';
import { fetchReportsApi, resolveReportApi } from '../services/reports';
import { getCurrentRole } from '../services/auth';
import { AlertTriangle, CheckCircle, AlertOctagon, ListFilter, Check } from 'lucide-react';

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const role = getCurrentRole();
  const [filter, setFilter] = useState<'All' | 'Open' | 'Resolved'>('Open');

  useEffect(() => {
    const loadReports = async () => {
      if (role === 'SuperAdmin') {
        try {
          const reports = await fetchReportsApi();
          // Sort default by date DESC
          setReports(reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
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
      const updatedReports = await fetchReportsApi();
      setReports(updatedReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error("Failed to resolve report:", error);
    }
  };

  const filteredReports = reports.filter(r => filter === 'All' ? true : r.status === filter);

  if (role === 'Teacher') {
    return <div className="p-10 text-center text-red-500 font-bold">Access Denied: Administrative Area.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2 text-university-600 font-bold uppercase tracking-wider text-xs">
            <AlertOctagon className="w-4 h-4" /> Incident Management
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Issue Reports</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Track and resolve issues reported directly from examination halls.
          </p>
        </div>
        <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          {(['Open', 'Resolved', 'All'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter === f ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
        {filteredReports.length === 0 ? (
          <div className="p-20 text-center text-slate-400">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-100" />
            <h3 className="text-lg font-bold text-slate-600">All Clear</h3>
            <p className="mt-1">No {filter !== 'All' ? filter.toLowerCase() : ''} issues found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredReports.map(report => (
              <div key={report.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-slate-50 transition-colors group">
                <div className="flex items-start gap-5">
                  <div className={`mt-1 p-3 rounded-full flex-shrink-0 ${report.status === 'Open' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    {report.status === 'Open' ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-university-800 transition-colors">{report.message}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="font-bold bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600">Room {report.roomId}</span>
                      <span>reported by <span className="font-semibold text-slate-700">{report.teacherId}</span></span>
                      <span className="text-slate-300">•</span>
                      <span>{new Date(report.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 pl-16 md:pl-0">
                  {report.status === 'Open' ? (
                    <button
                      onClick={() => handleResolve(report.id)}
                      className="bg-white border-2 border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Mark Resolved
                    </button>
                  ) : (
                    <span className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase border border-emerald-100">
                      <CheckCircle className="w-3.5 h-3.5" /> Resolved
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
