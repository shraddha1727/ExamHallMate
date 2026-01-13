import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Server, Database, Code, FileText, UserCog, Users, GraduationCap, ShieldCheck, Clock, Layout } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePortalClick = (role: 'Admin' | 'Staff') => {
    navigate('/login', { state: { role } });
  };

  const VIVA_LOGO_URL = "/logo.jpg";
  const VIVA_BUILDING_URL = "/viva_college.jpg";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-university-200 selection:text-university-900">

      {/* 1. NAVBAR */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${scrolled
            ? 'bg-white/95 backdrop-blur-md border-slate-200 shadow-sm py-2'
            : 'bg-white/0 border-transparent py-4'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-1 rounded-lg ${scrolled ? '' : 'bg-white/90 backdrop-blur-sm'}`}>
              <img
                src={VIVA_LOGO_URL}
                alt="VIVA Institute of Technology Logo"
                className="h-10 w-auto object-contain mix-blend-multiply"
              />
            </div>
            <div className={`hidden md:block ${scrolled ? 'text-slate-900' : 'text-white drop-shadow-md'}`}>
              <h1 className="text-sm font-bold leading-none tracking-wide">Exam HallMate</h1>
              <p className={`text-[10px] uppercase tracking-wider mt-0.5 ${scrolled ? 'text-slate-500' : 'text-slate-100'}`}>Official Examination Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePortalClick('Admin')}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${scrolled
                  ? 'text-slate-600 hover:text-university-600 hover:bg-slate-50'
                  : 'text-white hover:bg-white/20 backdrop-blur-sm'
                }`}
            >
              Admin Login
            </button>
            <button
              onClick={() => handlePortalClick('Staff')}
              className={`px-5 py-2 text-sm font-bold rounded-full transition-all shadow-lg ${scrolled
                  ? 'bg-university-600 text-white hover:bg-university-700'
                  : 'bg-white text-university-900 hover:bg-slate-100'
                }`}
            >
              Teacher Portal
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <div className="relative h-[85vh] lg:h-screen min-h-[600px] w-full overflow-hidden flex items-center">
        {/* Background Image with Parallax-like effect */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/20 z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent z-10 opacity-60"></div>
          <img
            src={VIVA_BUILDING_URL}
            alt="VIVA Institute Background"
            className="w-full h-full object-cover object-center transform scale-105"
          />
        </div>

        {/* Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 w-full pt-20">
          <div className="max-w-3xl space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-university-500/20 border border-university-400/30 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-university-400 animate-pulse"></span>
              <span className="text-xs font-medium text-university-200 tracking-wide uppercase">Academic Year 2024-2025</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight">
              Smart Seating. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-university-200 to-university-400">
                Seamless Exams.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-2xl font-light">
              A comprehensive examination management system for <strong className="text-white font-semibold">VIVA Institute of Technology</strong>.
              Automate room allocation, optimize capacity, and ensure malpractice-free examinations with precision.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => handlePortalClick('Admin')}
                className="group px-8 py-4 bg-university-600 hover:bg-university-500 text-white font-semibold rounded-lg shadow-xl hover:shadow-2xl hover:shadow-university-900/20 transition-all flex items-center justify-center gap-2"
              >
                Access Admin Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => handlePortalClick('Staff')}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold rounded-lg transition-all flex items-center justify-center"
              >
                Faculty Login
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FLOAT STATS / FEATURES */}
      <div className="relative z-30 -mt-24 px-6 mb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 transform hover:-translate-y-1 transition-transform duration-300">
              <div className="w-14 h-14 bg-university-50 rounded-xl flex items-center justify-center mb-6">
                <Layout className="w-7 h-7 text-university-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Automated Allocation</h3>
              <p className="text-slate-600 leading-relaxed">
                Eliminate human error with our intelligent algorithm that generates distinct branch seating arrangements instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 transform hover:-translate-y-1 transition-transform duration-300">
              <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Malpractice Prevention</h3>
              <p className="text-slate-600 leading-relaxed">
                Strategic seating patterns ensure students from the same department are never seated adjacent to each other.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 transform hover:-translate-y-1 transition-transform duration-300">
              <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Real-time Efficiency</h3>
              <p className="text-slate-600 leading-relaxed">
                Save valuable time with instant room-wise and block-wise report generation for both admins and faculty.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ABOUT SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-university-100 rounded-full blur-3xl opacity-50"></div>
            <div className="relative border-l-4 border-university-600 pl-6 py-2">
              <h4 className="text-university-600 font-bold uppercase tracking-wider text-sm mb-2">About The Institute</h4>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">VIVA Institute of Technology</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                Established in 2009, VIVA Institute of Technology is a premier engineering institute approved by AICTE, New Delhi and affiliated with the University of Mumbai.
              </p>
              <p className="text-slate-600 leading-relaxed">
                We are committed to fostering an environment of academic excellence, and this Automated Exam Seating System is a testament to our dedication to technological advancement in education administration.
              </p>
            </div>
          </div>
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-6 text-lg">System Capabilities</h3>
            <ul className="space-y-4">
              {[
                "Dynamic Classroom Capacity Management",
                "Faculty Duty Allocation & Tracking",
                "Student Data Bulk Import (CSV)",
                "Instant PDF Seating Plan Generation",
                "Secure Role-Based Access Control"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-university-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5. USER ROLES */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Tailored for Every Role</h2>
            <p className="text-slate-600">
              A unified platform providing specific tools and views for every stakeholder in the examination process.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Principal */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:shadow-xl hover:border-university-200 transition-all group">
              <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Principal / Super Admin</h3>
              <p className="text-slate-600 text-sm mb-6">Complete oversight of the examination process, from resource management to final seating approval.</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Full System Control
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> Master Data Management
                </li>
              </ul>
            </div>

            {/* HOD */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:shadow-xl hover:border-university-200 transition-all group">
              <div className="w-12 h-12 bg-university-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-university-100 transition-colors">
                <UserCog className="w-6 h-6 text-university-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">HOD / Admin</h3>
              <p className="text-slate-600 text-sm mb-6">Operational control for executing exam schedules, managing student lists, and allocating duties.</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-university-400"></span> Seating Generation
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-university-400"></span> Timetable Management
                </li>
              </ul>
            </div>

            {/* Staff */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:shadow-xl hover:border-university-200 transition-all group">
              <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-teal-100 transition-colors">
                <GraduationCap className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Faculty / Staff</h3>
              <p className="text-slate-600 text-sm mb-6">Streamlined access to assigned duties, room allocations, and student attendance sheets.</p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span> View Duties
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span> Print Reports
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <img src={VIVA_LOGO_URL} alt="Logo" className="h-12 w-auto mb-4 mix-blend-multiply" />
              <p className="text-slate-500 text-sm leading-relaxed">
                Automating academic excellence through technology.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><button onClick={() => window.scrollTo(0, 0)} className="hover:text-university-600">Home</button></li>
                <li><button onClick={() => handlePortalClick('Admin')} className="hover:text-university-600">Admin Login</button></li>
                <li><button onClick={() => handlePortalClick('Staff')} className="hover:text-university-600">Staff Login</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>VIVA Institute of Technology</li>
                <li>Virar, Maharashtra</li>
                <li>contact@viva-technology.org</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-4">Tech Stack</h4>
              <div className="flex gap-2">
                <span className="p-2 bg-slate-50 rounded text-slate-500 hover:text-university-600 transition-colors"><Code className="w-4 h-4" /></span>
                <span className="p-2 bg-slate-50 rounded text-slate-500 hover:text-university-600 transition-colors"><Server className="w-4 h-4" /></span>
                <span className="p-2 bg-slate-50 rounded text-slate-500 hover:text-university-600 transition-colors"><Database className="w-4 h-4" /></span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-400">
            <p>&copy; 2024 Exam HallMate. All rights reserved.</p>
            <p>Designed & Developed as an Academic Project</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;