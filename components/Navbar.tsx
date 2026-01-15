import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Grid, BookOpen, Layers, UserCheck, Calendar, User, LogOut } from 'lucide-react';
import { getSession, logout } from '../services/auth';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const session = getSession();
  const role = session?.role || 'SuperAdmin';
  const VIVA_LOGO_URL = "/logo.jpg";

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const adminItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: Home },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/rooms', label: 'Rooms', icon: Grid },
    { to: '/admin/exams', label: 'Timetable', icon: BookOpen },
    { to: '/admin/seating', label: 'Seating', icon: Layers },
    { to: '/admin/teachers', label: 'Faculty', icon: UserCheck },
    { to: '/admin/invigilation', label: 'Invigilation', icon: Calendar },
  ];

  const teacherItems = [
    { to: '/staff/dashboard', label: 'Overview', icon: Home },
    { to: '/staff/duties', label: 'My Duties', icon: Calendar },
    { to: '/staff/rooms', label: 'Seating View', icon: Grid },
    { to: '/staff/profile', label: 'Profile', icon: User },
  ];

  const navItems = role === 'Teacher' ? teacherItems : adminItems;

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 flex flex-col z-[100] bg-gradient-to-b from-slate-900 to-slate-950 text-white border-r border-slate-800 no-print shadow-2xl">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 bg-white border-b border-university-900/10">
        <img
          src={VIVA_LOGO_URL}
          alt="VIVA Logo"
          className="h-10 w-auto object-contain mr-3 mix-blend-multiply drop-shadow-sm"
        />
        <div className="flex flex-col">
          <h1 className="text-[12px] font-black text-slate-900 tracking-wider uppercase leading-none">VIVA<br /><span className="text-university-600">Tech</span></h1>
          <p className="text-[9px] text-slate-400 uppercase font-bold mt-1 tracking-widest">
            {role === 'Teacher' ? 'Faculty' : 'Admin'} Panel
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-8">
        <div className="px-6 mb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</div>
        <ul className="space-y-2 px-4">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${isActive
                    ? 'bg-university-600/10 text-white shadow-lg border border-university-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-university-500 rounded-l"></div>}
                    <item.icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-university-400' : 'text-slate-500 group-hover:text-university-400'}`} />
                    {item.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User / Logout */}
      <div className="p-4 bg-slate-950 border-t border-slate-900">
        <div className="flex items-center mb-4 px-2 p-3 rounded-xl bg-slate-900 border border-slate-800">
          <div className="w-10 h-10 rounded-full bg-university-600 flex items-center justify-center text-sm font-bold text-white shadow-lg border-2 border-slate-800">
            {session?.name?.charAt(0) || 'U'}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{session?.name || 'User'}</p>
            <p className="text-[10px] text-slate-400 truncate">{session?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all group"
        >
          <LogOut className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Navbar;