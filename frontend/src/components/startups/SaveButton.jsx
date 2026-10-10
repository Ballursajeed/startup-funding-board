import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth.js';
import { extractError } from '../../api/index.js';

export default function SaveButton({ startupId, showSignInPrompt }) {
  const { isAuthenticated, savedIds, pendingSaveIds, toggleSave } = useAuth();
  const [saveError, setSaveError] = useState(null);

  if (!isAuthenticated) {
    if (showSignInPrompt) {
      return (
        <Link to="/login" className="sign-in-to-save">
          Sign in to save
        </Link>
      );
    }
    return null;
  }

  const isSaved = savedIds.has(startupId);
  const isPending = pendingSaveIds.has(startupId);

  async function handleClick() {
    setSaveError(null);
    try {
      await toggleSave(startupId);
    } catch (err) {
      setSaveError(extractError(err));
    }
  }

  return (
    <div className="save-btn-wrapper">
      <button
        className={`save-btn${isSaved ? ' save-btn--saved' : ''}${isPending ? ' save-btn--pending' : ''}`}
        onClick={handleClick}
        disabled={isPending}
        aria-label={isSaved ? 'Remove from saved startups' : 'Save this startup'}
      >
        {isPending
          ? isSaved ? 'Removing…' : 'Saving…'
          : isSaved ? 'Unsave' : 'Save'}
      </button>
      {saveError && <p className="save-error">{saveError}</p>}
    </div>
  );
}
