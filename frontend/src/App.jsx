import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NoticesPage from './pages/NoticesPage';
import NoticeDetailPage from './pages/NoticeDetailPage';
import AdminDashboard from './pages/AdminDashboard';
import useAuth from '../hooks/useAuth';

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/notices" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/notices" element={<NoticesPage />} />
      <Route path="/notice/:id" element={<NoticeDetailPage />} />
      {console.log("from app",user?.role)}
      <Route
        path="/admin/dashboard"
        element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />}
      />
      <Route path="*" element={<Navigate to="/notices" />} />
    </Routes>
  );
};

export default App;
