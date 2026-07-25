import { useEffect, useState } from 'react';
import { useNavigate, useParams } from '../lib/router';
import { usePuterStore } from '../lib/puter';
import Summary from '../components/Summary';
import ATS from '../components/ATS';
import Details from '../components/Details';

export default function ResumePage() {
  const { auth, puterReady, isLoading, fs, kv } = usePuterStore();
  const params = useParams();
  const { navigate } = useNavigate();

  const [imageUrl, setImageUrl] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Redirect to auth if not signed in
  useEffect(() => {
    if (puterReady && !isLoading && !auth.isAuthenticated) {
      navigate(`/auth?next=/resume/${params.id}`);
    }
  }, [puterReady, isLoading, auth.isAuthenticated]);

  // Load resume data — depends on puterReady + auth + id all being available
  useEffect(() => {
    const id = params.id;
    if (!puterReady || !auth.isAuthenticated || !id) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setNotFound(false);
      setResume(null);
      setImageUrl('');
      setResumeUrl('');

      try {
        const raw = await kv.get(`resume:${id}`);
        if (cancelled) return;
        if (!raw) { setNotFound(true); setLoading(false); return; }

        const data: Resume = JSON.parse(raw);
        if (!cancelled) setResume(data);

        // Load PDF blob
        if (data.resumePath) {
          try {
            const pdfBlob = await fs.read(data.resumePath);
            if (pdfBlob && !cancelled) {
              setResumeUrl(URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' })));
            }
          } catch (e) {
            console.warn('Could not read resume PDF blob:', e);
          }
        }

        // Load image blob
        if (data.imagePath) {
          try {
            const imgBlob = await fs.read(data.imagePath);
            if (imgBlob && !cancelled) {
              setImageUrl(URL.createObjectURL(imgBlob));
            }
          } catch (e) {
            console.warn('Could not read image blob:', e);
          }
        }
      } catch (err) {
        console.error('Failed to load resume:', err);
        if (!cancelled) setNotFound(true);
      }

      if (!cancelled) setLoading(false);
    };

    load();
    return () => { cancelled = true; };
  }, [puterReady, auth.isAuthenticated, params.id]);

  return (
    <main className="!pt-0 min-h-screen">
      {/* Top nav */}
      <nav className="resume-nav sticky top-0 bg-white z-10">
        <button onClick={() => navigate('/')} className="back-button">
          <img src="/icons/back.svg" alt="back" className="w-2.5 h-2.5" />
          <span className="text-gray-800 text-sm font-semibold">Back to Dashboard</span>
        </button>
        {resume && (
          <div className="flex flex-col items-end">
            {resume.companyName && <p className="font-bold text-gray-800">{resume.companyName}</p>}
            {resume.jobTitle && <p className="text-sm text-gray-500">{resume.jobTitle}</p>}
          </div>
        )}
      </nav>

      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        {/* LEFT — sticky resume image */}
        <section
          className="feedback-section h-[100vh] sticky top-0 items-center justify-center"
          style={{ backgroundImage: "url('/images/bg-small.svg')", backgroundSize: 'cover' }}
        >
          {imageUrl ? (
            <div className="gradient-border h-[90%] w-fit" style={{ animation: 'fadeIn 0.8s ease-in' }}>
              <a href={resumeUrl || '#'} target="_blank" rel="noopener noreferrer" title="Click to open PDF">
                <img src={imageUrl} className="w-full h-full object-contain rounded-2xl" alt="Resume preview" />
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <img src="/images/resume-scan-2.gif" className="w-48" alt="loading" />
            </div>
          )}
        </section>

        {/* RIGHT — feedback */}
        <section className="feedback-section">
          <p className="text-4xl font-bold text-gray-900">Resume Review</p>

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <img src="/images/resume-scan-2.gif" className="w-48" alt="loading" />
              <p className="text-gray-400 text-sm">Loading your resume feedback...</p>
            </div>
          )}

          {!loading && notFound && (
            <div className="text-center py-20 flex flex-col items-center gap-6">
              <p className="text-2xl text-gray-400">Resume not found.</p>
              <button onClick={() => navigate('/')} className="primary-button w-fit px-8 py-3">
                Go to Dashboard
              </button>
            </div>
          )}

          {!loading && resume?.feedback && (
            <div className="flex flex-col gap-8 w-full" style={{ animation: 'fadeIn 0.8s ease-in' }}>
              <Summary feedback={resume.feedback} />
              <ATS
                score={resume.feedback.ATS?.score ?? 0}
                suggestions={resume.feedback.ATS?.tips ?? []}
              />
              <Details feedback={resume.feedback} />
            </div>
          )}

          {!loading && resume && !resume.feedback && (
            <div className="text-center py-20 flex flex-col items-center gap-6">
              <p className="text-xl text-gray-400">Analysis not available for this resume.</p>
              <button onClick={() => navigate('/upload')} className="primary-button w-fit px-8 py-3">
                Analyze Again
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}