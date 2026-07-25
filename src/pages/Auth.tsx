import { useEffect } from 'react';
import { useNavigate, useLocation } from '../lib/router';
import { usePuterStore } from '../lib/puter';

export default function Auth() {
  const { isLoading, auth } = usePuterStore();
  const { navigate } = useNavigate();
  const { search } = useLocation();
  const next = search.includes('next=') ? search.split('next=')[1] : '/';

  useEffect(() => {
    if (auth.isAuthenticated) navigate(next);
  }, [auth.isAuthenticated, next]);

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundImage: "url('/images/bg-auth.svg')", backgroundSize: 'cover' }}
    >
      <div className="gradient-border shadow-xl">
        <section className="flex flex-col gap-8 bg-white rounded-2xl p-10 min-w-[320px]">
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-5xl">Welcome</h1>
            <h2 className="text-xl text-gray-500">Log in to continue your job journey</h2>
          </div>
          <div className="flex justify-center">
            {isLoading ? (
              <button className="auth-button opacity-70 cursor-not-allowed">
                Signing you in...
              </button>
            ) : auth.isAuthenticated ? (
              <button className="auth-button" onClick={auth.signOut}>Log Out</button>
            ) : (
              <button className="auth-button" onClick={auth.signIn}>Log In with Puter</button>
            )}
          </div>
          <p className="text-center text-xs text-gray-400">
            Puter.com — free, no credit card needed
          </p>
        </section>
      </div>
    </main>
  );
}
