import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Rooms from './pages/Rooms';
import StudentsPage from './pages/StudentsPage';
import Exams from './pages/Exams';
import Seating from './pages/Seating';
import Teachers from './pages/Teachers';
import InvigilationPage from './pages/Invigilation';
import TeacherDashboard from './pages/TeacherDashboard';
import MyDuties from './pages/MyDuties';
import MyRooms from './pages/MyRooms';
import TeacherProfile from './pages/TeacherProfile';
import Login from './pages/Login';

import { initializeDemoData } from './services/storage';
import { isAuthenticated, getSession } from './services/auth';

// Layout component to wrap authenticated routes with Navbar
const AppLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen font-sans">
      <Navbar />
      {/* 
         Fix for Printing: 
         Added print:ml-0 print:p-0 print:h-auto print:overflow-visible print:w-full 
         to ensure content expands correctly on paper.
         Mobile: Remove left margin, reduce padding.
      */}
      <main className="flex-1 md:ml-64 ml-0 p-4 md:p-8 overflow-y-auto h-screen print:ml-0 print:p-0 print:h-auto print:overflow-visible print:w-full transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};

// Protected Route Guard
const ProtectedRoute: React.FC<{ allowedRole: 'SuperAdmin' | 'Teacher' }> = ({ allowedRole }) => {
  const isAuth = isAuthenticated();
  const session = getSession();
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (session?.role !== allowedRole) {
    // Redirect to correct dashboard if role mismatches
    return <Navigate to={session?.role === 'SuperAdmin' ? '/admin/dashboard' : '/staff/dashboard'} replace />;
  }

  return <AppLayout />;
};

const App: React.FC = () => {
  useEffect(() => {
    initializeDemoData();
  }, []);

  return (
    <Router>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<ProtectedRoute allowedRole="SuperAdmin" />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="exams" element={<Exams />} />
          <Route path="seating" element={<Seating />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="invigilation" element={<InvigilationPage />} />
          {/* Default admin redirect */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* STAFF ROUTES */}
        <Route path="/staff" element={<ProtectedRoute allowedRole="Teacher" />}>
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="duties" element={<MyDuties />} />
          <Route path="rooms" element={<MyRooms />} />
          <Route path="profile" element={<TeacherProfile />} />
          {/* Default staff redirect */}
          <Route index element={<Navigate to="/staff/dashboard" replace />} />
        </Route>

        {/* CATCH ALL */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;