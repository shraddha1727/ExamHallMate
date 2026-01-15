import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchStudentStatsApi } from '../services/students';
import DepartmentGrid, { DepartmentStat } from '../components/DepartmentGrid';
import SemesterGrid from '../components/SemesterGrid';
import StudentsTable from '../components/StudentsTable';
import BulkImportControls from '../components/BulkImportControls';
import { Users, GraduationCap } from 'lucide-react';

type ViewState = 'departments' | 'semesters' | 'table';

const StudentsPage: React.FC = () => {
  const [departmentStats, setDepartmentStats] = useState<DepartmentStat[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<ViewState>('departments');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const statsData = await fetchStudentStatsApi();
      setDepartmentStats(statsData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch student stats:', err);
      setError('Failed to load student statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSelectDepartment = useCallback((departmentName: string) => {
    setSelectedDepartment(departmentName);
    setView('semesters');
  }, []);

  const handleSelectSemester = useCallback((semester: string) => {
    setSelectedSemester(semester);
    setView('table');
  }, []);


  const handleBackToDepartments = useCallback(() => {
    setSelectedDepartment(null);
    setView('departments');
  }, []);

  const handleBackToSemesters = useCallback(() => {
    setView('semesters');
  }, []);

  const selectedDepartmentData = useMemo(() => {
    return departmentStats.find(dept => dept.name === selectedDepartment);
  }, [departmentStats, selectedDepartment]);



  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col justify-center items-center h-64 text-slate-500">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Loading academic records...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col justify-center items-center h-64 text-red-400 bg-red-50/50 rounded-[2rem] border border-red-100 p-8 text-center backdrop-blur-sm">
          <p className="text-xl font-bold mb-2">System Unavailable</p>
          <p className="text-sm font-medium opacity-80">{error}</p>
        </div>
      );
    }

    switch (view) {
      case 'departments':
        return <DepartmentGrid departmentStats={departmentStats} onSelectDepartment={handleSelectDepartment} />;
      case 'semesters':
        return selectedDepartmentData && (
          <SemesterGrid
            semesters={selectedDepartmentData.semesters}
            selectedDepartment={selectedDepartmentData.name}
            onSelectSemester={handleSelectSemester}
            onBack={handleBackToDepartments}
          />
        );
      case 'table':
        return selectedDepartment && selectedSemester && (
          <StudentsTable
            onBack={handleBackToSemesters}
            selectedDepartment={selectedDepartment}
            selectedSemester={selectedSemester}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200 relative">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg backdrop-blur-md border border-indigo-200">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Student Management</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Academic Records</h1>
          <p className="text-slate-500 mt-2 max-w-2xl text-lg font-medium">
            Browse students by department, view detailed rosters, and manage student data.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="space-y-8">
          <BulkImportControls onImportSuccess={fetchStats} />

          <div className="bg-white/60 backdrop-blur-xl p-2 rounded-[2.5rem] border border-white/40 shadow-2xl shadow-slate-900/10 min-h-[500px] relative overflow-hidden">
            {/* Inner background accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl pointer-events-none"></div>

            <div className="relative z-10 p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsPage;
