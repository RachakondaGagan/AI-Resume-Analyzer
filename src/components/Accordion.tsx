import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface Ctx { isActive: (id: string) => boolean; toggle: (id: string) => void; }
const AccordionCtx = createContext<Ctx>({ isActive: () => false, toggle: () => {} });

export function Accordion({ children, className = '' }: { children: ReactNode; className?: string }) {
  const [open, setOpen] = useState<string[]>([]);
  const toggle = (id: string) => setOpen(p => p.includes(id) ? p.filter(x => x !== id) : [id]);
  const isActive = (id: string) => open.includes(id);
  return (
    <AccordionCtx.Provider value={{ isActive, toggle }}>
      <div className={`space-y-2 ${className}`}>{children}</div>
    </AccordionCtx.Provider>
  );
}

export function AccordionItem({ id, children, className = '' }: { id: string; children: ReactNode; className?: string }) {
  return <div className={`overflow-hidden border-b border-gray-200 ${className}`}>{children}</div>;
}

export function AccordionHeader({ itemId, children, className = '' }: { itemId: string; children: ReactNode; className?: string }) {
  const { isActive, toggle } = useContext(AccordionCtx);
  const active = isActive(itemId);
  return (
    <button
      type="button"
      onClick={() => toggle(itemId)}
      className={`w-full px-4 py-3 text-left focus:outline-none flex items-center justify-between cursor-pointer transition-colors duration-200 ${className}`}
    >
      <div className="flex-1">{children}</div>
      <svg
        className={`w-5 h-5 transition-transform duration-200 flex-shrink-0 ml-2 ${active ? 'rotate-180' : ''}`}
        fill="none" stroke="#98A2B3" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

export function AccordionContent({ itemId, children, className = '' }: { itemId: string; children: ReactNode; className?: string }) {
  const { isActive } = useContext(AccordionCtx);
  return (
    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isActive(itemId) ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'} ${className}`}>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}
