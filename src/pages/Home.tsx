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

  return (
    <main style={{ backgroundImage: "url('/images/bg-main.svg')", backgroundSize: 'cover' }}>
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-16">
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
            {resumes.map((r) => <ResumeCard key={r.id} resume={r} />)}
          </div>
        )}

        {!loadingResumes && resumes.length === 0 && (
          <button
            onClick={() => navigate('/upload')}
            className="primary-button w-fit text-xl font-semibold px-10 py-4 mt-4"
          >
            Upload Resume
          </button>
        )}
      </section>
    </main>
  );
}
