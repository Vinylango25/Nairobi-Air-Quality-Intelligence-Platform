'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend,
} from 'recharts';
import { Wind, RefreshCw, MapPin, AlertTriangle, Shield, Activity, TrendingUp } from 'lucide-react';
import type { AirIQResponse, SubcountyData, AIRecommendation } from '@/lib/types';
import { aqiColor, aqiTextColor, aqiBgColor, POLLUTANT_INFO, calcExposure } from '@/lib/aqi';
import { type HealthProfile, PROFILE_LABELS, PROFILE_ICONS } from '@/lib/profiles';
import HealthNexusTab from '@/components/health-nexus';
import PollutantEncyclopedia from '@/components/pollutants';

// ─── Skeleton ────────────────────────────────────────────────────────────────
function Sk({ className }: { className?: string }) {
  return <div className={`bg-gray-800/60 rounded-lg animate-pulse ${className ?? ''}`} />;
}

// ─── Hero AQI Gauge ──────────────────────────────────────────────────────────
function HeroGauge({ aqi, label, size = 200 }: { aqi: number; label: string; size?: number }) {
  const color = aqiColor(aqi);
  const cat = aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : aqi <= 150 ? 'Unhealthy (Sensitive)' : aqi <= 200 ? 'Unhealthy' : aqi <= 300 ? 'Very Unhealthy' : 'Hazardous';
  const catBg = aqi <= 50 ? '#064e3b' : aqi <= 100 ? '#78350f' : aqi <= 150 ? '#7c2d12' : aqi <= 200 ? '#7f1d1d' : '#4c1d95';

  // SVG half-circle gauge
  const R = 70, CX = 100, CY = 90;
  const circumference = Math.PI * R; // half circle
  const pct = Math.min(aqi / 300, 1);
  const strokeDash = circumference;
  const strokeOffset = circumference * (1 - pct);

  // Needle angle: -90° (left) to +90° (right)
  const needleAngle = -90 + pct * 180;
  const needleRad = (needleAngle * Math.PI) / 180;
  const nx = CX + R * 0.75 * Math.cos(needleRad);
  const ny = CY + R * 0.75 * Math.sin(needleRad);

  // Tick marks
  const ticks = [0, 50, 100, 150, 200, 300].map(v => {
    const a = -90 + (v / 300) * 180;
    const r = (a * Math.PI) / 180;
    const x1 = CX + (R - 8) * Math.cos(r);
    const y1 = CY + (R - 8) * Math.sin(r);
    const x2 = CX + (R + 2) * Math.cos(r);
    const y2 = CY + (R + 2) * Math.sin(r);
    const lx = CX + (R - 18) * Math.cos(r);
    const ly = CY + (R - 18) * Math.sin(r);
    const tickColor = aqiColor(v);
    return { x1, y1, x2, y2, lx, ly, v, tickColor };
  });

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size * 0.6} viewBox="0 0 200 110">
        {/* Background arc */}
        <path d={`M ${CX - R},${CY} A ${R},${R} 0 0,1 ${CX + R},${CY}`}
          fill="none" stroke="#1f2937" strokeWidth="12" strokeLinecap="round" />
        {/* Colored arc — segmented gradient */}
        {[
          { from: 0,   to: 50,  color: '#10b981' },
          { from: 50,  to: 100, color: '#f59e0b' },
          { from: 100, to: 150, color: '#f97316' },
          { from: 150, to: 200, color: '#ef4444' },
          { from: 200, to: 300, color: '#7c3aed' },
        ].map(seg => {
          const a1 = -90 + (seg.from / 300) * 180;
          const a2 = -90 + (seg.to / 300) * 180;
          const r1 = (a1 * Math.PI) / 180;
          const r2 = (a2 * Math.PI) / 180;
          const x1 = CX + R * Math.cos(r1), y1 = CY + R * Math.sin(r1);
          const x2 = CX + R * Math.cos(r2), y2 = CY + R * Math.sin(r2);
          const fill = pct * 300 > seg.from;
          if (!fill) return null;
          const actualEnd = Math.min(pct * 300, seg.to);
          const ae = ((-90 + (actualEnd / 300) * 180) * Math.PI) / 180;
          const xe = CX + R * Math.cos(ae), ye = CY + R * Math.sin(ae);
          const large = (actualEnd - seg.from) / 300 * 180 > 180 ? 1 : 0;
          return (
            <path key={seg.from}
              d={`M ${x1},${y1} A ${R},${R} 0 ${large},1 ${xe},${ye}`}
              fill="none" stroke={seg.color} strokeWidth="12" strokeLinecap="butt"
              style={{ transition: 'stroke-dashoffset 1s ease-out' }}
            />
          );
        })}
        {/* Tick marks */}
        {ticks.map(t => (
          <g key={t.v}>
            <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={t.tickColor} strokeWidth="2" />
            <text x={t.lx} y={t.ly + 3} textAnchor="middle" fontSize="8" fill="#6b7280">{t.v}</text>
          </g>
        ))}
        {/* Needle */}
        <line x1={CX} y1={CY} x2={nx} y2={ny} stroke={color} strokeWidth="2.5" strokeLinecap="round"
          style={{ transition: 'all 1s ease-out', transformOrigin: `${CX}px ${CY}px` }} />
        <circle cx={CX} cy={CY} r="5" fill={color} />
        {/* Center value */}
        <text x={CX} y={CY - 12} textAnchor="middle" fontSize="28" fontWeight="bold" fill={color}>{aqi}</text>
        <text x={CX} y={CY + 2} textAnchor="middle" fontSize="8" fill="#6b7280">AQI</text>
      </svg>
      {/* Category badge */}
      <div className="px-4 py-1.5 rounded-full text-xs font-bold mt-1" style={{ backgroundColor: catBg + '88', color, border: `1px solid ${color}44` }}>
        {cat}
      </div>
      <p className="text-xs text-gray-400 mt-1.5 font-medium">{label}</p>
    </div>
  );
}

// ─── Compact mini gauge ───────────────────────────────────────────────────────
function MiniGauge({ aqi }: { aqi: number }) {
  const color = aqiColor(aqi);
  const pct = Math.min(aqi / 300, 1);
  return (
    <div className="flex flex-col items-center">
      <svg width="56" height="32" viewBox="0 0 56 32">
        <path d="M 4,28 A 24,24 0 0,1 52,28" fill="none" stroke="#1f2937" strokeWidth="6" strokeLinecap="round" />
        <path d="M 4,28 A 24,24 0 0,1 52,28" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${75.4 * pct} 75.4`} />
        <text x="28" y="26" textAnchor="middle" fontSize="11" fontWeight="bold" fill={color}>{aqi}</text>
      </svg>
    </div>
  );
}

// ─── Pollutant pill ───────────────────────────────────────────────────────────
function PollutantPill({ label, value, unit, color }: { label: string; value: number | null; unit: string; color: string }) {
  return (
    <div className="flex flex-col items-center px-3 py-2 rounded-xl" style={{ background: color + '15', border: `1px solid ${color}30` }}>
      <span className="text-xs font-mono font-bold" style={{ color }}>{label}</span>
      <span className="text-sm font-extrabold text-white mt-0.5">{value?.toFixed(1) ?? '—'}</span>
      <span className="text-xs text-gray-500">{unit}</span>
    </div>
  );
}

// ─── 24h trend chart ─────────────────────────────────────────────────────────
function TrendChart({ data, aqi }: { data: { hour: string; aqi: number }[]; aqi: number }) {
  const color = aqiColor(aqi);
  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
        <defs>
          <linearGradient id={`g${aqi}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="hour" tick={{ fill: '#6b7280', fontSize: 8 }} interval={5} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 8 }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 11 }}
          labelStyle={{ color: '#9ca3af' }} itemStyle={{ color }} />
        <Area type="monotone" dataKey="aqi" stroke={color} strokeWidth={2} fill={`url(#g${aqi})`} dot={false} name="AQI" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Subcounty Card ───────────────────────────────────────────────────────────
function SubcountyCard({ sc, selected, onClick }: { sc: SubcountyData; selected: boolean; onClick: () => void }) {
  const color = aqiColor(sc.aqi);
  const pm25 = sc.pollutants.find(p => p.key === 'pm25');
  return (
    <button onClick={onClick}
      className={`aiq-card w-full text-left rounded-2xl border p-3.5 transition-all ${
        selected
          ? `bg-gray-900 ring-2 ring-offset-0`
          : 'border-gray-800 bg-gray-900/40 hover:border-gray-600'
      }`}
      style={selected ? { borderColor: color, ['--tw-ring-color' as string]: color } : {}}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{sc.name}</p>
          <p className="text-xs mt-0.5" style={{ color }}>{sc.category}</p>
        </div>
        <MiniGauge aqi={sc.aqi} />
      </div>
      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
        <span>PM2.5: <span className="text-gray-300">{pm25?.value?.toFixed(1) ?? '—'} µg/m³</span></span>
        <span>7d: <span className="text-gray-300">{sc.weeklyAvg}</span></span>
        {!sc.isModelled && <span className="text-emerald-500">● Live</span>}
      </div>
    </button>
  );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function DetailPanel({ sc }: { sc: SubcountyData }) {
  const exposure = calcExposure(sc.id, sc.aqi);
  const riskColors: Record<string, string> = { Low: 'text-emerald-400', Moderate: 'text-amber-400', High: 'text-orange-400', 'Very High': 'text-red-400', Extreme: 'text-red-300' };
  const pollutantColors: Record<string, string> = { pm25: '#f97316', pm10: '#f59e0b', no2: '#8b5cf6', o3: '#06b6d4', co: '#84cc16', so2: '#ec4899' };

  return (
    <div className="space-y-4">
      {/* Hero gauge + pollutant pills */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white">{sc.name}</h2>
            <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1.5">
              <MapPin size={12} />
              {sc.stationName ? `Live station: ${sc.stationName}` : 'Spatially modelled — nearest WAQI stations'}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              Updated {new Date(sc.lastUpdated).toLocaleTimeString('en-KE')} EAT
            </p>
          </div>
          <HeroGauge aqi={sc.aqi} label={sc.name} size={160} />
        </div>

        {/* Pollutant pills */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
          {sc.pollutants.map(p => (
            <PollutantPill key={p.key} label={p.label} value={p.value} unit={p.unit} color={pollutantColors[p.key] ?? '#6b7280'} />
          ))}
        </div>
      </div>

      {/* 24h trend */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">📈 24-Hour AQI Trend</p>
        <TrendChart data={sc.hourlyTrend} aqi={sc.aqi} />
      </div>

      {/* Exposure */}
      <div className={`rounded-2xl border p-4 ${aqiBgColor(sc.aqi)}`}>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">⚠️ Exposure Assessment</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div>
            <p className="text-2xl font-black text-white">{exposure.safeOutdoorMinutes}m</p>
            <p className="text-xs text-gray-400">Safe outdoor</p>
          </div>
          <div>
            <p className="text-2xl font-black text-amber-400">{exposure.sensitiveGroupMinutes}m</p>
            <p className="text-xs text-gray-400">Sensitive groups</p>
          </div>
          <div>
            <p className={`text-lg font-extrabold ${riskColors[exposure.riskLevel] ?? 'text-gray-400'}`}>{exposure.riskLevel}</p>
            <p className="text-xs text-gray-400">Risk level</p>
          </div>
          <div>
            <p className="text-xl font-black text-white">{exposure.cumulativeExposureIndex}<span className="text-sm text-gray-500">/100</span></p>
            <p className="text-xs text-gray-400">Exposure Index</p>
          </div>
        </div>
        <ul className="mt-3 space-y-1">
          {exposure.recommendations.map((r, i) => (
            <li key={i} className="text-xs text-gray-300 flex gap-2"><span className="text-amber-400 shrink-0">•</span>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── AI Advisor Panel ─────────────────────────────────────────────────────────
function AIAdvisor({ sc }: { sc: SubcountyData }) {
  const [profile, setProfile] = useState<HealthProfile>('healthy_adult');
  const [rec, setRec] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const lastKey = useRef('');

  useEffect(() => {
    const key = `${sc.id}-${profile}`;
    if (key === lastKey.current) return;
    lastKey.current = key;
    setLoading(true);
    fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subcounty: sc, profile }),
    })
      .then(r => r.json())
      .then(setRec)
      .finally(() => setLoading(false));
  }, [sc.id, profile]);

  return (
    <div className="space-y-4">
      {/* Profile selector */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(PROFILE_LABELS) as [HealthProfile, string][]).map(([k, v]) => (
          <button key={k} onClick={() => setProfile(k)}
            className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-colors ${
              profile === k ? 'bg-indigo-600 text-white font-bold' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}>
            <span>{PROFILE_ICONS[k]}</span><span>{v}</span>
          </button>
        ))}
      </div>

      {loading && <div className="space-y-2"><Sk className="h-4 w-full" /><Sk className="h-4 w-3/4" /><Sk className="h-20 w-full" /></div>}

      {!loading && rec && (
        <div className="space-y-3">
          <div className="rounded-2xl border border-indigo-700/40 bg-indigo-950/30 p-4">
            <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mb-2">🤖 AI Assessment</p>
            <p className="text-sm text-gray-200 leading-relaxed">{rec.summary}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
              <p className="text-xs text-emerald-400 font-bold mb-1.5">🌿 Outdoor Advice</p>
              <p className="text-xs text-gray-300 leading-relaxed">{rec.outdoorAdvice}</p>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
              <p className="text-xs text-blue-400 font-bold mb-1.5">🏠 Indoor Advice</p>
              <p className="text-xs text-gray-300 leading-relaxed">{rec.indoorAdvice}</p>
            </div>
          </div>
          {rec.sensitiveGroupNote && (
            <div className="rounded-xl border border-amber-700/40 bg-amber-950/20 p-3">
              <p className="text-xs text-amber-400 font-bold mb-1">⚠️ {PROFILE_LABELS[profile]} Note</p>
              <p className="text-xs text-gray-300 leading-relaxed">{rec.sensitiveGroupNote}</p>
            </div>
          )}
          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Activity Safety</p>
            <div className="space-y-2">
              {rec.activities.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className={`shrink-0 font-bold ${a.safe ? 'text-emerald-400' : 'text-red-400'}`}>{a.safe ? '✓' : '✗'}</span>
                  <span className="text-gray-300 font-medium w-32 shrink-0">{a.activity}</span>
                  <span className="text-gray-500">{a.note}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1.5">📅 24h Forecast</p>
            <p className="text-xs text-gray-300 leading-relaxed">{rec.forecast}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pollutant Encyclopedia — imported from components/pollutants ─────────────
// (full multi-standard analytics: EPA, EU, WHO, NEMA, UNEP, FAIRMODE)

// ─── Statistics Tab ───────────────────────────────────────────────────────────
function StatisticsTab({ subcounties }: { subcounties: SubcountyData[] }) {
  const sorted = [...subcounties].sort((a, b) => b.aqi - a.aqi);
  const avgAqi = Math.round(subcounties.reduce((s, sc) => s + sc.aqi, 0) / subcounties.length);
  const above100 = subcounties.filter(s => s.aqi > 100).length;

  const hourly = subcounties[0]?.hourlyTrend.map((h, i) => ({
    hour: h.hour,
    cityAvg: Math.round(subcounties.reduce((s, sc) => s + (sc.hourlyTrend[i]?.aqi ?? sc.aqi), 0) / subcounties.length),
    worst: Math.max(...subcounties.map(sc => sc.hourlyTrend[i]?.aqi ?? sc.aqi)),
    best: Math.min(...subcounties.map(sc => sc.hourlyTrend[i]?.aqi ?? sc.aqi)),
  })) ?? [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <Activity size={16} />, label: 'City Average AQI', value: String(avgAqi), color: aqiTextColor(avgAqi) },
          { icon: <AlertTriangle size={16} />, label: 'Worst Subcounty', value: sorted[0]?.name ?? '—', color: 'text-red-400' },
          { icon: <Shield size={16} />, label: 'Best Subcounty', value: sorted[sorted.length - 1]?.name ?? '—', color: 'text-emerald-400' },
          { icon: <TrendingUp size={16} />, label: 'Above AQI 100', value: `${above100} / 17`, color: 'text-orange-400' },
        ].map((c, i) => (
          <div key={i} className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-2">{c.icon}<span className="text-xs">{c.label}</span></div>
            <p className={`text-lg font-extrabold truncate ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">📈 City-Wide 24-Hour AQI Pattern</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={hourly} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="hour" tick={{ fill: '#6b7280', fontSize: 9 }} interval={3} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 9 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
            <Line type="monotone" dataKey="worst" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Worst subcounty" />
            <Line type="monotone" dataKey="cityAvg" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="City average" />
            <Line type="monotone" dataKey="best" stroke="#10b981" strokeWidth={1.5} dot={false} name="Best subcounty" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">🏆 Subcounty AQI Ranking</p>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={sorted} layout="vertical" margin={{ left: 10, right: 40, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 200]} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} width={105} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }} formatter={(v) => [`AQI ${v}`, '']} />
            <Bar dataKey="aqi" radius={[0, 4, 4, 0]}>
              {sorted.map((e, i) => <Cell key={i} fill={aqiColor(e.aqi)} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-800">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">📋 Full Data Table</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider">
              {['Subcounty','AQI','Category','PM2.5','PM10','NO₂','O₃','7d Avg','Source'].map(h => (
                <th key={h} className={`py-2.5 px-3 whitespace-nowrap ${h === 'Subcounty' ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {sorted.map(sc => {
                const [pm25, pm10, no2, o3] = ['pm25','pm10','no2','o3'].map(k => sc.pollutants.find(p => p.key === k));
                return (
                  <tr key={sc.id} className="border-b border-gray-800/40 hover:bg-gray-800/30">
                    <td className="px-3 py-2.5 font-medium text-gray-200">{sc.name}</td>
                    <td className="px-3 py-2.5 text-right font-bold" style={{ color: aqiColor(sc.aqi) }}>{sc.aqi}</td>
                    <td className="px-3 py-2.5 text-right text-gray-400 whitespace-nowrap">{sc.category}</td>
                    <td className="px-3 py-2.5 text-right text-gray-300">{pm25?.value?.toFixed(1) ?? '—'}</td>
                    <td className="px-3 py-2.5 text-right text-gray-300">{pm10?.value?.toFixed(1) ?? '—'}</td>
                    <td className="px-3 py-2.5 text-right text-gray-300">{no2?.value?.toFixed(1) ?? '—'}</td>
                    <td className="px-3 py-2.5 text-right text-gray-300">{o3?.value?.toFixed(1) ?? '—'}</td>
                    <td className="px-3 py-2.5 text-right text-gray-400">{sc.weeklyAvg}</td>
                    <td className="px-3 py-2.5 text-right">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${sc.isModelled ? 'text-gray-500 bg-gray-800' : 'text-emerald-400 bg-emerald-900/30'}`}>
                        {sc.isModelled ? 'Model' : 'Live'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── 5 Hero Gauges Banner ─────────────────────────────────────────────────────
const HERO_SUBCOUNTIES = ['westlands', 'starehe', 'kibra', 'kasarani', 'embakasi-east'] as const;

function HeroGaugesBanner({
  subcounties,
  userSubcountyId,
  onSelect,
  isOutside,
}: {
  subcounties: SubcountyData[];
  userSubcountyId: string | null;
  onSelect: (sc: SubcountyData) => void;
  isOutside?: boolean;
}) {
  const hero = HERO_SUBCOUNTIES.map(id => subcounties.find(s => s.id === id)).filter(Boolean) as SubcountyData[];

  if (hero.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-gray-300 uppercase tracking-widest">🌍 Nairobi Air Quality Snapshot</h2>
          <p className="text-xs text-gray-600 mt-0.5">5 representative subcounties — click any to explore</p>
        </div>
        <span className="text-xs text-gray-600 hidden sm:block">
          {new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi', hour: '2-digit', minute: '2-digit', weekday: 'short', day: 'numeric', month: 'short' })} EAT
        </span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {hero.map(sc => {
          const color = aqiColor(sc.aqi);
          const isUser = sc.id === userSubcountyId;
          const pct = Math.min(sc.aqi / 300, 1);
          const R = 38, CX = 50, CY = 46;

          // Segmented arc for mini hero
          const segments = [
            { from: 0,   to: 50,  color: '#10b981' },
            { from: 50,  to: 100, color: '#f59e0b' },
            { from: 100, to: 150, color: '#f97316' },
            { from: 150, to: 200, color: '#ef4444' },
            { from: 200, to: 300, color: '#7c3aed' },
          ];

          // Needle
          const needleAngle = -90 + pct * 180;
          const nr = (needleAngle * Math.PI) / 180;
          const nx = CX + R * 0.7 * Math.cos(nr);
          const ny = CY + R * 0.7 * Math.sin(nr);

          return (
            <button
              key={sc.id}
              onClick={() => onSelect(sc)}
              className={`flex flex-col items-center rounded-2xl border p-3 transition-all hover:scale-105 ${
                isUser
                  ? 'ring-2 ring-offset-1 ring-offset-gray-900'
                  : 'border-gray-800 hover:border-gray-600 bg-gray-900/40'
              }`}
              style={isUser ? { borderColor: color, ['--tw-ring-color' as string]: color, background: color + '10' } : {}}
            >
              {isUser && (
                <span className="text-xs font-bold mb-1 flex items-center gap-1" style={{ color }}>
                  <MapPin size={9} />{isOutside ? 'Nearest' : 'You'}
                </span>
              )}

              {/* Gauge SVG */}
              <svg width="100" height="60" viewBox="0 0 100 60">
                {/* Track */}
                <path d={`M ${CX - R},${CY} A ${R},${R} 0 0,1 ${CX + R},${CY}`}
                  fill="none" stroke="#1f2937" strokeWidth="7" strokeLinecap="round" />

                {/* Colored segments */}
                {segments.map(seg => {
                  if (pct * 300 <= seg.from) return null;
                  const a1 = ((-90 + (seg.from / 300) * 180) * Math.PI) / 180;
                  const actualEnd = Math.min(pct * 300, seg.to);
                  const ae = ((-90 + (actualEnd / 300) * 180) * Math.PI) / 180;
                  const x1 = CX + R * Math.cos(a1), y1 = CY + R * Math.sin(a1);
                  const xe = CX + R * Math.cos(ae), ye = CY + R * Math.sin(ae);
                  const large = (actualEnd - seg.from) / 300 * 180 > 180 ? 1 : 0;
                  return (
                    <path key={seg.from}
                      d={`M ${x1},${y1} A ${R},${R} 0 ${large},1 ${xe},${ye}`}
                      fill="none" stroke={seg.color} strokeWidth="7" strokeLinecap="butt" />
                  );
                })}

                {/* Needle */}
                <line x1={CX} y1={CY} x2={nx} y2={ny}
                  stroke={color} strokeWidth="2" strokeLinecap="round" />
                <circle cx={CX} cy={CY} r="3.5" fill={color} />

                {/* AQI value */}
                <text x={CX} y={CY - 8} textAnchor="middle" fontSize="16" fontWeight="bold" fill={color}>{sc.aqi}</text>
                <text x={CX} y={CY + 3} textAnchor="middle" fontSize="7" fill="#6b7280">AQI</text>
              </svg>

              <p className="text-xs font-bold text-white mt-1 text-center leading-tight">{sc.name}</p>
              <p className="text-xs mt-0.5 font-medium text-center" style={{ color }}>
                {sc.aqi <= 50 ? 'Good' : sc.aqi <= 100 ? 'Moderate' : sc.aqi <= 150 ? 'Sensitive' : sc.aqi <= 200 ? 'Unhealthy' : 'Very Unhealthy'}
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                PM2.5 {sc.pollutants.find(p => p.key === 'pm25')?.value?.toFixed(1) ?? '—'}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}


import { NAIROBI_SUBCOUNTIES } from '@/lib/aqi';

// Nairobi bounding box
const NAIROBI_BOUNDS = { minLat: -1.445, maxLat: -1.155, minLng: 36.650, maxLng: 37.105 };

function isInsideNairobi(lat: number, lng: number): boolean {
  return lat >= NAIROBI_BOUNDS.minLat && lat <= NAIROBI_BOUNDS.maxLat &&
         lng >= NAIROBI_BOUNDS.minLng && lng <= NAIROBI_BOUNDS.maxLng;
}

function nearestSubcounty(lat: number, lng: number): string {
  let best: string = NAIROBI_SUBCOUNTIES[0].id;
  let bestDist = Infinity;
  for (const sc of NAIROBI_SUBCOUNTIES) {
    const d = Math.hypot(sc.lat - lat, sc.lng - lng);
    if (d < bestDist) { bestDist = d; best = sc.id as string; }
  }
  return best;
}

// Reverse geocode via Nominatim OSM (free, no key required)
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&zoom=17&format=json`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': 'AirIQ-Nairobi/1.0' } }
    );
    if (!res.ok) return '';
    const data = await res.json();
    const a = data.address ?? {};
    // Build a concise place string: neighbourhood/suburb/road + city
    const place = a.neighbourhood || a.suburb || a.quarter || a.residential ||
                  a.road || a.village || a.town || '';
    const city  = a.city || a.county || a.state_district || '';
    if (place && city) return `${place}, ${city}`;
    if (place) return place;
    if (city)  return city;
    return data.display_name?.split(',').slice(0, 2).join(',').trim() ?? '';
  } catch { return ''; }
}

// ─── Main AirIQ Page ──────────────────────────────────────────────────────────
type Tab = 'overview' | 'statistics' | 'health-nexus' | 'pollutants';
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview',     label: 'Live Monitor',  icon: '💨' },
  { id: 'statistics',   label: 'Statistics',    icon: '📊' },
  { id: 'health-nexus', label: 'Health Nexus',  icon: '🏥' },
  { id: 'pollutants',   label: 'Pollutants',    icon: '🧪' },
];

export default function AirIQPage() {
  const [tab, setTab]             = useState<Tab>('overview');
  const [data, setData]           = useState<AirIQResponse | null>(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefresh]  = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [selected, setSelected]   = useState<SubcountyData | null>(null);
  const [detailTab, setDetailTab] = useState<'detail' | 'ai'>('detail');
  const [lastRefresh, setLast]    = useState<Date | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'locating' | 'found' | 'error' | 'outside'>('idle');
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [exactPlace, setExactPlace]           = useState<string | null>(null);  // street/area from Nominatim
  const [outsideInfo, setOutsideInfo]         = useState<string | null>(null);  // city name when outside Nairobi
  const [nearestSubcountyName, setNearestSC]  = useState<string | null>(null);  // nearest Nairobi subcounty when outside

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefresh(true);
    setError(null);
    try {
      const res = await fetch('/api/airiq');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: AirIQResponse = await res.json();
      setData(json);
      setLast(new Date());
      return json;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      return null;
    } finally {
      setLoading(false); setRefresh(false);
    }
  }, []);

  // GPS auto-detect — high accuracy (±30m), reverse geocode, outside-Nairobi check
  const detectLocation = useCallback((subcounties: SubcountyData[]) => {
    if (!navigator.geolocation) return;
    setGpsStatus('locating');
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords;

        // Check if inside Nairobi
        if (!isInsideNairobi(lat, lng)) {
          // Still reverse-geocode so we can show them where they actually are
          const place = await reverseGeocode(lat, lng);
          setOutsideInfo(place || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          setGpsStatus('outside');
          // Still select nearest subcounty for reference and name it explicitly
          const id = nearestSubcounty(lat, lng);
          const sc = subcounties.find(s => s.id === id);
          if (sc) { setSelected(sc); setNearestSC(sc.name); }
          return;
        }

        // Inside Nairobi — get exact place name + nearest subcounty
        const [place, subcountyId] = await Promise.all([
          reverseGeocode(lat, lng),
          Promise.resolve(nearestSubcounty(lat, lng)),
        ]);

        const sc = subcounties.find(s => s.id === subcountyId);
        if (sc) {
          setSelected(sc);
          setUserLocation(sc.name);
          setExactPlace(place || null);
          setGpsStatus('found');
        } else {
          setGpsStatus('error');
        }
      },
      () => setGpsStatus('error'),
      {
        enableHighAccuracy: true,  // uses GPS chip → ~10–30m accuracy
        timeout: 12000,
        maximumAge: 0,             // never use cached position
      }
    );
  }, []);

  useEffect(() => {
    fetchData().then(json => {
      if (json) {
        // Try GPS first; fallback to Starehe (CBD)
        detectLocation(json.subcounties);
        const fallback = json.subcounties.find(s => s.id === 'starehe') ?? json.subcounties[0];
        // Use fallback if GPS doesn't respond in 3s
        setTimeout(() => {
          setSelected(prev => prev ?? fallback);
        }, 3000);
      }
    });
    const t = setInterval(() => void fetchData(true), 10 * 60 * 1000);
    return () => clearInterval(t);
  }, []);

  // Sync selected after refresh
  useEffect(() => {
    if (data && selected) {
      const u = data.subcounties.find(s => s.id === selected.id);
      if (u) setSelected(u);
    }
  }, [data]);

  const subcounties = data?.subcounties ?? [];

  return (
    <div className="min-h-screen text-white" style={{ background: '#070712' }}>

      {/* Header */}
      <header className="border-b border-gray-800/80 sticky top-0 z-40 backdrop-blur-md" style={{ background: 'rgba(7,7,18,0.96)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 flex items-center justify-center text-lg sm:text-xl shadow-lg">💨</div>
              <div>
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white">AirIQ</span>
                <span className="text-xs text-gray-500 ml-2 hidden xs:inline">Nairobi Air Quality</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* City AQI */}
              {!loading && data && (
                <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-full border text-sm font-bold ${aqiBgColor(data.cityAqi)}`}>
                  <span className="live-pulse w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: aqiColor(data.cityAqi) }} />
                  <span style={{ color: aqiColor(data.cityAqi) }}>AQI {data.cityAqi}</span>
                  <span className="text-gray-500 font-normal text-xs hidden sm:inline">{data.cityCategory}</span>
                </div>
              )}

              {/* GPS status */}
              {gpsStatus === 'locating' && (
                <span className="text-xs text-blue-400 flex items-center gap-1">
                  <MapPin size={12} className="animate-bounce" /><span className="hidden sm:inline">Locating…</span>
                </span>
              )}
              {gpsStatus === 'found' && userLocation && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 max-w-[160px] sm:max-w-none">
                  <MapPin size={12} className="shrink-0" />
                  <span className="truncate">
                    {exactPlace ? `${exactPlace}` : userLocation}
                    {exactPlace && <span className="text-gray-500"> · {userLocation}</span>}
                  </span>
                </span>
              )}
              {gpsStatus === 'outside' && (
                <span className="text-xs text-amber-400 flex items-center gap-1 max-w-[180px]">
                  <MapPin size={12} className="shrink-0" />
                  <span className="truncate">Outside Nairobi</span>
                </span>
              )}

              {/* Best/Worst */}
              {data && (
                <div className="text-xs text-gray-500 hidden md:flex items-center gap-1">
                  <span className="text-emerald-400">↑ {data.bestSubcounty}</span>
                  <span className="text-gray-700">·</span>
                  <span className="text-red-400">↓ {data.worstSubcounty}</span>
                </div>
              )}

              <button onClick={() => void fetchData(true)} disabled={refreshing || loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-xs text-gray-300 transition-colors">
                <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {!loading && lastRefresh && (
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-800/60 text-xs text-gray-600 overflow-x-auto flex-nowrap">
              <span className="shrink-0 flex items-center gap-1"><Wind size={10} /> 17 Nairobi Subcounties</span>
              <span className="shrink-0">📡 WAQI Live + Spatial Model</span>
              <span className="shrink-0">🔬 EPA AQI Standard</span>
              <span className="ml-auto shrink-0">Updated {lastRefresh.toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-gray-800/60 sticky top-[65px] sm:top-[73px] z-30 backdrop-blur-md" style={{ background: 'rgba(7,7,18,0.96)' }}>
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto no-scrollbar">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap shrink-0 ${
                tab === t.id ? 'border-teal-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Outside-Nairobi notice — sits directly under the tab bar ── */}
      {gpsStatus === 'outside' && outsideInfo && (
        <div className="border-b border-amber-800/40 bg-amber-950/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-amber-400 text-base">📍</span>
              <span className="text-xs font-bold text-amber-400">Outside Nairobi</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs flex-1 min-w-0">
              <span className="text-gray-300">
                Your location: <span className="text-white font-semibold">{outsideInfo}</span>
              </span>
              <span className="text-gray-600 hidden sm:inline">·</span>
              <span className="text-gray-400">
                Nearest Nairobi subcounty: <span className="text-amber-300 font-bold">{nearestSubcountyName ?? selected?.name ?? '—'}</span>
              </span>
            </div>
            <span className="text-xs text-gray-600 shrink-0 hidden md:block">Data shown is for reference only</span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-950/40 border border-red-700/60 text-red-300 text-sm flex items-center gap-2">
            <AlertTriangle size={16} />{error}
          </div>
        )}

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div>
            {/* 5 Hero Gauges Banner */}
            {!loading && subcounties.length > 0 && (
              <HeroGaugesBanner
                subcounties={subcounties}
                userSubcountyId={userLocation ? subcounties.find(s => s.name === userLocation)?.id ?? null : null}
                onSelect={sc => { setSelected(sc); setDetailTab('detail'); }}
                isOutside={gpsStatus === 'outside'}
              />
            )}
            {loading && <Sk className="h-52 rounded-2xl mb-5" />}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

            {/* Subcounty list */}
            <div className="lg:col-span-1 space-y-2 lg:max-h-[82vh] lg:overflow-y-auto pr-1">
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subcounties</p>
                {gpsStatus === 'found' && (
                  <span className="text-xs text-teal-400 flex items-center gap-1"><MapPin size={10} />Your area</span>
                )}
              </div>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <Sk key={i} className="h-20 rounded-2xl" />)
                : [...subcounties]
                    .sort((a, b) => b.aqi - a.aqi)
                    .map(sc => (
                      <SubcountyCard key={sc.id} sc={sc} selected={selected?.id === sc.id} onClick={() => setSelected(sc)} />
                    ))
              }
            </div>

            {/* Right panel */}
            <div className="lg:col-span-2 space-y-4">
              {loading && (
                <div className="space-y-4">
                  <Sk className="h-12 w-56" />
                  <Sk className="h-64 rounded-2xl w-full" />
                  <Sk className="h-40 rounded-2xl w-full" />
                </div>
              )}

              {!loading && selected && (
                <>
                  {/* Detail / AI toggle */}
                  <div className="flex gap-2">
                    {(['detail', 'ai'] as const).map(dt => (
                      <button key={dt} onClick={() => setDetailTab(dt)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                          detailTab === dt ? 'bg-teal-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}>
                        {dt === 'detail' ? '📊 Details & Exposure' : '🤖 AI Health Advisor'}
                      </button>
                    ))}
                  </div>
                  {detailTab === 'detail' ? <DetailPanel sc={selected} /> : <AIAdvisor sc={selected} />}
                </>
              )}
            </div>
          </div>
          </div>
        )}

        {tab === 'statistics'   && !loading && <StatisticsTab subcounties={subcounties} />}
        {tab === 'health-nexus' && !loading && <HealthNexusTab subcounties={subcounties} />}
        {tab === 'pollutants'   && <PollutantEncyclopedia />}

        {loading && tab !== 'overview' && (
          <div className="space-y-4 mt-4">
            {Array.from({ length: 4 }).map((_, i) => <Sk key={i} className="h-32 rounded-2xl" />)}
          </div>
        )}
      </main>

      <footer className="border-t border-gray-800/40 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <span>💨 AirIQ Nairobi — Spatial Interpolation · WAQI Live Data · EPA AQI Standard</span>
          <span>Auto-refresh 10 min · 17 subcounties · Healthcare: Nairobi Health Study 2024</span>
        </div>
      </footer>
    </div>
  );
}
