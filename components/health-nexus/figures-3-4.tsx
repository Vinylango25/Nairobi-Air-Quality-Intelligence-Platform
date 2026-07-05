'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ComposedChart, Line, Legend,
} from 'recharts';
import { HEALTHCARE_DATA } from '@/lib/healthcare';
import { TOOLTIP_STYLE, AXIS_TICK, GRID_STROKE, SectionTitle } from './figures-1-2';

// ─── Figure 3: Health facilities count + density (per 10k people) ────────────
const FACILITIES_DATA = HEALTHCARE_DATA.map(d => ({
  name: d.name.replace("Lang'ata", "Langata").replace('Embakasi ', 'Emb. '),
  facilities: d.healthFacilities,
  density: d.facilitiesPerCapita,
  pop: Math.round(d.population / 1000),
})).sort((a, b) => b.facilities - a.facilities);

export function Fig3Facilities() {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 sm:p-5">
      <SectionTitle
        icon="🏥"
        title="Fig 3 — Health Facilities: Count vs Density (per 10,000 people)"
        subtitle="Starehe has the most facilities (45) but many are private. Kibra and Mathare have critically low density despite large populations."
      />
      {/* Mobile: stacked charts. Desktop: two side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Facility count */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Total Facilities</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={FACILITIES_DATA} layout="vertical" margin={{ left: 0, right: 30, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
              <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }}
                axisLine={false} tickLine={false} width={82} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} facilities`, '']} />
              <Bar dataKey="facilities" radius={[0, 4, 4, 0]}>
                {FACILITIES_DATA.map((d, i) => (
                  <Cell key={i} fill={
                    d.facilities >= 35 ? '#10b981'
                    : d.facilities >= 22 ? '#f59e0b'
                    : '#ef4444'
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Density */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Facilities per 10,000 people</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={[...FACILITIES_DATA].sort((a, b) => b.density - a.density)}
              layout="vertical" margin={{ left: 0, right: 30, top: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
              <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }}
                axisLine={false} tickLine={false} width={82} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v} per 10k`, '']} />
              <Bar dataKey="density" radius={[0, 4, 4, 0]}>
                {[...FACILITIES_DATA].sort((a, b) => b.density - a.density).map((d, i) => (
                  <Cell key={i} fill={
                    d.density >= 15 ? '#10b981'
                    : d.density >= 10 ? '#f59e0b'
                    : '#ef4444'
                  } />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Key callout */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 text-xs">
        {[
          { label: 'Kibra density', val: '6.6/10k', color: 'text-red-400' },
          { label: 'Mathare density', val: '7.7/10k', color: 'text-red-400' },
          { label: 'Starehe density', val: '20.8/10k', color: 'text-emerald-400' },
          { label: 'WHO target', val: '≥10/10k', color: 'text-blue-400' },
        ].map(c => (
          <div key={c.label} className="rounded-lg border border-gray-800 bg-gray-800/30 p-2 text-center">
            <p className={`font-bold ${c.color}`}>{c.val}</p>
            <p className="text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-3 italic">
        Source: Nairobi Healthcare Accessibility Study 2024 · Kenya MoH KHIS 2022
      </p>
    </div>
  );
}

// ─── Figure 4: Operational hours ─────────────────────────────────────────────
const OPS_DATA = HEALTHCARE_DATA.map(d => ({
  name: d.name.replace("Lang'ata", "Langata").replace('Embakasi ', 'Emb. '),
  has24h:    d.has24HourService ? 1 : 0,
  weekend:   d.weekendService   ? 1 : 0,
  neither:   (!d.has24HourService && !d.weekendService) ? 1 : 0,
}));

const OPS_SUMMARY = [
  { label: 'Have 24h service',     n: HEALTHCARE_DATA.filter(d => d.has24HourService).length,  pct: Math.round(HEALTHCARE_DATA.filter(d => d.has24HourService).length / HEALTHCARE_DATA.length * 100), color: '#10b981' },
  { label: 'Have weekend service', n: HEALTHCARE_DATA.filter(d => d.weekendService).length,    pct: Math.round(HEALTHCARE_DATA.filter(d => d.weekendService).length / HEALTHCARE_DATA.length * 100),   color: '#f59e0b' },
  { label: 'No 24h OR weekend',    n: HEALTHCARE_DATA.filter(d => !d.has24HourService && !d.weekendService).length, pct: Math.round(HEALTHCARE_DATA.filter(d => !d.has24HourService && !d.weekendService).length / HEALTHCARE_DATA.length * 100), color: '#ef4444' },
];

export function Fig4OperationalHours() {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 sm:p-5">
      <SectionTitle
        icon="🕐"
        title="Fig 4 — Facility Operational Hours: 24h & Weekend Coverage"
        subtitle="Fewer than 30% of subcounties have round-the-clock public healthcare. Mathare and Embakasi South have neither 24h nor weekend service — critical gaps."
      />
      {/* Summary pills */}
      <div className="flex flex-wrap gap-3 mb-4">
        {OPS_SUMMARY.map(s => (
          <div key={s.label} className="rounded-xl border border-gray-800 bg-gray-800/40 px-3 py-2 text-center min-w-[100px]">
            <p className="text-xl font-black" style={{ color: s.color }}>{s.pct}%</p>
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className="text-xs text-gray-600">{s.n} of 17</p>
          </div>
        ))}
      </div>
      {/* Per-subcounty grid: coloured dots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {HEALTHCARE_DATA.map(d => (
          <div key={d.subcountyId} className="flex items-center gap-2 text-xs rounded-lg p-2 bg-gray-800/20">
            <span className="w-20 sm:w-24 text-gray-300 font-medium truncate shrink-0">{d.name}</span>
            <span className={`flex items-center gap-1 shrink-0 ${d.has24HourService ? 'text-emerald-400' : 'text-gray-700'}`}>
              <span className={`w-2 h-2 rounded-full ${d.has24HourService ? 'bg-emerald-400' : 'bg-gray-700'}`} />
              24h
            </span>
            <span className={`flex items-center gap-1 shrink-0 ${d.weekendService ? 'text-amber-400' : 'text-gray-700'}`}>
              <span className={`w-2 h-2 rounded-full ${d.weekendService ? 'bg-amber-400' : 'bg-gray-700'}`} />
              Wknd
            </span>
            {!d.has24HourService && !d.weekendService && (
              <span className="text-red-500 font-bold shrink-0">⚠ None</span>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-3 italic">
        Source: Kenya MoH KHIS 2022 · Nairobi Healthcare Study 2024
      </p>
    </div>
  );
}
