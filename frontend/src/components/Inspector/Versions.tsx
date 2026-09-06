import React, { useCallback } from "react";
import { useColorScheme } from "@mui/joy/styles";

import useCachedMultipart from "../../hooks/useCachedMultipart";

import Box from "@mui/joy/Box";
import IconButton from "@mui/joy/IconButton";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemContent from "@mui/joy/ListItemContent";
import Sheet from "@mui/joy/Sheet";
import Typography from "@mui/joy/Typography";

import CloseIcon from "@mui/icons-material/Close";

import { ExtInstanceLink } from "../Shared/Link";

import { Treemap, ResponsiveContainer, Tooltip } from "recharts";

/** instance object structure */
interface IInstance {
  url?: string;
  name?: string;
  version: string;
}

/** color scheme for version categories */
const CATEGORY_COLORS = {
  stable: "#22c55e",
  unstable: "#7c3aed",
} as const;

/** color gradients for version age visualization */
const VERSION_SCALE_COLORS = {
  stableNewest: "#22c55e",
  stableOldest: "#3b1f5f",
  unstableNewest: "#7c3aed",
  unstableOldest: "#dc2626",
} as const;

/** treemap tile representing a specific version */
interface IVersionTile {
  name: string;
  size: number;
  category: "stable" | "unstable";
  color: string;
}

/**
 * compare two version strings for sorting
 * handles both numeric and string parts (e.g., "1.2.0-rc1")
 * returns descending order (newest first)
 */
function compareVersions(a: string, b: string): number {
  const partsA = a.split(/[.-]/).map((part) => (Number.isNaN(Number(part)) ? part : Number(part)));
  const partsB = b.split(/[.-]/).map((part) => (Number.isNaN(Number(part)) ? part : Number(part)));

  for (let index = 0; index < Math.max(partsA.length, partsB.length); index += 1) {
    const partA = partsA[index] ?? 0;
    const partB = partsB[index] ?? 0;
    if (partA === partB) continue;
    if (typeof partA === "number" && typeof partB === "number") return partB - partA;
    return String(partA).localeCompare(String(partB));
  }

  return 0;
}

/**
 * interpolate between two hex colors at specified position (0-1)
 * @param start hex color for position 0
 * @param end hex color for position 1
 * @param position interpolation value 0-1
 */
function interpolateColor(start: string, end: string, position: number): string {
  const parseHex = (color: string) =>
    [0, 2, 4].map((offset) => parseInt(color.slice(offset + 1, offset + 3), 16));
  const startRgb = parseHex(start);
  const endRgb = parseHex(end);
  const channels = startRgb.map((channel, index) =>
    Math.round(channel + (endRgb[index] - channel) * position),
  );
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * determine if text should be dark or light based on background color luminance
 * uses relative luminance formula for accessibility
 */
function contrastText(color: string): string {
  const [red, green, blue] = [0, 2, 4].map((offset) => parseInt(color.slice(offset + 1, offset + 3), 16));
  return red * 0.299 + green * 0.587 + blue * 0.114 > 155 ? "#172033" : "#ffffff";
}

/** props for treemap tooltip */
interface ICustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: { name: string; value: number } }>;
  label?: string;
}

const CustomTooltip: React.FC<ICustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Sheet
        variant="outlined"
        sx={{ p: 1.5, borderRadius: "md", boxShadow: "md", minWidth: 180, bgcolor: "background.surface" }}
      >
        <Typography level={"body-sm" as any} fontWeight="lg">
          {payload[0].payload.name}
        </Typography>
        <Typography level={"body-xs" as any} sx={{ color: "text.tertiary", mt: 0.5 }}>
          {payload[0].payload.value} instances
        </Typography>
      </Sheet>
    );
  }

  return null;
};

/** props for treemap tile renderer */
interface ICustomizedContentProps {
  [key: string]: any; // recharts passes injected props
  isDarkMode: boolean;
  onVersionClick: (version: string) => void;
}

/**
 * custom treemap tile renderer
 * renders colored rectangles with optional text labels for versions
 * clickable only at depth 2 (individual version tiles)
 */
const CustomizedContent: React.FC<ICustomizedContentProps> = ({
  root,
  depth,
  x,
  y,
  width,
  height,
  index,
  name,
  isDarkMode,
  onVersionClick,
}: ICustomizedContentProps) => {
  const tile = depth === 2 ? root?.children?.[index] : root;
  const category = tile?.category === "stable" || tile?.name === "stable" ? "stable" : "unstable";
  const color = tile?.color || CATEGORY_COLORS[category];
  const textColor = isDarkMode ? "#ffffff" : contrastText(color);
  const textOutline = isDarkMode ? "#111827" : textColor === "#ffffff" ? "#172033" : "#ffffff";

  const handleClick = useCallback(() => {
    if (depth === 2) {
      onVersionClick(name);
    }
  }, [depth, name, onVersionClick]);

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: color,
          fillOpacity: depth < 2 ? 0.25 : 0.95,
          stroke: isDarkMode ? "#111827" : "#ffffff",
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: depth < 2 ? 0.8 : 0.65,
        }}
        onClick={handleClick}
        cursor={depth === 2 ? "pointer" : undefined}
      />
      {depth === 2 && width > 75 && (
        <text
          x={x + 6}
          y={y + 20}
          fill={textColor}
          fontSize={13}
          fontWeight={600}
          paintOrder="stroke"
          stroke={textOutline}
          strokeOpacity={0.45}
          strokeWidth={2}
        >
          {name}
        </text>
      )}
    </g>
  );
};

/** props for version instances side panel */
interface IVersionInstancesPanelProps {
  version: string;
  instances: IInstance[];
  onClose: () => void;
}

function VersionInstancesPanel({ version, instances, onClose }: IVersionInstancesPanelProps) {
  const matchingInstances = instances.filter((instance) => instance.version === version);

  return (
    <Sheet variant="outlined" sx={{ p: 2, height: "fit-content", maxHeight: 600, overflow: "hidden" }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
        <Box>
          <Typography level={"title-md" as any}>Instances on {version}</Typography>
          <Typography level={"body-sm" as any} sx={{ color: "text.tertiary", mt: 0.5 }}>
            {matchingInstances.length} instance{matchingInstances.length === 1 ? "" : "s"}
          </Typography>
        </Box>
        <IconButton size="sm" variant="plain" onClick={onClose} aria-label="Close version instances">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <List sx={{ mt: 1, overflowY: "auto", maxHeight: 500, mx: -1 }}>
        {matchingInstances.map((instance) => (
          <ListItem key={instance.url || instance.name}>
            <ListItemContent>
              <ExtInstanceLink instance={instance} />
              {instance.name && instance.name !== instance.url && (
                <Typography level={"body-xs" as any} noWrap sx={{ color: "text.tertiary" }}>
                  {instance.name}
                </Typography>
              )}
            </ListItemContent>
          </ListItem>
        ))}
      </List>
    </Sheet>
  );
}

/** props for main version distribution component */
interface IVersionDistProps {
  instances: IInstance[];
}

/**
 * main version distribution visualization component
 * displays treemap of instance versions grouped by stability
 * allows selecting a version to see all instances running it
 */
function VersionDist({ instances }: IVersionDistProps) {
  const { mode } = useColorScheme();
  const isDarkMode = mode === "dark";
  const [selectedVersion, setSelectedVersion] = React.useState<string | null>(null);

  const data = React.useMemo(() => {
    // count instances per version
    const versionsCounts: Record<string, number> = {};

    instances.forEach((instance) => {
      const version = instance.version;
      if (versionsCounts[version]) {
        versionsCounts[version] += 1;
      } else {
        versionsCounts[version] = 1;
      }
    });

    // detect stable versions (semantic versioning: x.y.z format)
    const isStableVersion = (version: string) => /^\d+\.\d+\.\d+$/.test(version.trim());

    // separate and sort stable/unstable versions (newest first)
    const stableVersions = Object.keys(versionsCounts)
      .filter((version) => version !== "" && version !== "unknown version")
      .filter(isStableVersion)
      .sort(compareVersions);

    const unstableVersions = Object.keys(versionsCounts)
      .filter((version) => version !== "" && version !== "unknown version")
      .filter((version) => !isStableVersion(version))
      .sort(compareVersions);

    // create tiles with color gradient based on version age
    const createTiles = (
      versions: string[],
      newestColor: string,
      oldestColor: string,
      category: IVersionTile["category"],
    ): IVersionTile[] =>
      versions.map((version, index) => ({
        name: version,
        size: versionsCounts[version],
        category,
        color: interpolateColor(
          newestColor,
          oldestColor,
          versions.length > 1 ? index / (versions.length - 1) : 0,
        ),
      }));

    const stable = createTiles(
      stableVersions,
      VERSION_SCALE_COLORS.stableNewest,
      VERSION_SCALE_COLORS.stableOldest,
      "stable",
    );
    const unstable = createTiles(
      unstableVersions,
      VERSION_SCALE_COLORS.unstableNewest,
      VERSION_SCALE_COLORS.unstableOldest,
      "unstable",
    );

    const data = [
      {
        name: "stable",
        children: stable,
      },
      {
        name: "unstable",
        children: unstable,
      },
    ];

    return data;
  }, [instances]);

  return (
    <Box>
      <Typography level={"body-sm" as any} sx={{ color: "text.tertiary", mb: 2, fontStyle: "italic" }}>
        Total instances by version across all lemmy instances: <strong>{instances.length}</strong>
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: selectedVersion ? "minmax(0, 1fr) 320px" : "1fr" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <ResponsiveContainer width="100%" height={600}>
          <Treemap
            data={data}
            dataKey="size"
            stroke="var(--joy-palette-background-surface, #fff)"
            fill={CATEGORY_COLORS.stable}
            animationDuration={0}
            key={isDarkMode ? "dark" : "light"}
            content={<CustomizedContent isDarkMode={isDarkMode} onVersionClick={setSelectedVersion} />}
          >
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={CustomTooltip}
              isAnimationActive={false}
              animationDuration={0}
              offset={0}
              wrapperStyle={{ pointerEvents: "none" }}
            />
          </Treemap>
        </ResponsiveContainer>

        {selectedVersion && (
          <VersionInstancesPanel
            version={selectedVersion}
            instances={instances}
            onClose={() => setSelectedVersion(null)}
          />
        )}
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 3, mt: 1.5 }}>
        {[
          ["Stable", VERSION_SCALE_COLORS.stableNewest, VERSION_SCALE_COLORS.stableOldest],
          ["Unstable", VERSION_SCALE_COLORS.unstableNewest, VERSION_SCALE_COLORS.unstableOldest],
        ].map(([label, newest, oldest]) => (
          <Box key={label as string} sx={{ minWidth: 220 }}>
            <Typography level={"body-xs" as any} fontWeight="lg" sx={{ mb: 0.5 }}>
              {label}
            </Typography>
            <Box
              sx={{
                height: 10,
                borderRadius: "sm",
                background: `linear-gradient(90deg, ${newest}, ${oldest})`,
              }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.25 }}>
              <Typography level={"body-xs" as any} sx={{ color: "text.tertiary" }}>
                newest
              </Typography>
              <Typography level={"body-xs" as any} sx={{ color: "text.tertiary" }}>
                oldest
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/**
 * data wrapper component that fetches instance data and passes to VersionDist
 * handles loading and error states
 */
export default function VersionDistDataWrapper() {
  const {
    isLoading: isLoadingIns,
    isSuccess: isSuccessIns,
    loadingPercent: loadingPercentIns,
    isError: isErrorIns,
    error: errorIns,
    data: dataIns,
  } = useCachedMultipart("instanceData", "instance");

  if (isLoadingIns) return <Box>Loading...</Box>;
  if (isErrorIns) return <Box>An error has occurred: {(errorIns as Error).message}</Box>;

  return <Box>{isSuccessIns && dataIns && <VersionDist instances={dataIns} />}</Box>;
}
