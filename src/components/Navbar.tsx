import { useNavigate, useLocation } from '../lib/router';
import { usePuterStore } from '../lib/puter';

export default function Navbar() {
  const { navigate } = useNavigate();
  const { pathname } = useLocation();
  const { auth } = usePuterStore();

  const isDashboard = pathname === '/' || pathname === '';
  const isUpload = pathname === '/upload';

  return (
    <header className="sticky top-4 z-50 px-4 w-full">
      <nav className="max-w-6xl mx-auto backdrop-blur-md bg-white/85 border border-slate-200/80 rounded-full px-6 py-3 shadow-lg shadow-indigo-500/5 flex items-center justify-between transition-all duration-300">
        {/* Brand logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center bg-transparent border-none p-0 cursor-pointer"
        >
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 bg-clip-text text-transparent">
            RESUMIND
          </span>
        </button>

        {/* Center navigation links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/50 text-sm font-medium">
          <button
            onClick={() => navigate('/')}
            className={`px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer border-none ${
              isDashboard
                ? 'bg-white text-indigo-600 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 bg-transparent'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/upload')}
            className={`px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer border-none ${
              isUpload
                ? 'bg-white text-indigo-600 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50 bg-transparent'
            }`}
          >
            Analyze Resume
          </button>
        </div>

        {/* Right action area */}
        <div className="flex items-center gap-3">
          {auth.isAuthenticated && auth.user && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200/60 rounded-full px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>@{auth.user.username}</span>
            </div>
          )}
          <button
            onClick={() => navigate('/upload')}
            className="primary-button flex items-center gap-1.5 text-sm font-semibold px-5 py-2 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Upload Resume</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
