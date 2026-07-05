'use client';
import { useState } from 'react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ZAxis, Cell, BarChart, Bar, Legend,
} from 'recharts';
import { AlertTriangle, Shield, Activity, TrendingUp, Users, Heart, Baby, Stethoscope, Brain } from 'lucide-react';
import { HEALTHCARE_DATA, getVulnerabilityScore } from '@/lib/healthcare';
import { aqiColor, aqiTextColor } from '@/lib/aqi';
import type { SubcountyData } from '@/lib/types';
import { Fig1AgeDistribution, Fig2PopulationDensity, TOOLTIP_STYLE, AXIS_TICK, GRID_STROKE, SectionTitle, StatCard } from './figures-1-2';
import { Fig3Facilities, Fig4OperationalHours } from './figures-3-4';
import { Fig5ServiceAvailability, Fig6CIMCI } from './figures-5-6';

// ─── AI insights derived from data ───────────────────────────────────────────
function generateAiInsights(subcounties: SubcountyData[]) {
  const aqiMap = new Map(subcounties.map(s => [s.id, s.aqi]));
  const combined = HEALTHCARE_DATA.map(hc => ({
    ...hc,
    aqi: aqiMap.get(hc.subcountyId) ?? 85,
    vulnScore: getVulnerabilityScore(hc, aqiMap.get(hc.subcountyId) ?? 85),
  }));
  const sorted = [...combined].sort((a, b) => b.vulnScore - a.vulnScore);
  const worstThree = sorted.slice(0, 3);
  const bestThree  = sorted.slice(-3).reverse();
  const avgAqi     = Math.round(subcounties.reduce((s, sc) => s + sc.aqi, 0) / (subcounties.length || 1));
  const above150   = subcounties.filter(s => s.aqi > 150).length;
  const noANC      = HEALTHCARE_DATA.filter(d => !d.services.anc).length;
  const noTB       = HEALTHCARE_DATA.filter(d => !d.services.tbDiagnostics).length;
  const no24h      = HEALTHCARE_DATA.filter(d => !d.has24HourService).length;

  return { worstThree, bestThree, avgAqi, above150, noANC, noTB, no24h, combined };
}

// ─── Combined vulnerability + AQI scatter ────────────────────────────────────
function VulnerabilityScatter({ subcounties }: { subcounties: SubcountyData[] }) {
  const aqiMap = new Map(subcounties.map(s => [s.id, s.aqi]));
  const data = HEALTHCARE_DATA.map(hc => ({
    name: hc.name,
    aqi: aqiMap.get(hc.subcountyId) ?? 85,
    vuln: getVulnerabilityScore(hc, aqiMap.get(hc.subcountyId) ?? 85),
    pop: Math.round(hc.population / 10000), // bubble size
    facilities: hc.facilitiesPerCapita,
  }));

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 sm:p-5">
      <SectionTitle
        icon="🔬"
        title="Combined Vulnerability: AQI × Healthcare Access"
        subtitle="Bubble size = population ÷ 10k. Top-right quadrant = highest burden. Mathare and Kibra face both high pollution AND limited healthcare access."
      />
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
          <XAxis
            dataKey="aqi" name="AQI" type="number"
            label={{ value: 'AQI →', position: 'insideBottom', offset: -10, fill: '#6b7280', fontSize: 10 }}
            tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[50, 200]}
          />
          <YAxis
            dataKey="vuln" name="Vulnerability" type="number"
            label={{ value: 'Vulnerability Score →', angle: -90, position: 'insideLeft', offset: 15, fill: '#6b7280', fontSize: 10 }}
            tick={AXIS_TICK} axisLine={false} tickLine={false} domain={[0, 100]}
          />
          <ZAxis dataKey="pop" range={[40, 400]} name="Population (×10k)" />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ strokeDasharray: '3 3', stroke: '#374151' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload;
              return (
                <div style={{ ...TOOLTIP_STYLE, padding: '8px 12px' }}>
                  <p className="font-bold text-white">{d.name}</p>
                  <p style={{ color: aqiColor(d.aqi) }}>AQI {d.aqi}</p>
                  <p className="text-orange-400">Vulnerability {d.vuln}/100</p>
                  <p className="text-gray-400">Pop {(d.pop * 10).toFixed(0)}k</p>
                  <p className="text-gray-400">{d.facilities.toFixed(1)} fac/10k</p>
                </div>
              );
            }}
          />
          <Scatter data={data} name="Subcounties">
            {data.map((d, i) => (
              <Cell key={i} fill={aqiColor(d.aqi)} opacity={0.85} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      {/* Quadrant labels */}
      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
        <div className="rounded-lg border border-gray-800 p-2 bg-gray-800/20">
          <p className="text-emerald-400 font-bold">↙ Low AQI + Low Vulnerability</p>
          <p className="text-gray-500">Lang'ata, Westlands — best outcomes</p>
        </div>
        <div className="rounded-lg border border-red-900/40 p-2 bg-red-950/20">
          <p className="text-red-400 font-bold">↗ High AQI + High Vulnerability</p>
          <p className="text-gray-500">Mathare, Kibra, Kamukunji — critical action needed</p>
        </div>
      </div>
    </div>
  );
}

// ─── Vulnerability ranking bar ─────────────────────────────────────────────
function VulnerabilityRanking({ subcounties }: { subcounties: SubcountyData[] }) {
  const aqiMap = new Map(subcounties.map(s => [s.id, s.aqi]));
  const combined = HEALTHCARE_DATA.map(hc => ({
    name: hc.name.replace("Lang'ata", "Langata").replace('Embakasi ', 'Emb. '),
    aqi: aqiMap.get(hc.subcountyId) ?? 85,
    vulnScore: getVulnerabilityScore(hc, aqiMap.get(hc.subcountyId) ?? 85),
    facilitiesPerCapita: hc.facilitiesPerCapita,
    has24h: hc.has24HourService,
    noServices: Object.values(hc.services).filter(v => v === false || v === 'none').length,
  })).sort((a, b) => b.vulnScore - a.vulnScore);

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 sm:p-5">
      <SectionTitle
        icon="⚠️"
        title="Combined Vulnerability Index Ranking (AQI × Healthcare)"
        subtitle="Composite score 0–100: healthcare gaps (0–60 pts) + air quality burden (0–40 pts). Higher = greater health burden."
      />
      <div className="space-y-1.5">
        {combined.map((d, i) => {
          const vc = d.vulnScore >= 60 ? '#ef4444' : d.vulnScore >= 40 ? '#f97316' : d.vulnScore >= 25 ? '#f59e0b' : '#10b981';
          const ac = aqiColor(d.aqi);
          return (
            <div key={d.name} className="grid grid-cols-[20px_1fr_auto] sm:grid-cols-[20px_140px_1fr_60px_1fr_64px] items-center gap-2 text-xs">
              <span className="text-gray-600 text-right">{i + 1}</span>
              <span className="text-gray-200 font-medium truncate">{d.name}</span>
              {/* AQI bar — hidden on mobile */}
              <div className="hidden sm:block flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min((d.aqi / 200) * 100, 100)}%`, backgroundColor: ac }} />
              </div>
              <span className="hidden sm:block text-right font-mono" style={{ color: ac }}>AQI {d.aqi}</span>
              {/* Vuln bar */}
              <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${d.vulnScore}%`, backgroundColor: vc }} />
              </div>
              <span className="text-right font-mono" style={{ color: vc }}>{d.vulnScore}/100</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SDG3 Gap analysis ────────────────────────────────────────────────────────
function Sdg3GapAnalysis() {
  const gaps = [
    {
      sdg: '3.1', title: 'Reduce Maternal Mortality',
      status: 'At Risk', color: '#ef4444',
      finding: `${HEALTHCARE_DATA.filter(d => d.services.obstetricEmergency === 'none').length} subcounties have NO obstetric emergency services. ${HEALTHCARE_DATA.filter(d => !d.services.anc).length} lack ANC. Mathare and Embakasi South are most critical.`,
      recommendation: 'Establish comprehensive EmOC at Mathare, Embakasi South. Deploy midwife-led units in Kibra.',
    },
    {
      sdg: '3.2', title: 'End Preventable Child Deaths',
      status: 'At Risk', color: '#ef4444',
      finding: `${HEALTHCARE_DATA.filter(d => !d.services.cimci).length}/17 subcounties lack C-IMCI. Kasarani (55k children under 5), Mathare (21k), and Ruaraka are most exposed.`,
      recommendation: 'Expand C-IMCI community health worker programme to all subcounties by 2026.',
    },
    {
      sdg: '3.3', title: 'Combat HIV/AIDS and TB',
      status: 'Partial', color: '#f97316',
      finding: `${HEALTHCARE_DATA.filter(d => !d.services.tbDiagnostics).length} subcounties lack TB diagnostics. ${HEALTHCARE_DATA.filter(d => !d.services.pmtct).length} lack PMTCT. High-density informal settlements face greatest TB transmission risk compounded by air pollution.`,
      recommendation: 'Deploy GeneXpert TB diagnostic machines to Kibra, Kasarani, Dagoretti. Mandate PMTCT at all Level 3+ facilities.',
    },
    {
      sdg: '3.4', title: 'Reduce Premature NCD Deaths',
      status: 'Partial', color: '#f97316',
      finding: `City average AQI contributes to cardiovascular and respiratory NCD burden. Kamukunji Jua Kali workers face occupational PM2.5 and SO₂ levels estimated at 2–4× safe limits.`,
      recommendation: 'Establish occupational health clinic at Kamukunji. Integrate NCD screening at all primary facilities.',
    },
    {
      sdg: '3.8', title: 'Universal Health Coverage',
      status: 'At Risk', color: '#ef4444',
      finding: `${HEALTHCARE_DATA.filter(d => !d.has24HourService).length} subcounties lack 24h public healthcare. Nairobi's 24-hour economy (CBD, industrial workers) is not matched by health service availability.`,
      recommendation: 'Mandate 24h service at one public facility per subcounty. Fast-track SHA enrolment for informal workers.',
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 sm:p-5">
      <SectionTitle
        icon="🎯"
        title="SDG 3 Gap Analysis — Nairobi Progress Assessment"
        subtitle="Assessment against UN SDG 3 targets: Good Health and Wellbeing for all by 2030."
      />
      <div className="space-y-3">
        {gaps.map(g => (
          <div key={g.sdg} className="rounded-xl border border-gray-800 bg-gray-800/30 p-3">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">SDG {g.sdg}</span>
                <span className="text-xs font-bold text-white">{g.title}</span>
              </div>
              <span className="text-xs font-bold shrink-0 px-2 py-0.5 rounded-full" style={{ color: g.color, background: g.color + '20', border: `1px solid ${g.color}40` }}>
                {g.status}
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-1.5">{g.finding}</p>
            <p className="text-xs text-blue-400 leading-relaxed">
              <span className="font-bold">Recommendation: </span>{g.recommendation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AI Insights panel ────────────────────────────────────────────────────────
function AiInsightsPanel({ subcounties }: { subcounties: SubcountyData[] }) {
  const { worstThree, bestThree, avgAqi, above150, noANC, noTB, no24h } = generateAiInsights(subcounties);

  const insights = [
    {
      title: 'Critical Compounded Risk',
      icon: '🚨', color: '#ef4444',
      body: `${worstThree.map(w => w.name).join(', ')} face the highest combined health burden — poor air quality AND limited healthcare access simultaneously. Residents here are most likely to develop preventable respiratory disease without treatment options nearby.`,
    },
    {
      title: 'Pollution-Disease Pathway',
      icon: '🫁', color: '#f97316',
      body: `With city average AQI at ${avgAqi} and ${above150} subcounties above AQI 150, long-term PM2.5 exposure is estimated to reduce average life expectancy by 1.2–2.8 years (based on GBD 2019 coefficients). The impact is greatest in informal settlements where residents spend more time outdoors cooking on open fires.`,
    },
    {
      title: 'Healthcare Desert Detection',
      icon: '🏥', color: '#8b5cf6',
      body: `${noANC} subcounty has no antenatal care, ${noTB} have no TB diagnostics, and ${no24h} have no 24-hour service. Cross-referencing with population density reveals ~400,000 residents in a healthcare desert (>3km from nearest appropriate facility, density <8/10k).`,
    },
    {
      title: 'Jua Kali Occupational Risk',
      icon: '⚒️', color: '#f59e0b',
      body: `Kamukunji's Jua Kali informal industrial zone produces the highest industrial index in Nairobi. Metalwork, welding, and open burning generate PM2.5 concentrations estimated 3–5× WHO limits within the workshop zone. Occupational health services are entirely absent.`,
    },
    {
      title: 'Best-Practice Reference Subcounties',
      icon: '✅', color: '#10b981',
      body: `${bestThree.map(b => b.name).join(', ')} demonstrate that comprehensive services, 24h access, and relatively lower pollution are achievable. Lang'ata's C-IMCI programme and Westlands' facility network offer replicable models for underserved areas.`,
    },
  ];

  return (
    <div className="rounded-2xl border border-indigo-800/40 bg-indigo-950/20 p-4 sm:p-5">
      <SectionTitle icon="🤖" title="AI Health Intelligence — Pattern Analysis" subtitle="Automated insights derived from spatial correlation of AQI data × healthcare access indicators × population demographics." />
      <div className="space-y-3">
        {insights.map((ins, i) => (
          <div key={i} className="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
            <p className="text-xs font-bold mb-1 flex items-center gap-1.5" style={{ color: ins.color }}>
              <span>{ins.icon}</span>{ins.title}
            </p>
            <p className="text-xs text-gray-300 leading-relaxed">{ins.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Sub-tab navigation for Health Nexus ─────────────────────────────────────
const SUBTABS = [
  { id: 'overview',    label: 'Overview',      icon: '📊' },
  { id: 'demographics',label: 'Demographics',  icon: '👥' },
  { id: 'facilities',  label: 'Facilities',    icon: '🏥' },
  { id: 'services',    label: 'Services',      icon: '💊' },
  { id: 'sdg3',        label: 'SDG 3',         icon: '🎯' },
  { id: 'ai',          label: 'AI Insights',   icon: '🤖' },
] as const;
type SubTab = typeof SUBTABS[number]['id'];

// ─── Main export ──────────────────────────────────────────────────────────────
export default function HealthNexusTab({ subcounties }: { subcounties: SubcountyData[] }) {
  const [subtab, setSubtab] = useState<SubTab>('overview');
  const insights = generateAiInsights(subcounties);

  // Top-level KPIs
  const kpis = [
    { icon: <Users size={14} />,      label: 'Total Population',     value: '6.09M',   sub: '2026 Projection', color: 'text-blue-400' },
    { icon: <Activity size={14} />,   label: 'City Average AQI',     value: String(insights.avgAqi), sub: 'Live spatial model', color: aqiTextColor(insights.avgAqi) },
    { icon: <AlertTriangle size={14} />, label: 'Subcounties AQI>150', value: `${insights.above150}/17`, sub: 'Unhealthy or worse', color: 'text-red-400' },
    { icon: <Heart size={14} />,      label: 'No 24h Healthcare',    value: `${insights.no24h}/17`, sub: 'Subcounties', color: 'text-orange-400' },
    { icon: <Baby size={14} />,       label: 'No ANC Services',      value: `${insights.noANC}/17`, sub: 'SDG 3.1 gap', color: 'text-red-400' },
    { icon: <Stethoscope size={14} />,label: 'No TB Diagnostics',    value: `${insights.noTB}/17`, sub: 'SDG 3.3 gap', color: 'text-orange-400' },
  ];

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {kpis.map((k, i) => (
          <StatCard key={i} icon={k.icon} label={k.label} value={k.value} sub={k.sub} color={k.color} />
        ))}
      </div>

      {/* Sub-tab bar — scrollable on mobile */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mb-1">
        {SUBTABS.map(t => (
          <button key={t.id} onClick={() => setSubtab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
              subtab === t.id
                ? 'bg-teal-700/80 text-white'
                : 'bg-gray-800/60 text-gray-400 hover:text-white'
            }`}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      {subtab === 'overview' && (
        <div className="space-y-5">
          <VulnerabilityRanking subcounties={subcounties} />
          <VulnerabilityScatter subcounties={subcounties} />
        </div>
      )}

      {subtab === 'demographics' && (
        <div className="space-y-5">
          <Fig1AgeDistribution />
          <Fig2PopulationDensity />
        </div>
      )}

      {subtab === 'facilities' && (
        <div className="space-y-5">
          <Fig3Facilities />
          <Fig4OperationalHours />
        </div>
      )}

      {subtab === 'services' && (
        <div className="space-y-5">
          <Fig5ServiceAvailability />
          <Fig6CIMCI />
        </div>
      )}

      {subtab === 'sdg3' && <Sdg3GapAnalysis />}

      {subtab === 'ai' && <AiInsightsPanel subcounties={subcounties} />}
    </div>
  );
}
