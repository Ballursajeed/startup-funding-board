import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth.js';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          VentureBoard
        </Link>

        {/* Desktop nav links — hidden on mobile (shown inside open menu) */}
        <div className="navbar-nav" aria-label="Site navigation">
          <Link to="/startups" className="navbar-link">Startups</Link>
          {isAuthenticated && (
            <Link to="/saved-startups" className="navbar-link">Saved</Link>
          )}
        </div>

        {/* Hamburger button — visible on small screens only */}
        <button
          className="navbar-toggle"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>

        <div className={`navbar-menu${menuOpen ? ' navbar-menu--open' : ''}`}>
          {/* Mobile-only nav link (desktop version is in navbar-nav above) */}
          <Link to="/startups" className="navbar-link navbar-link--mobile">Startups</Link>
          {isAuthenticated && (
            <Link to="/saved-startups" className="navbar-link navbar-link--mobile">Saved</Link>
          )}

          {isAuthenticated ? (
            <>
              <span className="navbar-user">
                {user?.name}
                <span className={`role-badge role-badge--${user?.role}`}>
                  {user?.role === 'founder' ? 'Founder' : 'Investor'}
                </span>
              </span>
              <button className="btn btn-secondary" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">Log in</Link>
              <Link to="/signup" className="btn btn-primary">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
