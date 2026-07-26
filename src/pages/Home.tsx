import { useEffect, useState } from 'react';
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
  }, [isLoading, auth.isAuthenticated, navigate]);

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    const load = async () => {
      setLoadingResumes(true);
      const items = (await kv.list('resume:*', true)) as KVItem[] | undefined;
      setResumes(items?.map((item) => JSON.parse(item.value) as Resume) ?? []);
      setLoadingResumes(false);
    };
    load();
  }, [auth.isAuthenticated, kv]);

  const handleDeleteResume = (deletedId: string) => {
    setResumes((prev) => prev.filter((r) => r.id !== deletedId));
  };

  return (
    <main style={{ backgroundImage: "url('/images/bg-main.svg')", backgroundSize: 'cover' }}>
      <Navbar />
      <section className="main-section max-w-7xl mx-auto">
        <div className="page-heading py-12">
          <h1>Track Your Applications & Resume Ratings</h1>
          {!loadingResumes && resumes.length === 0
            ? <h2>No resumes yet. Upload your first resume to get feedback.</h2>
            : <h2>Review your submissions and check AI-powered feedback.</h2>}
        </div>

        {loadingResumes && (
          <div className="flex items-center justify-center py-20">
            <img src="/images/resume-scan-2.gif" className="w-[200px]" alt="loading" />
          </div>
        )}

        {!loadingResumes && resumes.length > 0 && (
          <div className="resumes-section">
            {resumes.map((r) => (
              <ResumeCard key={r.id} resume={r} onDelete={handleDeleteResume} />
            ))}
          </div>
        )}

        {!loadingResumes && resumes.length === 0 && (
          <button
            onClick={() => navigate('/upload')}
            className="primary-button w-fit text-xl font-semibold px-10 py-4 mt-4 shadow-lg shadow-indigo-500/25 hover:scale-105 transition-transform"
          >
            Upload Resume
          </button>
        )}

        {/* Section below used resumes */}
        {!loadingResumes && (
          <div className="w-full mt-16 flex flex-col gap-12 max-w-6xl">
            {/* Quick Stats & Benefits Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-12 shadow-2xl border border-indigo-500/20">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex flex-col gap-3 text-center md:text-left max-w-xl">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1 rounded-full w-fit mx-auto md:mx-0">
                    ✨ AI Career Optimization
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                    Apply with confidence to every role
                  </h3>
                  <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                    Tailoring your resume for each target position boosts ATS keyword match rates by up to 40%. Get instant actionable tips before submitting.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/upload')}
                  className="bg-white text-indigo-950 font-bold px-8 py-4 rounded-full shadow-lg hover:bg-indigo-50 transition-all hover:scale-105 whitespace-nowrap text-base cursor-pointer border-none"
                >
                  + Analyze New Job Target
                </button>
              </div>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold">
                  🎯
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">ATS Keyword Match</h4>
                  <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                    Automatically compare hard skills & key terms in your resume against the employer's job description.
                  </p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
                  ⚡
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Format & Layout Audit</h4>
                  <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                    Detect formatting issues, structural errors, and missing sections that prevent ATS bots from parsing correctly.
                  </p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
                  📈
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">Impact Quantification</h4>
                  <p className="text-slate-500 text-sm mt-1 leading-relaxed">
                    Get tailored suggestions to rephrase experience bullet points into high-impact, metric-driven achievements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
