import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/useAuth.js';
import { getSavedStartups, extractError } from '../api/index.js';
import StartupCard from '../components/startups/StartupCard.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';

export default function SavedStartupsPage() {
  const { user, savedIds } = useAuth();
  const [fetchedStartups, setFetchedStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getSavedStartups()
      .then((res) => {
        if (!cancelled) setFetchedStartups(res.data.startups ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(extractError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Filter by current savedIds so unsaving via SaveButton removes the item live
  const visible = fetchedStartups.filter((s) => savedIds.has(s._id));

  if (loading) return <Spinner />;

  return (
    <div className="startups-page">
      <div className="startups-page-header">
        <h1>Saved Startups</h1>
      </div>

      {error && <ErrorMessage message={error} />}

      {!error && visible.length === 0 && (
        <p className="empty-state">
          You haven't saved any startups yet. Browse startups to find some.
        </p>
      )}

      {visible.length > 0 && (
        <div className="startup-grid">
          {visible.map((startup) => (
            <StartupCard
              key={startup._id}
              startup={startup}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
