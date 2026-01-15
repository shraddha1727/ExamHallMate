import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Student } from '../types';
import { fetchPaginatedStudentsApi } from '../services/students';
import { ArrowLeft, ChevronLeft, ChevronRight, Users } from 'lucide-react';

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
    <div className="p-2 md:p-4">
      <div className="flex flex-col md:flex-row md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-3 p-2 rounded-xl bg-white/50 border border-slate-200 hover:bg-indigo-50 text-slate-600 transition-colors duration-200 shadow-sm"
            aria-label="Back to Semesters"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">
            Students in <span className="text-indigo-600 block md:inline">{selectedDepartment}</span> <span className="text-slate-400 text-sm md:text-xl font-normal hidden md:inline">|</span> <span className="text-slate-500 text-sm md:text-xl block md:inline">Sem {selectedSemester}</span>
          </h2>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <input
          type="text"
          placeholder="Search students..."
          className="p-3 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl w-full md:w-1/3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400 disabled:opacity-50 transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <Users className="w-4 h-4" />
          <span>Records: {totalRecords}</span>
        </div>
      </div>

      <div className="overflow-x-auto bg-white/60 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] shadow-xl shadow-slate-900/5 border border-white/40 relative">
        {/* Scroll Hint Gradient - Right */}
        <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-white/20 to-transparent pointer-events-none md:hidden"></div>

        <table className="min-w-[800px] w-full text-left">
          <thead className="bg-slate-50/80 border-b border-slate-200/60">
            <tr>
              {['Enrollment', 'Name', 'Branch', 'Sem', 'Batch'].map(header => (
                <th key={header} scope="col" className="px-4 py-4 md:px-8 md:py-5 text-left text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
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
                    <div className="w-10 h-10 bg-slate-200 rounded-full mb-3"></div>
                    <div className="h-3 w-24 bg-slate-200 rounded"></div>
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
                  <td className="px-4 py-3 md:px-8 md:py-5 whitespace-nowrap text-xs md:text-sm font-bold text-slate-700 font-mono bg-slate-50/50 group-hover:bg-transparent">{student.enrollNo}</td>
                  <td className="px-4 py-3 md:px-8 md:py-5 whitespace-nowrap text-xs md:text-sm font-bold text-slate-800">{student.name}</td>
                  <td className="px-4 py-3 md:px-8 md:py-5 whitespace-nowrap text-xs md:text-sm font-medium text-slate-600">
                    <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] md:text-xs font-bold text-slate-500 shadow-sm">{student.branch}</span>
                  </td>
                  <td className="px-4 py-3 md:px-8 md:py-5 whitespace-nowrap text-xs md:text-sm font-medium text-slate-600">
                    <span className="px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] md:text-xs font-bold text-indigo-600">{student.semester}</span>
                  </td>
                  <td className="px-4 py-3 md:px-8 md:py-5 whitespace-nowrap text-xs md:text-sm font-medium text-slate-500">{student.batch}</td>
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
