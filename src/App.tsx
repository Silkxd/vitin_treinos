import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { Exercises } from './pages/Exercises';
import WorkoutCreate from './pages/WorkoutCreate';
import Workouts from './pages/Workouts';
import WorkoutDetails from './pages/WorkoutDetails';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/alunos" element={<Students />} />
              <Route path="/exercicios" element={<Exercises />} />
              <Route path="/treinos" element={<Workouts />} />
              <Route path="/treinos/novo" element={<WorkoutCreate />} />
              <Route path="/treinos/:id" element={<WorkoutDetails />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
