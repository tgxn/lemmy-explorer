import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Sheet from "@mui/joy/Sheet";
import Stack from "@mui/joy/Stack";
import Typography from "@mui/joy/Typography";

import useQueryCache from "../../hooks/useQueryCache";

export type EdgeType = "trust" | "defederate" | "fediseer";

type RawFederationNode = [id: string, score: number, weight: number];
type RawFederationEdge = [source: number, target: number, type: EdgeType, weight: number];

interface FederationGraphData {
  nodes: RawFederationNode[];
  edges: RawFederationEdge[];
}

type NodeStats = {
  connections: number;
  incomingDefederations: number;
  outgoingDefederations: number;
  endorsements: number;
};

type GraphNode = {
  id: number;
  label: string;
  score: number;
  weight: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
};

const edgeColors: Record<EdgeType, string> = {
  trust: "#0f766e",
  defederate: "#dc2626",
  fediseer: "#2563eb",
};

const focusedNodeColors = {
  selected: "#0f766e",
  indirect: "#94a3b8",
};

function matchesDirectionFilter(
  edge: RawFederationEdge,
  selectedNodeId: number,
  filters: Record<"defederate" | "fediseer", { incoming: boolean; outgoing: boolean }>,
) {
  if (edge[2] === "trust") return false;

  return (
    (filters[edge[2]].outgoing && edge[0] === selectedNodeId) ||
    (filters[edge[2]].incoming && edge[1] === selectedNodeId)
  );
}

function isRelationshipTypeEnabled(
  edge: RawFederationEdge,
  filters: Record<"defederate" | "fediseer", { incoming: boolean; outgoing: boolean }>,
) {
  return edge[2] !== "trust" && (filters[edge[2]].incoming || filters[edge[2]].outgoing);
}

function formatNodeLabel(label: string) {
  const hostname = label
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");

  return hostname.length > 30 ? `${hostname.slice(0, 29)}...` : hostname;
}

export default function FederationGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const drawRef = useRef<(() => void) | null>(null);
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const pointerStartRef = useRef({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const hoveredNodeIdRef = useRef<number | null>(null);
  const [hoveredNode, setHoveredNode] = useState<{ id: number; label: string } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [directionFilters, setDirectionFilters] = useState({
    defederate: { incoming: true, outgoing: true },
    fediseer: { incoming: true, outgoing: true },
  });
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);

  const {
    isLoading,
    isSuccess,
    data: graphData,
  } = useQueryCache("federation.graph", "federation.graph") as {
    isLoading: boolean;
    isSuccess: boolean;
    data: FederationGraphData | undefined;
  };

  const nodeStats = useMemo(() => {
    const stats =
      graphData?.nodes.map<NodeStats>(() => ({
        connections: 0,
        incomingDefederations: 0,
        outgoingDefederations: 0,
        endorsements: 0,
      })) ?? [];

    graphData?.edges.forEach((edge) => {
      const [sourceId, targetId, type, weight] = edge;
      if (type === "trust") return;

      stats[sourceId].connections += weight;
      stats[targetId].connections += weight;

      if (type === "defederate") {
        stats[sourceId].outgoingDefederations += weight;
        stats[targetId].incomingDefederations += weight;
      }
      if (type === "fediseer") {
        stats[targetId].endorsements += weight;
      }
    });

    return stats;
  }, [graphData]);

  const graphEdges = useMemo(() => graphData?.edges.filter((edge) => edge[2] !== "trust") ?? [], [graphData]);

  const overviewEdges = useMemo(
    () => graphEdges.filter((edge) => isRelationshipTypeEnabled(edge, directionFilters)),
    [directionFilters, graphEdges],
  );

  const focusedGraph = useMemo(() => {
    const distances = new Map<number, number>();
    const edgeIndexes = new Set<number>();
    if (!graphData || selectedNodeId === null) return { distances, edgeIndexes };

    distances.set(selectedNodeId, 0);
    for (let depth = 0; ; depth += 1) {
      let foundNextDegree = false;
      graphEdges.forEach((edge, index) => {
        const sourceDistance = distances.get(edge[0]);
        const targetDistance = distances.get(edge[1]);
        if (directionFilters[edge[2]].outgoing && sourceDistance === depth && targetDistance === undefined) {
          distances.set(edge[1], depth + 1);
          edgeIndexes.add(index);
          foundNextDegree = true;
        }
        if (directionFilters[edge[2]].incoming && targetDistance === depth && sourceDistance === undefined) {
          distances.set(edge[0], depth + 1);
          edgeIndexes.add(index);
          foundNextDegree = true;
        }
      });
      if (!foundNextDegree) break;
    }

    return { distances, edgeIndexes };
  }, [directionFilters, graphEdges, graphData, selectedNodeId]);

  const nodeDistances = focusedGraph.distances;

  const visibleNodeIds = useMemo(() => {
    if (!graphData) return [];
    if (selectedNodeId !== null) return [...nodeDistances.keys()];
    return [...new Set(overviewEdges.flatMap((edge) => [edge[0], edge[1]]))];
  }, [graphData, nodeDistances, overviewEdges, selectedNodeId]);

  const visibleNodeIdSet = useMemo(() => new Set(visibleNodeIds), [visibleNodeIds]);
  const visibleEdges = useMemo(() => {
    if (!graphData) return [];
    if (selectedNodeId !== null) {
      return graphEdges.filter((_, index) => focusedGraph.edgeIndexes.has(index));
    }
    return overviewEdges.filter((edge) => visibleNodeIdSet.has(edge[0]) && visibleNodeIdSet.has(edge[1]));
  }, [focusedGraph.edgeIndexes, graphData, graphEdges, overviewEdges, selectedNodeId, visibleNodeIdSet]);

  const directNodeTypes = useMemo(() => {
    const types = new Map<number, EdgeType>();
    if (selectedNodeId === null) return types;

    visibleEdges.forEach((edge) => {
      if (edge[0] === selectedNodeId) types.set(edge[1], edge[2]);
      if (edge[1] === selectedNodeId) types.set(edge[0], edge[2]);
    });
    return types;
  }, [selectedNodeId, visibleEdges]);

  const selectedRelationships = useMemo(() => {
    if (!graphData || selectedNodeId === null) return [];
    return graphEdges
      .filter(
        (edge) =>
          (edge[0] === selectedNodeId || edge[1] === selectedNodeId) &&
          matchesDirectionFilter(edge, selectedNodeId, directionFilters),
      )
      .map((edge) => ({
        direction: edge[0] === selectedNodeId ? "outgoing" : "incoming",
        instance: graphData.nodes[edge[0] === selectedNodeId ? edge[1] : edge[0]][0],
        type: edge[2],
        weight: edge[3],
      }))
      .sort((first, second) => second.weight - first.weight || first.instance.localeCompare(second.instance));
  }, [directionFilters, graphData, graphEdges, selectedNodeId]);

  const relationshipGroups = useMemo(
    () => [
      {
        id: "outgoing",
        label: "Outgoing defederations",
        color: edgeColors.defederate,
        relationships: selectedRelationships.filter(
          (relationship) => relationship.type === "defederate" && relationship.direction === "outgoing",
        ),
      },
      {
        id: "incoming",
        label: "Incoming defederations",
        color: edgeColors.defederate,
        relationships: selectedRelationships.filter(
          (relationship) => relationship.type === "defederate" && relationship.direction === "incoming",
        ),
      },
      {
        id: "vouches",
        label: "Outgoing Fediseer vouches",
        color: edgeColors.fediseer,
        relationships: selectedRelationships.filter(
          (relationship) => relationship.type === "fediseer" && relationship.direction === "outgoing",
        ),
      },
      {
        id: "vouched-by",
        label: "Incoming Fediseer vouches",
        color: edgeColors.fediseer,
        relationships: selectedRelationships.filter(
          (relationship) => relationship.type === "fediseer" && relationship.direction === "incoming",
        ),
      },
    ],
    [selectedRelationships],
  );

  useEffect(() => {
    if (!canvasRef.current || !graphData || visibleNodeIds.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const getCanvasPalette = () => {
      const styles = getComputedStyle(canvas);
      return {
        background: styles.getPropertyValue("--joy-palette-background-surface").trim() || "#ffffff",
        foreground: styles.getPropertyValue("--joy-palette-text-primary").trim() || "#111827",
        edgeColors: {
          trust: styles.getPropertyValue("--joy-palette-success-500").trim() || edgeColors.trust,
          defederate: styles.getPropertyValue("--joy-palette-danger-500").trim() || edgeColors.defederate,
          fediseer: styles.getPropertyValue("--joy-palette-primary-500").trim() || edgeColors.fediseer,
        },
      };
    };
    let palette = getCanvasPalette();

    const resizeCanvas = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 1;
      const height = canvas.clientHeight || 1;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      return { width, height, pixelRatio };
    };
    let dimensions = resizeCanvas();
    transformRef.current = { x: 0, y: 0, k: 1 };

    const nodes = visibleNodeIds.map((id) => {
      const nodeData = graphData.nodes[id];
      return {
        id,
        label: nodeData[0],
        score: nodeData[1],
        weight: nodeData[2],
        x: Math.random() * dimensions.width,
        y: Math.random() * dimensions.height,
        vx: 0,
        vy: 0,
      };
    });

    nodesRef.current = nodes;

    const links = visibleEdges.map((edge) => ({
      source: edge[0],
      target: edge[1],
      type: edge[2],
      weight: edge[3],
    }));

    const nodeById = new Map(nodes.map((node) => [node.id, node]));
    const renderedRingCount = 5;
    const getRingSpacing = () =>
      Math.max(
        38,
        Math.min(105, Math.min(dimensions.width, dimensions.height) / (renderedRingCount * 2 + 1)),
      );
    const draw = (time = performance.now()) => {
      ctx.save();
      ctx.setTransform(dimensions.pixelRatio, 0, 0, dimensions.pixelRatio, 0, 0);
      ctx.fillStyle = palette.background;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      ctx.translate(transformRef.current.x, transformRef.current.y);
      ctx.scale(transformRef.current.k, transformRef.current.k);

      visibleEdges.forEach((edge, index) => {
        const source = nodeById.get(edge[0]);
        const target = nodeById.get(edge[1]);
        if (!source || !target) return;

        const isFocusedView = selectedNodeId !== null;
        ctx.strokeStyle = palette.edgeColors[edge[2]];
        ctx.lineWidth =
          Math.max(isFocusedView ? 1.5 : 0.8, Math.min(isFocusedView ? 5 : 3, edge[3] / 2)) /
          transformRef.current.k;
        ctx.globalAlpha = isFocusedView ? 0.8 : 0.45;
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();

        if (isFocusedView) {
          const progress = 0.15 + ((time / 1500 + index * 0.19) % 1) * 0.7;
          const markerX = source.x + (target.x - source.x) * progress;
          const markerY = source.y + (target.y - source.y) * progress;
          const angle = Math.atan2(target.y - source.y, target.x - source.x);
          const markerSize = 5 / transformRef.current.k;

          ctx.fillStyle = palette.edgeColors[edge[2]];
          ctx.globalAlpha = 1;
          ctx.beginPath();
          ctx.moveTo(markerX + Math.cos(angle) * markerSize, markerY + Math.sin(angle) * markerSize);
          ctx.lineTo(
            markerX + Math.cos(angle + Math.PI * 0.75) * markerSize,
            markerY + Math.sin(angle + Math.PI * 0.75) * markerSize,
          );
          ctx.lineTo(
            markerX + Math.cos(angle - Math.PI * 0.75) * markerSize,
            markerY + Math.sin(angle - Math.PI * 0.75) * markerSize,
          );
          ctx.closePath();
          ctx.fill();
        }
      });

      nodes.forEach((node) => {
        const colorIntensity = Math.min(1, Math.max(0, node.score) / 80);
        const nodeRadius = Math.max(3, Math.min(10, 3 + Math.sqrt(node.weight)));
        ctx.globalAlpha = 1;
        const nodeDistance = nodeDistances.get(node.id);
        ctx.fillStyle =
          node.id === selectedNodeId
            ? focusedNodeColors.selected
            : nodeDistance === 1
              ? palette.edgeColors[directNodeTypes.get(node.id) ?? "trust"]
              : nodeDistance !== undefined && nodeDistance > 1
                ? focusedNodeColors.indirect
                : d3.interpolateViridis(colorIntensity);
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
        ctx.fill();

        if (node.id === selectedNodeId || node.id === hoveredNodeIdRef.current) {
          ctx.strokeStyle = node.id === selectedNodeId ? palette.foreground : "#f59e0b";
          ctx.lineWidth = 2 / transformRef.current.k;
          ctx.stroke();
        }

        const shouldLabelNode =
          node.id === selectedNodeId ||
          nodeDistances.get(node.id) === 1 ||
          node.id === hoveredNodeIdRef.current;
        if (shouldLabelNode) {
          ctx.fillStyle = palette.foreground;
          ctx.font = `500 ${10 / transformRef.current.k}px sans-serif`;
          ctx.fillText(formatNodeLabel(node.label), node.x + nodeRadius + 4, node.y + 3);
        }
      });
      ctx.restore();
    };
    drawRef.current = draw;

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links as any)
          .id((node: any) => node.id)
          .distance(45),
      )
      .force("charge", d3.forceManyBody().strength(selectedNodeId === null ? -70 : -120))
      .force("collide", d3.forceCollide(14))
      .force(
        "radial",
        selectedNodeId === null
          ? null
          : d3
              .forceRadial<GraphNode>(
                (node) => Math.min(nodeDistances.get(node.id) ?? 0, renderedRingCount) * getRingSpacing(),
              )
              .x(dimensions.width / 2)
              .y(dimensions.height / 2)
              .strength(0.8),
      )
      .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .alphaDecay(0.05)
      .alphaMin(0.05)
      .on("tick", draw);

    let animationFrame = 0;
    const animate = (time: number) => {
      draw(time);
      animationFrame = window.requestAnimationFrame(animate);
    };
    if (selectedNodeId !== null) animationFrame = window.requestAnimationFrame(animate);

    const resizeObserver = new ResizeObserver(() => {
      dimensions = resizeCanvas();
      simulation.force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2));
      simulation
        .force("radial")
        ?.x(dimensions.width / 2)
        .y(dimensions.height / 2);
      simulation.alpha(0.5).restart();
    });
    resizeObserver.observe(canvas);
    const themeObserver = new MutationObserver(() => {
      palette = getCanvasPalette();
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-joy-color-scheme", "data-mui-color-scheme"],
    });

    const getMouseInGraphSpace = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const canvasX = clientX - rect.left;
      const canvasY = clientY - rect.top;
      const graphX = (canvasX - transformRef.current.x) / transformRef.current.k;
      const graphY = (canvasY - transformRef.current.y) / transformRef.current.k;

      return { x: graphX, y: graphY, canvasX, canvasY };
    };

    const findNodeAt = (x: number, y: number) => {
      return nodesRef.current.find((node) => {
        const radius = Math.max(10, 3 + Math.sqrt(node.weight));
        return Math.hypot(node.x - x, node.y - y) < radius;
      });
    };

    const handlePointerDown = (event: PointerEvent) => {
      isPanningRef.current = true;
      pointerStartRef.current = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const coords = getMouseInGraphSpace(event.clientX, event.clientY);
      setMousePos({ x: event.clientX, y: event.clientY });

      if (isPanningRef.current && event.buttons !== 0) {
        const dx = event.clientX - pointerStartRef.current.x;
        const dy = event.clientY - pointerStartRef.current.y;
        transformRef.current.x += dx;
        transformRef.current.y += dy;
        pointerStartRef.current = { x: event.clientX, y: event.clientY };
        draw();
        return;
      }

      const foundNode = findNodeAt(coords.x, coords.y);
      const nextHoveredId = foundNode?.id ?? null;
      if (nextHoveredId === hoveredNodeIdRef.current) return;

      hoveredNodeIdRef.current = nextHoveredId;
      setHoveredNode(foundNode ? { id: foundNode.id, label: foundNode.label } : null);
      draw();
    };

    const handlePointerUp = (event: PointerEvent) => {
      const travelled = Math.hypot(
        event.clientX - pointerStartRef.current.x,
        event.clientY - pointerStartRef.current.y,
      );
      isPanningRef.current = false;
      if (travelled >= 6) return;

      const coords = getMouseInGraphSpace(event.clientX, event.clientY);
      const selectedNode = findNodeAt(coords.x, coords.y);
      if (selectedNode) setSelectedNodeId(selectedNode.id);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const coords = getMouseInGraphSpace(event.clientX, event.clientY);

      const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
      const newK = transformRef.current.k * zoomFactor;
      const clampedK = Math.max(0.5, Math.min(3, newK));

      transformRef.current.x = coords.canvasX - coords.x * clampedK;
      transformRef.current.y = coords.canvasY - coords.y * clampedK;
      transformRef.current.k = clampedK;
      draw();
    };

    const handlePointerLeave = () => {
      hoveredNodeIdRef.current = null;
      setHoveredNode(null);
      isPanningRef.current = false;
      draw();
    };

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerUp);
    canvas.addEventListener("pointerleave", handlePointerLeave);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      simulation.stop();
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      drawRef.current = null;
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [graphData, nodeDistances, selectedNodeId, visibleEdges, visibleNodeIds]);

  useEffect(() => {
    drawRef.current?.();
  }, [hoveredNode, selectedNodeId]);

  if (isLoading) return <Box sx={{ p: 2 }}>Loading federation graph...</Box>;
  if (!isSuccess || !graphData) return <Box sx={{ p: 2 }}>No graph data available</Box>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2, height: "100%" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography level="body3">
          {selectedNodeId === null
            ? `${visibleNodeIds.length} instances and ${visibleEdges.length} of ${graphEdges.length} relationships`
            : `Focused view: ${visibleNodeIds.length} reachable instances and ${visibleEdges.length} relationships`}
        </Typography>
      </Box>

      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <Checkbox
          label="Outgoing defederations"
          checked={directionFilters.defederate.outgoing}
          onChange={(event) =>
            setDirectionFilters({
              ...directionFilters,
              defederate: { ...directionFilters.defederate, outgoing: event.target.checked },
            })
          }
          slotProps={{ label: { sx: { fontSize: "sm" } } }}
        />
        <Checkbox
          label="Incoming defederations"
          checked={directionFilters.defederate.incoming}
          onChange={(event) =>
            setDirectionFilters({
              ...directionFilters,
              defederate: { ...directionFilters.defederate, incoming: event.target.checked },
            })
          }
          slotProps={{ label: { sx: { fontSize: "sm" } } }}
        />
        <Checkbox
          label="Outgoing Fediseer vouches"
          checked={directionFilters.fediseer.outgoing}
          onChange={(event) =>
            setDirectionFilters({
              ...directionFilters,
              fediseer: { ...directionFilters.fediseer, outgoing: event.target.checked },
            })
          }
          slotProps={{ label: { sx: { fontSize: "sm" } } }}
        />
        <Checkbox
          label="Incoming Fediseer vouches"
          checked={directionFilters.fediseer.incoming}
          onChange={(event) =>
            setDirectionFilters({
              ...directionFilters,
              fediseer: { ...directionFilters.fediseer, incoming: event.target.checked },
            })
          }
          slotProps={{ label: { sx: { fontSize: "sm" } } }}
        />
      </Stack>

      {selectedNodeId !== null && (
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap alignItems="center">
          {[
            ["Selected", focusedNodeColors.selected],
            ["Defederates", edgeColors.defederate],
            ["Vouches", edgeColors.fediseer],
            ["Two degrees away", focusedNodeColors.indirect],
          ].map(([label, color]) => (
            <Stack key={label} direction="row" spacing={0.5} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: color }} />
              <Typography level="body3">{label}</Typography>
            </Stack>
          ))}
        </Stack>
      )}

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          alignItems: "stretch",
          gap: 2,
          minHeight: 0,
          flex: 1,
        }}
      >
        <Sheet
          variant="outlined"
          sx={{
            flex: "1 1 0",
            minWidth: 0,
            position: "relative",
            overflow: "hidden",
            borderRadius: "sm",
            height: { xs: "360px", md: "500px", lg: "min(65vh, 760px)" },
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: "100%", display: "block", cursor: "grab", touchAction: "none" }}
          />

          {hoveredNode && (
            <Box
              sx={{
                position: "fixed",
                left: `${mousePos.x + 10}px`,
                top: `${mousePos.y + 10}px`,
                backgroundColor: "background.surface",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "sm",
                p: 1,
                fontSize: "sm",
                pointerEvents: "none",
                zIndex: 10,
                boxShadow: "sm",
                maxWidth: "300px",
                wordBreak: "break-word",
              }}
            >
              <Typography level="body3" sx={{ fontWeight: 600 }}>
                {hoveredNode.label}
              </Typography>
            </Box>
          )}
        </Sheet>

        <Sheet
          variant="outlined"
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: { xs: "0 0 auto", lg: "0 0 280px" },
            minWidth: 0,
            maxHeight: { xs: "360px", lg: "min(65vh, 760px)" },
            borderRadius: "sm",
            p: 1.5,
          }}
        >
          {selectedNodeId === null ? (
            <Typography level="body3">
              Select an instance to inspect its incoming and outgoing relationships.
            </Typography>
          ) : (
            <Stack spacing={1.25} sx={{ minHeight: 0, height: "100%" }}>
              <Box>
                <Typography level="body2" sx={{ fontWeight: 600, overflowWrap: "anywhere" }}>
                  {graphData.nodes[selectedNodeId][0]}
                </Typography>
                <Typography level="body3">
                  Score {graphData.nodes[selectedNodeId][1]} | {nodeStats[selectedNodeId].connections}{" "}
                  weighted connections
                </Typography>
              </Box>
              <Button size="sm" variant="outlined" onClick={() => setSelectedNodeId(null)}>
                Clear selection
              </Button>
              <Typography level="body3">{selectedRelationships.length} direct relationships</Typography>
              <Stack spacing={0.75} sx={{ minHeight: 0, overflowY: "auto", pr: 0.5 }}>
                {selectedRelationships.length === 0 ? (
                  <Typography level="body3">No relationships match the selected filters.</Typography>
                ) : (
                  relationshipGroups
                    .filter((group) => group.relationships.length > 0)
                    .map((group) => (
                      <Stack key={group.id} spacing={0.5}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Box
                            sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: group.color }}
                          />
                          <Typography level="body3" sx={{ fontWeight: 600 }}>
                            {group.label} ({group.relationships.length})
                          </Typography>
                        </Stack>
                        {group.relationships.map((relationship) => (
                          <Typography
                            key={`${relationship.direction}-${relationship.type}-${relationship.instance}`}
                            level="body3"
                            sx={{ minWidth: 0, overflowWrap: "anywhere", pl: 1.75 }}
                          >
                            {relationship.instance}
                            {relationship.weight > 1 ? ` (${relationship.weight})` : ""}
                          </Typography>
                        ))}
                      </Stack>
                    ))
                )}
              </Stack>
            </Stack>
          )}
        </Sheet>
      </Box>
    </Box>
  );
}
