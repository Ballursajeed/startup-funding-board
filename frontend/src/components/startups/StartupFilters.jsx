import React from 'react';

export default function StartupFilters({ filters, onChange }) {
  return (
    <div className="filter-bar" role="search">
      <div className="filter-group">
        <label htmlFor="filter-search" className="filter-label">Search</label>
        <input
          id="filter-search"
          type="text"
          className="filter-input"
          placeholder="Name or tagline…"
          value={filters.search}
          onChange={(e) => onChange('search', e.target.value)}
        />
      </div>
      <div className="filter-group">
        <label htmlFor="filter-industry" className="filter-label">Industry</label>
        <input
          id="filter-industry"
          type="text"
          className="filter-input"
          placeholder="e.g. SaaS, HealthTech…"
          value={filters.industry}
          onChange={(e) => onChange('industry', e.target.value)}
        />
      </div>
      <div className="filter-group">
        <label htmlFor="filter-stage" className="filter-label">Stage</label>
        <select
          id="filter-stage"
          className="filter-select"
          value={filters.stage}
          onChange={(e) => onChange('stage', e.target.value)}
        >
          <option value="">All stages</option>
          <option value="idea">Idea</option>
          <option value="pre-seed">Pre-seed</option>
          <option value="seed">Seed</option>
          <option value="series-a">Series A</option>
        </select>
      </div>
      <div className="filter-group">
        <label htmlFor="filter-status" className="filter-label">Status</label>
        <select
          id="filter-status"
          className="filter-select"
          value={filters.status}
          onChange={(e) => onChange('status', e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="fundraising">Fundraising</option>
          <option value="paused">Paused</option>
          <option value="funded">Funded</option>
        </select>
      </div>
    </div>
  );
}
