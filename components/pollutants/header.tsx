'use client';
/**
 * Pollutant Encyclopedia — full multi-standard regulatory analytics
 * Standards: US EPA NAAQS, EU AQD 2024, WHO 2021, Kenya NEMA 2014, UNEP Africa
 * Includes FAIRMODE source apportionment, AQI bands, Nairobi context
 */
import { POLLUTANT_INFO } from '@/lib/aqi';

const TOOLTIP_STYLE = {
  background: '#111827', border: '1px solid #374151',
  borderRadius: 10, fontSize: 11, color: '#e5e7eb',
};
const AXIS_TICK = { fill: '#6b7280', fontSize: 10 };

type PollutantKey = keyof typeof POLLUTANT_INFO;

// ─── Pollutant selector tabs ──────────────────────────────────────────────────
function PollutantSelector({ sel, onSelect }: { sel: PollutantKey; onSelect: (k: PollutantKey) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {(Object.values(POLLUTANT_INFO) as (typeof POLLUTANT_INFO)[PollutantKey][]).map(p => (
        <button
          key={p.key}
          onClick={() => onSelect(p.key as PollutantKey)}
          className={`text-sm font-mono px-3 py-2 rounded-xl transition-colors border ${
            sel === p.key ? '' : 'border-gray-800 text-gray-400 bg-gray-900/40 hover:text-white'
          }`}
          style={sel === p.key
            ? { backgroundColor: p.color + '22', borderColor: p.color + '55', color: p.color }
            : {}}
        >
          {p.formula}
        </button>
      ))}
    </div>
  );
}

// ─── Header: formula, name, WHO guideline ────────────────────────────────────
function PollutantHeader({ pollutantKey }: { pollutantKey: PollutantKey }) {
  const info = POLLUTANT_INFO[pollutantKey];
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-3xl font-extrabold" style={{ color: info.color }}>{info.formula}</h2>
          <p className="text-sm text-gray-300 mt-0.5">{info.name}</p>
          <p className="text-xs text-gray-500 mt-1">
            <span className="text-gray-400 font-medium">WHO 2021 Guideline:</span>{' '}
            <span className="text-white">{info.whoGuideline}</span>
          </p>
        </div>
        {/* AQI band color scale strip */}
        <div className="flex flex-col gap-1 shrink-0">
          <p className="text-xs text-gray-500 uppercase font-bold mb-1">AQI Scale</p>
          {info.aqiBands.map((b, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: b.color }} />
              <span className="text-gray-400 w-24 truncate">{b.range}</span>
              <span className="font-medium" style={{ color: b.color }}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-300 leading-relaxed mt-4">{info.description}</p>

      {/* Nairobi context */}
      {'nairobiContext' in info && info.nairobiContext && (
        <div className="mt-3 rounded-xl border border-teal-800/40 bg-teal-950/20 p-3">
          <p className="text-xs font-bold text-teal-400 mb-1">🌍 Nairobi Context</p>
          <p className="text-xs text-gray-300 leading-relaxed">{info.nairobiContext}</p>
        </div>
      )}
    </div>
  );
}

export { PollutantSelector, PollutantHeader, TOOLTIP_STYLE, AXIS_TICK };
export type { PollutantKey };
