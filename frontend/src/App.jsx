import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Login from './pages/Login';
import GroupList from './pages/GroupList';
import GroupView from './pages/GroupView';
import CreateExpense from './pages/CreateExpense';
import Simplify from './pages/Simplify';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><GroupList /></ProtectedRoute>} />
      <Route path="/groups/:id" element={<ProtectedRoute><GroupView /></ProtectedRoute>} />
      <Route path="/groups/:id/expense/new" element={<ProtectedRoute><CreateExpense /></ProtectedRoute>} />
      <Route path="/groups/:id/simplify" element={<ProtectedRoute><Simplify /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
