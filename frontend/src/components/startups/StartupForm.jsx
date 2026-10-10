import React, { useState } from 'react';

const DEFAULT_VALUES = {
  name: '',
  tagline: '',
  description: '',
  industry: '',
  stage: 'idea',
  fundingGoal: '',
  location: '',
  website: '',
  status: 'fundraising',
};

const REQUIRED = ['name', 'tagline', 'description', 'industry', 'stage', 'fundingGoal'];

export default function StartupForm({
  initialValues,
  onSubmit,
  submitting,
  submitError,
  submitLabel = 'Submit',
}) {
  const [values, setValues] = useState(() => ({
    ...DEFAULT_VALUES,
    ...(initialValues
      ? {
          name: initialValues.name || '',
          tagline: initialValues.tagline || '',
          description: initialValues.description || '',
          industry: initialValues.industry || '',
          stage: initialValues.stage || 'idea',
          fundingGoal:
            initialValues.fundingGoal !== undefined
              ? String(initialValues.fundingGoal)
              : '',
          location: initialValues.location || '',
          website: initialValues.website || '',
          status: initialValues.status || 'fundraising',
        }
      : {}),
  }));
  const [touched, setTouched] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  function validate(vals) {
    const errors = {};
    for (const field of REQUIRED) {
      if (!vals[field] || String(vals[field]).trim() === '') {
        errors[field] = 'This field is required.';
      }
    }
    if (vals.fundingGoal && Number(vals.fundingGoal) < 1) {
      errors.fundingGoal = 'Funding goal must be at least 1.';
    }
    return errors;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (touched) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: validate({ ...values, [name]: value })[name],
      }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    const errors = validate(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const data = {};
    for (const [key, value] of Object.entries(values)) {
      if (value !== '' && value !== undefined && value !== null) {
        data[key] = value;
      }
    }
    data.fundingGoal = Number(data.fundingGoal);
    onSubmit(data);
  }

  return (
    <form className="startup-form" onSubmit={handleSubmit} noValidate>
      {submitError && (
        <div className="form-error" role="alert">
          {submitError}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="sf-name">
          Company name{' '}
          <span aria-hidden="true" className="required-mark">
            *
          </span>
        </label>
        <input
          id="sf-name"
          name="name"
          type="text"
          value={values.name}
          onChange={handleChange}
          className={fieldErrors.name ? 'input-error' : ''}
          maxLength={100}
          aria-describedby={fieldErrors.name ? 'sf-name-err' : undefined}
          aria-required="true"
        />
        {fieldErrors.name && (
          <span id="sf-name-err" className="field-error">
            {fieldErrors.name}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="sf-tagline">
          Tagline{' '}
          <span aria-hidden="true" className="required-mark">
            *
          </span>
        </label>
        <input
          id="sf-tagline"
          name="tagline"
          type="text"
          value={values.tagline}
          onChange={handleChange}
          className={fieldErrors.tagline ? 'input-error' : ''}
          maxLength={150}
          aria-required="true"
        />
        {fieldErrors.tagline && (
          <span className="field-error">{fieldErrors.tagline}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="sf-description">
          Description{' '}
          <span aria-hidden="true" className="required-mark">
            *
          </span>
        </label>
        <textarea
          id="sf-description"
          name="description"
          value={values.description}
          onChange={handleChange}
          className={`startup-form-textarea${fieldErrors.description ? ' input-error' : ''}`}
          maxLength={3000}
          rows={5}
          aria-required="true"
        />
        {fieldErrors.description && (
          <span className="field-error">{fieldErrors.description}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="sf-industry">
            Industry{' '}
            <span aria-hidden="true" className="required-mark">
              *
            </span>
          </label>
          <input
            id="sf-industry"
            name="industry"
            type="text"
            value={values.industry}
            onChange={handleChange}
            className={fieldErrors.industry ? 'input-error' : ''}
            maxLength={60}
            aria-required="true"
          />
          {fieldErrors.industry && (
            <span className="field-error">{fieldErrors.industry}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="sf-stage">
            Stage{' '}
            <span aria-hidden="true" className="required-mark">
              *
            </span>
          </label>
          <select
            id="sf-stage"
            name="stage"
            value={values.stage}
            onChange={handleChange}
            className={`startup-form-select${fieldErrors.stage ? ' input-error' : ''}`}
            aria-required="true"
          >
            <option value="idea">Idea</option>
            <option value="pre-seed">Pre-seed</option>
            <option value="seed">Seed</option>
            <option value="series-a">Series A</option>
          </select>
          {fieldErrors.stage && (
            <span className="field-error">{fieldErrors.stage}</span>
          )}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="sf-fundingGoal">
            Funding goal (INR){' '}
            <span aria-hidden="true" className="required-mark">
              *
            </span>
          </label>
          <input
            id="sf-fundingGoal"
            name="fundingGoal"
            type="number"
            value={values.fundingGoal}
            onChange={handleChange}
            className={fieldErrors.fundingGoal ? 'input-error' : ''}
            min={1}
            step={1}
            aria-required="true"
          />
          {fieldErrors.fundingGoal && (
            <span className="field-error">{fieldErrors.fundingGoal}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="sf-status">Status</label>
          <select
            id="sf-status"
            name="status"
            value={values.status}
            onChange={handleChange}
            className="startup-form-select"
          >
            <option value="fundraising">Fundraising</option>
            <option value="paused">Paused</option>
            <option value="funded">Funded</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="sf-location">
          Location{' '}
          <span className="optional-mark">(optional)</span>
        </label>
        <input
          id="sf-location"
          name="location"
          type="text"
          value={values.location}
          onChange={handleChange}
          maxLength={100}
          placeholder="e.g. Bengaluru, India"
        />
      </div>

      <div className="form-group">
        <label htmlFor="sf-website">
          Website{' '}
          <span className="optional-mark">(optional)</span>
        </label>
        <input
          id="sf-website"
          name="website"
          type="url"
          value={values.website}
          onChange={handleChange}
          maxLength={300}
          placeholder="https://example.com"
        />
      </div>

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
