'use client';
/**
 * Health Nexus Tab — Deep statistics replicating all 6 research figures from
 * "Enhancing Healthcare Accessibility in Nairobi" (Vinylango25/Healthcare-Accessibility-in-Nairobi)
 * Combined with live AQI data for integrated air-quality × healthcare analysis.
 *
 * Figures:
 *  Fig 1 — Age distribution (youth bulge)
 *  Fig 2 — Population density by subcounty
 *  Fig 3 — Health facilities count + facility density (per 10k)
 *  Fig 4 — Operational hours (24h service, weekend service)
 *  Fig 5 — Service availability heatmap (ART, ANC, PMTCT, TB, EPI, obstetric)
 *  Fig 6 — C-IMCI children's accessibility
 *  Plus: Combined Vulnerability Index, SDG3 gap analysis, AI insights
 */

import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, LineChart, Line, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ZAxis,
  ComposedChart, Area,
} from 'recharts';
import { AlertTriangle, Shield, Activity, TrendingUp, Users, Heart, Baby, Stethoscope } from 'lucide-react';
import { HEALTHCARE_DATA, getVulnerabilityScore } from '@/lib/healthcare';
import { aqiColor, aqiTextColor } from '@/lib/aqi';
import type { SubcountyData } from '@/lib/types';

// ─── Fig 1 data: Nairobi age distribution (2026 KNBS Projection) ─────────────────
const AGE_DISTRIBUTION = [
  { group: '0–4',   pct: 11.8, fill: '#06b6d4' },
  { group: '5–9',   pct: 10.2, fill: '#06b6d4' },
  { group: '10–14', pct: 9.1,  fill: '#06b6d4' },
  { group: '15–19', pct: 9.8,  fill: '#8b5cf6' },
  { group: '20–24', pct: 12.4, fill: '#8b5cf6' },
  { group: '25–29', pct: 13.1, fill: '#8b5cf6' },
  { group: '30–34', pct: 10.5, fill: '#8b5cf6' },
  { group: '35–39', pct: 8.2,  fill: '#f59e0b' },
  { group: '40–44', pct: 5.8,  fill: '#f59e0b' },
  { group: '45–49', pct: 3.9,  fill: '#f97316' },
  { group: '50–54', pct: 2.5,  fill: '#f97316' },
  { group: '55–59', pct: 1.4,  fill: '#ef4444' },
  { group: '60+',   pct: 1.3,  fill: '#ef4444' },
];

// ─── Fig 2 data: Population density by subcounty (2026 Projection) ───────────────
const POP_DENSITY = [
  { name: 'Mathare',         density: 62500, pop: 181000, color: '#ef4444' },
  { name: 'Kamukunji',       density: 54200, pop: 165000, color: '#ef4444' },
  { name: 'Starehe',         density: 48100, pop: 216000, color: '#ef4444' },
  { name: 'Kibra',           density: 44300, pop: 272000, color: '#f97316' },
  { name: 'Makadara',        density: 39800, pop: 186000, color: '#f97316' },
  { name: 'Westlands',       density: 18200, pop: 247000, color: '#f59e0b' },
  { name: 'Dagoretti N.',    density: 16400, pop: 194000, color: '#f59e0b' },
  { name: 'Dagoretti S.',    density: 15900, pop: 189000, color: '#f59e0b' },
  { name: 'Embakasi C.',     density: 14100, pop: 212000, color: '#f59e0b' },
  { name: 'Ruaraka',         density: 13200, pop: 200000, color: '#84cc16' },
  { name: 'Kasarani',        density: 11800, pop: 465000, color: '#84cc16' },
  { name: 'Roysambu',        density: 11200, pop: 223000, color: '#84cc16' },
  { name: 'Embakasi W.',     density: 9800,  pop: 228000, color: '#10b981' },
  { name: 'Embakasi N.',     density: 9200,  pop: 250000, color: '#10b981' },
  { name: "Lang'ata",        density: 6800,  pop: 321000, color: '#10b981' },
  { name: 'Embakasi E.',     density: 6500,  pop: 270000, color: '#10b981' },
  { name: 'Embakasi S.',     density: 5900,  pop: 188000, color: '#10b981' },
];

// ─── Shared chart styles ──────────────────────────────────────────────────────
const TOOLTIP_STYLE = {
  background: '#111827', border: '1px solid #374151',
  borderRadius: 10, fontSize: 11, color: '#e5e7eb',
};
const AXIS_TICK = { fill: '#6b7280', fontSize: 10 };
const GRID_STROKE = '#1f2937';

function SectionTitle({ icon, title, subtitle }: { icon: string; title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <span>{icon}</span>{title}
      </h3>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-3 sm:p-4">
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        {icon}<span className="text-xs">{label}</span>
      </div>
      <p className={`text-lg sm:text-xl font-extrabold truncate ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-0.5 truncate">{sub}</p>}
    </div>
  );
}

// ─── Figure 1: Age distribution ───────────────────────────────────────────────
function Fig1AgeDistribution() {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 sm:p-5">
      <SectionTitle
        icon="👥"
        title="Fig 1 — Nairobi Age Distribution (2026 Projection)"
        subtitle="Youth bulge: 70%+ of Nairobi's 6.09M residents are under 35. Children under 5 represent 11.8% — driving demand for pediatric and maternal services."
      />
      <div className="flex flex-wrap gap-3 mb-3 text-xs">
        {[
          { label: 'Under 15', color: '#06b6d4', pct: '31%' },
          { label: '15–34',    color: '#8b5cf6', pct: '46%' },
          { label: '35–49',    color: '#f59e0b', pct: '18%' },
          { label: '50+',      color: '#ef4444', pct: '5%'  },
        ].map(b => (
          <span key={b.label} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: b.color }} />
            <span className="text-gray-400">{b.label}</span>
            <span className="font-bold text-white">{b.pct}</span>
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={AGE_DISTRIBUTION} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="group" tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`, 'Population share']} />
          <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
            {AGE_DISTRIBUTION.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-600 mt-2 italic">
        Source: KNBS 2026 Projection (base: 2022 Census) · Nairobi County
      </p>
    </div>
  );
}

// ─── Figure 2: Population density ─────────────────────────────────────────────
function Fig2PopulationDensity() {
  const sorted = [...POP_DENSITY].sort((a, b) => b.density - a.density);
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 sm:p-5">
      <SectionTitle
        icon="🏙️"
        title="Fig 2 — Population Density by Subcounty (persons/km²)"
        subtitle="Mathare, Kamukunji and Starehe are among Africa's densest urban areas. High density = amplified air pollution exposure and healthcare demand."
      />
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={sorted} layout="vertical" margin={{ left: 5, right: 40, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
          <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false}
            tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }}
            axisLine={false} tickLine={false} width={90} />
          <Tooltip contentStyle={TOOLTIP_STYLE}
            formatter={(v) => [`${Number(v).toLocaleString()} /km²`, 'Density']} />
          <Bar dataKey="density" radius={[0, 4, 4, 0]}>
            {sorted.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-600 mt-2 italic">
        Source: KNBS 2026 Projection · Note: Embakasi subcounties share the wider Embakasi constituency
      </p>
    </div>
  );
}

export { Fig1AgeDistribution, Fig2PopulationDensity, AGE_DISTRIBUTION, POP_DENSITY, TOOLTIP_STYLE, AXIS_TICK, GRID_STROKE, SectionTitle, StatCard };
