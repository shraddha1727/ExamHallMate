import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface Semester {
    semester: string;
    count: number;
}

interface SemesterGridProps {
  semesters: Semester[];
  selectedDepartment: string;
  onSelectSemester: (semester: string) => void;
  onBack: () => void;
}

const SemesterGrid: React.FC<SemesterGridProps> = ({ semesters, selectedDepartment, onSelectSemester, onBack }) => {

  // Sort semesters numerically
  const sortedSemesters = [...semesters].sort((a, b) => parseInt(a.semester) - parseInt(b.semester));

  return (
    <div className="p-4">
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors duration-200"
          aria-label="Back to Departments"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Select Semester for <span className="text-university-900">{selectedDepartment}</span></h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {sortedSemesters.map(({ semester, count }) => (
          <div
            key={semester}
            className="bg-university-800 text-white rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-university-900 transition-colors duration-200 shadow-sm"
            onClick={() => onSelectSemester(semester)}
          >
            <div className="text-lg font-semibold">{`Sem ${semester}`}</div>
            <div className="text-xs mt-1">{`(${count} students)`}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SemesterGrid;
