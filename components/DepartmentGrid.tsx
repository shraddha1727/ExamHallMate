import React from 'react';

// This interface should match the structure from the /api/students/stats endpoint
export interface DepartmentStat {
  name: string;
  count: number;
  semesters: { semester: string, count: number }[];
}

interface DepartmentGridProps {
  departmentStats: DepartmentStat[];
  onSelectDepartment: (departmentName: string) => void;
}

const DepartmentGrid: React.FC<DepartmentGridProps> = ({ departmentStats, onSelectDepartment }) => {

  if (!departmentStats || departmentStats.length === 0) {
    return (
        <div className="p-4 text-center text-gray-500">
            No student data found. Please import students to see department statistics.
        </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Select Department</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {departmentStats.map(dept => (
          <div
            key={dept.name}
            className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 cursor-pointer hover:shadow-lg hover:border-university-800 transition-all duration-200 ease-in-out transform hover:-translate-y-1"
            onClick={() => onSelectDepartment(dept.name)}
          >
            <h3 className="text-xl font-semibold text-university-900 mb-2">{dept.name}</h3>
            <p className="text-gray-600">Total Students: <span className="font-medium text-gray-800">{dept.count}</span></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentGrid;
