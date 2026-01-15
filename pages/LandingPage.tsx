import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Server, Database, Code, FileText, UserCog, Users, GraduationCap, ShieldCheck, Clock, Layout, Play, ChevronRight, Award } from 'lucide-react';

// --- Hooks ---

// Hook for typewriter effect
const useTypewriter = (words: string[], speed = 150, pause = 2000) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    if (index === words.length) return;

    if (subIndex === words[index].length + 1 && !reverse) {
      setTimeout(() => setReverse(true), pause);
      return;
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, Math.max(reverse ? 75 : subIndex === words[index].length ? 1000 : 150, parseInt((Math.random() * 50).toString())));

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words, pause]);

  // Blinking cursor effect
  useEffect(() => {
    const timeout2 = setInterval(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearInterval(timeout2);
  }, []);

  return `${words[index].substring(0, subIndex)}${blink ? '|' : ' '}`;
};

// Hook for scroll reveal
const useScrollReveal = (): React.MutableRefObject<HTMLDivElement | null> => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }
        });
      },
      { threshold: 0.1 }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return ref;
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  // Custom interactive hooks
  const typewriterText = useTypewriter(['Examinations', 'Seating Plans', 'Invigilation', 'Results'], 150, 2000);
  const featuresRef = useScrollReveal();
  const aboutRef = useScrollReveal();
  const rolesRef = useScrollReveal();

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

  // Mouse move effect for spotlight cards
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const cards = document.getElementsByClassName("spotlight-card");
    for (const card of cards as any) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    }
  };

  const VIVA_LOGO_URL = "/logo.jpg";
  const VIVA_BUILDING_URL = "/viva_college.jpg";

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-slate-50 selection:bg-university-200 selection:text-university-900 overflow-x-hidden" onMouseMove={handleMouseMove}>

      {/* 1. NAVBAR */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/80 backdrop-blur-md shadow-lg py-3'
          : 'bg-transparent py-6'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-xl transition-all ${scrolled ? 'bg-white shadow-sm' : 'bg-white/90 backdrop-blur-sm shadow-lg'}`}>
              <img
                src={VIVA_LOGO_URL}
                alt="VIVA Logo"
                className="h-10 w-auto object-contain mix-blend-multiply"
              />
            </div>
            <div className={`hidden md:block ${scrolled ? 'text-slate-900' : 'text-slate-900'}`}>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight leading-none">
                  VIVA
                </span>
                <span className={`text-[10px] font-bold tracking-widest uppercase mt-1 ${scrolled ? 'text-university-600' : 'text-university-600'}`}>
                  Exam Manager
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handlePortalClick('Admin')}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${scrolled
                ? 'text-slate-600 hover:text-university-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                : 'text-slate-600 hover:text-university-600 hover:bg-white/50 border border-slate-200/50'
                }`}
            >
              Admin Portal
            </button>
            <button
              onClick={() => handlePortalClick('Staff')}
              className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 ${scrolled
                ? 'bg-university-900 text-white hover:bg-university-800'
                : 'bg-white text-university-900 hover:bg-slate-50'
                }`}
            >
              Faculty Login
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse-slow"></div>
          <div className="absolute top-40 -left-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8 animate-fade-in-down hover:shadow-md transition-shadow cursor-default group">
            <span className="w-2 h-2 rounded-full bg-university-500 animate-pulse group-hover:scale-150 transition-transform"></span>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Academic Year 2024-2025</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 animate-fade-in-up leading-tight">
            Automate Your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-university-800 via-university-500 to-university-800 animate-shine bg-[length:200%_auto]">
              {typewriterText}
            </span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-600 mb-10 animate-fade-in-up font-medium leading-relaxed" style={{ animationDelay: "0.2s" }}>
            A comprehensive, automated platform designed for <strong className="text-slate-900">VIVA Institute of Technology</strong> to optimize exam scheduling, seating allocation, and invigilation.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <button
              onClick={() => handlePortalClick('Admin')}
              className="w-full sm:w-auto px-8 py-4 bg-university-900 text-white rounded-xl font-bold text-lg hover:bg-university-800 shadow-xl shadow-university-900/20 hover:shadow-2xl hover:shadow-university-900/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Admin Dashboard
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => handlePortalClick('Staff')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Faculty Portal
            </button>
          </div>

          {/* Hero Dashboard Preview with Glassmorphism */}
          <div className="mt-20 relative max-w-5xl mx-auto animate-fade-in-up perspective-1000" style={{ animationDelay: "0.6s" }}>
            <div className="absolute -inset-1 bg-gradient-to-r from-university-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 group transform transition-transform hover:scale-[1.01] hover:rotate-1 duration-500">
              <div className="h-11 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="ml-4 flex-1 flex justify-center">
                  <div className="w-80 h-6 bg-slate-200/50 rounded-md flex items-center justify-center text-[10px] text-slate-400">
                    dashboard.viva-technology.edu.in
                  </div>
                </div>
              </div>
              <div className="relative aspect-[16/9] bg-slate-100 flex items-center justify-center overflow-hidden">
                {/* Abstract representation of dashboard */}
                <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-4 p-8 opacity-50 group-hover:scale-105 transition-transform duration-700">
                  <div className="col-span-1 row-span-3 bg-white rounded-xl shadow-sm animate-pulse-slow"></div>
                  <div className="col-span-3 bg-white rounded-xl shadow-sm"></div>
                  <div className="col-span-1 bg-white rounded-xl shadow-sm"></div>
                  <div className="col-span-1 bg-white rounded-xl shadow-sm"></div>
                  <div className="col-span-1 bg-white rounded-xl shadow-sm"></div>
                  <div className="col-span-3 bg-white rounded-xl shadow-sm"></div>
                </div>

                <div className="z-10 text-center glass p-8 rounded-2xl border border-white/50 backdrop-blur-md shadow-2xl transform transition-transform group-hover:scale-110">
                  <Layout className="w-16 h-16 mx-auto mb-4 text-university-600" />
                  <p className="font-bold text-slate-800 text-lg">Secure Examination Dashboard</p>
                  <p className="text-slate-500 text-sm mt-2">Centralized control for Admins & Faculty</p>
                </div>
              </div>
            </div>

            {/* Floating Badge 1 */}
            <div className="absolute -right-8 -bottom-8 bg-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 hidden md:flex items-center gap-4 animate-float glass" style={{ animationDelay: "1s" }}>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Security</div>
                <div className="text-xl font-bold text-slate-800">Malpractice Free</div>
              </div>
            </div>

            {/* Floating Badge 2 */}
            <div className="absolute -left-12 top-1/3 bg-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 hidden md:flex items-center gap-4 animate-float glass" style={{ animationDelay: "3s" }}>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800">2,500+</div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Students Managed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FEATURES GRID (Card Hover Effects) */}
      <div className="relative z-20 bg-white py-24" id="features">
        <div ref={featuresRef} className="max-w-7xl mx-auto px-6 opacity-0 translate-y-10 transition-all duration-1000 ease-out">
          <div className="text-center mb-20">
            <span className="text-university-600 font-bold tracking-widest uppercase text-sm">Key Capabilities</span>
            <h2 className="text-4xl font-extrabold text-slate-900 mt-2">Everything you need to manage exams</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="spotlight-card group relative bg-slate-50 p-8 rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-300">
              {/* Spotlight Gradient */}
              <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(59, 130, 246, 0.1), transparent 40%)` }}></div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <Layout className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">Automated Allocation</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Eliminate human error with our intelligent algorithm that generates distinct branch seating arrangements instantly.
                </p>
              </div>
            </div>

            <div className="spotlight-card group relative bg-slate-50 p-8 rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(16, 185, 129, 0.1), transparent 40%)` }}></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <ShieldCheck className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors">Malpractice Prevention</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Strategic seating patterns ensure students from the same department are never seated adjacent to each other.
                </p>
              </div>
            </div>

            <div className="spotlight-card group relative bg-slate-50 p-8 rounded-3xl border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-300">
              <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(245, 158, 11, 0.1), transparent 40%)` }}></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <Clock className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-amber-600 transition-colors">Real-time Efficiency</h3>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Save valuable time with instant room-wise and block-wise report generation for both admins and faculty.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ABOUT SECTION (Glassmorphism & Gradients) */}
      <section ref={aboutRef} className="py-24 bg-slate-900 relative overflow-hidden opacity-0 translate-y-10 transition-all duration-1000 ease-out">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-university-900/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-university-600/20 blur-[100px] rounded-full"></div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 mb-6">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">Premier Institute</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8 leading-tight">
              Empowering <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Academic Excellence</span>
            </h2>
            <p className="text-slate-300 text-lg leading-relaxed mb-8">
              Established in 2009, <strong className="text-white">VIVA Institute of Technology</strong> is a premier engineering institute approved by AICTE. This automated system is a testament to our dedication to technological advancement.
            </p>

            <div className="flex flex-col gap-4">
              {[
                "Dynamic Classroom Capacity Management",
                "Faculty Duty Allocation & Tracking",
                "Instant PDF Seating Plan Generation",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="p-2 bg-university-600 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-slate-200 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-[2.5rem] rotate-6 opacity-50 blur-lg scale-105 animate-pulse-slow"></div>
            <div className="relative bg-white rounded-[2rem] p-8 shadow-2xl">
              <div className="flex items-center justify-center mb-8">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-10 h-10 text-slate-900" />
                </div>
              </div>
              <div className="text-center space-y-2 mb-8">
                <h3 className="text-2xl font-bold text-slate-900">VIVA Institute</h3>
                <p className="text-slate-500 font-medium">Of Technology</p>
              </div>
              <div className="space-y-4">
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-university-600 rounded-full"></div>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
                  <span>Efficiency</span>
                  <span>98%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. USER ROLES (Clean Cards) */}
      <section ref={rolesRef} className="py-24 bg-slate-50 border-t border-slate-200 opacity-0 translate-y-10 transition-all duration-1000 ease-out">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Tailored for Every Role</h2>
            <p className="text-slate-600 text-lg">
              A unified platform providing specific tools and views for every stakeholder.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Principal */}
            <div className="spotlight-card group relative bg-white p-10 rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:border-indigo-200 transition-all duration-300">
              <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(79, 70, 229, 0.1), transparent 40%)` }}></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Super Admin</h3>
                <p className="text-slate-600 mb-8 leading-relaxed">Complete oversight of the examination process and master data.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-bold rounded-full border border-slate-100">Full Control</span>
                  <span className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-bold rounded-full border border-slate-100">Approvals</span>
                </div>
              </div>
            </div>

            {/* HOD */}
            <div className="spotlight-card group relative bg-white p-10 rounded-3xl shadow-lg border border-university-100 overflow-hidden transform hover:-translate-y-2 transition-all duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-university-400 to-university-600"></div>
              <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(37, 99, 235, 0.1), transparent 40%)` }}></div>

              <div className="relative z-10">
                <div className="w-14 h-14 bg-university-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <UserCog className="w-7 h-7 text-university-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">HOD & Admin</h3>
                <p className="text-slate-600 mb-8 leading-relaxed">Operational control for executing exam schedules and student lists.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-university-50 text-university-700 text-xs font-bold rounded-full border border-university-100">Scheduling</span>
                  <span className="px-3 py-1 bg-university-50 text-university-700 text-xs font-bold rounded-full border border-university-100">Allocation</span>
                </div>
              </div>
            </div>

            {/* Staff */}
            <div className="spotlight-card group relative bg-white p-10 rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:border-teal-200 transition-all duration-300">
              <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100" style={{ background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(20, 184, 166, 0.1), transparent 40%)` }}></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Faculty & Staff</h3>
                <p className="text-slate-600 mb-8 leading-relaxed">Streamlined access to assigned duties and student attendance sheets.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-bold rounded-full border border-slate-100">Duties</span>
                  <span className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-bold rounded-full border border-slate-100">Reporting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="bg-white pt-20 pb-10 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-university-900 text-white p-1.5 rounded-lg">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-xl font-extrabold text-slate-900">VIVA</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed font-medium">
                Automating academic excellence through technology. Designed for efficient, secure, and stress-free exams.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6">Platform</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-medium">
                <li><button onClick={() => window.scrollTo(0, 0)} className="hover:text-university-600 transition-colors">Home</button></li>
                <li><button onClick={() => handlePortalClick('Admin')} className="hover:text-university-600 transition-colors">Admin Login</button></li>
                <li><button onClick={() => handlePortalClick('Staff')} className="hover:text-university-600 transition-colors">Faculty Login</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6">Contact</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-medium">
                <li>VIVA Institute of Technology</li>
                <li>Virar, Maharashtra</li>
                <li className="text-university-600">contact@viva-technology.org</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6">Technology</h4>
              <div className="flex gap-2">
                <span className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-university-600 hover:bg-university-50 transition-all"><Code className="w-5 h-5" /></span>
                <span className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-university-600 hover:bg-university-50 transition-all"><Server className="w-5 h-5" /></span>
                <span className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-university-600 hover:bg-university-50 transition-all"><Database className="w-5 h-5" /></span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            <p>&copy; 2024 Exam HallMate. All rights reserved.</p>
            <p className="mt-2 md:mt-0">Academic Project • VIVA Tech</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;