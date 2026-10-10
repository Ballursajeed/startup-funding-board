import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth.js';
import { getStartups, deleteStartup, extractError } from '../api/index.js';
import StartupFilters from '../components/startups/StartupFilters.jsx';
import StartupGrid from '../components/startups/StartupGrid.jsx';
import Pagination from '../components/ui/Pagination.jsx';

const LIMIT = 12;
const DEFAULT_FILTERS = { search: '', industry: '', stage: '', status: '' };

export default function StartupsPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [startups, setStartups] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Generation counter to discard stale responses
  const fetchGen = useRef(0);

  const fetchStartups = useCallback(async (currentFilters, currentPage) => {
    const gen = ++fetchGen.current;
    setLoading(true);
    setError(null);
    try {
      const res = await getStartups({ ...currentFilters, page: currentPage, limit: LIMIT });
      if (gen !== fetchGen.current) return;
      setStartups(res.data.startups);
      setPagination(res.data.pagination);
    } catch (err) {
      if (gen !== fetchGen.current) return;
      setError(extractError(err));
    } finally {
      if (gen === fetchGen.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStartups(filters, page);
  }, [filters, page, fetchStartups]);

  function handleFilterChange(name, value) {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  }

  async function handleDelete(id) {
    try {
      await deleteStartup(id);
      fetchStartups(filters, page);
    } catch (err) {
      alert(extractError(err));
    }
  }

  return (
    <div className="startups-page">
      <div className="startups-page-header">
        <h1>Startups</h1>
        {user?.role === 'founder' && (
          <Link to="/startups/new" className="btn btn-primary">
            + Create Startup
          </Link>
        )}
      </div>

      <StartupFilters filters={filters} onChange={handleFilterChange} />

      <StartupGrid
        startups={startups}
        loading={loading}
        error={error}
        currentUserId={user?.id}
        onDelete={handleDelete}
      />

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </div>
  );
}
