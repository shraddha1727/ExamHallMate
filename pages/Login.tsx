import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/auth';
import { registerApi, resetPasswordApi } from '../services/users';
import { ArrowRight, Loader2, ChevronLeft, ShieldCheck } from 'lucide-react';

type ViewState = 'LOGIN' | 'REGISTER' | 'RESET';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const VIVA_LOGO_URL = "/logo.jpg";
  
  const [activeTab, setActiveTab] = useState<'Admin' | 'Staff'>('Admin');
  const [view, setView] = useState<ViewState>('LOGIN');
  
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

    // Simulate network delay
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
        setError('Login failed. Server may be down.');
        setLoading(false);
      }
    }, 800);
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
      setSuccessMsg(activeTab === 'Staff' ? "Teacher account created. Please login." : "Admin account created. Please login.");
      setView('LOGIN');
      setFormData({ ...formData, password: '' }); 
    } catch (error: any) {
      setError(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    setLoading(true);

    try {
      await resetPasswordApi(formData, activeTab);
      setSuccessMsg("Password updated successfully. Please login.");
      setView('LOGIN');
      setFormData({ ...formData, password: '', currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setError(error.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-300 font-sans text-slate-900">
      
      {/* Left Panel - University Branding */}
      <div className="hidden lg:flex w-5/12 bg-indigo-950 flex-col justify-between p-16 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8 opacity-80">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold tracking-widest uppercase">Official Portal</span>
          </div>
          <h1 className="text-3xl font-bold mb-4 leading-tight tracking-tight">
            VIVA Institute of Technology
          </h1>
          <p className="text-lg text-university-200 font-light mb-8">
            Exam HallMate
          </p>
          <div className="h-1 w-16 bg-university-600 rounded"></div>
        </div>

        <div className="relative z-10 flex justify-center items-center">
          <img
            src={VIVA_LOGO_URL}
            alt="VIVA Institute Logo"
            className="h-32 md:h-40 w-auto object-contain drop-shadow-xl border-4 border-white/75 rounded-2xl bg-white/5"
          />
        </div>
        
        <div className="relative z-10 text-xs text-university-300 font-medium">
           <p>© 2025 Department of Computer Engineering</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center items-center p-8 bg-white">
        <div className="w-full max-w-md">
          <button onClick={() => navigate('/')} className="flex items-center text-xs font-bold text-slate-400 hover:text-slate-800 mb-10 transition-colors uppercase tracking-wide">
             <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
          </button>

          <div className="bg-white">
            {/* White Background for Logo */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-university-900">
                {view === 'LOGIN' ? (activeTab === 'Admin' ? 'Admin Login' : 'Faculty Login') : 
                 view === 'REGISTER' ? 'Create Account' : 'Reset Password'}
              </h2>
              <p className="text-slate-500 mt-2 text-sm">
                {view === 'LOGIN' ? 'Enter your credentials to access the portal.' : 'Complete the form below.'}
              </p>
            </div>

            {view === 'LOGIN' && (
              <div className="flex bg-slate-100 p-1 rounded mb-8 border border-slate-200">
                 <button 
                    onClick={() => setActiveTab('Admin')}
                    className={`flex-1 py-2 text-sm font-semibold rounded transition-all ${activeTab === 'Admin' ? 'bg-white text-university-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    Admin
                 </button>
                 <button 
                    onClick={() => setActiveTab('Staff')}
                    className={`flex-1 py-2 text-sm font-semibold rounded transition-all ${activeTab === 'Staff' ? 'bg-white text-university-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    Faculty
                 </button>
              </div>
            )}

            {error && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r">{error}</div>}
            {successMsg && <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-medium rounded-r">{successMsg}</div>}

            <form onSubmit={view === 'LOGIN' ? handleLogin : view === 'REGISTER' ? handleRegister : handleReset} className="space-y-5">
               {view === 'REGISTER' && (
                 <>
                   <div className="mb-2 p-3 bg-blue-50 text-blue-800 text-xs rounded border border-blue-100 font-medium">
                     {activeTab === 'Staff' ? 'Faculty Registration (New Users)' : 'Admin Registration (Authorized Only)'}
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 ml-1">{activeTab === 'Staff' ? 'Staff ID' : 'Admin ID'}</label>
                     <input required type="text" name="id" value={formData.id} onChange={handleInputChange} className="input-field py-3" placeholder={activeTab === 'Staff' ? 'T-001' : 'Admin-01'} />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 ml-1">Full Name</label>
                     <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="input-field py-3" placeholder="John Doe" />
                   </div>
                   {activeTab === 'Staff' && (
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 ml-1">Department</label>
                        <input required type="text" name="department" value={formData.department} onChange={handleInputChange} className="input-field py-3" placeholder="CO" />
                    </div>
                   )}
                 </>
               )}

               <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 ml-1">Email Address</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-field py-3" />
               </div>

               {view !== 'RESET' && (
                 <div>
                    <div className="flex justify-between mb-1.5 ml-1">
                       <label className="block text-xs font-bold text-slate-700 uppercase">Password</label>
                       {view === 'LOGIN' && <button type="button" onClick={() => setView('RESET')} className="text-xs text-university-600 hover:text-university-800 font-bold">Forgot Password?</button>}
                    </div>
                    <input required type="password" name="password" value={formData.password} onChange={handleInputChange} className="input-field py-3" />
                 </div>
               )}

               {view === 'REGISTER' && (
                 <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 ml-1">Confirm Password</label>
                    <input required type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="input-field py-3" />
                 </div>
               )}

               {view === 'RESET' && (
                 <>
                    <div>
                       <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 ml-1">Current Password</label>
                       <input required type="password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange} className="input-field py-3" />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 ml-1">New Password</label>
                       <input required type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} className="input-field py-3" />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 ml-1">Confirm New Password</label>
                       <input required type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="input-field py-3" />
                    </div>
                 </>
               )}

               <button type="submit" disabled={loading} className="w-full bg-university-900 text-white font-bold py-3.5 px-4 rounded hover:bg-university-800 transition-all flex justify-center items-center mt-8 shadow-sm">
                 {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                    <>
                      {view === 'LOGIN' ? 'Secure Login' : view === 'REGISTER' ? 'Register Account' : 'Update Password'}
                      {view === 'LOGIN' && <ArrowRight className="w-4 h-4 ml-2" />}
                    </>
                 )}
               </button>
            </form>

            {view === 'LOGIN' && (
               <div className="mt-8 text-center pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                     First time? <button onClick={() => setView('REGISTER')} className="text-university-700 font-bold hover:underline">Activate Account</button>
                  </p>
               </div>
            )}
            
            {(view === 'REGISTER' || view === 'RESET') && (
               <div className="mt-8 text-center pt-6 border-t border-slate-100">
                  <button onClick={() => setView('LOGIN')} className="text-xs text-slate-500 font-bold hover:text-slate-800">Back to Login</button>
               </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
