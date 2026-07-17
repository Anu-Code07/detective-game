"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { InvestigationCase, InvestigationState } from "@/types/case";
import { useGameStore } from "@/store/game-store";

export function CaseBoardPanel({
  caseData,
  investigation,
  caseId,
}: {
  caseData: InvestigationCase;
  investigation: InvestigationState | null;
  caseId: string;
}) {
  const { addBoardConnection } = useGameStore();
  const discovered = useMemo(
    () => new Set(investigation?.discoveredEvidence ?? []),
    [investigation?.discoveredEvidence]
  );

  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = [];
    caseData.suspects.forEach((s, i) => {
      nodes.push({
        id: s.id,
        position: { x: 50 + i * 180, y: 50 },
        data: { label: `👤 ${s.name}` },
        style: { background: "#1a2540", border: "1px solid #f59e0b40", color: "#e2e8f0", borderRadius: 8, padding: 8, fontSize: 12 },
      });
    });
    caseData.evidence
      .filter((e) => discovered.has(e.id))
      .forEach((e, i) => {
        nodes.push({
          id: e.id,
          position: { x: 80 + (i % 3) * 200, y: 200 + Math.floor(i / 3) * 100 },
          data: { label: `📎 ${e.title}` },
          style: { background: "#121a2e", border: "1px solid #3b82f640", color: "#94a3b8", borderRadius: 8, padding: 8, fontSize: 11, maxWidth: 160 },
        });
      });
    caseData.timeline
      .filter((t) => t.known || investigation?.discoveredTimeline.includes(t.id))
      .forEach((t, i) => {
        nodes.push({
          id: t.id,
          position: { x: 100 + i * 160, y: 400 },
          data: { label: `⏱ ${t.title}` },
          style: { background: "#0c1220", border: "1px solid #a855f740", color: "#c4b5fd", borderRadius: 8, padding: 8, fontSize: 11 },
        });
      });
    return nodes;
  }, [caseData, discovered, investigation]);

  const initialEdges: Edge[] = useMemo(
    () =>
      (investigation?.boardConnections ?? []).map((c) => ({
        id: c.id,
        source: c.source,
        target: c.target,
        label: c.label,
        style: { stroke: "#f59e0b80" },
        labelStyle: { fill: "#f59e0b", fontSize: 10 },
      })),
    [investigation]
  );

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const label = "possible link";
      addBoardConnection(caseId, connection.source, connection.target, label);
      setEdges((eds) => addEdge({ ...connection, label, style: { stroke: "#f59e0b80" } }, eds));
    },
    [caseId, addBoardConnection, setEdges]
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Case Board</h2>
      <p className="text-sm text-slate-400">
        Drag to connect evidence, people, and events. Connections are saved. AI never confirms guilt.
      </p>
      <div className="h-[min(500px,60vh)] sm:h-[500px] rounded-xl border border-white/10 overflow-hidden bg-[#080c16] touch-pan-x touch-pan-y">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background color="#ffffff10" gap={20} />
          <Controls className="!bg-slate-800 !border-white/10" />
          <MiniMap className="!bg-slate-900" />
        </ReactFlow>
      </div>
      <div className="flex flex-wrap gap-2">
        {caseData.evidenceRelationships
          .filter((r) => r.suggested)
          .map((r, i) => (
            <span key={i} className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Hint: {r.from} → {r.to} ({r.label})
            </span>
          ))}
      </div>
    </div>
  );
}
