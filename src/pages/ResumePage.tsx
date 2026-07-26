import { useEffect, useState } from 'react';
import { useNavigate, useParams } from '../lib/router';
import { usePuterStore } from '../lib/puter';
import { markIdAsDeleted } from '../lib/utils';
import { convertPdfToImage } from '../lib/pdf2img';
import Summary from '../components/Summary';
import ATS from '../components/ATS';
import Details from '../components/Details';

export default function ResumePage() {
  const { auth, puterReady, fs, kv } = usePuterStore();
  const { id } = useParams();
  const { navigate } = useNavigate();
  const [imageUrl, setImageUrl] = useState('');
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [resumeUrl, setResumeUrl] = useState('');
  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Redirect to auth if not signed in once puter is ready
  useEffect(() => {
    if (puterReady && !auth.isAuthenticated) {
      navigate(`/auth?next=/resume/${id}`);
    }
  }, [puterReady, auth.isAuthenticated, id, navigate]);

  // Load resume data once puter is ready + user is authed + we have an id
  useEffect(() => {
    if (!puterReady || !auth.isAuthenticated || !id) return;

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setNotFound(false);

      try {
        // 1. Check local session storage first (instant load after upload)
        let raw = sessionStorage.getItem(`resume:${id}`);
        if (!raw) {
          // 2. Poll Puter KV up to 3 attempts (handles network sync lag)
          for (let attempt = 0; attempt < 3; attempt++) {
            raw = (await kv.get(`resume:${id}`)) ?? null;
            if (raw) break;
            await new Promise((r) => setTimeout(r, 400));
          }
        }

        if (!raw || cancelled) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const data: Resume = JSON.parse(raw);
        if (!cancelled) setResume(data);

        // Check instant local thumbnail & page images cache
        const localImg = sessionStorage.getItem(`resume_img:${id}`);
        const localPages = sessionStorage.getItem(`resume_pages:${id}`);

        if (localPages && !cancelled) {
          try { setPageImages(JSON.parse(localPages)); } catch {}
        }

        if (localImg && !cancelled) {
          setImageUrl(localImg);
        } else if (data.imagePath) {
          const imgBlob = await fs.read(data.imagePath);
          if (imgBlob && !cancelled) {
            setImageUrl(URL.createObjectURL(imgBlob));
          }
        }

        // Load PDF blob & generate close-up page cards if needed
        if (data.resumePath) {
          const pdfBlob = await fs.read(data.resumePath);
          if (pdfBlob && !cancelled) {
            setResumeUrl(URL.createObjectURL(new Blob([pdfBlob], { type: 'application/pdf' })));

            if (!localPages) {
              const pdfFile = new File([pdfBlob], 'document.pdf', { type: 'application/pdf' });
              const res = await convertPdfToImage(pdfFile);
              if (res.pageImages && res.pageImages.length > 0 && !cancelled) {
                setPageImages(res.pageImages);
              }
            }
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
  }, [puterReady, auth.isAuthenticated, id, fs, kv]);

  const handleDeleteThisResume = async () => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this resume analysis?')) {
      markIdAsDeleted(id);
      sessionStorage.removeItem(`resume:${id}`);
      sessionStorage.removeItem(`resume_img:${id}`);
      sessionStorage.removeItem(`resume_pages:${id}`);
      await kv.delete(`resume:${id}`);
      if (resume?.imagePath) fs.delete(resume.imagePath).catch(() => {});
      if (resume?.resumePath) fs.delete(resume.resumePath).catch(() => {});
      navigate('/');
    }
  };

  return (
    <main className="!pt-0 min-h-screen">
      {/* Top nav */}
      <nav className="resume-nav sticky top-0 bg-white z-10 px-6 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="back-button">
            <img src="/icons/back.svg" alt="back" className="w-2.5 h-2.5" />
            <span className="text-gray-800 text-sm font-semibold">Back to Dashboard</span>
          </button>
          {resume && (
            <button
              onClick={handleDeleteThisResume}
              className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg px-3 py-2 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete Analysis</span>
            </button>
          )}
        </div>
        {resume && (
          <div className="flex flex-col items-end">
            {resume.companyName && (
              <p className="font-bold text-gray-800">{resume.companyName}</p>
            )}
            {resume.jobTitle && (
              <p className="text-sm text-gray-500">{resume.jobTitle}</p>
            )}
          </div>
        )}
      </nav>

      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        {/* LEFT — sticky resume preview */}
        <section
          className="feedback-section h-[100vh] sticky top-0 items-center justify-center"
          style={{ backgroundImage: "url('/images/bg-small.svg')", backgroundSize: 'cover' }}
        >
          {imageUrl ? (
            <div className="gradient-border h-[90%] w-fit shadow-2xl" style={{ animation: 'fadeIn 0.8s ease-in' }}>
              <a href={resumeUrl || '#'} target="_blank" rel="noopener noreferrer" title="Click to open PDF">
                <img
                  src={imageUrl}
                  className="w-full h-full object-contain rounded-2xl bg-white"
                  alt="Resume preview"
                />
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <img src="/images/resume-scan-2.gif" className="w-48" alt="loading" />
            </div>
          )}
        </section>

        {/* RIGHT — feedback panel */}
        <section className="feedback-section">
          <p className="text-4xl font-bold text-gray-900">Resume Review</p>

          {/* Still loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <img src="/images/resume-scan-2.gif" className="w-48" alt="loading" />
              <p className="text-gray-400 text-sm">Loading your resume feedback...</p>
            </div>
          )}

          {/* Not found empty state */}
          {!loading && notFound && (
            <div className="text-center py-20 flex flex-col items-center gap-6">
              <p className="text-2xl text-gray-400">Resume review unavailable.</p>
              <button onClick={() => navigate('/upload')} className="primary-button w-fit px-8 py-3">
                Upload Resume & Start Analysis
              </button>
            </div>
          )}

          {/* Feedback loaded */}
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

          {/* Resume saved but feedback missing */}
          {!loading && resume && !resume.feedback && (
            <div className="text-center py-20">
              <p className="text-xl text-gray-400">Analysis not available for this resume.</p>
              <button onClick={() => navigate('/upload')} className="primary-button w-fit px-8 py-3 mt-6">
                Analyze Again
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
