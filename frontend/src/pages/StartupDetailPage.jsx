import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { getStartup, deleteStartup, extractError } from '../api/index.js';
import Spinner from '../components/ui/Spinner.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';
import SaveButton from '../components/startups/SaveButton.jsx';

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export default function StartupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getStartup(id)
      .then((res) => {
        if (!cancelled) setStartup(res.data.startup);
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = extractError(err);
          setError(err.response?.status === 404 ? 'Startup not found.' : msg);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleDelete() {
    if (!window.confirm(`Delete "${startup?.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteStartup(id);
      navigate('/startups', { replace: true });
    } catch (err) {
      alert(extractError(err));
      setDeleting(false);
    }
  }

  if (loading) return <Spinner />;
  if (error)
    return (
      <div className="detail-page">
        <ErrorMessage message={error} />
        <Link to="/startups" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to startups
        </Link>
      </div>
    );
  if (!startup) return null;

  const isOwner = user?.id && startup.owner && user.id === startup.owner;

  return (
    <div className="detail-page">
      <div className="detail-back">
        <Link to="/startups" className="btn btn-secondary btn-sm">
          &larr; Back to startups
        </Link>
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          <h1 className="detail-name">{startup.name}</h1>
          <p className="detail-tagline">{startup.tagline}</p>

          <div className="startup-card-badges" style={{ marginBottom: '1.5rem' }}>
            <span className="badge badge--industry">{startup.industry}</span>
            <span className="badge badge--stage">{startup.stage}</span>
            <span className={`badge badge--status badge--status-${startup.status}`}>
              {startup.status}
            </span>
          </div>

          <SaveButton startupId={startup._id} showSignInPrompt={true} />

          <section className="detail-section">
            <h2>About</h2>
            <p style={{ whiteSpace: 'pre-wrap' }}>{startup.description}</p>
          </section>
        </div>

        <aside className="detail-sidebar">
          <div className="detail-meta">
            <div className="detail-meta-item">
              <span className="detail-meta-label">Funding Goal</span>
              <span className="detail-meta-value">
                {inrFormatter.format(startup.fundingGoal)}
              </span>
            </div>
            {startup.location && (
              <div className="detail-meta-item">
                <span className="detail-meta-label">Location</span>
                <span className="detail-meta-value">{startup.location}</span>
              </div>
            )}
            {startup.website && (
              <div className="detail-meta-item">
                <span className="detail-meta-label">Website</span>
                <a
                  href={startup.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-meta-value"
                >
                  {startup.website}
                </a>
              </div>
            )}
            <div className="detail-meta-item">
              <span className="detail-meta-label">Stage</span>
              <span className="detail-meta-value">{startup.stage}</span>
            </div>
            <div className="detail-meta-item">
              <span className="detail-meta-label">Status</span>
              <span className="detail-meta-value">{startup.status}</span>
            </div>
            <div className="detail-meta-item">
              <span className="detail-meta-label">Posted by</span>
              <span className="detail-meta-value">A founder</span>
            </div>
          </div>

          {isOwner && (
            <div className="detail-owner-actions">
              <Link
                to={`/startups/${startup._id}/edit`}
                className="btn btn-secondary btn-full"
              >
                Edit startup
              </Link>
              <button
                className="btn btn-danger btn-full"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete startup'}
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
