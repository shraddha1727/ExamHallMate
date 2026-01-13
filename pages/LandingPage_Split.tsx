import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Server, Database, Code, FileText, Layout, ShieldCheck, Clock, Users } from 'lucide-react';

const LandingPage_Split: React.FC = () => {
    const navigate = useNavigate();

    const handlePortalClick = (role: 'Admin' | 'Staff') => {
        navigate('/login', { state: { role } });
    };

    const VIVA_LOGO_URL = "/logo.jpg";
    const VIVA_BUILDING_URL = "/viva_college.jpg";

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">

            {/* Navbar - Simple */}
            <nav className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center">
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md p-2 rounded-lg">
                    <img src={VIVA_LOGO_URL} alt="Logo" className="h-8 w-auto mix-blend-multiply" />
                    <span className="font-bold text-slate-900">Exam HallMate</span>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => handlePortalClick('Admin')} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-university-600 bg-white/80 backdrop-blur rounded-lg">Admin</button>
                    <button onClick={() => handlePortalClick('Staff')} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-university-600 bg-white/80 backdrop-blur rounded-lg">Staff</button>
                </div>
            </nav>

            {/* Hero Split */}
            <div className="flex flex-col lg:flex-row h-screen min-h-[700px]">
                {/* Left Content */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-20 lg:px-24 pt-20">

                    <div className="mb-8">
                        <span className="inline-block px-3 py-1 bg-university-50 text-university-700 rounded-full text-xs font-bold tracking-wider mb-4 border border-university-100">
                            OFFICIAL EXAM PORTAL
                        </span>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                            Precision in <br />
                            <span className="text-university-600">Examination.</span>
                        </h1>
                        <p className="text-lg text-slate-600 leading-relaxed max-w-lg mb-8">
                            Manage seating arrangements, prevent malpractice, and optimize resources with VIVA Institute's state-of-the-art automation system.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => handlePortalClick('Admin')}
                                className="px-8 py-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                Admin Dashboard <ArrowRight className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handlePortalClick('Staff')}
                                className="px-8 py-4 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all flex items-center justify-center"
                            >
                                Faculty Login
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-8 mt-4">
                        <div>
                            <h3 className="text-3xl font-bold text-slate-900">100%</h3>
                            <p className="text-sm text-slate-500 mt-1">Error-free Seating</p>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-slate-900">0s</h3>
                            <p className="text-sm text-slate-500 mt-1">Manual Effort</p>
                        </div>
                    </div>

                </div>

                {/* Right Image */}
                <div className="w-full lg:w-1/2 relative bg-slate-100 hidden lg:block h-full">
                    <img
                        src={VIVA_BUILDING_URL}
                        alt="Campus"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-university-900/40 mix-blend-multiply"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-black/80 to-transparent text-white">
                        <p className="font-serif italic text-xl opacity-90">"Education is the passport to the future, for tomorrow belongs to those who prepare for it today."</p>
                        <p className="mt-4 font-bold uppercase tracking-widest text-xs opacity-70">VIVA Institute of Technology</p>
                    </div>
                </div>
            </div>

            {/* Features Grid (Below Fold) */}
            <section className="bg-slate-50 py-20 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900">Streamlined Operations</h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                            <Layout className="w-10 h-10 text-university-600 mb-4" />
                            <h3 className="font-bold text-lg mb-2">Dynamic Allocation</h3>
                            <p className="text-slate-600 text-sm">Automatically shuffle students and generate seating charts based on room capacity and branch constraints.</p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                            <ShieldCheck className="w-10 h-10 text-university-600 mb-4" />
                            <h3 className="font-bold text-lg mb-2">Secure & Compliant</h3>
                            <p className="text-slate-600 text-sm">Adheres to university examination standards, ensuring a fair and secure environment for all candidates.</p>
                        </div>
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                            <Users className="w-10 h-10 text-university-600 mb-4" />
                            <h3 className="font-bold text-lg mb-2">Role-Based Access</h3>
                            <p className="text-slate-600 text-sm">Dedicated portals for Administrators and Teachers with specific tools for their operational needs.</p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default LandingPage_Split;
