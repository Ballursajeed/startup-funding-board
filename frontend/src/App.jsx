import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext.jsx';
import { ProtectedRoute } from './auth/ProtectedRoute.jsx';
import Layout from './components/layout/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import StartupsPage from './pages/StartupsPage.jsx';
import StartupDetailPage from './pages/StartupDetailPage.jsx';
import CreateStartupPage from './pages/CreateStartupPage.jsx';
import EditStartupPage from './pages/EditStartupPage.jsx';
import SavedStartupsPage from './pages/SavedStartupsPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public auth routes (no layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* All pages with the navbar layout */}
          <Route element={<Layout />}>
            {/* Dashboard — protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Startup listing + detail — public */}
            <Route path="/startups" element={<StartupsPage />} />
            <Route path="/startups/:id" element={<StartupDetailPage />} />

            {/* /startups/new — founder only. Static segment beats :id param in React Router v6 */}
            <Route
              path="/startups/new"
              element={
                <ProtectedRoute requiredRole="founder">
                  <CreateStartupPage />
                </ProtectedRoute>
              }
            />

            {/* /startups/:id/edit — founder only */}
            <Route
              path="/startups/:id/edit"
              element={
                <ProtectedRoute requiredRole="founder">
                  <EditStartupPage />
                </ProtectedRoute>
              }
            />

            {/* Saved startups — any authenticated user */}
            <Route
              path="/saved-startups"
              element={
                <ProtectedRoute>
                  <SavedStartupsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
