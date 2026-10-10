import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { getStartup, updateStartup, extractError } from '../api/index.js';
import StartupForm from '../components/startups/StartupForm.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import ErrorMessage from '../components/ui/ErrorMessage.jsx';

export default function EditStartupPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [startup, setStartup] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getStartup(id)
      .then((res) => {
        if (cancelled) return;
        const s = res.data.startup;
        // Client-side ownership check — server will enforce too
        if (user?.id && s.owner && s.owner !== user.id) {
          navigate(`/startups/${id}`, { replace: true });
          return;
        }
        setStartup(s);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(extractError(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(data) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await updateStartup(id, data);
      navigate(`/startups/${id}`, { replace: true });
    } catch (err) {
      setSubmitError(extractError(err));
      setSubmitting(false);
    }
  }

  if (loading) return <Spinner />;
  if (loadError) return <ErrorMessage message={loadError} />;
  if (!startup) return null;

  return (
    <div className="form-page">
      <h1>Edit Startup</h1>
      <StartupForm
        initialValues={startup}
        onSubmit={handleSubmit}
        submitting={submitting}
        submitError={submitError}
        submitLabel="Save Changes"
      />
    </div>
  );
}
