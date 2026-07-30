import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, tokenStore } from '../lib/api';
import type { Profile } from '../lib/types';

interface AuthValue {
  user: Profile | null;
  loading: boolean;
  login: (userId: string, password: string) => Promise<void>;
  signup: (payload: {
    userId: string;
    password: string;
    name: string;
    dept: string;
    campus: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: Profile) => void;
}

const AuthContext = createContext<AuthValue>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  setUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the saved session on every visit.
  useEffect(() => {
    const token = tokenStore.get();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .restore()
      .then(({ user: u }) => setUser(u))
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (userId: string, password: string) => {
    const res = await api.login(userId, password);
    tokenStore.set(res.token);
    setUser(res.user);
  }, []);

  const signup = useCallback(
    async (payload: { userId: string; password: string; name: string; dept: string; campus: string }) => {
      const res = await api.signup(payload);
      tokenStore.set(res.token);
      setUser(res.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      /* even if the server call fails, drop the local session */
    }
    tokenStore.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
