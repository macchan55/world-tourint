import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'ダッシュボード' },
  { to: '/map', label: '世界地図' },
  { to: '/countries', label: '国一覧' },
  { to: '/goals', label: '目標' },
];

export function Layout() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-brand">🌍 World Tourint</div>
        <nav className="app-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="app-header-user">
          <span className="user-email">{user?.email}</span>
          <button type="button" className="signout-btn" onClick={() => supabase.auth.signOut()}>
            ログアウト
          </button>
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
