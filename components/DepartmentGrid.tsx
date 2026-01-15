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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {departmentStats.map(dept => (
          <div
            key={dept.name}
            className="group bg-white/40 backdrop-blur-md border border-white/50 rounded-[1.5rem] p-8 cursor-pointer hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
            onClick={() => onSelectDepartment(dept.name)}
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-full blur-xl -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500"></div>

            <div className="relative z-10">
              <h3 className="text-2xl font-extrabold text-slate-800 mb-2 mt-2 group-hover:text-indigo-600 transition-colors">{dept.name}</h3>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-indigo-50 rounded-lg text-xs font-bold text-indigo-700 border border-indigo-100">
                  {dept.count} Students
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentGrid;
