"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useIsDark } from "@/lib/useIsDark";
import { getPalette } from "@/lib/palette";

export interface TrendSeries {
  key: string;
  label: string;
  colorSlot: "series1" | "series2" | "series3" | "series4";
}

export function TrendChart({
  title,
  data,
  xKey,
  series,
  valueFormatter,
}: {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>[];
  xKey: string;
  series: TrendSeries[];
  valueFormatter?: (v: number) => string;
}) {
  const isDark = useIsDark();
  const palette = getPalette(isDark);

  return (
    <div>
      <div className="mb-2 flex items-center gap-4">
        <h3 className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {title}
        </h3>
        {series.length > 1 ? (
          <div className="flex items-center gap-3">
            {series.map((s) => (
              <span key={s.key} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full"
                  style={{ background: palette[s.colorSlot] }}
                />
                {s.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 11, fill: palette.textMuted }}
            axisLine={{ stroke: palette.baseline }}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 11, fill: palette.textMuted }}
            axisLine={false}
            tickLine={false}
            width={36}
          />
          <Tooltip
            contentStyle={{
              background: palette.surface,
              border: `1px solid ${palette.grid}`,
              borderRadius: 8,
              fontSize: 12,
              color: palette.textPrimary,
            }}
            formatter={(value: number, name: string) => [
              valueFormatter ? valueFormatter(value) : value,
              series.find((s) => s.key === name)?.label ?? name,
            ]}
          />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.key}
              stroke={palette[s.colorSlot]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
