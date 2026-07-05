'use client';
import { useState } from 'react';
import { PollutantSelector, PollutantHeader, type PollutantKey } from './header';
import { StandardsComparison } from './standards';
import { SourcesAndHealth, SourceApportionment, AqiBandsPanel } from './sources-health';

// Sub-tabs inside each pollutant
const SUBTABS = [
  { id: 'overview',   label: 'Overview',    icon: '📋' },
  { id: 'standards',  label: 'Standards',   icon: '⚖️' },
  { id: 'sources',    label: 'Sources',     icon: '🏭' },
  { id: 'bands',      label: 'AQI Bands',   icon: '📏' },
] as const;
type SubTab = typeof SUBTABS[number]['id'];

export default function PollutantEncyclopedia() {
  const [sel, setSel] = useState<PollutantKey>('pm25');
  const [subtab, setSubtab] = useState<SubTab>('overview');

  // Reset to overview when switching pollutant
  function handleSelect(k: PollutantKey) {
    setSel(k);
    setSubtab('overview');
  }

  return (
    <div className="space-y-4">
      {/* Pollutant selector */}
      <PollutantSelector sel={sel} onSelect={handleSelect} />

      {/* Sub-tab bar — scrollable on mobile */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1">
        {SUBTABS.map(t => (
          <button
            key={t.id}
            onClick={() => setSubtab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
              subtab === t.id
                ? 'bg-teal-700/80 text-white'
                : 'bg-gray-800/60 text-gray-400 hover:text-white'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Always show header */}
      <PollutantHeader pollutantKey={sel} />

      {/* Sub-tab content */}
      {subtab === 'overview' && (
        <div className="space-y-4">
          <SourcesAndHealth pollutantKey={sel} />
          <SourceApportionment pollutantKey={sel} />
        </div>
      )}

      {subtab === 'standards' && (
        <StandardsComparison pollutantKey={sel} />
      )}

      {subtab === 'sources' && (
        <div className="space-y-4">
          <SourceApportionment pollutantKey={sel} />
          <SourcesAndHealth pollutantKey={sel} />
        </div>
      )}

      {subtab === 'bands' && (
        <AqiBandsPanel pollutantKey={sel} />
      )}
    </div>
  );
}
