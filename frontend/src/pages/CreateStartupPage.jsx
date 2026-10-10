import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStartup, extractError } from '../api/index.js';
import StartupForm from '../components/startups/StartupForm.jsx';

export default function CreateStartupPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  async function handleSubmit(data) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await createStartup(data);
      navigate(`/startups/${res.data.startup._id}`, { replace: true });
    } catch (err) {
      setSubmitError(extractError(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="form-page">
      <h1>Create Startup</h1>
      <StartupForm
        onSubmit={handleSubmit}
        submitting={submitting}
        submitError={submitError}
        submitLabel="Create Startup"
      />
    </div>
  );
}
