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

      <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-university-900">
            <tr>
              {['Enrollment No.', 'Name', 'Branch', 'Semester', 'Batch'].map(header => (
                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-red-500">{error}</td>
              </tr>
            ) : students.length > 0 ? (
              students.map((student) => (
                <tr key={student.enrollNo} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{student.enrollNo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.branch}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.semester}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.batch}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                  No students found for this selection.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="bg-white px-4 py-3 flex items-center justify-center border-t border-gray-200 sm:px-6 rounded-b-lg">
           <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1 || loading}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    disabled={loading}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === index + 1
                        ? 'z-10 bg-university-800 border-university-800 text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </nav>
      )}
    </div>
  );
};

export default StudentsTable;
