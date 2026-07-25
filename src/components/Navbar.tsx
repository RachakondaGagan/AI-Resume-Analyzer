import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from '../lib/router';
import { usePuterStore } from '../lib/puter';
import { MISTRAL_KEY_LS } from '../lib/constants';

export default function Navbar() {
  const { navigate } = useNavigate();
  const { pathname } = useLocation();
  const { auth } = usePuterStore();

  const [hasKey, setHasKey] = useState(() => !!localStorage.getItem(MISTRAL_KEY_LS));
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState(() => localStorage.getItem(MISTRAL_KEY_LS) ?? '');
  const [keyError, setKeyError] = useState('');

  useEffect(() => {
    const checkKey = () => setHasKey(!!localStorage.getItem(MISTRAL_KEY_LS));
    window.addEventListener('storage', checkKey);
    return () => window.removeEventListener('storage', checkKey);
  }, []);

  const handleSaveKey = () => {
    const trimmed = inputKey.trim();
    if (!trimmed) { setKeyError('Please enter a valid API key.'); return; }
    localStorage.setItem(MISTRAL_KEY_LS, trimmed);
    setHasKey(true);
    setKeyError('');
    setShowKeyModal(false);
  };

  const handleRemoveKey = () => {
    localStorage.removeItem(MISTRAL_KEY_LS);
    setHasKey(false);
    setInputKey('');
    setShowKeyModal(false);
  };

  return (
    <header className="sticky top-4 z-40 w-full max-w-7xl mx-auto px-4">
      <nav className="flex items-center justify-between bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm rounded-full px-6 py-3 transition-all duration-300">
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 bg-transparent border-none p-0 cursor-pointer text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-gradient">RESUMIND</span>
              <span className="ml-2 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full px-2 py-0.5">
                AI SaaS
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1 ml-6 pl-6 border-l border-slate-200">
            <button
              onClick={() => navigate('/')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                pathname === '/' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/upload')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                pathname === '/upload' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Upload & Analyze
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Mistral Key Status Pill */}
          <button
            onClick={() => setShowKeyModal(true)}
            className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
              hasKey
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 animate-pulse'
            }`}
            title="Configure Mistral AI Key"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" style={{ display: hasKey ? 'inline-block' : 'none' }} />
            <span>🔑 {hasKey ? 'Mistral API Ready' : 'Add API Key'}</span>
          </button>

          {/* Upload Button */}
          <button
            onClick={() => navigate('/upload')}
            className="primary-button text-sm font-semibold px-5 py-2 shadow-md shadow-indigo-100 hover:shadow-indigo-200"
          >
            + New Scan
          </button>

          {/* User Account / Auth */}
          {auth.isAuthenticated && (
            <button
              onClick={auth.signOut}
              className="text-xs font-medium text-slate-500 hover:text-red-600 px-2 py-1 rounded-md transition-colors border-none bg-transparent cursor-pointer"
              title="Log out from Puter"
            >
              Log out
            </button>
          )}
        </div>
      </nav>

      {/* Key Config Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>🔑</span> Mistral AI Configuration
              </h3>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold border-none bg-transparent cursor-pointer"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-slate-600">
              Resumind uses your personal Mistral AI API key for analyzing resume content. Your key is stored safely in your browser local storage.
            </p>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-700">Mistral API Key</label>
              <input
                type="password"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Paste key starting with '...' "
                className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              {keyError && <p className="text-xs text-red-600">{keyError}</p>}
            </div>
            <div className="flex items-center justify-between pt-2">
              {hasKey && (
                <button
                  type="button"
                  onClick={handleRemoveKey}
                  className="text-xs text-red-600 hover:underline border-none bg-transparent cursor-pointer"
                >
                  Remove saved key
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-full border-none bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveKey}
                  className="primary-button text-xs font-semibold px-5 py-2"
                >
                  Save API Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
