import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { TravelDataProvider } from './lib/TravelDataContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorldMapPage } from './pages/WorldMapPage';
import { CountryListPage } from './pages/CountryListPage';
import { GoalsPage } from './pages/GoalsPage';
import './App.css';

function AuthGate() {
  const { session, loading } = useAuth();

  if (loading) {
    return <p className="page-loading">読み込み中...</p>;
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <TravelDataProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/map" element={<WorldMapPage />} />
          <Route path="/countries" element={<CountryListPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </TravelDataProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
