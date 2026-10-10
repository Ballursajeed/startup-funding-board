import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}</h1>
        <span className={`role-badge role-badge--${user?.role}`}>
          {user?.role === 'founder' ? 'Founder' : 'Investor'}
        </span>
      </div>
      <p className="dashboard-placeholder">
        Startup listings coming in the next stage.
      </p>
      {user?.role === 'founder' && (
        <Link to="/startups/new" className="btn btn-primary">
          + Create Startup
        </Link>
      )}
    </div>
  );
}
