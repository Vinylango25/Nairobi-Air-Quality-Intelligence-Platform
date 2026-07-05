'use client';
/**
 * Regulatory Standards Comparison
 * US EPA NAAQS · EU AQD 2024 · WHO 2021 · Kenya NEMA 2014 · UNEP Africa
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine, Legend,
} from 'recharts';
import { POLLUTANT_INFO, REGULATORY_STANDARDS } from '@/lib/aqi';
import { TOOLTIP_STYLE, AXIS_TICK, type PollutantKey } from './header';

// ─── Standards comparison chart ───────────────────────────────────────────────
export function StandardsComparison({ pollutantKey }: { pollutantKey: PollutantKey }) {
  const info = POLLUTANT_INFO[pollutantKey];
  // Access standards directly — all POLLUTANT_INFO entries include this field
  const standards = (info as { standards?: typeof REGULATORY_STANDARDS[string] }).standards;
  if (!standards?.length) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 text-center text-gray-500 text-sm">
        Regulatory standard data not available for this pollutant.
      </div>
    );
  }

  // Build chart datasets: annual limits and daily limits side by side
  const annualData = standards
    .filter(s => s.annual !== undefined)
    .map(s => ({ name: s.shortName, limit: s.annual!, color: s.color, note: s.note, body: s.body }));

  const dailyData = standards
    .filter(s => s.daily !== undefined)
    .map(s => ({ name: s.shortName, limit: s.daily!, color: s.color, note: s.note, body: s.body }));

  const hourlyData = standards
    .filter(s => s.hourly !== undefined)
    .map(s => ({ name: s.shortName, limit: s.hourly!, color: s.color, note: s.note, body: s.body }));

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { body: string; limit: number; note: string } }[] }) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div style={{ ...TOOLTIP_STYLE, padding: '10px 14px', maxWidth: 240 }}>
        <p className="font-bold text-white mb-1">{d.body}</p>
        <p className="text-emerald-400 font-mono">{d.limit} {info.unit}</p>
        <p className="text-gray-400 text-xs mt-1 leading-relaxed">{d.note}</p>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 sm:p-5 space-y-5">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">
          📋 Regulatory Standards Comparison
        </p>
        <p className="text-xs text-gray-500">
          All limits in {info.unit}. Lower is stricter. WHO 2021 is the most protective standard globally.
        </p>
      </div>

      {/* Annual limits */}
      {annualData.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">Annual Mean Limit ({info.unit})</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={annualData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={35} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="limit" radius={[4, 4, 0, 0]} name="Annual limit">
                {annualData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Daily limits */}
      {dailyData.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">24-Hour Mean Limit ({info.unit})</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={dailyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={35} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="limit" radius={[4, 4, 0, 0]} name="24h limit">
                {dailyData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Hourly limits */}
      {hourlyData.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase mb-2">1-Hour Limit ({info.unit})</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={hourlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
              <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={35} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="limit" radius={[4, 4, 0, 0]} name="1h limit">
                {hourlyData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Detailed table — scrollable on mobile */}
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full text-xs min-w-[480px]">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider">
              {['Standard', 'Body', 'Annual', '24h', '1h', 'Note'].map(h => (
                <th key={h} className="py-2.5 px-3 text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standards.map((s, i) => (
              <tr key={i} className="border-b border-gray-800/40 hover:bg-gray-800/20">
                <td className="px-3 py-2.5">
                  <span className="font-bold" style={{ color: s.color }}>{s.shortName}</span>
                </td>
                <td className="px-3 py-2.5 text-gray-300">{s.body}</td>
                <td className="px-3 py-2.5 font-mono text-gray-200">{s.annual ?? '—'}</td>
                <td className="px-3 py-2.5 font-mono text-gray-200">{s.daily ?? '—'}</td>
                <td className="px-3 py-2.5 font-mono text-gray-200">{s.hourly ?? '—'}</td>
                <td className="px-3 py-2.5 text-gray-500 max-w-[180px] truncate">{s.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs">
        {standards.map(s => (
          <span key={s.shortName} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
            <span className="text-gray-400">{s.shortName}</span>
            <span className="text-gray-600">—</span>
            <span className="text-gray-500 truncate max-w-[120px]">{s.body}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
