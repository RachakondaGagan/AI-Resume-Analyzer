import { type FormEvent, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import FileUploader from '../components/FileUploader';
import { usePuterStore } from '../lib/puter';
import { useNavigate } from '../lib/router';
import { convertPdfToImage, blobToBase64 } from '../lib/pdf2img';
import { generateUUID } from '../lib/utils';
import { analyzeResume } from '../lib/mistral';
import { MISTRAL_KEY_LS } from '../lib/constants';

export default function Upload() {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const { navigate } = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [analysisError, setAnalysisError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(MISTRAL_KEY_LS) ?? '');
  const [keySaved, setKeySaved] = useState(() => !!localStorage.getItem(MISTRAL_KEY_LS));
  const [keyError, setKeyError] = useState('');

  // Redirect to auth if not signed in once puter loading completes
  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate('/auth?next=/upload');
    }
  }, [isLoading, auth.isAuthenticated, navigate]);

  const saveKey = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) { setKeyError('Please enter a valid API key.'); return; }
    localStorage.setItem(MISTRAL_KEY_LS, trimmed);
    setKeySaved(true);
    setKeyError('');
  };

  const runAnalysis = async (
    companyName: string,
    jobTitle: string,
    jobDescription: string,
    selectedFile: File,
    key: string
  ) => {
    setAnalysisError('');
    setProcessing(true);
    try {
      setStatus('Uploading resume...');
      const rawUpload = await fs.upload([selectedFile]);
      const uploaded = Array.isArray(rawUpload) ? rawUpload[0] : rawUpload;
      if (!uploaded || !uploaded.path) throw new Error('Upload to Puter failed — are you signed in to Puter?');

      setStatus('Converting PDF to image...');
      const img = await convertPdfToImage(selectedFile);
      if (!img.file) throw new Error(img.error ?? 'PDF to image conversion failed');

      setStatus('Uploading thumbnail...');
      const rawImgUpload = await fs.upload([img.file]);
      const uploadedImg = Array.isArray(rawImgUpload) ? rawImgUpload[0] : rawImgUpload;
      if (!uploadedImg || !uploadedImg.path) throw new Error('Thumbnail upload failed');

      setStatus('Saving record...');
      const uuid = generateUUID();
      const resumeData: Resume = {
        id: uuid,
        companyName,
        jobTitle,
        resumePath: uploaded.path,
        imagePath: uploadedImg.path,
        feedback: null as unknown as Feedback,
      };
      await kv.set(`resume:${uuid}`, JSON.stringify(resumeData));

      setStatus('Encoding image...');
      const base64 = await blobToBase64(img.file);
      try {
        sessionStorage.setItem(`resume_img:${uuid}`, `data:image/jpeg;base64,${base64}`);
      } catch {}

      setStatus('Analyzing with Mistral AI...');
      const feedback = await analyzeResume({ imageBase64: base64, jobTitle, jobDescription, apiKey: key });

      setStatus('Saving results...');
      resumeData.feedback = feedback;
      try {
        sessionStorage.setItem(`resume:${uuid}`, JSON.stringify(resumeData));
      } catch {}
      await kv.set(`resume:${uuid}`, JSON.stringify(resumeData));

      setStatus('Done! Opening results...');
      // Small delay so user sees the "Done!" message before navigation
      setTimeout(() => navigate(`/resume/${uuid}`), 400);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setAnalysisError(msg);
      setStatus(`❌ Error: ${msg}`);
      setProcessing(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    // Prevent form from causing ANY page reload — must be first line
    e.preventDefault();
    e.stopPropagation();

    const key = localStorage.getItem(MISTRAL_KEY_LS) ?? apiKey.trim();
    if (!key) { setKeyError('Save your Mistral API key first.'); return; }
    if (!file) return;

    const fd = new FormData(e.currentTarget);
    const companyName = (fd.get('company-name') as string) ?? '';
    const jobTitle = (fd.get('job-title') as string) ?? '';
    const jobDescription = (fd.get('job-description') as string) ?? '';

    // Fire async without awaiting in the event handler (prevents browser from treating it as sync submit)
    runAnalysis(companyName, jobTitle, jobDescription, file, key);
  };

  return (
    <main style={{ backgroundImage: "url('/images/bg-main.svg')", backgroundSize: 'cover' }}>
      <Navbar />
      <section className="main-section">
        <div className="page-heading py-10 w-full max-w-xl">
          <h1>Smart feedback for your dream job</h1>

          {/* Error Banner if previous analysis failed */}
          {analysisError && !processing && (
            <div className="w-full text-left bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col gap-2 shadow-sm">
              <p className="font-semibold text-red-900 text-base flex items-center gap-2">
                <span>❌ Analysis Failed</span>
              </p>
              <p className="text-red-700 text-sm leading-relaxed">{analysisError}</p>
            </div>
          )}

          {/* API Key Banner */}
          {!keySaved && !processing && (
            <div className="w-full text-left bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col gap-3">
              <div>
                <p className="font-semibold text-blue-900 text-base">🔑 Mistral API Key Required</p>
                <p className="text-blue-700 text-sm mt-1">
                  Get your free key at{' '}
                  <a href="https://console.mistral.ai" target="_blank" rel="noreferrer" className="underline font-medium">
                    console.mistral.ai
                  </a>
                  {' '}→ API Keys → Create new key. Stored only in your browser.
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveKey()}
                  placeholder="Paste your API key here..."
                  className="flex-1 text-sm py-2 px-3"
                />
                <button type="button" onClick={saveKey} className="primary-button w-fit px-5 whitespace-nowrap">
                  Save
                </button>
              </div>
              {keyError && <p className="text-red-600 text-sm">{keyError}</p>}
            </div>
          )}

          {keySaved && !processing && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-full px-4 py-2 self-center">
              <img src="/icons/check.svg" className="w-4 h-4" alt="ok" />
              Mistral API key saved
              <button
                type="button"
                onClick={() => { setKeySaved(false); setApiKey(''); localStorage.removeItem(MISTRAL_KEY_LS); }}
                className="underline ml-1 cursor-pointer bg-transparent border-none text-green-900 text-sm"
              >
                change
              </button>
            </div>
          )}

          {/* Processing state */}
          {processing ? (
            <div className="flex flex-col items-center gap-6 w-full py-6">
              <p className="text-xl font-medium text-gray-600 text-center">{status}</p>
              <img src="/images/resume-scan.gif" className="w-full max-w-md rounded-xl" alt="scanning" />
            </div>
          ) : (
            <>
              <h2>Drop your resume for an ATS score and improvement tips</h2>
              {/* noValidate prevents browser-native form submission on Enter key */}
              <form onSubmit={handleSubmit} className="w-full text-left" noValidate>
                <div className="form-div">
                  <label htmlFor="company-name">Company Name</label>
                  <input type="text" name="company-name" id="company-name" placeholder="e.g. Google" />
                </div>
                <div className="form-div">
                  <label htmlFor="job-title">Job Title <span className="text-red-400">*</span></label>
                  <input type="text" name="job-title" id="job-title" placeholder="e.g. Frontend Developer" />
                </div>
                <div className="form-div">
                  <label htmlFor="job-description">Job Description</label>
                  <textarea
                    rows={5}
                    name="job-description"
                    id="job-description"
                    placeholder="Paste the full job description here for better analysis..."
                  />
                </div>
                <div className="form-div">
                  <label>Upload Resume <span className="text-red-400">*</span></label>
                  <FileUploader onFileSelect={setFile} />
                </div>
                <button
                  type="submit"
                  className="primary-button"
                  disabled={!file || !keySaved}
                  style={{
                    opacity: !file || !keySaved ? 0.5 : 1,
                    cursor: !file || !keySaved ? 'not-allowed' : 'pointer',
                  }}
                >
                  Analyze Resume
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
