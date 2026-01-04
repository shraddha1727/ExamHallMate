import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Server, Database, Code, FileText } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const handlePortalClick = (role: 'Admin' | 'Staff') => {
    navigate('/login', { state: { role } });
  };

  const VIVA_LOGO_URL = "/logo.jpg";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* 1. HEADER / NAVBAR */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm h-20">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img 
              src={VIVA_LOGO_URL} 
              alt="VIVA Institute of Technology Logo" 
              className="h-12 w-auto object-contain mix-blend-multiply drop-shadow-sm"
            />
            <div className="hidden md:block h-8 w-px bg-slate-200"></div>
            <div className="hidden md:block">
              <h1 className="text-sm font-bold text-university-900 leading-none">Exam HallMate</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">Official Examination Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => handlePortalClick('Admin')} className="text-sm font-medium text-slate-600 hover:text-university-600 transition-colors">
               Admin Login
             </button>
             <span className="text-slate-300">|</span>
             <button onClick={() => handlePortalClick('Staff')} className="text-sm font-medium text-slate-600 hover:text-university-600 transition-colors">
               Teacher Login
             </button>
          </div>
        </div>
      </header>

      {/* 2. INTRODUCTION SECTION */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold text-university-900 mb-6 leading-tight">
              Exam HallMate
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              A centralized examination management solution designed to automate seating allocation, 
              optimize room capacity, and streamline the invigilation process for VIVA Institute of Technology.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => handlePortalClick('Admin')}
                className="px-6 py-2.5 bg-university-900 text-white text-sm font-medium rounded hover:bg-university-800 transition-colors flex items-center"
              >
                Go to Admin Panel <ArrowRight className="w-4 h-4 ml-2" />
              </button>
              <button 
                onClick={() => handlePortalClick('Staff')}
                className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded hover:bg-slate-50 transition-colors"
              >
                Go to Teacher Panel
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT INSTITUTE */}
      <section className="bg-slate-50 py-16 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-xl font-bold text-university-900 mb-4 border-l-4 border-university-600 pl-3">
            About VIVA Institute of Technology
          </h2>
          <p className="text-slate-700 leading-relaxed text-sm max-w-4xl">
            VIVA Institute of Technology, established in 2009, is a premier engineering institute approved by AICTE, New Delhi 
            and affiliated with the University of Mumbai. The institute is committed to providing quality technical education 
            and fostering an environment of academic excellence.
          </p>
        </div>
      </section>

      {/* 4. ABOUT THE SYSTEM */}
      <section className="bg-white py-16 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-xl font-bold text-university-900 mb-4 border-l-4 border-university-600 pl-3">
            About the System
          </h2>
          <p className="text-slate-700 leading-relaxed text-sm max-w-4xl mb-6">
            The Exam Seating Management System is an academic project developed to address the logistical challenges of manual seating arrangement. 
            By digitizing the entire workflow, the system eliminates human error, ensures fair distribution of students, and provides instant access to seating plans for faculty members.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
             <div className="flex items-start gap-3">
               <CheckCircle2 className="w-5 h-5 text-university-600 flex-shrink-0 mt-0.5" />
               <p className="text-sm text-slate-600">Eliminates manual allocation errors.</p>
             </div>
             <div className="flex items-start gap-3">
               <CheckCircle2 className="w-5 h-5 text-university-600 flex-shrink-0 mt-0.5" />
               <p className="text-sm text-slate-600">Ensures distinct branch seating to prevent malpractice.</p>
             </div>
             <div className="flex items-start gap-3">
               <CheckCircle2 className="w-5 h-5 text-university-600 flex-shrink-0 mt-0.5" />
               <p className="text-sm text-slate-600">Optimizes classroom resource utilization.</p>
             </div>
             <div className="flex items-start gap-3">
               <CheckCircle2 className="w-5 h-5 text-university-600 flex-shrink-0 mt-0.5" />
               <p className="text-sm text-slate-600">Provides real-time digital access to invigilators.</p>
             </div>
          </div>
        </div>
      </section>

      {/* 5. SYSTEM WORKFLOW */}
      <section className="bg-slate-50 py-16 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-xl font-bold text-university-900 mb-8 border-l-4 border-university-600 pl-3">
            System Workflow
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
             {[
               "Student CSV Import",
               "Timetable Upload",
               "Exam Creation",
               "Seating Allocation",
               "Admin / Teacher View"
             ].map((step, idx) => (
               <React.Fragment key={idx}>
                 <div className="bg-white border border-slate-200 p-4 rounded text-center shadow-sm">
                   <span className="block text-xs font-bold text-university-600 mb-1">STEP {idx + 1}</span>
                   <span className="text-sm font-semibold text-slate-800">{step}</span>
                 </div>
                 {idx < 4 && (
                   <div className="hidden md:flex justify-center text-slate-300">
                     <ArrowRight className="w-5 h-5" />
                   </div>
                 )}
               </React.Fragment>
             ))}
          </div>
        </div>
      </section>

      {/* 6. ROLE-BASED ACCESS */}
      <section className="bg-white py-16 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-xl font-bold text-university-900 mb-8 border-l-4 border-university-600 pl-3">
            User Roles & Permissions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-slate-200 p-6 rounded bg-slate-50/50">
              <h3 className="font-bold text-university-900 mb-2">Principal (Super Admin)</h3>
              <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                <li>Full system control</li>
                <li>Manage students, rooms, exams</li>
                <li>Generate & View Seating</li>
                <li>Manage Faculty Access</li>
              </ul>
            </div>
            <div className="border border-slate-200 p-6 rounded bg-slate-50/50">
              <h3 className="font-bold text-university-900 mb-2">HOD (Admin)</h3>
              <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                <li>Manage Students & Rooms</li>
                <li>Upload Exam Timetables</li>
                <li>Generate Seating Plans</li>
                <li>Assign Invigilation Duties</li>
              </ul>
            </div>
            <div className="border border-slate-200 p-6 rounded bg-slate-50/50">
              <h3 className="font-bold text-university-900 mb-2">Staff (Teacher)</h3>
              <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
                <li>View Assigned Exam Duties</li>
                <li>View Room-wise Seating</li>
                <li>Print Seating Sheets</li>
                <li>View Own Profile</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. KEY FEATURES */}
      <section className="bg-slate-50 py-16 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-xl font-bold text-university-900 mb-6 border-l-4 border-university-600 pl-3">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              "Bulk Student Import via CSV",
              "Dynamic Timetable Creation",
              "Algorithmic Seating Generation",
              "Room Capacity Management",
              "Invigilation Duty Assignment",
              "Responsive Web Interface (LAN)"
            ].map((feature, i) => (
              <div key={i} className="flex items-center p-3 bg-white border border-slate-200 rounded shadow-sm">
                <div className="w-2 h-2 bg-university-600 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TECH STACK */}
      <section className="bg-white py-16 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-xl font-bold text-university-900 mb-6 border-l-4 border-university-600 pl-3">
            Technical Specifications
          </h2>
          <div className="bg-slate-50 border border-slate-200 rounded p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 text-sm uppercase">
                  <Code className="w-4 h-4 text-university-600" /> Frontend
                </div>
                <p className="text-sm text-slate-600">React.js, TypeScript, Tailwind CSS</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 text-sm uppercase">
                  <Server className="w-4 h-4 text-university-600" /> Backend
                </div>
                <p className="text-sm text-slate-600">Python (Flask), Pandas</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 text-sm uppercase">
                  <Database className="w-4 h-4 text-university-600" /> Database
                </div>
                <p className="text-sm text-slate-600">MongoDB (NoSQL)</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 text-sm uppercase">
                  <FileText className="w-4 h-4 text-university-600" /> Libraries
                </div>
                <p className="text-sm text-slate-600">React Router, Axios, Lucide Icons</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm">
          <div className="mb-4 md:mb-0">
             <p className="font-bold text-slate-800 uppercase tracking-wide">Exam Seating Management System</p>
             <p className="mt-1">Developed as an Academic Project</p>
          </div>
          <div className="text-right">
             <p className="font-semibold text-slate-800">VIVA Institute of Technology</p>
             <p className="mt-1">Academic Year 2024-2025</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;