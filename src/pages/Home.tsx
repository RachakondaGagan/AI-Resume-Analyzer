import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from '../lib/router';
import { usePuterStore } from '../lib/puter';
import Navbar from '../components/Navbar';
import ResumeCard from '../components/ResumeCard';

export default function Home() {
  const { auth, kv, isLoading } = usePuterStore();
  const { navigate } = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) navigate('/auth?next=/');
  }, [isLoading, auth.isAuthenticated]);

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    const load = async () => {
      setLoadingResumes(true);
      const items = (await kv.list('resume:*', true)) as KVItem[] | undefined;
      setResumes(items?.map((item) => JSON.parse(item.value) as Resume) ?? []);
      setLoadingResumes(false);
    };
    load();
  }, [auth.isAuthenticated]);

  // Compute SaaS analytics metrics
  const stats = useMemo(() => {
    if (resumes.length === 0) return { total: 0, avgScore: 0, topScore: 0 };
    const scores = resumes.map((r) => r.feedback?.overallScore ?? 0);
    const total = resumes.length;
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / total);
    const topScore = Math.max(...scores);
    return { total, avgScore, topScore };
  }, [resumes]);

  return (
    <main className="min-h-screen bg-slate-50/50 pb-20" style={{ backgroundImage: "url('/images/bg-main.svg')", backgroundSize: 'cover' }}>
      <Navbar />
      <section className="main-section max-w-7xl mx-auto px-4 pt-10">
        <div className="page-heading w-full flex flex-col items-center text-center gap-4">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight max-w-3xl">
            Track Applications & AI Ratings
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl font-normal leading-relaxed">
            Monitor your resume optimizations, review detailed ATS score breakdowns, and refine your job applications.
          </p>

          {/* Stats Bar */}
          {!loadingResumes && resumes.length > 0 && (
            <div className="w-full max-w-3xl grid grid-cols-3 gap-4 my-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm text-center">
                <p className="text-xs font-bold uppercase text-slate-400">Total Scans</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{stats.total}</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm text-center">
                <p className="text-xs font-bold uppercase text-slate-400">Average ATS Score</p>
                <p className="text-3xl font-black text-indigo-600 mt-1">{stats.avgScore}%</p>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm text-center">
                <p className="text-xs font-bold uppercase text-slate-400">Best Match Rating</p>
                <p className="text-3xl font-black text-emerald-600 mt-1">{stats.topScore}%</p>
              </div>
            </div>
          )}
        </div>

        {loadingResumes && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <img src="/images/resume-scan-2.gif" className="w-[180px]" alt="loading" />
            <p className="text-sm font-medium text-slate-500">Loading your saved resume analyses...</p>
          </div>
        )}

        {!loadingResumes && resumes.length > 0 && (
          <div className="resumes-section mt-4">
            {resumes.map((r) => <ResumeCard key={r.id} resume={r} />)}
          </div>
        )}

        {!loadingResumes && resumes.length === 0 && (
          <div className="w-full max-w-xl bg-white rounded-3xl p-10 border border-slate-200 shadow-xl text-center flex flex-col items-center gap-6 my-8">
            <div className="w-20 h-20 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-4xl shadow-inner">
              📄
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900">No Resumes Analyzed Yet</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-md">
                Upload your resume PDF along with target job titles to generate your first AI-driven ATS score and improvement roadmap.
              </p>
            </div>
            <button
              onClick={() => navigate('/upload')}
              className="primary-button text-base font-bold px-8 py-3.5 shadow-lg shadow-indigo-200"
            >
              🚀 Analyze Your First Resume
            </button>
          </div>
        )}

        {/* Feature Cards Grid — Displayed on Home Page */}
        <div className="w-full max-w-5xl mt-12 pt-8 border-t border-slate-200/60">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-black text-slate-900">How Resumind Supercharges Your Job Search</h3>
            <p className="text-slate-500 text-sm mt-1">AI-powered resume optimization designed to bypass ATS filters</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-3">
              <span className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">
                01
              </span>
              <h4 className="font-bold text-slate-900 text-base">Comprehensive ATS Scoring</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluates formatting, section hierarchy, ATS keyword density, and bullet point structure against industry standards.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-3">
              <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-black">
                02
              </span>
              <h4 className="font-bold text-slate-900 text-base">Tone & Impact Analytics</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Highlights strong action verbs, quantifiable achievements, and active voice to maximize recruiter interest.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-3">
              <span className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center text-xs font-black">
                03
              </span>
              <h4 className="font-bold text-slate-900 text-base">Targeted Suggestions</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive actionable bullet-by-bullet improvement tips tailored directly to your target role and industry.
              </p>
            </div>
          </div>

          {/* Privacy Banner */}
          <div className="mt-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-lg flex items-center justify-center gap-4 text-center">
            <div className="text-3xl">🔒</div>
            <div className="text-left">
              <p className="text-xs font-extrabold text-indigo-300 uppercase tracking-wider">Privacy Guaranteed</p>
              <p className="text-xs text-slate-300 mt-0.5">Your files are stored securely in browser storage and Puter Cloud.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
