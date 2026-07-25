export default function ScoreCircle({ score = 75 }: { score: number }) {
  const radius = 40, stroke = 8;
  const nr = radius - stroke / 2;
  const circ = 2 * Math.PI * nr;
  const offset = circ * (1 - score / 100);
  return (
    <div className="relative w-[100px] h-[100px]">
      <svg height="100%" width="100%" viewBox="0 0 100 100" className="transform -rotate-90">
        <circle cx="50" cy="50" r={nr} stroke="#e5e7eb" strokeWidth={stroke} fill="transparent" />
        <defs>
          <linearGradient id="scoreGrad" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF97AD" />
            <stop offset="100%" stopColor="#5171FF" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={nr} stroke="url(#scoreGrad)" strokeWidth={stroke} fill="transparent"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-semibold text-sm">{score}/100</span>
      </div>
    </div>
  );
}
