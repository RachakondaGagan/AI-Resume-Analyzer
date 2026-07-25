interface Tip { type: 'good' | 'improve'; tip: string; }

export default function ATS({ score, suggestions }: { score: number; suggestions: Tip[] }) {
  const gradFrom = score > 69 ? 'from-green-100' : score > 49 ? 'from-yellow-100' : 'from-red-100';
  const icon = score > 69 ? '/icons/ats-good.svg' : score > 49 ? '/icons/ats-warning.svg' : '/icons/ats-bad.svg';
  const label = score > 69 ? 'Great Job!' : score > 49 ? 'Good Start' : 'Needs Improvement';

  return (
    <div className={`bg-gradient-to-b ${gradFrom} to-white rounded-2xl shadow-md w-full p-6`}>
      <div className="flex items-center gap-4 mb-6">
        <img src={icon} alt="ATS" className="w-12 h-12" />
        <p className="text-2xl font-bold text-gray-900">ATS Score — {score}/100</p>
      </div>
      <p className="text-xl font-semibold mb-2 text-gray-900">{label}</p>
      <p className="text-gray-600 mb-4">
        How well your resume is likely to perform in Applicant Tracking Systems used by employers.
      </p>
      <div className="space-y-3 mb-6">
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-start gap-3">
            <img src={s.type === 'good' ? '/icons/check.svg' : '/icons/warning.svg'} alt={s.type} className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className={s.type === 'good' ? 'text-green-700' : 'text-amber-700'}>{s.tip}</p>
          </div>
        ))}
      </div>
      <p className="text-gray-600 italic text-sm">Keep refining your resume to improve your chances of passing ATS filters.</p>
    </div>
  );
}
