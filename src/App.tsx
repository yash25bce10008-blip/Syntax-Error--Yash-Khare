import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

/**
 * Hard auth gate. Nothing but the loading state and the login screen can render
 * until a session has been verified against the database.
 */
function Gate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-page">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={22} className="animate-spin text-amber-deep" />
          <p className="text-[13px] text-mute">Checking your session…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Login />;
  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
