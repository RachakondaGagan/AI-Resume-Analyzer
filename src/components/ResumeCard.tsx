import { useEffect, useState } from 'react';
import { useNavigate } from '../lib/router';
import { usePuterStore } from '../lib/puter';
import { markIdAsDeleted } from '../lib/utils';
import ScoreCircle from './ScoreCircle';

interface ResumeCardProps {
  resume: Resume;
  onDelete?: (id: string) => void;
}

export default function ResumeCard({ resume, onDelete }: ResumeCardProps) {
  const { id, companyName, jobTitle, feedback, imagePath, resumePath } = resume;
  const { fs, kv } = usePuterStore();
  const { navigate } = useNavigate();
  const [imgUrl, setImgUrl] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Check local session storage thumbnail first
    const localImg = sessionStorage.getItem(`resume_img:${id}`);
    if (localImg) {
      setImgUrl(localImg);
      return;
    }
    if (imagePath) {
      fs.read(imagePath).then((blob) => {
        if (blob) setImgUrl(URL.createObjectURL(blob));
      });
    }
  }, [id, imagePath, fs]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(true);
    markIdAsDeleted(id);
    try {
      // 1. Clear session storage caches
      sessionStorage.removeItem(`resume:${id}`);
      sessionStorage.removeItem(`resume_img:${id}`);
      // 2. Remove Puter KV entry
      await kv.delete(`resume:${id}`);
      // 3. Remove Puter FS files asynchronously
      if (imagePath) fs.delete(imagePath).catch(() => {});
      if (resumePath) fs.delete(resumePath).catch(() => {});
    } catch (err) {
      console.error('Failed to delete resume:', err);
    }
    setDeleting(false);
    setShowConfirm(false);
    onDelete?.(id);
  };

  return (
    <div
      onClick={() => navigate(`/resume/${id}`)}
      className="resume-card relative cursor-pointer hover:shadow-xl transition-all duration-300 group border border-slate-100"
      style={{ animation: 'fadeIn 0.6s ease-in' }}
    >
      {/* Delete Confirmation Overlay */}
      {showConfirm && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm rounded-2xl z-20 flex flex-col items-center justify-center p-6 text-center gap-4 text-white"
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-2xl">
            🗑️
          </div>
          <div>
            <p className="font-bold text-lg text-white">Delete Resume Analysis?</p>
            <p className="text-xs text-slate-300 mt-1">This action cannot be undone.</p>
          </div>
          <div className="flex items-center gap-3 w-full max-w-xs mt-2">
            <button
              onClick={(e) => { e.stopPropagation(); setShowConfirm(false); }}
              className="flex-1 py-2 px-4 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm font-semibold border-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold border-none cursor-pointer"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="resume-card-header items-start">
        <div className="flex flex-col gap-1 flex-1 min-w-0 pr-2">
          {companyName && (
            <h2 className="!text-slate-900 font-bold truncate text-xl" style={{ WebkitTextFillColor: '#0f172a', color: '#0f172a' }}>
              {companyName}
            </h2>
          )}
          {jobTitle && <p className="text-sm font-medium text-slate-500 truncate">{jobTitle}</p>}
          {!companyName && !jobTitle && (
            <h2 className="!text-slate-900 font-bold text-xl" style={{ WebkitTextFillColor: '#0f172a', color: '#0f172a' }}>
              Resume Analysis
            </h2>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <ScoreCircle score={feedback?.overallScore ?? 0} />
          {/* Delete Icon Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowConfirm(true);
            }}
            title="Delete analysis"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors border-none cursor-pointer opacity-70 group-hover:opacity-100"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Image Preview */}
      {imgUrl ? (
        <div className="gradient-border flex-1 overflow-hidden">
          <img src={imgUrl} alt="resume preview" className="w-full h-[350px] object-cover object-top rounded-xl" />
        </div>
      ) : (
        <div className="gradient-border flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
