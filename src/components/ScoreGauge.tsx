import { useEffect, useRef, useState } from 'react';

export default function ScoreGauge({ score = 75 }: { score: number }) {
  const [len, setLen] = useState(0);
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => { if (ref.current) setLen(ref.current.getTotalLength()); }, []);
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-20">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#fca5a5" />
            </linearGradient>
          </defs>
          <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="#e5e7eb" strokeWidth="10" strokeLinecap="round" />
          <path ref={ref} d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="url(#gaugeGrad)"
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={len} strokeDashoffset={len * (1 - score / 100)} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pt-2">
          <span className="text-xl font-semibold pt-4">{score}/100</span>
        </div>
      </div>
    </div>
  );
}
