import React, { useMemo } from "react";
import moment from "moment";

import useQueryCache from "../../hooks/useQueryCache";

import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import Table from "@mui/joy/Table";
import Chip from "@mui/joy/Chip";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

interface RawDataPoint {
  time: number;
  [version: string]: number;
}

interface MetricsSeries {
  versions: RawDataPoint[];
  versionKeys: string[];
}

interface VersionStat {
  version: string;
  firstSeen: number | null;
  currentCount: number;
  sharePct: number;
}

function compareVersions(a: string, b: string): number {
  const toParts = (v: string): (string | number)[] =>
    String(v)
      .split(/[.-]/)
      .map((p) => (isNaN(Number(p)) ? p : Number(p)));

  const partsA = toParts(a);
  const partsB = toParts(b);
  const len = Math.max(partsA.length, partsB.length);

  for (let i = 0; i < len; i++) {
    const x = partsA[i] ?? 0;
    const y = partsB[i] ?? 0;
    if (x === y) continue;
    if (typeof x === "number" && typeof y === "number") return x - y;
    return String(x).localeCompare(String(y));
  }
  return 0;
}

// Continuous cool -> warm flow (blue -> violet -> magenta), driven by
// chronological rank (oldest -> newest), NOT by stacking position.
// Green is reserved exclusively for "latest".
function versionColor(chronologicalRank: number, total: number, isLatest: boolean): string {
  if (isLatest) return "#16a34a";
  if (total <= 1) return "#94a3b8";

  const hueStart = 200;
  const hueEnd = 320;
  const t = chronologicalRank / (total - 1);

  const hue = hueStart + (hueEnd - hueStart) * t;
  const saturation = 35 + Math.round(t * 35);
  const lightness = 78 - Math.round(t * 33);

  return `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
}

// Rotated (vertical) label so closely-spaced rollout markers stack along the
// y-axis instead of colliding horizontally. Uses Joy UI's own text-color CSS
// variable so it automatically flips between light/dark mode.
interface RotatedMarkerLabelProps {
  viewBox?: { x: number; y: number; width?: number; height?: number };
  value: string;
}

const RotatedMarkerLabel: React.FC<RotatedMarkerLabelProps> = ({ viewBox, value }) => {
  if (!viewBox) return null;
  const { x, y } = viewBox;
  return (
    <text
      x={x}
      y={y}
      dx={4}
      dy={-4}
      transform={`rotate(-90, ${x + 4}, ${y - 4})`}
      textAnchor="start"
      fontSize={10}
      style={{ fill: "var(--joy-palette-text-primary, #334155)" }}
    >
      {value}
    </text>
  );
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ dataKey: string; value: number; color: string }>;
  label?: string | number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const total = payload.reduce((sum, p) => sum + (p.value || 0), 0);

  return (
    <Sheet
      variant="outlined"
      sx={{ p: 1.5, borderRadius: "md", boxShadow: "md", minWidth: 220, bgcolor: "background.surface" }}
    >
      <Typography level={"body-sm" as any} fontWeight="lg" sx={{ mb: 0.5 }}>
        {moment(Number(label)).format("DD MMM YYYY")}
      </Typography>
      {payload
        .slice()
        .sort((a, b) => b.value - a.value)
        .filter((p) => p.value > 0)
        .map((p) => (
          <Box key={p.dataKey} sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.25 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: p.color }} />
              <Typography level={"body-xs" as any}>{p.dataKey}</Typography>
            </Box>
            <Typography level={"body-xs" as any} fontWeight="md">
              {total ? `${((p.value / total) * 100).toFixed(1)}%` : p.value}
              <Typography level={"body-xs" as any} sx={{ color: "text.tertiary", ml: 0.5 }}>
                ({p.value})
              </Typography>
            </Typography>
          </Box>
        ))}
    </Sheet>
  );
};

export default function VersionChart() {
  const {
    isLoading,
    isSuccess,
    isError,
    error,
    data: metricsData,
  } = useQueryCache("metrics.series", "metrics.series") as {
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
    data: MetricsSeries | undefined;
  };

  const dataset = useMemo<RawDataPoint[]>(() => {
    if (!metricsData) return [];
    return [...metricsData.versions].sort((a, b) => a.time - b.time);
  }, [metricsData]);

  const rawVersionKeys = useMemo<string[]>(() => {
    if (!metricsData) return [];
    return metricsData.versionKeys;
  }, [metricsData]);

  const { normalizedDataset, versionKeys, chronoRank } = useMemo(() => {
    if (!dataset.length || !rawVersionKeys.length) {
      return {
        normalizedDataset: [] as RawDataPoint[],
        versionKeys: [] as string[],
        chronoRank: new Map<string, number>(),
      };
    }

    // Only keep keys that are pure semver ("1.2.3"). Anything with a
    // build hash, pre-release tag, or other custom suffix is dropped
    // completely - it is never summed into another series.

    const validKeys = rawVersionKeys.filter((raw: string): boolean => {
      return /^\d+\.\d+\.\d+$/.test(String(raw).trim());
    });

    const rows: RawDataPoint[] = dataset.map((row) => {
      const out: RawDataPoint = { time: row.time };
      validKeys.forEach((k) => {
        out[k] = row[k] || 0;
      });
      return out;
    });

    const chronological = [...validKeys].sort(compareVersions);
    const rankMap = new Map<string, number>(chronological.map((v, i) => [v, i]));

    const stackOrder = [...validKeys].sort((a, b) => compareVersions(b, a));

    return { normalizedDataset: rows, versionKeys: stackOrder, chronoRank: rankMap };
  }, [dataset, rawVersionKeys]);

  const versionStats = useMemo<VersionStat[]>(() => {
    if (!normalizedDataset.length || !versionKeys.length) return [];

    const latestRow = normalizedDataset[normalizedDataset.length - 1];
    const latestTotal = versionKeys.reduce((sum, v) => sum + (latestRow[v] || 0), 0);

    return versionKeys
      .map((version) => {
        const firstSeenRow = normalizedDataset.find((row) => (row[version] || 0) > 0);
        const currentCount = latestRow[version] || 0;

        return {
          version,
          firstSeen: firstSeenRow ? firstSeenRow.time : null,
          currentCount,
          sharePct: latestTotal ? (currentCount / latestTotal) * 100 : 0,
        };
      })
      .sort((a, b) => b.currentCount - a.currentCount);
  }, [normalizedDataset, versionKeys]);

  const latestVersionName = versionKeys.length
    ? ([...versionKeys].sort(compareVersions).pop() ?? null)
    : null;

  const latestOverallDate = normalizedDataset.length
    ? normalizedDataset[normalizedDataset.length - 1].time
    : null;

  const newVersionEvents = useMemo<VersionStat[]>(() => {
    if (!normalizedDataset.length || !versionStats.length) return [];

    const earliestDate = normalizedDataset[0].time;

    return versionStats
      .filter((v): v is VersionStat & { firstSeen: number } => !!v.firstSeen && v.firstSeen > earliestDate)
      .sort((a, b) => (a.firstSeen as number) - (b.firstSeen as number));
  }, [normalizedDataset, versionStats]);

  if (isLoading) return <>Loading...</>;
  if (isError || !isSuccess) return <>An error has occurred: {error?.message}</>;

  return (
    <Box>
      <ResponsiveContainer width="100%" height={480}>
        <AreaChart
          data={normalizedDataset}
          stackOffset="expand"
          margin={{ top: 80, right: 20, left: 0, bottom: 0 }}
        >
          <defs>
            {versionKeys.map((version) => {
              const color = versionColor(
                chronoRank.get(version) ?? 0,
                versionKeys.length,
                version === latestVersionName,
              );
              return (
                <linearGradient key={version} id={`fill-${version}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.35} />
                </linearGradient>
              );
            })}
          </defs>

          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />

          <XAxis
            dataKey="time"
            domain={["dataMin", "dataMax"]}
            name="Time"
            tickFormatter={(unixTime: number) => moment(unixTime).format("DD MMM YYYY")}
            type="number"
            padding={{ left: 20, right: 20 }}
            tick={{ fontSize: 11 }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
          />

          <YAxis
            tickFormatter={(v: number) => `${Math.round(v * 100)}%`}
            domain={[0, 1]}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={45}
          />

          <Tooltip
            cursor={{ stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "4 4" }}
            content={<CustomTooltip />}
          />

          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} iconType="circle" iconSize={8} />

          {versionKeys.map((version) => {
            const isLatest = version === latestVersionName;
            const color = versionColor(chronoRank.get(version) ?? 0, versionKeys.length, isLatest);
            return (
              <Area
                key={version}
                type="monotone"
                dataKey={version}
                stackId="1"
                stroke={color}
                strokeWidth={isLatest ? 2 : 1}
                fill={`url(#fill-${version})`}
                isAnimationActive={false}
              />
            );
          })}

          {newVersionEvents.map((event) => (
            <ReferenceLine
              key={event.version}
              x={event.firstSeen as number}
              stroke="#94a3b8"
              strokeDasharray="3 3"
              strokeWidth={1}
              ifOverflow="extendDomain"
              label={<RotatedMarkerLabel value={event.version} />}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      <Box sx={{ mt: 3 }}>
        <Typography level={"title-sm" as any} sx={{ mb: 1 }}>
          Version Breakdown
        </Typography>

        <Table size="sm" hoverRow borderAxis="bothBetween">
          <thead>
            <tr>
              <th>Version</th>
              <th>Current Count</th>
              <th>Current Percentage</th>
              <th>First Seen</th>
            </tr>
          </thead>
          <tbody>
            {versionStats.map((row) => (
              <tr key={row.version}>
                <td>
                  {row.version}
                  {row.version === latestVersionName && (
                    <Chip size="sm" color="success" variant="soft" sx={{ ml: 1 }}>
                      latest
                    </Chip>
                  )}
                </td>
                <td>{row.currentCount}</td>
                <td>{row.sharePct.toFixed(1)}%</td>
                <td>{row.firstSeen ? moment(Number(row.firstSeen)).format("DD MMM YYYY") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Box>
    </Box>
  );
}
