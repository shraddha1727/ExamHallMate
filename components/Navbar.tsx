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
    <aside className="w-64 h-screen fixed left-0 top-0 flex flex-col z-50 bg-university-900 text-white border-r border-university-800 no-print shadow-xl">
      {/* Brand Header - White for Logo Compliance */}
      <div className="h-20 flex items-center px-6 bg-white border-b border-slate-200">
        <img 
          src={VIVA_LOGO_URL} 
          alt="VIVA Logo" 
          className="h-12 w-auto object-contain mr-3 mix-blend-multiply drop-shadow-sm"
        />
        <div className="flex flex-col">
          <h1 className="text-[10px] font-extrabold text-university-900 tracking-wide uppercase leading-tight">VIVA<br/>Institute</h1>
          <p className="text-[9px] text-university-600 uppercase font-bold mt-0.5">
            {role === 'Teacher' ? 'Staff' : 'Admin'}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6">
        <div className="px-6 mb-3 text-[10px] font-bold text-university-300 uppercase tracking-widest">Main Menu</div>
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2.5 rounded text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-university-800 text-white shadow-inner border border-university-700'
                      : 'text-university-200 hover:text-white hover:bg-university-800'
                  }`
                }
              >
                <item.icon className={`w-4 h-4 mr-3 opacity-90`} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User / Logout */}
      <div className="p-4 border-t border-university-800 bg-university-950">
        <div className="flex items-center mb-4 px-2">
          <div className="w-8 h-8 rounded bg-university-800 flex items-center justify-center text-xs font-bold text-white border border-university-700">
            {session?.name?.charAt(0) || 'U'}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{session?.name || 'User'}</p>
            <p className="text-[10px] text-university-300 truncate">{session?.email}</p>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-3 py-2 bg-university-900 hover:bg-university-800 text-university-200 hover:text-white border border-university-800 rounded text-xs font-bold transition-all"
        >
          <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Navbar;