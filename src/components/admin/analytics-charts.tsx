'use client';

import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';
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

const COLORS = ['#10b981', '#6366f1', '#a855f7', '#f59e0b'];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
  isDark?: boolean;
}

// Custom Glassmorphic Tooltip Component
const CustomTooltip = ({
  active,
  payload,
  label,
  isDark,
}: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={`space-y-1 rounded-2xl border p-4 text-xs shadow-xl backdrop-blur-xl transition-all ${
          isDark
            ? 'text-neutral-250 border-neutral-800 bg-neutral-950/90'
            : 'border-neutral-200 bg-white/95 text-neutral-800'
        }`}
      >
        <p className="font-mono font-bold">{label}</p>
        {payload.map((item, idx) => (
          <p
            key={idx}
            style={{ color: item.color }}
            className="font-mono font-semibold"
          >
            {item.name}:{' '}
            <span
              className={`font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}
            >
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
  userSignups,
  categoryDistribution,
}: AnalyticsChartsProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Avoid SSR hydration flash for dynamic themes
  const isDark = mounted ? resolvedTheme === 'dark' : true;
  const gridStroke = isDark ? '#1f1f1f' : '#e5e5e5';
  const tickStroke = isDark ? '#737373' : '#a3a3a3';

  return (
    <div className="grid grid-cols-1 gap-8 font-sans lg:grid-cols-2">
      {/* Daily AI Token Volume (Bar Chart) */}
      <div className="dark:border-neutral-850 space-y-4 rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:bg-neutral-900/10">
        <div>
          <h3 className="font-mono text-base font-bold text-neutral-900 uppercase dark:text-white">
            Daily AI Usage Volume
          </h3>
          <p className="text-neutral-550 mt-1 text-xs font-medium dark:text-neutral-400">
            Aggregated tokens consumed by all agents over the last 14 days
          </p>
        </div>
        <div className="h-80 w-full">
          {dailyUsage.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-neutral-500 italic">
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
                  stroke={gridStroke}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke={tickStroke}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={tickStroke}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                <Bar
                  name="Tokens Consumed"
                  dataKey="tokens"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* User Signup Trends (Line Chart) */}
      <div className="dark:border-neutral-850 space-y-4 rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:bg-neutral-900/10">
        <div>
          <h3 className="font-mono text-base font-bold text-neutral-900 uppercase dark:text-white">
            User Registration Rate
          </h3>
          <p className="text-neutral-550 mt-1 text-xs font-medium dark:text-neutral-400">
            Daily user accounts generated over the last 14 days
          </p>
        </div>
        <div className="h-80 w-full">
          {userSignups.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-neutral-500 italic">
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
                  stroke={gridStroke}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke={tickStroke}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={tickStroke}
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                <Line
                  name="New Users"
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    strokeWidth: 1,
                    fill: isDark ? '#000000' : '#ffffff',
                  }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Content Category Distribution (Pie Chart) */}
      <div className="dark:border-neutral-850 space-y-4 rounded-[2rem] border border-neutral-200 bg-white/70 p-6 shadow-sm backdrop-blur-xl lg:col-span-2 dark:bg-neutral-900/10">
        <div>
          <h3 className="font-mono text-base font-bold text-neutral-900 uppercase dark:text-white">
            Category Distribution
          </h3>
          <p className="text-neutral-550 mt-1 text-xs font-medium dark:text-neutral-400">
            Active content volume divided across core category tags
          </p>
        </div>
        <div className="flex h-80 w-full flex-col items-center justify-around gap-6 md:flex-row">
          {categoryDistribution.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-neutral-500 italic">
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
                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend */}
              <div className="grid w-full max-w-sm shrink-0 grid-cols-2 gap-4">
                {categoryDistribution.map((entry, index) => (
                  <div
                    key={entry.name}
                    className="dark:border-neutral-850 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50/50 p-3 shadow-sm dark:bg-neutral-950/40"
                  >
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <p className="dark:text-neutral-450 font-mono text-[10px] font-bold tracking-wider text-neutral-500 uppercase">
                        {entry.name}
                      </p>
                      <p className="mt-0.5 text-lg font-extrabold text-neutral-900 dark:text-neutral-200">
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
