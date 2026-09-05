import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";

import Box from "@mui/joy/Box";
import Button from "@mui/joy/Button";
import Checkbox from "@mui/joy/Checkbox";
import Chip from "@mui/joy/Chip";
import FormControl from "@mui/joy/FormControl";
import FormLabel from "@mui/joy/FormLabel";
import Option from "@mui/joy/Option";
import Sheet from "@mui/joy/Sheet";
import Select from "@mui/joy/Select";
import Slider from "@mui/joy/Slider";
import Stack from "@mui/joy/Stack";
import Tab from "@mui/joy/Tab";
import TabList from "@mui/joy/TabList";
import Tabs from "@mui/joy/Tabs";
import Typography from "@mui/joy/Typography";

import useQueryCache from "../../hooks/useQueryCache";

export type EdgeType = "trust" | "defederate" | "fediseer";

type RawFederationNode = [id: string, score: number, weight: number];
type RawFederationEdge = [source: number, target: number, type: EdgeType, weight: number];

interface FederationGraphData {
  nodes: RawFederationNode[];
  edges: RawFederationEdge[];
}

type GraphMode = "overview" | "full";
type RankCriterion = "connections" | "score" | "incomingDefederations" | "outgoingDefederations" | "endorsements";

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

const edgeNames: Record<EdgeType, string> = {
  trust: "Federates",
  defederate: "Defederates",
  fediseer: "Vouches",
};

function matchesEdgeFilters(edge: RawFederationEdge, filters: Record<EdgeType, boolean>) {
  return filters[edge[2]];
}

function getRankValue(node: RawFederationNode, stats: NodeStats, criterion: RankCriterion) {
  if (criterion === "score") return node[1];
  return stats[criterion];
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
  const [edgeFilters, setEdgeFilters] = useState({ trust: true, defederate: true, fediseer: true });
  const [graphMode, setGraphMode] = useState<GraphMode>("overview");
  const [rankCriterion, setRankCriterion] = useState<RankCriterion>("connections");
  const [nodeLimit, setNodeLimit] = useState(40);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [isCompact, setIsCompact] = useState(false);

  const {
    isLoading,
    isSuccess,
    data: graphData,
  } = useQueryCache("federation.graph", "federation.graph") as {
    isLoading: boolean;
    isSuccess: boolean;
    data: FederationGraphData | undefined;
  };

  useEffect(() => {
    const query = window.matchMedia("(max-width: 599px)");
    const updateCompactMode = () => setIsCompact(query.matches);
    updateCompactMode();
    query.addEventListener("change", updateCompactMode);
    return () => query.removeEventListener("change", updateCompactMode);
  }, []);

  const nodeStats = useMemo(() => {
    const stats = graphData?.nodes.map<NodeStats>(() => ({
      connections: 0,
      incomingDefederations: 0,
      outgoingDefederations: 0,
      endorsements: 0,
    })) ?? [];

    graphData?.edges.forEach((edge) => {
      const [sourceId, targetId, type, weight] = edge;
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

  const rankedNodeIds = useMemo(() => {
    if (!graphData) return [];
    return graphData.nodes
      .map((node, id) => ({ id, value: getRankValue(node, nodeStats[id], rankCriterion) }))
      .sort((first, second) => second.value - first.value || first.id - second.id)
      .map(({ id }) => id);
  }, [graphData, nodeStats, rankCriterion]);

  const visibleNodeIds = useMemo(() => {
    if (!graphData) return [];
    if (graphMode === "full") return graphData.nodes.map((_, id) => id);

    const maxNodeCount = isCompact ? Math.min(nodeLimit, 30) : nodeLimit;
    if (selectedNodeId === null) return rankedNodeIds.slice(0, maxNodeCount);

    const selectedNeighbors = graphData.edges
      .filter((edge) => edge[0] === selectedNodeId || edge[1] === selectedNodeId)
      .map((edge) => (edge[0] === selectedNodeId ? edge[1] : edge[0]));
    const ranking = new Map(rankedNodeIds.map((id, index) => [id, index]));
    selectedNeighbors.sort((first, second) => ranking.get(first)! - ranking.get(second)!);

    const visibleIds = new Set<number>([selectedNodeId]);
    for (const neighborId of selectedNeighbors) {
      if (visibleIds.size >= maxNodeCount) break;
      visibleIds.add(neighborId);
    }
    for (const nodeId of rankedNodeIds) {
      if (visibleIds.size >= maxNodeCount) break;
      visibleIds.add(nodeId);
    }
    return [...visibleIds];
  }, [graphData, graphMode, isCompact, nodeLimit, rankedNodeIds, selectedNodeId]);

  const visibleNodeIdSet = useMemo(() => new Set(visibleNodeIds), [visibleNodeIds]);
  const visibleEdges = useMemo(
    () =>
      graphData?.edges.filter(
        (edge) =>
          visibleNodeIdSet.has(edge[0]) &&
          visibleNodeIdSet.has(edge[1]) &&
          matchesEdgeFilters(edge, edgeFilters),
      ) ?? [],
    [edgeFilters, graphData, visibleNodeIdSet],
  );

  const selectedRelationships = useMemo(() => {
    if (!graphData || selectedNodeId === null) return [];
    return graphData.edges
      .filter((edge) => edge[0] === selectedNodeId || edge[1] === selectedNodeId)
      .filter((edge) => matchesEdgeFilters(edge, edgeFilters))
      .map((edge) => ({
        direction: edge[0] === selectedNodeId ? "outgoing" : "incoming",
        instance: graphData.nodes[edge[0] === selectedNodeId ? edge[1] : edge[0]][0],
        type: edge[2],
        weight: edge[3],
      }))
      .sort((first, second) => second.weight - first.weight || first.instance.localeCompare(second.instance));
  }, [edgeFilters, graphData, selectedNodeId]);

  useEffect(() => {
    if (!canvasRef.current || !graphData || visibleNodeIds.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 1;
      const height = canvas.clientHeight || 1;
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      return { width, height, pixelRatio };
    };
    const dimensions = resizeCanvas();
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
    const draw = () => {
      ctx.save();
      ctx.setTransform(dimensions.pixelRatio, 0, 0, dimensions.pixelRatio, 0, 0);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      ctx.translate(transformRef.current.x, transformRef.current.y);
      ctx.scale(transformRef.current.k, transformRef.current.k);

      visibleEdges.forEach((edge) => {
        const source = nodeById.get(edge[0]);
        const target = nodeById.get(edge[1]);
        if (!source || !target) return;

        ctx.strokeStyle = edgeColors[edge[2]];
        ctx.lineWidth = Math.max(0.8, Math.min(3, edge[3] / 2)) / transformRef.current.k;
        ctx.globalAlpha = 0.45;
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
      });

      nodes.forEach((node) => {
        const colorIntensity = Math.min(1, Math.max(0, node.score) / 80);
        const nodeRadius = Math.max(3, Math.min(10, 3 + Math.sqrt(node.weight)));
        ctx.globalAlpha = 1;
        ctx.fillStyle = d3.interpolateViridis(colorIntensity);
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
        ctx.fill();

        if (node.id === selectedNodeId || node.id === hoveredNodeIdRef.current) {
          ctx.strokeStyle = node.id === selectedNodeId ? "#111827" : "#f59e0b";
          ctx.lineWidth = 2 / transformRef.current.k;
          ctx.stroke();
        }

        if (graphMode === "overview" && nodes.length <= 30) {
          ctx.fillStyle = "#111827";
          ctx.font = `${11 / transformRef.current.k}px sans-serif`;
          ctx.fillText(node.label, node.x + nodeRadius + 4, node.y + 3);
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
          .distance(graphMode === "full" ? 45 : 80),
      )
      .force("charge", d3.forceManyBody().strength(graphMode === "full" ? -70 : -220))
      .force("collide", d3.forceCollide(14))
      .force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .alphaDecay(0.05)
      .alphaMin(0.05)
      .on("tick", draw);

    const resizeObserver = new ResizeObserver(() => {
      const resizedDimensions = resizeCanvas();
      simulation.force("center", d3.forceCenter(resizedDimensions.width / 2, resizedDimensions.height / 2));
      simulation.alpha(0.5).restart();
    });
    resizeObserver.observe(canvas);

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
      resizeObserver.disconnect();
      drawRef.current = null;
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerup", handlePointerUp);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      canvas.removeEventListener("wheel", handleWheel);
    };
  }, [graphData, graphMode, selectedNodeId, visibleEdges, visibleNodeIds]);

  useEffect(() => {
    drawRef.current?.();
  }, [hoveredNode, selectedNodeId]);

  if (isLoading) return <Box sx={{ p: 2 }}>Loading federation graph...</Box>;
  if (!isSuccess || !graphData) return <Box sx={{ p: 2 }}>No graph data available</Box>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2, height: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <Typography level="body3">
          Showing {visibleNodeIds.length} of {graphData.nodes.length} instances and {visibleEdges.length} of {graphData.edges.length} relationships
        </Typography>
        <Tabs value={graphMode} onChange={(_, value) => setGraphMode(value as GraphMode)} size="sm">
          <TabList>
            <Tab value="overview">Explorer</Tab>
            <Tab value="full">Full network</Tab>
          </TabList>
        </Tabs>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 1.5 }}>
        <FormControl size="sm">
          <FormLabel>Prioritize instances by</FormLabel>
          <Select value={rankCriterion} onChange={(_, value) => value && setRankCriterion(value)} disabled={graphMode === "full"}>
            <Option value="connections">Connections</Option>
            <Option value="incomingDefederations">Incoming defederations</Option>
            <Option value="outgoingDefederations">Outgoing defederations</Option>
            <Option value="endorsements">Fediseer vouches</Option>
            <Option value="score">Instance score</Option>
          </Select>
        </FormControl>
        <FormControl size="sm" disabled={graphMode === "full"}>
          <FormLabel>Instances in explorer: {isCompact ? Math.min(nodeLimit, 30) : nodeLimit}</FormLabel>
          <Slider
            value={nodeLimit}
            min={10}
            max={60}
            step={10}
            marks
            onChange={(_, value) => setNodeLimit(value as number)}
          />
        </FormControl>
      </Box>

      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <Checkbox
          label="Federates"
          checked={edgeFilters.trust}
          onChange={(event) => setEdgeFilters({ ...edgeFilters, trust: event.target.checked })}
          slotProps={{ label: { sx: { fontSize: "sm" } } }}
        />
        <Checkbox
          label="Defederates"
          checked={edgeFilters.defederate}
          onChange={(event) => setEdgeFilters({ ...edgeFilters, defederate: event.target.checked })}
          slotProps={{ label: { sx: { fontSize: "sm" } } }}
        />
        <Checkbox
          label="Fediseer vouches"
          checked={edgeFilters.fediseer}
          onChange={(event) => setEdgeFilters({ ...edgeFilters, fediseer: event.target.checked })}
          slotProps={{ label: { sx: { fontSize: "sm" } } }}
        />
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 280px" }, gap: 2, minHeight: 0, flex: 1 }}>
        <Sheet
          variant="outlined"
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "sm",
            minHeight: { xs: "360px", md: "500px" },
            maxHeight: "760px",
          }}
        >
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block", cursor: "grab", touchAction: "none" }} />

          {hoveredNode && (
            <Box
              sx={{
                position: "fixed",
                left: `${mousePos.x + 10}px`,
                top: `${mousePos.y + 10}px`,
                backgroundColor: "#ffffff",
                border: "1px solid #d1d5db",
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

        <Sheet variant="outlined" sx={{ borderRadius: "sm", p: 1.5, minHeight: "200px", overflow: "auto" }}>
          {selectedNodeId === null ? (
            <Typography level="body3">Select an instance to inspect its incoming and outgoing relationships.</Typography>
          ) : (
            <Stack spacing={1.25}>
              <Box>
                <Typography level="body2" sx={{ fontWeight: 600, overflowWrap: "anywhere" }}>
                  {graphData.nodes[selectedNodeId][0]}
                </Typography>
                <Typography level="body3">
                  Score {graphData.nodes[selectedNodeId][1]} | {nodeStats[selectedNodeId].connections} weighted connections
                </Typography>
              </Box>
              <Button size="sm" variant="outlined" onClick={() => setSelectedNodeId(null)}>
                Clear selection
              </Button>
              <Stack spacing={0.75}>
                {selectedRelationships.length === 0 ? (
                  <Typography level="body3">No relationships match the active filters.</Typography>
                ) : (
                  selectedRelationships.map((relationship) => (
                    <Box key={`${relationship.direction}-${relationship.type}-${relationship.instance}`} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                      <Chip size="sm" variant="soft" sx={{ color: edgeColors[relationship.type] }}>
                        {edgeNames[relationship.type]}
                      </Chip>
                      <Typography level="body3" sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
                        {relationship.direction} {relationship.instance}{relationship.weight > 1 ? ` (${relationship.weight})` : ""}
                      </Typography>
                    </Box>
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
