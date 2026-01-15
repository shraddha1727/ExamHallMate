import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/auth';
import { registerApi, resetPasswordApi } from '../services/users';
import { ArrowRight, Loader2, ChevronLeft, Mail, Lock, User, Building2, Fingerprint, ShieldCheck } from 'lucide-react';

type ViewState = 'LOGIN' | 'REGISTER' | 'RESET';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const VIVA_LOGO_URL = "/logo.jpg";

  const [activeTab, setActiveTab] = useState<'Admin' | 'Staff'>('Admin');
  const [view, setView] = useState<ViewState>('LOGIN');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Reveal animation
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (location.state && location.state.role) {
      setActiveTab(location.state.role);
    }
  }, [location]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    id: '',
    department: '',
    password: '',
    confirmPassword: '',
    currentPassword: '',
    newPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(async () => {
      try {
        const result = await login(formData.email, formData.password);
        if (result.success && result.user) {
          if (activeTab === 'Admin' && result.user.role !== 'SuperAdmin') {
            setError('Access Denied. Account does not have Admin privileges.');
            setLoading(false);
            return;
          }
          if (activeTab === 'Staff' && result.user.role !== 'Teacher') {
            setError('Invalid Portal. Please use the Admin Login.');
            setLoading(false);
            return;
          }
          if (result.user.role === 'SuperAdmin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/staff/dashboard');
          }
        } else {
          setError(result.error || 'Login failed');
          setLoading(false);
        }
      } catch (error) {
        setError('Server unresponsive. Please try again.');
        setLoading(false);
      }
    }, 1000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);

    try {
      await registerApi(formData, activeTab);
      setSuccessMsg(`Account created for ${activeTab}. Redirecting...`);
      setTimeout(() => {
        setView('LOGIN');
        setFormData({ ...formData, password: '', confirmPassword: '' });
        setSuccessMsg('');
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);

    try {
      await resetPasswordApi(formData, activeTab);
      setSuccessMsg("Credentials updated. Please login.");
      setTimeout(() => {
        setView('LOGIN');
        setFormData({ ...formData, password: '', currentPassword: '', newPassword: '', confirmPassword: '' });
        setSuccessMsg('');
      }, 2000);
    } catch (error: any) {
      setError(error.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-950 font-sans selection:bg-indigo-500 selection:text-white">

      {/* 1. Immersive Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      {/* 2. The Main "Big" Card */}
      <div className={`relative z-10 w-full max-w-[1100px] grid lg:grid-cols-5 bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden min-h-[650px] transition-all duration-700 ease-out transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>

        {/* Left Column: Visual Branding (Takes 2/5 width on desktop) */}
        <div className="hidden lg:flex lg:col-span-2 relative bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-10 flex-col justify-between overflow-hidden">

          {/* Background Effects for Left Panel */}
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_#00000080_100%)]"></div>

          {/* Content */}
          <div className="relative z-10">
            <button
              onClick={() => navigate('/')}
              className="flex items-center text-xs font-bold text-indigo-200/60 hover:text-white transition-colors uppercase tracking-widest group mb-8"
            >
              <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Website
            </button>

            <div className="mt-12">
              <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-8 animate-float">
                <img src={VIVA_LOGO_URL} alt="VIVA" className="w-14 h-14 object-contain" />
              </div>
              <h1 className="text-4xl font-extrabold text-white leading-tight mb-4 tracking-tight">
                Review. <br />
                Manage. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Excel.</span>
              </h1>
              <p className="text-indigo-200/80 text-lg font-medium leading-relaxed max-w-sm">
                The centralized examination management system for VIVA Institute of Technology.
              </p>
            </div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span>Secure</span>
              <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
              <span>Fast</span>
              <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
              <span>Automated</span>
            </div>
          </div>
        </div>

        {/* Right Column: Form (Takes 3/5 width on desktop, full width on mobile) */}
        <div className="col-span-1 lg:col-span-3 bg-slate-900/60 p-8 lg:p-12 flex flex-col justify-center relative">

          {/* Mobile Header (Only visible on mobile) */}
          <div className="lg:hidden mb-6 flex justify-between items-center">
            <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white"><ChevronLeft /></button>
            <img src={VIVA_LOGO_URL} alt="VIVA" className="w-8 h-8 rounded-lg" />
          </div>

          {/* Header Area */}
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {view === 'LOGIN' ? 'Sign In' : view === 'REGISTER' ? 'Create Account' : 'Reset Password'}
              </h2>
              <p className="text-slate-400 font-medium text-base">
                {view === 'LOGIN' ? 'Enter your credentials to access the portal.' :
                  'Please fill in your details to proceed.'}
              </p>
            </div>

            {/* Role Toggle Pill - Large */}
            {view === 'LOGIN' && (
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setActiveTab('Admin')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'Admin' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  Admin
                </button>
                <button
                  onClick={() => setActiveTab('Staff')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'Staff' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  Faculty
                </button>
              </div>
            )}
          </div>

          {/* ERROR / SUCCESS ALERTS */}
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border-l-4 border-red-500 rounded-r-lg flex items-center gap-3 animate-shake">
              <ShieldCheck className="w-5 h-5 text-red-400" />
              <span className="text-red-200 text-sm font-medium">{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-8 p-4 bg-emerald-500/10 border-l-4 border-emerald-500 rounded-r-lg flex items-center gap-3 animate-fade-in-down">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-200 text-sm font-medium">{successMsg}</span>
            </div>
          )}

          {/* THE FORM */}
          <form onSubmit={view === 'LOGIN' ? handleLogin : view === 'REGISTER' ? handleRegister : handleReset} className="space-y-6">

            {/* Registration Split Fields */}
            {view === 'REGISTER' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in-up">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">ID Number</label>
                  <div className="relative group">
                    <Fingerprint className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      required type="text" name="id" value={formData.id} onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-white placeholder:text-slate-600 font-medium"
                      placeholder={activeTab === 'Staff' ? 'T-001' : 'ADM-01'}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      required type="text" name="name" value={formData.name} onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-white placeholder:text-slate-600 font-medium"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                {activeTab === 'Staff' && (
                  <div className="sm:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Department</label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                      <input
                        required type="text" name="department" value={formData.department} onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-white placeholder:text-slate-600 font-medium"
                        placeholder="Computer Engineering"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Main Fields: Email & Password */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    required type="email" name="email" value={formData.email} onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-base text-white placeholder:text-slate-600 font-medium"
                    placeholder="name@viva-technology.org"
                  />
                </div>
              </div>

              {view !== 'RESET' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Password</label>
                    {view === 'LOGIN' && (
                      <button type="button" onClick={() => setView('RESET')} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      required type="password" name="password" value={formData.password} onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:bg-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all text-base text-white placeholder:text-slate-600 font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              {/* Confirm PW fields for Register/Reset */}
              {(view === 'REGISTER' || view === 'RESET') && (
                <div className="space-y-4 animate-fade-in-up">
                  {view === 'RESET' && <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase ml-1">New Password</label><input required type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500" placeholder="New Password" /></div>}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Confirm Password</label>
                    <input required type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500" placeholder="Confirm Password" />
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <button
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-900/40 hover:shadow-indigo-600/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 flex justify-center items-center text-lg group"
            >
              {loading ? <Loader2 className="animate-spin w-6 h-6" /> : (
                <>
                  {view === 'LOGIN' ? 'Login to Dashboard' : view === 'REGISTER' ? 'Complete Registration' : 'Reset Password'}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

          </form>

          <div className="mt-auto pt-8 text-center">
            {view === 'LOGIN' ? (
              <p className="text-slate-400">
                Don't have an account? <button onClick={() => setView('REGISTER')} className="text-white font-bold hover:text-indigo-400 transition-colors ml-1">Register Now</button>
              </p>
            ) : (
              <button onClick={() => setView('LOGIN')} className="text-slate-400 font-bold hover:text-white transition-colors">Back to Login</button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;
