import { Outlet, useNavigate } from 'react-router-dom';
import { BrandHeader } from '../components/BrandHeader';
import { SideMenu } from '../components/SideMenu';
import { useAuth } from '../hooks/useAuth';

export function AppShell() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/sign-in');
  }

  return (
    <div className="app-shell">
      <nav className="app-navbar">
        <BrandHeader />
        <div className="app-user-menu" data-testid="app-session-info">
          <span>
            {session?.username} ({session?.roles.join(', ')})
          </span>
          <button className="btn-outline" onClick={() => navigate('/change-password')}>
            Change Password
          </button>
          <button className="btn-outline" onClick={handleLogout}>
            Sign Out
          </button>
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
