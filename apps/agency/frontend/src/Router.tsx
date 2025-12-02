import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/(main)/dashboard/page';

const AppRouter: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/agency/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<Navigate to="/agency/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
