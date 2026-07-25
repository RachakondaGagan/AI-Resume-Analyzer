export default function ScoreBadge({ score }: { score: number }) {
  const { bg, text, label } = score > 70
    ? { bg: 'bg-badge-green', text: 'text-green-600', label: 'Strong' }
    : score > 49
    ? { bg: 'bg-badge-yellow', text: 'text-yellow-600', label: 'Good Start' }
    : { bg: 'bg-badge-red', text: 'text-red-600', label: 'Needs Work' };
  return (
    <div className={`px-3 py-1 rounded-full ${bg}`}>
      <p className={`text-sm font-medium ${text}`}>{label}</p>
    </div>
  );
}
