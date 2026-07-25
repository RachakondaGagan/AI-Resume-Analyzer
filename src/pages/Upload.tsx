import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import FileUploader from '../components/FileUploader';
import { usePuterStore } from '../lib/puter';
import { useNavigate } from '../lib/router';
import { convertPdfToImage, blobToBase64 } from '../lib/pdf2img';
import { generateUUID } from '../lib/utils';
import { analyzeResume } from '../lib/mistral';
import { MISTRAL_KEY_LS } from '../lib/constants';

export default function Upload() {
  const { auth, puterReady, isLoading, fs, kv } = usePuterStore();
  const { navigate } = useNavigate();

  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState('');
  const [stepIndex, setStepIndex] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const [apiKey, setApiKey] = useState(() => localStorage.getItem(MISTRAL_KEY_LS) ?? '');
  const [keySaved, setKeySaved] = useState(() => !!localStorage.getItem(MISTRAL_KEY_LS));
  const [keyError, setKeyError] = useState('');

  // Redirect to auth if not logged in
  useEffect(() => {
    if (puterReady && !isLoading && !auth.isAuthenticated) {
      navigate('/auth?next=/upload');
    }
  }, [puterReady, isLoading, auth.isAuthenticated]);

  const saveKey = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) { setKeyError('Please enter a valid API key.'); return; }
    localStorage.setItem(MISTRAL_KEY_LS, trimmed);
    setKeySaved(true);
    setKeyError('');
  };

  const fillSample = (role: 'frontend' | 'pm') => {
    if (role === 'frontend') {
      setCompanyName('Stripe');
      setJobTitle('Senior Frontend Engineer');
      setJobDescription(
        'Looking for a Senior Frontend Engineer proficient in React, TypeScript, Tailwind CSS, performance optimization, web accessibility (a11y), state management, and modern component design systems.'
      );
    } else {
      setCompanyName('Airbnb');
      setJobTitle('Product Manager');
      setJobDescription(
        'Seeking an experienced Product Manager to lead user acquisition, product analytics, wireframing, A/B testing, cross-functional engineering sprint planning, and roadmap execution.'
      );
    }
  };

  const getPath = (item: any): string | undefined => {
    if (!item) return undefined;
    if (Array.isArray(item)) return item[0]?.path;
    return item.path;
  };

  const handleAnalyze = async () => {
    const key = localStorage.getItem(MISTRAL_KEY_LS) ?? '';
    if (!key) { setKeyError('Save your Mistral API key first.'); return; }
    if (!file) return;

    setErrorMsg(null);
    setProcessing(true);
    setStepIndex(1);
    try {
      setStatus('Uploading resume to secure cloud storage...');
      const uploaded = await fs.upload([file]);
      const uploadedPath = getPath(uploaded);
      if (!uploadedPath) throw new Error('Upload to Puter failed — please check your login status');

      setStepIndex(2);
      setStatus('Converting PDF page to high-res preview...');
      const img = await convertPdfToImage(file);
      if (!img.file) throw new Error(img.error ?? 'PDF to image conversion failed');

      setStepIndex(3);
      setStatus('Uploading thumbnail preview...');
      const uploadedImg = await fs.upload([img.file]);
      const uploadedImgPath = getPath(uploadedImg);
      if (!uploadedImgPath) throw new Error('Thumbnail upload failed');

      setStatus('Initializing application record...');
      const uuid = generateUUID();
      const resumeData: Resume = {
        id: uuid,
        companyName,
        jobTitle,
        resumePath: uploadedPath,
        imagePath: uploadedImgPath,
        feedback: null as unknown as Feedback,
      };
      await kv.set(`resume:${uuid}`, JSON.stringify(resumeData));

      setStepIndex(4);
      setStatus('Encoding document for vision analysis...');
      const base64 = await blobToBase64(img.file);

      setStatus('Analyzing with Mistral AI Vision Model...');
      const feedback = await analyzeResume({ imageBase64: base64, jobTitle, jobDescription, apiKey: key });

      setStepIndex(5);
      setStatus('Generating ATS report & score breakdown...');
      resumeData.feedback = feedback;
      await kv.set(`resume:${uuid}`, JSON.stringify(resumeData));

      setStatus('Done! Opening results dashboard...');
      navigate(`/resume/${uuid}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
      setStatus('');
      setProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/50 pb-20" style={{ backgroundImage: "url('/images/bg-main.svg')", backgroundSize: 'cover' }}>
      <Navbar />

      <section className="main-section max-w-5xl mx-auto px-4 pt-10">
        <div className="page-heading w-full flex flex-col items-center text-center gap-4">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight max-w-3xl leading-tight">
            Smart Feedback for Your Dream Job
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl font-normal leading-relaxed">
            Upload your resume alongside target job details to receive instant ATS scoring, keyword match analysis, and targeted improvement recommendations powered by Mistral AI.
          </p>

          {/* API Key Banner if not saved */}
          {!keySaved && !processing && (
            <div className="w-full max-w-xl text-left bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4 mt-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                  🔑
                </div>
                <div>
                  <h4 className="font-bold text-blue-950 text-base">Mistral API Key Required</h4>
                  <p className="text-blue-800 text-xs mt-1 leading-normal">
                    Free key available at{' '}
                    <a href="https://console.mistral.ai" target="_blank" rel="noreferrer" className="underline font-semibold text-blue-900">
                      console.mistral.ai
                    </a>
                    {' '}→ API Keys. Keys are kept 100% private in your browser.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveKey()}
                  placeholder="Paste your Mistral API key here..."
                  className="flex-1 text-sm py-2.5 px-4 rounded-xl border border-blue-200 bg-white"
                />
                <button type="button" onClick={saveKey} className="primary-button text-sm font-bold px-6 whitespace-nowrap">
                  Save Key
                </button>
              </div>
              {keyError && <p className="text-red-600 text-xs font-medium">{keyError}</p>}
            </div>
          )}

          {keySaved && !processing && (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 mt-1">
              <img src="/icons/check.svg" className="w-4 h-4" alt="ok" />
              Mistral API key configured
              <button
                type="button"
                onClick={() => { setKeySaved(false); setApiKey(''); localStorage.removeItem(MISTRAL_KEY_LS); }}
                className="underline ml-1 cursor-pointer bg-transparent border-none text-emerald-950 text-xs"
              >
                change
              </button>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && !processing && (
            <div className="w-full max-w-xl text-left bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm flex flex-col gap-1 mt-2">
              <p className="font-semibold text-red-900 flex items-center gap-2">
                <span>⚠️</span> Analysis Failed
              </p>
              <p className="text-xs">{errorMsg}</p>
            </div>
          )}

          {/* Processing State */}
          {processing ? (
            <div className="flex flex-col items-center gap-6 w-full max-w-xl py-10 bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200 shadow-xl mt-6 p-8">
              {/* Progress Steps Indicator */}
              <div className="w-full flex items-center justify-between px-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                        stepIndex >= s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {s}
                    </div>
                    {s < 5 && <div className={`w-8 sm:w-12 h-1 rounded-full ${stepIndex > s ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
                  </div>
                ))}
              </div>

              <div className="text-center space-y-2">
                <p className="text-lg font-bold text-slate-800">{status}</p>
                <p className="text-xs text-slate-400">Step {stepIndex} of 5 · Please wait while Mistral AI processes your document</p>
              </div>

              <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 shadow-inner">
                <img src="/images/resume-scan.gif" className="w-full object-cover" alt="scanning" />
              </div>
            </div>
          ) : (
            <div className="w-full max-w-xl mt-6">
              {/* Centered Large Form Container */}
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xl text-left flex flex-col gap-6">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Application Details</h3>
                    <p className="text-xs text-slate-500">Provide job details for higher precision AI feedback</p>
                  </div>
                  {/* Quick Fill Samples */}
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => fillSample('frontend')}
                      className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg px-2.5 py-1 transition-colors cursor-pointer"
                    >
                      ⚡ Sample 1
                    </button>
                    <button
                      type="button"
                      onClick={() => fillSample('pm')}
                      className="text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg px-2.5 py-1 transition-colors cursor-pointer"
                    >
                      ⚡ Sample 2
                    </button>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAnalyze();
                  }}
                  className="flex flex-col gap-5"
                >
                  <div className="form-div">
                    <label className="text-xs font-bold text-slate-700">Target Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Google, Stripe, Microsoft"
                      className="text-sm rounded-xl border border-slate-200 py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="form-div">
                    <label className="text-xs font-bold text-slate-700">
                      Target Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Full Stack Engineer, Product Manager"
                      className="text-sm rounded-xl border border-slate-200 py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="form-div">
                    <label className="text-xs font-bold text-slate-700">Job Description (Optional)</label>
                    <textarea
                      rows={4}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the target job description to get tailored ATS keyword matching..."
                      className="text-sm rounded-xl border border-slate-200 p-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="form-div">
                    <label className="text-xs font-bold text-slate-700">
                      Upload Resume PDF <span className="text-red-500">*</span>
                    </label>
                    <FileUploader onFileSelect={setFile} />
                  </div>

                  <button
                    type="submit"
                    className="primary-button text-base font-bold py-3.5 px-8 shadow-lg shadow-indigo-200 mt-2 w-full"
                    disabled={!file || !keySaved}
                    style={{
                      opacity: !file || !keySaved ? 0.5 : 1,
                      cursor: !file || !keySaved ? 'not-allowed' : 'pointer',
                    }}
                  >
                    🚀 Analyze Resume with AI
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}