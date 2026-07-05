'use client';
/**
 * Regulatory Standards Comparison
 * US EPA NAAQS · EU AQD 2024 · WHO 2021 · Kenya NEMA 2014 · UNEP Africa
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { POLLUTANT_INFO, getPollutantStandards, type RegulatoryStandard } from '@/lib/aqi';
import { TOOLTIP_STYLE, AXIS_TICK, type PollutantKey } from './header';

// ─── Defined OUTSIDE component to prevent remount on every render ─────────────
type ChartRow = { name: string; limit: number; color: string; note: string; body: string };

function StandardTooltip({ active, payload, unit }: {
  active?: boolean;
  payload?: { payload: ChartRow }[];
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ ...TOOLTIP_STYLE, padding: '10px 14px', maxWidth: 240 }}>
      <p className="font-bold text-white mb-1">{d.body}</p>
      <p className="text-emerald-400 font-mono">{d.limit} {unit}</p>
      <p className="text-gray-400 text-xs mt-1 leading-relaxed">{d.note}</p>
    </div>
  );
}

function ChartBlock({ data, label, unit }: { data: ChartRow[]; label: string; unit: string }) {
  if (!data.length) return null;
  return (
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase mb-2">{label} ({unit})</p>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={38} />
          <Tooltip content={<StandardTooltip unit={unit} />} />
          <Bar dataKey="limit" radius={[4, 4, 0, 0]}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function StandardsComparison({ pollutantKey }: { pollutantKey: PollutantKey }) {
  const info = POLLUTANT_INFO[pollutantKey];
  const standards: RegulatoryStandard[] = getPollutantStandards(pollutantKey);

  if (!standards.length) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6 text-center text-gray-500 text-sm">
        Regulatory standard data not available for this pollutant.
      </div>
    );
  }

  const toRow = (s: RegulatoryStandard) => ({
    name: s.shortName, color: s.color, note: s.note, body: s.body, limit: 0,
  });

  const annualData: ChartRow[] = standards
    .filter(s => s.annual !== undefined)
    .map(s => ({ ...toRow(s), limit: s.annual! }));

  const dailyData: ChartRow[] = standards
    .filter(s => s.daily !== undefined)
    .map(s => ({ ...toRow(s), limit: s.daily! }));

  const hourlyData: ChartRow[] = standards
    .filter(s => s.hourly !== undefined)
    .map(s => ({ ...toRow(s), limit: s.hourly! }));

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4 sm:p-5 space-y-6">
      {/* Title */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">
          📋 Regulatory Standards Comparison
        </p>
        <p className="text-xs text-gray-500">
          All limits in {info.unit}. Lower is stricter. WHO 2021 is the most protective standard globally.
        </p>
      </div>

      <ChartBlock data={annualData} label="Annual Mean Limit" unit={info.unit} />
      <ChartBlock data={dailyData}  label="24-Hour Mean Limit" unit={info.unit} />
      <ChartBlock data={hourlyData} label="1-Hour Limit"       unit={info.unit} />

      {/* Scrollable comparison table */}
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
                <td className="px-3 py-2.5 font-bold" style={{ color: s.color }}>{s.shortName}</td>
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

      {/* Colour legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {standards.map(s => (
          <span key={s.shortName} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
            <span className="text-gray-400 font-medium">{s.shortName}</span>
            <span className="text-gray-600">—</span>
            <span className="text-gray-500">{s.body}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
