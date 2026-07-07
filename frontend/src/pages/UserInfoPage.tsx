import { useAuth } from '../hooks/useAuth';

/**
 * FRONTEND_SPEC_v12.md wants email/phone/last-login shown here too, but none of those exist
 * on the live USERS table (see backend/src/repositories/UserRepository.ts) - only what
 * /auth/session can actually return is shown.
 */
export function UserInfoPage() {
  const { session } = useAuth();

  return (
    <div className="section-card" data-testid="userinfo-panel" style={{ maxWidth: 480 }}>
      <h2>Your Profile</h2>
      <table className="data-table">
        <tbody>
          <tr>
            <td>Username</td>
            <td data-testid="userinfo-name">{session?.username}</td>
          </tr>
          <tr>
            <td>Roles</td>
            <td data-testid="userinfo-roles">{session?.roles.join(', ')}</td>
          </tr>
          <tr>
            <td>Status</td>
            <td data-testid="userinfo-status">{session?.status}</td>
          </tr>
        </tbody>
      </table>
      <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-4)' }}>
        Email, phone, and last-login are not shown because the live database has no columns for them (see README.md).
      </p>
    </div>
  );
}
