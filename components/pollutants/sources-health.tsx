'use client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { POLLUTANT_INFO } from '@/lib/aqi';
import { TOOLTIP_STYLE, AXIS_TICK, type PollutantKey } from './header';

// ─── FAIRMODE source apportionment data per pollutant ────────────────────────
// Source: FAIRMODE/EMEP methodology applied to Nairobi emission inventory
// UNEP Africa Urban Air Quality report 2022
const SOURCE_APPORTIONMENT: Record<string, { name: string; pct: number; color: string }[]> = {
  pm25: [
    { name: 'Cooking fires (residential)', pct: 32, color: '#f97316' },
    { name: 'Vehicle exhaust',             pct: 28, color: '#ef4444' },
    { name: 'Industrial (Makadara/Ruaraka)', pct: 18, color: '#8b5cf6' },
    { name: 'Road / soil dust',            pct: 12, color: '#f59e0b' },
    { name: 'Open waste burning',          pct: 6,  color: '#ec4899' },
    { name: 'Secondary formation',         pct: 4,  color: '#6b7280' },
  ],
  pm10: [
    { name: 'Road / soil dust',            pct: 38, color: '#f59e0b' },
    { name: 'Vehicle exhaust',             pct: 22, color: '#ef4444' },
    { name: 'Construction activity',       pct: 18, color: '#84cc16' },
    { name: 'Cooking fires',               pct: 14, color: '#f97316' },
    { name: 'Industrial',                  pct: 8,  color: '#8b5cf6' },
  ],
  no2: [
    { name: 'Vehicle exhaust (matatus/lorries)', pct: 68, color: '#ef4444' },
    { name: 'Energy / generators',              pct: 18, color: '#f59e0b' },
    { name: 'Industrial combustion',            pct: 10, color: '#8b5cf6' },
    { name: 'Other',                            pct: 4,  color: '#6b7280' },
  ],
  o3: [
    { name: 'Secondary: NOₓ + VOCs + UV', pct: 55, color: '#06b6d4' },
    { name: 'Vehicle VOC evaporation',    pct: 20, color: '#ef4444' },
    { name: 'Industrial solvents/paints', pct: 15, color: '#8b5cf6' },
    { name: 'Long-range transport',       pct: 10, color: '#6b7280' },
  ],
  co: [
    { name: 'Charcoal jiko / cooking',   pct: 40, color: '#f97316' },
    { name: 'Congested traffic',          pct: 35, color: '#ef4444' },
    { name: 'Generators (power cuts)',    pct: 15, color: '#f59e0b' },
    { name: 'Industrial furnaces',        pct: 10, color: '#8b5cf6' },
  ],
  so2: [
    { name: 'Industry (Mombasa Rd belt)', pct: 48, color: '#8b5cf6' },
    { name: 'Heavy diesel / generators', pct: 28, color: '#ef4444' },
    { name: 'Kenya Power thermal plants', pct: 16, color: '#f59e0b' },
    { name: 'Jua Kali metalwork',         pct: 8,  color: '#ec4899' },
  ],
};

// ─── Sources + health effects panel ──────────────────────────────────────────
export function SourcesAndHealth({ pollutantKey }: { pollutantKey: PollutantKey }) {
  const info = POLLUTANT_INFO[pollutantKey];
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 sm:p-5 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sources */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            🏭 Sources in Nairobi
          </p>
          <ul className="space-y-2">
            {info.sources.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                <span className="shrink-0 mt-0.5" style={{ color: info.color }}>▸</span>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Health effects */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            🫁 Health Effects
          </p>
          <ul className="space-y-2">
            {info.healthEffects.map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                <span className="text-red-400 shrink-0 mt-0.5">▸</span>
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* FAIRMODE source apportionment */}
      {'fairmode' in info && info.fairmode && (
        <div className="rounded-xl border border-purple-800/40 bg-purple-950/20 p-3">
          <p className="text-xs font-bold text-purple-400 mb-1">🔬 FAIRMODE Spatial Analysis</p>
          <p className="text-xs text-gray-300 leading-relaxed">{info.fairmode}</p>
        </div>
      )}
    </div>
  );
}

// ─── FAIRMODE source apportionment donut + bar ───────────────────────────────
export function SourceApportionment({ pollutantKey }: { pollutantKey: PollutantKey }) {
  const info = POLLUTANT_INFO[pollutantKey];
  const data = SOURCE_APPORTIONMENT[pollutantKey] ?? [];
  if (!data.length) return null;

  const RADIAN = Math.PI / 180;
  const renderCustomLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, pct: pctVal, name,
  }: {
    cx: number; cy: number; midAngle: number;
    innerRadius: number; outerRadius: number; pct?: number; name: string;
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if ((pctVal ?? 0) < 8) return null;
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={9} fontWeight="bold">
        {pctVal}%
      </text>
    );
  };

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 sm:p-5">
      <div className="mb-3">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          📊 FAIRMODE Source Apportionment — {info.formula} in Nairobi
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          Estimated % contribution per emission sector. Source: UNEP Africa Urban AQ Report 2022 + EMEP methodology.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Donut chart */}
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              dataKey="pct"
              nameKey="name"
              labelLine={false}
              label={renderCustomLabel}
            >
              {data.map((d, i) => <Cell key={i} fill={d.color} />)}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(v, _, props) => [`${v}%`, props.payload.name]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Horizontal bar breakdown */}
        <div className="space-y-2">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: d.color }} />
              <span className="text-gray-300 flex-1 leading-tight">{d.name}</span>
              <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden shrink-0">
                <div className="h-full rounded-full" style={{ width: `${d.pct}%`, background: d.color }} />
              </div>
              <span className="font-mono w-8 text-right shrink-0" style={{ color: d.color }}>{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── AQI bands visual ─────────────────────────────────────────────────────────
export function AqiBandsPanel({ pollutantKey }: { pollutantKey: PollutantKey }) {
  const info = POLLUTANT_INFO[pollutantKey];
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 sm:p-5">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
        📏 AQI Breakpoints — US EPA Standard
      </p>
      <div className="space-y-2">
        {info.aqiBands.map((b, i) => (
          <div key={i} className="flex items-center gap-3 text-xs rounded-lg p-2 bg-gray-800/20">
            <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: b.color }} />
            <span className="text-gray-400 w-28 sm:w-36 shrink-0 font-mono">{b.range}</span>
            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: `${Math.min(((i + 1) / info.aqiBands.length) * 100, 100)}%`,
                backgroundColor: b.color,
              }} />
            </div>
            <span className="font-bold shrink-0" style={{ color: b.color }}>{b.label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-3 italic">
        US EPA AQI breakpoints. Nairobi measurements regularly exceed Moderate (yellow) for PM2.5 and NO₂.
      </p>
    </div>
  );
}
