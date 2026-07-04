"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface MonthlyPoint {
  label: string;
  gross: number;
  net: number;
}

interface EventPoint {
  title: string;
  gross: number;
}

const AXIS = "var(--app-text-muted)";
const GRID = "var(--app-border)";
const LINE = "var(--color-primary-700)";
const BAR = "var(--color-secondary-700)";

const won = (value: number) => `${value.toLocaleString()}원`;

function compact(value: number): string {
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1)}억`;
  if (value >= 10_000) return `${Math.round(value / 10_000).toLocaleString()}만`;
  return value.toLocaleString();
}

const tooltipStyle = {
  borderRadius: 12,
  border: `1px solid ${GRID}`,
  backgroundColor: "var(--app-surface)",
  color: "var(--app-text)",
  fontSize: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
} as const;

export default function SettlementCharts({
  monthly,
  byEvent,
}: {
  monthly: MonthlyPoint[];
  byEvent: EventPoint[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-5 font-semibold text-gray-900">월별 정산 추이</h2>
        {monthly.length === 0 ? (
          <ChartEmpty />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={monthly}
              margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={GRID}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: AXIS }}
                tickLine={false}
                axisLine={{ stroke: GRID }}
              />
              <YAxis
                tickFormatter={compact}
                tick={{ fontSize: 12, fill: AXIS }}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <Tooltip
                formatter={(value) => [won(Number(value)), "정산액"]}
                contentStyle={tooltipStyle}
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke={LINE}
                strokeWidth={2.5}
                dot={{ r: 3, fill: LINE }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-5 font-semibold text-gray-900">이벤트별 매출</h2>
        {byEvent.length === 0 ? (
          <ChartEmpty />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={byEvent}
              margin={{ top: 8, right: 12, left: 4, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={GRID}
                vertical={false}
              />
              <XAxis
                dataKey="title"
                tick={{ fontSize: 11, fill: AXIS }}
                tickLine={false}
                axisLine={{ stroke: GRID }}
                interval={0}
                tickFormatter={(title: string) =>
                  title.length > 6 ? `${title.slice(0, 6)}…` : title
                }
              />
              <YAxis
                tickFormatter={compact}
                tick={{ fontSize: 12, fill: AXIS }}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <Tooltip
                formatter={(value) => [won(Number(value)), "매출"]}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
                contentStyle={tooltipStyle}
              />
              <Bar
                dataKey="gross"
                fill={BAR}
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>
    </div>
  );
}

function ChartEmpty() {
  return (
    <div className="flex h-65 items-center justify-center text-sm text-gray-400">
      표시할 데이터가 없습니다
    </div>
  );
}
