import React from 'react';
import { Link } from 'react-router-dom';
import SaveButton from './SaveButton.jsx';

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export default function StartupCard({ startup, currentUserId, onDelete }) {
  const isOwner = currentUserId && startup.owner && currentUserId === startup.owner;

  function handleDelete() {
    if (window.confirm(`Delete "${startup.name}"? This cannot be undone.`)) {
      onDelete?.(startup._id);
    }
  }

  return (
    <article className="startup-card">
      <div className="startup-card-body">
        <h3 className="startup-card-name">{startup.name}</h3>
        <p className="startup-card-tagline">{startup.tagline}</p>
        <div className="startup-card-badges">
          <span className="badge badge--industry">{startup.industry}</span>
          <span className="badge badge--stage">{startup.stage}</span>
          <span className={`badge badge--status badge--status-${startup.status}`}>
            {startup.status}
          </span>
        </div>
        <p className="startup-card-funding">
          Goal: {inrFormatter.format(startup.fundingGoal)}
        </p>
      </div>
      <div className="startup-card-footer">
        <Link to={`/startups/${startup._id}`} className="btn btn-secondary btn-sm">
          View details
        </Link>
        {isOwner && (
          <div className="startup-card-owner-actions">
            <Link to={`/startups/${startup._id}/edit`} className="btn btn-secondary btn-sm">
              Edit
            </Link>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>
              Delete
            </button>
          </div>
        )}
        <SaveButton startupId={startup._id} showSignInPrompt={false} />
      </div>
    </article>
  );
}
