import { cn } from '../lib/utils';
import { Accordion, AccordionItem, AccordionHeader, AccordionContent } from './Accordion';

type Tip = { type: 'good' | 'improve'; tip: string; explanation: string };

function ScorePill({ score }: { score: number }) {
  const { bg, textColor } = score > 69
    ? { bg: 'bg-badge-green', textColor: 'text-badge-green-text' }
    : score > 39
    ? { bg: 'bg-badge-yellow', textColor: 'text-badge-yellow-text' }
    : { bg: 'bg-badge-red', textColor: 'text-badge-red-text' };
  return (
    <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-medium', bg, textColor)}>
      <img src={score > 39 ? '/icons/check.svg' : '/icons/warning.svg'} className="w-3.5 h-3.5" alt="" />
      {score}/100
    </span>
  );
}

function CategoryTips({ tips }: { tips: Tip[] }) {
  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Quick overview grid */}
      <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl px-5 py-4">
        {tips.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <img src={t.type === 'good' ? '/icons/check.svg' : '/icons/warning.svg'} className="w-4 h-4 flex-shrink-0" alt="" />
            <p className="text-base text-gray-600 leading-snug">{t.tip}</p>
          </div>
        ))}
      </div>
      {/* Detailed cards */}
      <div className="flex flex-col gap-3">
        {tips.map((t, i) => (
          <div key={i} className={cn('rounded-2xl p-4 flex flex-col gap-1',
            t.type === 'good'
              ? 'bg-green-50 border border-green-200'
              : 'bg-yellow-50 border border-yellow-200'
          )}>
            <div className="flex items-center gap-2">
              <img src={t.type === 'good' ? '/icons/check.svg' : '/icons/warning.svg'} className="w-5 h-5 flex-shrink-0" alt="" />
              <p className={cn('font-semibold text-lg', t.type === 'good' ? 'text-green-800' : 'text-yellow-800')}>{t.tip}</p>
            </div>
            <p className={cn('text-sm leading-relaxed pl-7', t.type === 'good' ? 'text-green-700' : 'text-yellow-700')}>{t.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const SECTIONS = [
  { id: 'tone', title: 'Tone & Style', key: 'toneAndStyle' },
  { id: 'content', title: 'Content', key: 'content' },
  { id: 'structure', title: 'Structure', key: 'structure' },
  { id: 'skills', title: 'Skills', key: 'skills' },
] as const;

export default function Details({ feedback }: { feedback: Feedback }) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <Accordion>
        {SECTIONS.map(({ id, title, key }) => {
          const section = feedback[key];
          return (
            <AccordionItem key={id} id={id}>
              <AccordionHeader itemId={id}>
                <div className="flex items-center gap-3 py-1">
                  <span className="text-xl font-semibold text-gray-800">{title}</span>
                  <ScorePill score={section.score} />
                </div>
              </AccordionHeader>
              <AccordionContent itemId={id}>
                <CategoryTips tips={section.tips as Tip[]} />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
