import React, { useMemo, useRef, useEffect, useState, useCallback } from "react";
import * as d3 from "d3";

import useQueryCache from "../../hooks/useQueryCache";

import Box from "@mui/joy/Box";
import Typography from "@mui/joy/Typography";
import Sheet from "@mui/joy/Sheet";
import Table from "@mui/joy/Table";
import Chip from "@mui/joy/Chip";
import Input from "@mui/joy/Input";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EdgeType = "trust" | "defederate";

interface RawFederationNode {
  id: string; // instance domain
  x: number;
  y: number;
}

interface RawFederationEdge {
  source: string;
  target: string;
  type: EdgeType;
  weight?: number;
}

interface FederationGraphData {
  nodes: RawFederationNode[];
  edges: RawFederationEdge[];
}

interface SceneNode extends RawFederationNode {
  trustIn: number;
  trustOut: number;
  defedIn: number;
  defedOut: number;
}

interface SceneEdge {
  source: SceneNode;
  target: SceneNode;
  type: EdgeType;
  weight: number;
}

interface NodeStat {
  id: string;
  trustIn: number;
  trustOut: number;
  defedIn: number;
  defedOut: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NODE_COLOR = "#ddaa00";
const NODE_OPACITY = 0.55;
const NODE_RADIUS = 2.2;

const HIGHLIGHT_COLOR = "#00aaff";
const HIGHLIGHT_RADIUS = 4;

const SEARCH_COLOR = "#ff4400";
const SEARCH_RADIUS = 6;

const TRUST_COLOR = "#22c55e";
const DEFEDERATE_COLOR = "#ef4444";

const BACKGROUND = "#191b22";

const HIT_RADIUS_PX = 8; // screen-space pick radius

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FederationGraph() {
  const {
    isLoading,
    isSuccess,
    isError,
    error,
    data: graphData,
  } = useQueryCache("federation.graph", "federation.graph") as {
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    error: Error | null;
    data: FederationGraphData | undefined;
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [markedId, setMarkedId] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [searchError, setSearchError] = useState(false);

  // -- Normalize raw data into a scene graph with per-node in/out counts ----

  const { nodesById, sceneNodes, sceneEdges, nodeStats } = useMemo(() => {
    const empty = {
      nodesById: new Map<string, SceneNode>(),
      sceneNodes: [] as SceneNode[],
      sceneEdges: [] as SceneEdge[],
      nodeStats: [] as NodeStat[],
    };
    if (!graphData) return empty;

    const byId = new Map<string, SceneNode>();
    graphData.nodes.forEach((n) => {
      byId.set(n.id, { ...n, trustIn: 0, trustOut: 0, defedIn: 0, defedOut: 0 });
    });

    const edges: SceneEdge[] = [];
    graphData.edges.forEach((e) => {
      const source = byId.get(e.source);
      const target = byId.get(e.target);
      if (!source || !target) return; // drop dangling refs rather than crash

      if (e.type === "trust") {
        source.trustOut += 1;
        target.trustIn += 1;
      } else {
        source.defedOut += 1;
        target.defedIn += 1;
      }

      edges.push({ source, target, type: e.type, weight: e.weight ?? 1 });
    });

    const nodes = Array.from(byId.values());
    const stats: NodeStat[] = nodes
      .map((n) => ({
        id: n.id,
        trustIn: n.trustIn,
        trustOut: n.trustOut,
        defedIn: n.defedIn,
        defedOut: n.defedOut,
      }))
      .sort((a, b) => b.trustIn + b.trustOut - (a.trustIn + a.trustOut));

    return { nodesById: byId, sceneNodes: nodes, sceneEdges: edges, nodeStats: stats };
  }, [graphData]);

  // -- Fit projection: map data-space coords into a normalized square -------

  const bounds = useMemo(() => {
    if (!sceneNodes.length) return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    sceneNodes.forEach((n) => {
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    });
    // small padding so edge nodes aren't clipped at the canvas border
    const padX = (maxX - minX) * 0.03 || 1;
    const padY = (maxY - minY) * 0.03 || 1;
    return { minX: minX - padX, maxX: maxX + padX, minY: minY - padY, maxY: maxY + padY };
  }, [sceneNodes]);

  // -- Quadtree over *projected* (pre-zoom) coordinates for hit testing -----

  const quadtree = useMemo(() => {
    if (!sceneNodes.length) return null;
    return d3
      .quadtree<SceneNode>()
      .x((d) => project(d.x, bounds, "x"))
      .y((d) => project(d.y, bounds, "y"))
      .addAll(sceneNodes);
  }, [sceneNodes, bounds]);

  function project(v: number, b: typeof bounds, axis: "x" | "y"): number {
    if (axis === "x") return (v - b.minX) / (b.maxX - b.minX || 1);
    return (v - b.minY) / (b.maxY - b.minY || 1);
  }

  // -- Draw loop --------------------------------------------------------------

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sceneNodes.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const scale = Math.min(w, h);

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, w, h);

    const t = transformRef.current;
    ctx.translate(t.x, t.y);
    ctx.scale(t.k, t.k);

    const toScreen = (n: SceneNode) => ({
      x: project(n.x, bounds, "x") * scale,
      y: project(n.y, bounds, "y") * scale,
    });

    // edges first, so nodes sit on top
    ctx.lineWidth = 1 / t.k;
    sceneEdges.forEach((e) => {
      const s = toScreen(e.source);
      const tt = toScreen(e.target);
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tt.x, tt.y);
      if (e.type === "trust") {
        ctx.strokeStyle = TRUST_COLOR;
        ctx.globalAlpha = 0.18;
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = DEFEDERATE_COLOR;
        ctx.globalAlpha = 0.35;
        ctx.setLineDash([4 / t.k, 3 / t.k]);
      }
      ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    // nodes
    sceneNodes.forEach((n) => {
      const p = toScreen(n);
      let color = NODE_COLOR;
      let opacity = NODE_OPACITY;
      let radius = NODE_RADIUS;

      if (n.id === markedId) {
        color = SEARCH_COLOR;
        opacity = 0.9;
        radius = SEARCH_RADIUS;
      } else if (n.id === hoveredId) {
        color = HIGHLIGHT_COLOR;
        opacity = 0.9;
        radius = HIGHLIGHT_RADIUS;
      }

      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      ctx.arc(p.x, p.y, radius / t.k, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    ctx.restore();
  }, [sceneNodes, sceneEdges, bounds, hoveredId, markedId]);

  // -- Resize + zoom wiring ---------------------------------------------------

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      draw();
    };

    const zoomBehavior = d3
      .zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.2, 40])
      .on("zoom", (event) => {
        transformRef.current = event.transform;
        draw();
      });

    d3.select(canvas).call(zoomBehavior);

    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();

    return () => {
      observer.disconnect();
      d3.select(canvas).on(".zoom", null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneNodes]);

  useEffect(() => {
    draw();
  }, [draw]);

  // -- Mouse interaction: hover + click, via quadtree pick ------------------

  const pickNode = useCallback(
    (clientX: number, clientY: number): SceneNode | null => {
      const canvas = canvasRef.current;
      if (!canvas || !quadtree) return null;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const scale = Math.min(canvas.width / dpr, canvas.height / dpr);
      const t = transformRef.current;

      const localX = (clientX - rect.left - t.x) / t.k / scale;
      const localY = (clientY - rect.top - t.y) / t.k / scale;
      const dataX = localX * scale;
      const dataY = localY * scale;

      const radius = HIT_RADIUS_PX / t.k;
      const found = quadtree.find(dataX, dataY, radius);
      return found ?? null;
    },
    [quadtree],
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const node = pickNode(e.clientX, e.clientY);
    setHoveredId(node ? node.id : null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const node = pickNode(e.clientX, e.clientY);
    setMarkedId(node ? node.id : null);
  };

  // -- Search box (mirrors reference implementation's searchForNodes) -------

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (!value) {
      setMarkedId(null);
      setSearchError(false);
      return;
    }
    const match = nodesById.get(value.trim());
    setMarkedId(match ? match.id : null);
    setSearchError(!match);
  };

  const markedStats = markedId ? nodesById.get(markedId) : null;
  const hoveredStats = hoveredId ? nodesById.get(hoveredId) : null;
  const infoNode = markedStats ?? hoveredStats;

  if (isLoading) return <>Loading...</>;
  if (isError || !isSuccess) return <>An error has occurred: {error?.message}</>;

  return (
    <Box>
      <Box
        ref={containerRef}
        sx={{
          position: "relative",
          width: "100%",
          height: 560,
          borderRadius: "md",
          overflow: "hidden",
          bgcolor: BACKGROUND,
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ display: "block", cursor: hoveredId ? "pointer" : "default" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredId(null)}
          onClick={handleClick}
        />

        <Box sx={{ position: "absolute", top: 0, right: 0, m: 1.5 }}>
          <Input
            size="sm"
            placeholder="Search instance…"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            color={searchError ? "danger" : "neutral"}
            sx={{ minWidth: 220 }}
          />
        </Box>

        <Box sx={{ position: "absolute", top: 0, left: 0, m: 1.5 }}>
          <Sheet variant="soft" sx={{ p: 1, borderRadius: "sm", bgcolor: "rgba(255,255,255,0.06)" }}>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <LegendDot color={TRUST_COLOR} label="Trust" />
              <LegendDot color={DEFEDERATE_COLOR} label="Defederate" dashed />
            </Box>
          </Sheet>
        </Box>

        {infoNode && (
          <Box sx={{ position: "absolute", bottom: 0, left: 0, m: 1.5 }}>
            <Sheet
              variant="outlined"
              sx={{
                p: 1.25,
                borderRadius: "md",
                boxShadow: "md",
                minWidth: 220,
                bgcolor: "background.surface",
              }}
            >
              <Typography level={"body-sm" as any} fontWeight="lg" sx={{ mb: 0.5, wordBreak: "break-all" }}>
                {infoNode.id}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip size="sm" variant="soft" color="success">
                  trust in {infoNode.trustIn} / out {infoNode.trustOut}
                </Chip>
                <Chip size="sm" variant="soft" color="danger">
                  defed in {infoNode.defedIn} / out {infoNode.defedOut}
                </Chip>
              </Box>
            </Sheet>
          </Box>
        )}
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography level={"title-sm" as any} sx={{ mb: 1 }}>
          Instance Breakdown
        </Typography>

        <Table size="sm" hoverRow borderAxis="bothBetween">
          <thead>
            <tr>
              <th>Instance</th>
              <th>Trust in</th>
              <th>Trust out</th>
              <th>Defederate in</th>
              <th>Defederate out</th>
            </tr>
          </thead>
          <tbody>
            {nodeStats.slice(0, 50).map((row) => (
              <tr
                key={row.id}
                onClick={() => {
                  setSearchValue(row.id);
                  setMarkedId(row.id);
                  setSearchError(false);
                }}
                style={{ cursor: "pointer" }}
              >
                <td>
                  {row.id}
                  {row.id === markedId && (
                    <Chip size="sm" color="primary" variant="soft" sx={{ ml: 1 }}>
                      selected
                    </Chip>
                  )}
                </td>
                <td>{row.trustIn}</td>
                <td>{row.trustOut}</td>
                <td>{row.defedIn}</td>
                <td>{row.defedOut}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Box>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Small presentational helper
// ---------------------------------------------------------------------------

function LegendDot({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Box
        sx={{
          width: 14,
          height: 0,
          borderTop: `2px ${dashed ? "dashed" : "solid"} ${color}`,
        }}
      />
      <Typography level={"body-xs" as any} sx={{ color: "white" }}>
        {label}
      </Typography>
    </Box>
  );
}
