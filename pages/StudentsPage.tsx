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
          <div className="w-10 h-10 border-4 border-slate-200 border-t-university-600 rounded-full animate-spin mb-4"></div>
          <p className="font-medium">Loading academic records...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col justify-center items-center h-64 text-red-500 bg-red-50 rounded-xl border border-red-100 p-8">
          <p className="text-lg font-bold mb-2">Unavailable</p>
          <p>{error}</p>
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
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2 text-university-600 font-bold uppercase tracking-wider text-xs">
            <GraduationCap className="w-4 h-4" /> Student Management
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Academic Records</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Browse students by department, view detailed rosters, and manage student data.
          </p>
        </div>

        {/* Bulk Upload is now integrated cleanly next to title if needed, or kept in body */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <BulkImportControls onImportSuccess={fetchStats} />
          <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsPage;
