import {
  ACTORS,
  MISMATCHES,
  STATEMENTS,
  TOPICS,
  type ActorId,
  type Statement,
  type TopicId,
} from "./record";

export type NodeKind = "actor" | "statement" | "topic";

export type GraphNode = {
  id: string;
  kind: NodeKind;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  meta?: string;
  actor?: ActorId;
  topics?: TopicId[];
};

export type EdgeKind = "said" | "about" | "mismatch";

export type GraphEdge = {
  id: string;
  kind: EdgeKind;
  from: string;
  to: string;
  label?: string;
};

export type DocketGraph = {
  width: number;
  height: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
  statements: Statement[];
};

// Hero cards only. The rest stay in `statements` for ask + citations.
const HERO: string[] = [
  "wh-woke",
  "lin-blank",
  "hegseth-scr",
  "lin-illegal",
  "hegseth-access",
  "anthropic-exceptions",
];

const ACTOR_POS: Record<ActorId, { x: number; y: number }> = {
  "white-house": { x: 70, y: 132 },
  hegseth: { x: 70, y: 387 },
  lin: { x: 1010, y: 217 },
  anthropic: { x: 1010, y: 472 },
};

const STATEMENT_POS: Record<string, { x: number; y: number }> = {
  "wh-woke": { x: 390, y: 132 },
  "lin-blank": { x: 690, y: 132 },
  "hegseth-scr": { x: 390, y: 302 },
  "lin-illegal": { x: 690, y: 302 },
  "hegseth-access": { x: 390, y: 472 },
  "anthropic-exceptions": { x: 690, y: 472 },
};

const TOPIC_POS: Record<TopicId, { x: number; y: number }> = {
  "supply-chain-risk": { x: 270, y: 630 },
  "first-amendment": { x: 540, y: 630 },
  "military-ai": { x: 810, y: 630 },
};

function actorNode(id: ActorId): GraphNode {
  const actor = ACTORS.find((item) => item.id === id);
  const pos = ACTOR_POS[id];
  if (!actor) {
    throw new Error(`missing actor ${id}`);
  }
  return {
    id,
    kind: "actor",
    x: pos.x,
    y: pos.y,
    w: 88,
    h: 88,
    label: actor.short,
    sub: actor.name,
    meta: actor.role,
    actor: id,
  };
}

function statementNode(row: Statement): GraphNode {
  const pos = STATEMENT_POS[row.id];
  if (!pos) {
    throw new Error(`missing hero position for ${row.id}`);
  }
  return {
    id: row.id,
    kind: "statement",
    x: pos.x,
    y: pos.y,
    w: 196,
    h: 108,
    label: row.card,
    sub: row.speaker,
    meta: `${formatDate(row.date)}  ·  ${row.source}`,
    actor: row.actor,
    topics: row.topics,
  };
}

function topicNode(id: TopicId): GraphNode {
  const topic = TOPICS.find((item) => item.id === id);
  const pos = TOPIC_POS[id];
  if (!topic) {
    throw new Error(`missing topic ${id}`);
  }
  return {
    id,
    kind: "topic",
    x: pos.x,
    y: pos.y,
    w: 168,
    h: 40,
    label: topic.name,
  };
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthIndex = Number(month) - 1;
  const label = months[monthIndex];
  if (!label || !day || !year) {
    return iso;
  }
  return `${Number(day)} ${label} ${year}`;
}

export function buildGraph(): DocketGraph {
  const heroRows = HERO.map((id) => {
    const row = STATEMENTS.find((item) => item.id === id);
    if (!row) {
      throw new Error(`missing statement ${id}`);
    }
    return row;
  });

  const nodes: GraphNode[] = [
    actorNode("white-house"),
    actorNode("hegseth"),
    actorNode("lin"),
    actorNode("anthropic"),
    ...heroRows.map(statementNode),
    topicNode("supply-chain-risk"),
    topicNode("first-amendment"),
    topicNode("military-ai"),
  ];

  const edges: GraphEdge[] = [];

  for (const row of heroRows) {
    edges.push({
      id: `said-${row.actor}-${row.id}`,
      kind: "said",
      from: row.actor,
      to: row.id,
    });
    for (const topic of row.topics) {
      edges.push({
        id: `about-${row.id}-${topic}`,
        kind: "about",
        from: row.id,
        to: topic,
      });
    }
  }

  for (const fight of MISMATCHES) {
    if (!HERO.includes(fight.a) || !HERO.includes(fight.b)) {
      continue;
    }
    edges.push({
      id: fight.id,
      kind: "mismatch",
      from: fight.a,
      to: fight.b,
      label: fight.label,
    });
  }

  return {
    width: 1080,
    height: 700,
    nodes,
    edges,
    statements: STATEMENTS,
  };
}
