import { MISMATCHES, STATEMENTS } from "./record";
import { formatDate } from "./graph";

export type Citation = {
  speaker: string;
  org: string;
  date: string;
  dateLabel: string;
  url: string;
  source: string;
  quote: string;
};

export type LocalAsk = {
  kind: "local";
  question: string;
  title: string;
  body: string;
  citations: Citation[];
  litNodes: string[];
  litEdges: string[];
};

function tokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function citationFor(id: string): Citation | null {
  const row = STATEMENTS.find((item) => item.id === id);
  if (!row) {
    return null;
  }
  return {
    speaker: row.speaker,
    org: row.org,
    date: row.date,
    dateLabel: formatDate(row.date),
    url: row.url,
    source: row.source,
    quote: row.quote,
  };
}

function citations(ids: string[]): Citation[] {
  const out: Citation[] = [];
  for (const id of ids) {
    const row = citationFor(id);
    if (row) {
      out.push(row);
    }
  }
  return out;
}

function unique(ids: string[]): string[] {
  return [...new Set(ids)];
}

function mismatchBundle(id: string): { nodes: string[]; edges: string[] } {
  const nodes = [id];
  const edges: string[] = [];
  for (const fight of MISMATCHES) {
    if (fight.a === id || fight.b === id) {
      nodes.push(fight.a, fight.b);
      edges.push(fight.id);
    }
  }
  const row = STATEMENTS.find((item) => item.id === id);
  if (row) {
    nodes.push(row.actor, ...row.topics);
    edges.push(`said-${row.actor}-${id}`);
    for (const topic of row.topics) {
      edges.push(`about-${id}-${topic}`);
    }
  }
  for (const nodeId of [...nodes]) {
    const other = STATEMENTS.find((item) => item.id === nodeId);
    if (!other) {
      continue;
    }
    nodes.push(other.actor, ...other.topics);
    edges.push(`said-${other.actor}-${other.id}`);
    for (const topic of other.topics) {
      edges.push(`about-${other.id}-${topic}`);
    }
  }
  return { nodes: unique(nodes), edges: unique(edges) };
}

function scoreStatement(questionTokens: string[], id: string): number {
  const row = STATEMENTS.find((item) => item.id === id);
  if (!row) {
    return 0;
  }
  const hay = tokens(
    [row.quote, row.card, row.speaker, row.org, row.source, ...row.topics].join(" "),
  );
  let score = 0;
  for (const token of questionTokens) {
    if (hay.includes(token)) {
      score += 2;
    }
  }
  return score;
}

export function askLocal(question: string): LocalAsk {
  const q = question.trim();
  const qTokens = tokens(q);
  const joined = qTokens.join(" ");

  const wantsFight =
    /\b(agree|disagree|mismatch|conflict|fight|both|vs|versus|differ|contradict|match)\b/.test(
      joined,
    ) || qTokens.includes("same");

  const wantsCourt = /\b(court|judge|lin|unlawful|blank|retaliation|amendment|illegal|baseless)\b/.test(
    joined,
  );
  const wantsWhiteHouse = /\b(white|house|trump|woke|radical|constitution|tos)\b/.test(
    joined,
  );
  const wantsHegseth = /\b(hegseth|pentagon|defense|dod|dow|supply|chain|risk|secretary)\b/.test(
    joined,
  );
  const wantsAnthropic = /\b(anthropic|claude|amodei|surveillance|weapon|autonomous|reliable|exception)\b/.test(
    joined,
  );

  if (wantsFight || (wantsWhiteHouse && wantsCourt)) {
    const left = "wh-woke";
    const right = "lin-blank";
    const extra = mismatchBundle(left);
    const extra2 = mismatchBundle("hegseth-scr");
    return {
      kind: "local",
      question: q,
      title: "They do not agree. Both lines stay.",
      body: "The White House called Anthropic a radical left, woke company trying to control the military. Judge Lin wrote that national security is not a blank check to punish critics. Hegseth designated a supply-chain risk. The same court called those measures illegal and baseless.",
      citations: citations([left, right, "hegseth-scr", "lin-illegal"]),
      litNodes: unique([...extra.nodes, ...extra2.nodes]),
      litEdges: unique([...extra.edges, ...extra2.edges]),
    };
  }

  if (wantsCourt && !wantsHegseth && !wantsWhiteHouse) {
    const ids = ["lin-blank", "lin-illegal", "lin-1a", "lin-saboteur"];
    const pack = ids.map(mismatchBundle);
    return {
      kind: "local",
      question: q,
      title: "The court kept the designation off the board.",
      body: "Judge Rita Lin, N.D. Cal., held the Pentagon's label unlawful First Amendment retaliation and called the broad measures illegal and baseless.",
      citations: citations(ids),
      litNodes: unique(pack.flatMap((item) => item.nodes)),
      litEdges: unique(pack.flatMap((item) => item.edges)),
    };
  }

  if (wantsWhiteHouse && !wantsCourt) {
    const pack = mismatchBundle("wh-woke");
    const tos = mismatchBundle("wh-tos");
    return {
      kind: "local",
      question: q,
      title: "The White House line, still on the record.",
      body: "BBC quotes the White House calling Anthropic a radical left, woke company attempting to control military activity. The official post, carried by The Verge, says the military answers to the Constitution, not a company's terms of service.",
      citations: citations(["wh-woke", "wh-tos"]),
      litNodes: unique([...pack.nodes, ...tos.nodes, "wh-tos"]),
      litEdges: unique([...pack.edges, ...tos.edges]),
    };
  }

  if (wantsHegseth && !wantsAnthropic) {
    const pack = mismatchBundle("hegseth-scr");
    const access = mismatchBundle("hegseth-access");
    return {
      kind: "local",
      question: q,
      title: "Hegseth named a supply-chain risk.",
      body: "On 27 Feb 2026 Hegseth directed the Department of War to designate Anthropic a Supply Chain Risk to National Security, and said the department must have unrestricted access for every lawful purpose. The court later called the designation illegal and baseless. Both stay.",
      citations: citations(["hegseth-scr", "hegseth-access", "lin-illegal"]),
      litNodes: unique([...pack.nodes, ...access.nodes]),
      litEdges: unique([...pack.edges, ...access.edges]),
    };
  }

  if (wantsAnthropic) {
    const pack = mismatchBundle("anthropic-exceptions");
    return {
      kind: "local",
      question: q,
      title: "Anthropic held two lines and did not move.",
      body: "Anthropic said it would not change its position on mass domestic surveillance or fully autonomous weapons, and that today's models are not reliable enough for those uses. After the ruling it welcomed the finding that the supply-chain designation was unlawful.",
      citations: citations([
        "anthropic-exceptions",
        "anthropic-reliable",
        "anthropic-welcome",
      ]),
      litNodes: unique([...pack.nodes, "anthropic-reliable", "anthropic-welcome"]),
      litEdges: unique([...pack.edges, "fight-use"]),
    };
  }

  const ranked = STATEMENTS.map((row) => ({
    id: row.id,
    score: scoreStatement(qTokens, row.id),
  }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) {
    const pack = mismatchBundle("wh-woke");
    const pack2 = mismatchBundle("hegseth-scr");
    return {
      kind: "local",
      question: q,
      title: "The fight, as filed.",
      body: "Four voices. One designation. A court that called it unlawful. Ask who said what, or whether they agree.",
      citations: citations(["wh-woke", "lin-blank", "hegseth-scr", "lin-illegal"]),
      litNodes: unique([...pack.nodes, ...pack2.nodes]),
      litEdges: unique([...pack.edges, ...pack2.edges]),
    };
  }

  const top = ranked.slice(0, 3).map((row) => row.id);
  const packs = top.map(mismatchBundle);
  const first = STATEMENTS.find((item) => item.id === top[0]);
  return {
    kind: "local",
    question: q,
    title: first ? `${first.speaker}, on the record.` : "On the record.",
    body: first ? `"${first.quote}"` : "Cited rows below.",
    citations: citations(top),
    litNodes: unique(packs.flatMap((item) => item.nodes)),
    litEdges: unique(packs.flatMap((item) => item.edges)),
  };
}
