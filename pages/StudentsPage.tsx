import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchStudentStatsApi } from '../services/students';
import DepartmentGrid, { DepartmentStat } from '../components/DepartmentGrid';
import SemesterGrid from '../components/SemesterGrid';
import StudentsTable from '../components/StudentsTable';
import BulkImportControls from '../components/BulkImportControls';

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
        <div className="flex justify-center items-center h-64 text-gray-700 text-lg">
          Loading statistics...
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="flex justify-center items-center h-64 text-red-600 text-lg">
          Error: {error}
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
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 space-y-6">
      <BulkImportControls onImportSuccess={fetchStats} />
      
      <div className="relative bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        {renderContent()}
      </div>
    </div>
  );
};

export default StudentsPage;
