import React from 'react';
import StartupCard from './StartupCard.jsx';
import Spinner from '../ui/Spinner.jsx';
import ErrorMessage from '../ui/ErrorMessage.jsx';

export default function StartupGrid({ startups, loading, error, currentUserId, onDelete }) {
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!startups || startups.length === 0) {
    return <p className="empty-state">No startups found.</p>;
  }

  return (
    <div className="startup-grid">
      {startups.map((startup) => (
        <StartupCard
          key={startup._id}
          startup={startup}
          currentUserId={currentUserId}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
