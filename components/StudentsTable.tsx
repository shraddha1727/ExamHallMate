import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Student } from '../types';
import { fetchPaginatedStudentsApi } from '../services/students';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

// Custom hook for debouncing
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface StudentsTableProps {
  onBack: () => void;
  selectedDepartment: string;
  selectedSemester: string;
}

const StudentsTable: React.FC<StudentsTableProps> = ({ onBack, selectedDepartment, selectedSemester }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms delay

  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedDepartment || !selectedSemester) return;

      setLoading(true);
      setError(null);
      try {
        const data = await fetchPaginatedStudentsApi(selectedDepartment, selectedSemester, currentPage, debouncedSearchTerm);
        setStudents(data.students);
        setTotalPages(data.totalPages);
        setTotalRecords(data.totalRecords);
      } catch (err) {
        setError('Failed to load students.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedDepartment, selectedSemester, currentPage, debouncedSearchTerm]);

  // Reset to page 1 whenever search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors duration-200"
          aria-label="Back to Semesters"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          Students in <span className="text-university-900">{selectedDepartment}</span> - Sem <span className="text-university-900">{selectedSemester}</span>
        </h2>
      </div>

      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by name or enrollment no..."
          className="p-2 border border-gray-300 rounded-md w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <span className="text-gray-600 hidden md:inline">Total Records: {totalRecords}</span>
      </div>

      <div className="overflow-x-auto bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-slate-900/10 border border-white/40">
        <table className="min-w-[800px] w-full text-left">
          <thead className="bg-slate-50/80 border-b border-slate-200/60">
            <tr>
              {['Enrollment No.', 'Name', 'Branch', 'Semester', 'Batch'].map(header => (
                <th key={header} scope="col" className="px-8 py-5 text-left text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-24 text-center text-slate-400">
                  <div className="flex flex-col items-center animate-pulse">
                    <div className="w-12 h-12 bg-slate-200 rounded-full mb-3"></div>
                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-red-500 font-bold">{error}</td>
              </tr>
            ) : students.length > 0 ? (
              students.map((student) => (
                <tr key={student.enrollNo} className="hover:bg-indigo-50/40 transition-colors duration-200 group">
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-700 font-mono bg-slate-50/50 rounded-r-xl group-hover:bg-transparent">{student.enrollNo}</td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-bold text-slate-800">{student.name}</td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-slate-600">
                    <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 shadow-sm">{student.branch}</span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-slate-600">
                    <span className="px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-xs font-bold text-indigo-600">Sem {student.semester}</span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm font-medium text-slate-500">{student.batch}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-24 text-center text-sm text-slate-500 font-medium">
                  No students found for this selection.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="inline-flex rounded-2xl shadow-lg shadow-slate-200/50 bg-white p-1.5 gap-1 border border-slate-100">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {[...Array(totalPages)].map((_, index) => {
              // Simple pagination logic to show limited pages if too many
              if (totalPages > 7 && Math.abs(currentPage - (index + 1)) > 2 && index !== 0 && index !== totalPages - 1) {
                if (index === 1 || index === totalPages - 2) return <span key={index} className="px-2 py-2 text-slate-300">...</span>;
                return null;
              }
              return (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  disabled={loading}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === index + 1
                      ? 'bg-gradient-to-br from-university-600 to-indigo-600 text-white shadow-md shadow-indigo-500/30'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  {index + 1}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
              className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default StudentsTable;
