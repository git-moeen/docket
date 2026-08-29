"use client";

import type { ActorId } from "@/lib/record";
import type { DocketGraph, GraphEdge, GraphNode } from "@/lib/graph";

type Tone = "idle" | "lit" | "dim";

const ACTOR_FILL: Record<ActorId, string> = {
  "white-house": "#c44738",
  hegseth: "#7d8c62",
  lin: "#efe6d6",
  anthropic: "#c9a36a",
};

const ACTOR_INK: Record<ActorId, string> = {
  "white-house": "#1a0c0a",
  hegseth: "#10140c",
  lin: "#1a1712",
  anthropic: "#1a140c",
};

function tone(id: string, lit: Set<string> | null, selected: string | null): Tone {
  if (selected === id) {
    return "lit";
  }
  if (!lit) {
    return "idle";
  }
  return lit.has(id) ? "lit" : "dim";
}

function nodeClass(id: string, lit: Set<string> | null, selected: string | null): string {
  const t = tone(id, lit, selected);
  if (t === "lit") {
    return "node-lit glow-paper";
  }
  if (t === "dim") {
    return "node-dim";
  }
  return "node-idle";
}

function edgeClass(id: string, kind: GraphEdge["kind"], lit: Set<string> | null): string {
  const t = tone(id, lit, null);
  const fight = kind === "mismatch" ? " glow-fight" : "";
  if (t === "lit") {
    return `edge-lit${fight} ${kind === "mismatch" ? "edge-draw-lit" : ""}`;
  }
  if (t === "dim") {
    return "edge-dim";
  }
  return kind === "mismatch" ? "edge-idle glow-fight edge-draw" : "edge-idle";
}

function findNode(graph: DocketGraph, id: string): GraphNode | undefined {
  return graph.nodes.find((node) => node.id === id);
}

function edgePath(graph: DocketGraph, edge: GraphEdge): string {
  const from = findNode(graph, edge.from);
  const to = findNode(graph, edge.to);
  if (!from || !to) {
    return "";
  }
  if (edge.kind === "mismatch") {
    const y = from.y;
    const x1 = from.x + from.w / 2 + 6;
    const x2 = to.x - to.w / 2 - 6;
    return `M ${x1} ${y} L ${x2} ${y}`;
  }
  if (edge.kind === "said") {
    const goingRight = to.x > from.x;
    const x1 = goingRight ? from.x + 46 : from.x - 46;
    const x2 = goingRight ? to.x - to.w / 2 : to.x + to.w / 2;
    const mid = (x1 + x2) / 2;
    return `M ${x1} ${from.y} C ${mid} ${from.y}, ${mid} ${to.y}, ${x2} ${to.y}`;
  }
  const x1 = from.x;
  const y1 = from.y + from.h / 2;
  const x2 = to.x;
  const y2 = to.y - to.h / 2;
  return `M ${x1} ${y1} C ${x1} ${y1 + 36}, ${x2} ${y2 - 36}, ${x2} ${y2}`;
}

function wrapQuote(text: string, width: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines.slice(0, 3);
}

export function Graph({
  graph,
  litNodes,
  litEdges,
  selected,
  onSelect,
}: {
  graph: DocketGraph;
  litNodes: string[] | null;
  litEdges: string[] | null;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const litNodeSet = litNodes ? new Set(litNodes) : null;
  const litEdgeSet = litEdges ? new Set(litEdges) : null;

  return (
    <svg
      viewBox={`0 0 ${graph.width} ${graph.height}`}
      width={graph.width}
      height={graph.height}
      role="img"
      aria-label="Cited graph of who said what"
      className="docket-grid block"
    >
      <rect width={graph.width} height={graph.height} fill="#0c0b09" />

      <text
        x={24}
        y={28}
        fill="#5c574d"
        fontSize={10}
        fontFamily="var(--font-mono)"
        letterSpacing={2}
      >
        PEOPLE → STATEMENTS → TOPICS
      </text>
      <text
        x={graph.width - 24}
        y={28}
        fill="#5c574d"
        fontSize={10}
        fontFamily="var(--font-mono)"
        textAnchor="end"
        letterSpacing={2}
      >
        MISMATCH STAYS
      </text>

      {graph.edges.map((edge) => {
        const from = findNode(graph, edge.from);
        const to = findNode(graph, edge.to);
        if (!from || !to) {
          return null;
        }
        const d = edgePath(graph, edge);
        const isFight = edge.kind === "mismatch";
        return (
          <g key={edge.id} className={edgeClass(edge.id, edge.kind, litEdgeSet)}>
            <path
              d={d}
              fill="none"
              stroke={isFight ? "#e25b2a" : "#4a443a"}
              strokeWidth={isFight ? 2.2 : edge.kind === "said" ? 1.4 : 1}
            />
            {isFight ? (
              <g transform={`translate(${(from.x + to.x) / 2}, ${from.y})`}>
                <circle r={13} fill="#0c0b09" stroke="#e25b2a" strokeWidth={1.4} />
                <text
                  y={4}
                  textAnchor="middle"
                  fill="#e25b2a"
                  fontSize={13}
                  fontFamily="var(--font-display)"
                >
                  ≠
                </text>
              </g>
            ) : null}
          </g>
        );
      })}

      {graph.nodes.map((node) => {
        if (node.kind === "actor" && node.actor) {
          return (
            <ActorMark
              key={node.id}
              node={node}
              actor={node.actor}
              className={nodeClass(node.id, litNodeSet, selected)}
              selected={selected === node.id}
              onSelect={onSelect}
            />
          );
        }
        if (node.kind === "statement") {
          return (
            <StatementMark
              key={node.id}
              node={node}
              className={nodeClass(node.id, litNodeSet, selected)}
              selected={selected === node.id}
              onSelect={onSelect}
            />
          );
        }
        return (
          <TopicMark
            key={node.id}
            node={node}
            className={nodeClass(node.id, litNodeSet, selected)}
            selected={selected === node.id}
            onSelect={onSelect}
          />
        );
      })}
    </svg>
  );
}

function ActorMark({
  node,
  actor,
  className,
  selected,
  onSelect,
}: {
  node: GraphNode;
  actor: ActorId;
  className: string;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const fill = ACTOR_FILL[actor];
  const ink = ACTOR_INK[actor];
  return (
    <g
      className={className}
      transform={`translate(${node.x}, ${node.y})`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(node.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onSelect(node.id);
        }
      }}
      style={{ cursor: "pointer" }}
    >
      <circle
        r={40}
        fill={fill}
        stroke={selected ? "#e7dfd0" : "#0c0b09"}
        strokeWidth={selected ? 2 : 1}
      />
      <text
        y={-2}
        textAnchor="middle"
        fill={ink}
        fontSize={16}
        fontFamily="var(--font-display)"
        letterSpacing={1}
      >
        {node.label}
      </text>
      <text
        y={58}
        textAnchor="middle"
        fill="#e7dfd0"
        fontSize={11}
        fontFamily="var(--font-mono)"
      >
        {node.sub}
      </text>
      <text
        y={74}
        textAnchor="middle"
        fill="#8d8678"
        fontSize={9}
        fontFamily="var(--font-mono)"
      >
        {node.meta}
      </text>
    </g>
  );
}

function StatementMark({
  node,
  className,
  selected,
  onSelect,
}: {
  node: GraphNode;
  className: string;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const lines = wrapQuote(`"${node.label}"`, 28);
  const x = -node.w / 2;
  const y = -node.h / 2;
  return (
    <g
      className={className}
      transform={`translate(${node.x}, ${node.y})`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(node.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onSelect(node.id);
        }
      }}
      style={{ cursor: "pointer" }}
    >
      <rect
        x={x}
        y={y}
        width={node.w}
        height={node.h}
        rx={4}
        fill="#14120e"
        stroke={selected ? "#e7dfd0" : "#3a342c"}
        strokeWidth={selected ? 1.6 : 1}
      />
      <text
        x={x + 12}
        y={y + 20}
        fill="#8d8678"
        fontSize={9}
        fontFamily="var(--font-mono)"
        letterSpacing={0.6}
      >
        {node.meta}
      </text>
      {lines.map((line, index) => (
        <text
          key={line}
          x={x + 12}
          y={y + 42 + index * 16}
          fill="#e7dfd0"
          fontSize={13}
          fontFamily="var(--font-display)"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function TopicMark({
  node,
  className,
  selected,
  onSelect,
}: {
  node: GraphNode;
  className: string;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const x = -node.w / 2;
  const y = -node.h / 2;
  return (
    <g
      className={className}
      transform={`translate(${node.x}, ${node.y})`}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(node.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onSelect(node.id);
        }
      }}
      style={{ cursor: "pointer" }}
    >
      <rect
        x={x}
        y={y}
        width={node.w}
        height={node.h}
        rx={20}
        fill="#16130f"
        stroke={selected ? "#e7dfd0" : "#3a342c"}
      />
      <text
        y={4}
        textAnchor="middle"
        fill="#cfc6b4"
        fontSize={11}
        fontFamily="var(--font-mono)"
        letterSpacing={0.8}
      >
        {node.label}
      </text>
    </g>
  );
}
