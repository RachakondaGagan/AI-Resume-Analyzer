import React, {
  createContext, useContext, useState, useEffect,
  useCallback, useMemo, type ReactNode,
} from 'react';

interface RouterCtx {
  path: string;
  navigate: (to: string) => void;
  params: Record<string, string>;
  search: string;
}

const RouterContext = createContext<RouterCtx>({
  path: '/', navigate: () => {}, params: {}, search: '',
});

function parseHash(hash: string) {
  const full = hash.replace(/^#/, '') || '/';
  const qIdx = full.indexOf('?');
  if (qIdx === -1) return { path: full, search: '' };
  return { path: full.slice(0, qIdx), search: full.slice(qIdx + 1) };
}

function extractParams(path: string): Record<string, string> {
  const parts = path.split('/');
  if (parts[1] === 'resume' && parts[2]) return { id: parts[2] };
  return {};
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [loc, setLoc] = useState(() => parseHash(window.location.hash));

  const navigate = useCallback((to: string) => {
    // Ensure hash starts with /
    const hash = to.startsWith('/') ? to : '/' + to;
    window.location.hash = hash;
    // Manually fire state update in case hashchange doesn't fire (same hash)
    setLoc(parseHash('#' + hash));
  }, []);

  useEffect(() => {
    const handler = () => setLoc(parseHash(window.location.hash));
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  // Derive params synchronously from path — no separate useEffect, no race condition
  const params = useMemo(() => extractParams(loc.path), [loc.path]);

  return (
    <RouterContext.Provider value={{ path: loc.path, navigate, params, search: loc.search }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useNavigate() {
  const { navigate } = useContext(RouterContext);
  return { navigate };
}

export function useParams() {
  return useContext(RouterContext).params;
}

export function useLocation() {
  const { path, search } = useContext(RouterContext);
  return { pathname: path, search };
}

function matchRoute(routePath: string, actualPath: string): boolean {
  const rParts = routePath.split('/');
  const aParts = actualPath.split('/');
  if (rParts.length !== aParts.length) return false;
  return rParts.every((part, i) => part.startsWith(':') || part === aParts[i]);
}

interface RouteConfig { path: string; component: React.ComponentType; }

export function Routes({ routes }: { routes: RouteConfig[] }) {
  const { path } = useContext(RouterContext);
  for (const route of routes) {
    if (matchRoute(route.path, path)) return <route.component />;
  }
  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="text-center p-8">
        <p className="text-6xl font-bold text-gray-300">404</p>
        <p className="text-gray-500 mt-4 text-xl">Page not found</p>
      </div>
    </main>
  );
}
