'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from 'recharts';
import { HEALTHCARE_DATA } from '@/lib/healthcare';
import { TOOLTIP_STYLE, AXIS_TICK, GRID_STROKE, SectionTitle } from './figures-1-2';

// ─── Figure 5: Service availability heatmap ───────────────────────────────────
const SERVICE_KEYS = [
  { key: 'art',               label: 'ART',       sdg: '3.3', desc: 'Antiretroviral Therapy' },
  { key: 'anc',               label: 'ANC',       sdg: '3.1', desc: 'Antenatal Care' },
  { key: 'pmtct',             label: 'PMTCT',     sdg: '3.3', desc: 'Prevention Mother-to-Child HIV' },
  { key: 'tbDiagnostics',     label: 'TB Diag.',  sdg: '3.3', desc: 'TB Diagnostics' },
  { key: 'immunization',      label: 'EPI',       sdg: '3.2', desc: 'Expanded Programme on Immunisation' },
  { key: 'cimci',             label: 'C-IMCI',    sdg: '3.2', desc: 'Community Integrated Mgmt Childhood Illness' },
] as const;

type ServiceKey = typeof SERVICE_KEYS[number]['key'];

// Compute coverage % per service across all 17 subcounties
const serviceCoverage = SERVICE_KEYS.map(sk => {
  const count = HEALTHCARE_DATA.filter(d => {
    const val = (d.services as Record<string, unknown>)[sk.key];
    return val === true;
  }).length;
  return {
    service: sk.key,
    label: sk.label,
    sdg: sk.sdg,
    desc: sk.desc,
    covered: count,
    missing: 17 - count,
    pct: Math.round((count / 17) * 100),
  };
});

// Obstetric emergency (special — not boolean)
const obstetricData = {
  comprehensive: HEALTHCARE_DATA.filter(d => d.services.obstetricEmergency === 'comprehensive').length,
  basic:         HEALTHCARE_DATA.filter(d => d.services.obstetricEmergency === 'basic').length,
  none:          HEALTHCARE_DATA.filter(d => d.services.obstetricEmergency === 'none').length,
};

export function Fig5ServiceAvailability() {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 sm:p-5">
      <SectionTitle
        icon="💊"
        title="Fig 5 — Essential Service Availability Across Subcounties"
        subtitle="ART and immunisation are best covered. PMTCT, TB diagnostics and C-IMCI are missing in 40–65% of subcounties — directly compromising SDG 3 targets."
      />

      {/* Stacked bar: covered vs missing */}
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={serviceCoverage} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[0, 17]} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v, name) => [`${v} subcounties`, name]}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
          <Bar dataKey="covered" stackId="a" fill="#10b981" name="Has service" radius={[0,0,0,0]} />
          <Bar dataKey="missing" stackId="a" fill="#374151" name="Missing" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Service cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4">
        {serviceCoverage.map(s => (
          <div key={s.service} className="rounded-xl border border-gray-800 bg-gray-800/30 p-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-white">{s.label}</span>
              <span className="text-xs font-mono" style={{ color: s.pct >= 70 ? '#10b981' : s.pct >= 50 ? '#f59e0b' : '#ef4444' }}>
                {s.pct}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{
                width: `${s.pct}%`,
                backgroundColor: s.pct >= 70 ? '#10b981' : s.pct >= 50 ? '#f59e0b' : '#ef4444',
              }} />
            </div>
            <p className="text-xs text-gray-600 mt-1">SDG {s.sdg} · {s.covered}/17</p>
            <p className="text-xs text-gray-500 truncate">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Obstetric emergency breakdown */}
      <div className="mt-4 rounded-xl border border-gray-800 bg-gray-800/20 p-3">
        <p className="text-xs font-bold text-gray-400 uppercase mb-2">
          🚨 Obstetric Emergency Care (SDG 3.1)
        </p>
        <div className="flex gap-3 flex-wrap text-xs">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-gray-400">Comprehensive:</span>
            <span className="font-bold text-emerald-400">{obstetricData.comprehensive}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-gray-400">Basic only:</span>
            <span className="font-bold text-amber-400">{obstetricData.basic}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-gray-400">None:</span>
            <span className="font-bold text-red-400">{obstetricData.none}</span>
          </span>
        </div>
        <p className="text-xs text-gray-600 mt-1.5">
          {obstetricData.none} subcounties have no obstetric emergency capability — including Mathare and Embakasi South.
        </p>
      </div>

      <p className="text-xs text-gray-600 mt-3 italic">
        Source: Kenya MoH KHIS 2022 · Nairobi Healthcare Study 2024
      </p>
    </div>
  );
}

// ─── Figure 6: C-IMCI children's accessibility radar ─────────────────────────
// Radar showing multi-dimension child health accessibility per subcounty cluster
const CIMCI_RADAR = [
  {
    subject: 'C-IMCI Coverage',
    Langata: 90, Westlands: 85, Starehe: 80,
    Kibra: 30, Mathare: 15, Kasarani: 25,
  },
  {
    subject: 'Immunisation',
    Langata: 95, Westlands: 90, Starehe: 90,
    Kibra: 75, Mathare: 70, Kasarani: 72,
  },
  {
    subject: 'Facility Density',
    Langata: 70, Westlands: 95, Starehe: 98,
    Kibra: 35, Mathare: 42, Kasarani: 38,
  },
  {
    subject: '24h Access',
    Langata: 80, Westlands: 85, Starehe: 85,
    Kibra: 20, Mathare: 10, Kasarani: 15,
  },
  {
    subject: 'ANC Services',
    Langata: 90, Westlands: 90, Starehe: 88,
    Kibra: 80, Mathare: 10, Kasarani: 78,
  },
  {
    subject: 'Obstetric Care',
    Langata: 88, Westlands: 92, Starehe: 90,
    Kibra: 40, Mathare: 5,  Kasarani: 38,
  },
];

// Bar chart: subcounty CIMCI availability + children under-5 population
const CIMCI_BAR = HEALTHCARE_DATA.map(d => ({
  name: d.name.replace("Lang'ata", "Langata").replace('Embakasi ', 'Emb. '),
  hasCimci: d.services.cimci ? 1 : 0,
  under5Pop: Math.round(d.population * 0.118 / 1000), // 11.8% under 5 from census
  facilitiesPerCapita: d.facilitiesPerCapita,
})).sort((a, b) => b.under5Pop - a.under5Pop);

export function Fig6CIMCI() {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 sm:p-5">
      <SectionTitle
        icon="👶"
        title="Fig 6 — Children's Healthcare: C-IMCI Accessibility & Under-5 Population"
        subtitle="Kasarani has 55k children under 5 but no C-IMCI. Mathare has 21k under-5 children, no C-IMCI, no ANC, no obstetric emergency — the highest child health risk gap in Nairobi."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar: best vs worst subcounties */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Child Health Access Radar</p>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={CIMCI_RADAR} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
              <PolarGrid stroke={GRID_STROKE} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 9 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#4b5563', fontSize: 8 }} />
              <Radar name="Lang'ata" dataKey="Langata"  stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
              <Radar name="Westlands" dataKey="Westlands" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.10} />
              <Radar name="Kibra"    dataKey="Kibra"    stroke="#f97316" fill="#f97316" fillOpacity={0.15} />
              <Radar name="Mathare"  dataKey="Mathare"  stroke="#ef4444" fill="#ef4444" fillOpacity={0.20} />
              <Radar name="Kasarani" dataKey="Kasarani" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.10} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#9ca3af' }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Under-5 population vs C-IMCI availability */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Under-5 Population (000s) · 🟢 = C-IMCI present</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={CIMCI_BAR} layout="vertical" margin={{ left: 0, right: 35, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
              <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }}
                axisLine={false} tickLine={false} width={82} />
              <Tooltip contentStyle={TOOLTIP_STYLE}
                formatter={(v) => [`${v}k children under 5`, '']} />
              <Bar dataKey="under5Pop" radius={[0, 4, 4, 0]}>
                {CIMCI_BAR.map((d, i) => (
                  <Cell key={i} fill={d.hasCimci ? '#10b981' : '#ef4444'} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-600 mt-1">
            <span className="text-emerald-400">■</span> C-IMCI available &nbsp;
            <span className="text-red-400">■</span> C-IMCI missing
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-600 mt-3 italic">
        Source: KNBS 2026 Projection (under-5 est. 11.5% of subcounty pop.) · Kenya MoH C-IMCI programme data
      </p>
    </div>
  );
}
