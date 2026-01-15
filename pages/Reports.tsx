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
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="p-8 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl text-center text-red-500 font-bold shadow-xl">
          Access Denied: Administrative Area.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up pb-12">

      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200 relative">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg backdrop-blur-md border border-indigo-200">
              <AlertOctagon className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Incident Management</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Issue Reports</h1>
          <p className="text-slate-500 mt-2 max-w-2xl text-lg font-medium">
            Track and resolve issues reported directly from examination halls.
          </p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-sm">
          {(['Open', 'Resolved', 'All'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${filter === f ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-slate-900/5 border border-white/40 overflow-hidden relative min-h-[400px]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        {filteredReports.length === 0 ? (
          <div className="p-24 text-center text-slate-400 relative z-10">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20 shadow-inner">
              <CheckCircle className="w-10 h-10 text-emerald-500/60" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">All Clear</h3>
            <p className="text-lg opacity-70">No {filter !== 'All' ? filter.toLowerCase() : ''} issues found.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/20 relative z-10">
            {filteredReports.map(report => (
              <div key={report.id} className="p-8 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/40 transition-colors group relative overflow-hidden">
                <div className="absolute left-0 top-0 w-1 h-full bg-transparent group-hover:bg-indigo-500 transition-colors"></div>

                <div className="flex items-start gap-6">
                  <div className={`mt-1 p-4 rounded-xl flex-shrink-0 shadow-sm border border-white/50 ${report.status === 'Open' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    {report.status === 'Open' ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-xl group-hover:text-indigo-700 transition-colors leading-snug">{report.message}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm font-medium text-slate-500">
                      <span className="flex items-center gap-1.5 bg-white/60 px-3 py-1 rounded-lg border border-white/60 shadow-sm text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Room {report.roomId}
                      </span>
                      <span>reported by <span className="font-bold text-slate-700 border-b border-indigo-200">{report.teacherId}</span></span>
                      <span className="text-slate-300">•</span>
                      <span>{new Date(report.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 md:mt-0 pl-20 md:pl-0">
                  {report.status === 'Open' ? (
                    <button
                      onClick={() => handleResolve(report.id)}
                      className="bg-white border-2 border-slate-200/60 text-slate-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 px-6 py-3 rounded-xl text-sm font-extrabold transition-all shadow-sm hover:shadow-md flex items-center gap-2 uppercase tracking-wide"
                    >
                      <Check className="w-4 h-4" /> Mark Resolved
                    </button>
                  ) : (
                    <span className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 text-emerald-700 rounded-xl text-xs font-bold uppercase border border-emerald-500/20 tracking-wider shadow-sm">
                      <CheckCircle className="w-4 h-4" /> Resolved
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
