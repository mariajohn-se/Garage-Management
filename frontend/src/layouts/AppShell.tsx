import { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { BrandHeader } from '../components/BrandHeader';
import { SideMenu } from '../components/SideMenu';
import { useAuth } from '../hooks/useAuth';

function getInitials(username?: string): string {
  if (!username) return '?';
  const parts = username.trim().split(/[\s._-]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function AppShell() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    navigate('/sign-in');
  }

  function goTo(path: string) {
    setMenuOpen(false);
    navigate(path);
  }

  return (
    <div className="app-shell">
      <nav className="app-navbar">
        <BrandHeader />
        <div className="app-user-menu" data-testid="app-session-info" ref={menuRef}>
          <button
            type="button"
            className="app-user-avatar-btn"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="app-user-avatar" aria-hidden="true">
              {getInitials(session?.username)}
            </span>
            <span className="app-user-name">{session?.username}</span>
            <span className={`app-user-chevron ${menuOpen ? 'is-open' : ''}`} aria-hidden="true">
              &#9662;
            </span>
          </button>
          {menuOpen && (
            <div className="app-user-dropdown" role="menu">
              <div className="app-user-dropdown-header">
                <span className="app-user-avatar app-user-avatar-lg" aria-hidden="true">
                  {getInitials(session?.username)}
                </span>
                <div className="app-user-dropdown-info">
                  <span className="app-user-dropdown-name">{session?.username}</span>
                  <span className="app-user-dropdown-role">{session?.roles.join(', ')}</span>
                </div>
              </div>
              <div className="app-user-dropdown-divider" />
              <button type="button" role="menuitem" className="app-user-dropdown-item" onClick={() => goTo('/user-info')}>
                My Profile
              </button>
              <button type="button" role="menuitem" className="app-user-dropdown-item" onClick={() => goTo('/health')}>
                System Health
              </button>
              <button type="button" role="menuitem" className="app-user-dropdown-item" onClick={() => goTo('/change-password')}>
                Change Password
              </button>
              <div className="app-user-dropdown-divider" />
              <button type="button" role="menuitem" className="app-user-dropdown-item is-danger" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>
      <div className="app-body">
        <SideMenu />
        <div className="app-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
