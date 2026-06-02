'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DailyUsageData {
  date: string;
  tokens: number;
  calls: number;
}

interface UserSignupData {
  date: string;
  count: number;
}

interface CategoryDistributionData {
  name: string;
  value: number;
}

interface AnalyticsChartsProps {
  dailyUsage: DailyUsageData[];
  userSignups: UserSignupData[];
  categoryDistribution: CategoryDistributionData[];
}

const COLORS = ['#2dd4bf', '#a78bfa', '#f43f5e', '#34d399'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
}

// Custom Glassmorphic Tooltip Component
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950/90 p-4 text-xs shadow-2xl backdrop-blur-xl">
        <p className="font-bold text-slate-200">{label}</p>
        {payload.map((item, idx) => (
          <p key={idx} style={{ color: item.color }} className="font-mono">
            {item.name}:{' '}
            <span className="font-bold text-slate-100">
              {item.value.toLocaleString()}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AnalyticsCharts({
  dailyUsage,
  dailyUsage: _ignoredUsage,
  userSignups,
  categoryDistribution,
}: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 gap-8 font-sans lg:grid-cols-2">
      {/* Daily AI Token Volume (Bar Chart) */}
      <div className="space-y-4 rounded-3xl border border-slate-900 bg-slate-900/10 p-6 backdrop-blur-xl">
        <div>
          <h3 className="text-base font-bold text-white">
            Daily AI Usage Volume
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Aggregated tokens consumed by all agents over the last 14 days
          </p>
        </div>
        <div className="h-80 w-full">
          {dailyUsage.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-600 italic">
              No daily AI usage logs recorded in database.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyUsage}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#0f172a"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  name="Tokens Consumed"
                  dataKey="tokens"
                  fill="#2dd4bf"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* User Signup Trends (Line Chart) */}
      <div className="space-y-4 rounded-3xl border border-slate-900 bg-slate-900/10 p-6 backdrop-blur-xl">
        <div>
          <h3 className="text-base font-bold text-white">
            User Registration Rate
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Daily user accounts generated over the last 14 days
          </p>
        </div>
        <div className="h-80 w-full">
          {userSignups.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-600 italic">
              No daily user signups recorded in database.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={userSignups}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#0f172a"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  name="New Users"
                  type="monotone"
                  dataKey="count"
                  stroke="#a78bfa"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 1, fill: '#090d16' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Content Category Distribution (Pie Chart) */}
      <div className="space-y-4 rounded-3xl border border-slate-900 bg-slate-900/10 p-6 backdrop-blur-xl lg:col-span-2">
        <div>
          <h3 className="text-base font-bold text-white">
            Category Distribution
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Active content volume divided across core category tags
          </p>
        </div>
        <div className="flex h-80 w-full flex-col items-center justify-around gap-6 md:flex-row">
          {categoryDistribution.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-slate-600 italic">
              No category metrics currently available in database.
            </div>
          ) : (
            <>
              <div className="h-full max-w-[280px] flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend to match glassmorphic aesthetics */}
              <div className="grid w-full max-w-sm shrink-0 grid-cols-2 gap-4">
                {categoryDistribution.map((entry, index) => (
                  <div
                    key={entry.name}
                    className="flex items-center gap-3 rounded-2xl border border-slate-900 bg-slate-950/40 p-3"
                  >
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <p className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                        {entry.name}
                      </p>
                      <p className="mt-0.5 text-lg font-extrabold text-slate-200">
                        {entry.value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
