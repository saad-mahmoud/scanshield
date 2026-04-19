import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'scanshield_access_token';

type AuthContextValue = {
  token: string | null;
  setToken: (t: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() =>
    typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null,
  );

  const setToken = useCallback((t: string | null) => {
    setTokenState(t);
    if (t === null) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, t);
    }
  }, []);

  const logout = useCallback(() => setToken(null), [setToken]);

  return (
    <AuthContext.Provider value={{ token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
