"use client";

import { useMemo, useState } from "react";
import { Graph } from "@/components/Graph";
import type { Citation } from "@/lib/ask-local";
import type { DocketGraph } from "@/lib/graph";
import { ACTORS, STATEMENTS, TOPICS } from "@/lib/record";

type Layer = "local" | "infona";

type AskResponse = {
  layer: Layer;
  title: string;
  body: string;
  citations: Citation[];
  litNodes: string[];
  litEdges: string[];
  infonaError?: string;
};

const CHIPS = [
  "Do they agree?",
  "Who called it a supply-chain risk?",
  "What did the court say?",
  "Why did Anthropic refuse?",
];

export function Docket({
  graph,
  infonaLabel,
}: {
  graph: DocketGraph;
  infonaLabel: string;
}) {
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AskResponse | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const selectedCopy = useMemo(() => detailFor(selected), [selected]);

  async function submit(next: string) {
    const q = next.trim();
    if (!q) {
      return;
    }
    setBusy(true);
    setError(null);
    setQuestion(q);
    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const payload: unknown = await response.json();
      if (!response.ok || !isAskResponse(payload)) {
        setError(readError(payload));
        return;
      }
      setResult(payload);
      setSelected(payload.citations[0] ? speakerToNode(payload.citations[0].speaker) : null);
    } catch {
      setError("Ask failed. The local graph is still on the page.");
    } finally {
      setBusy(false);
    }
  }

  const litNodes = result?.litNodes ?? null;
  const litEdges = result?.litEdges ?? null;

  return (
    <main className="min-h-screen bg-[#0c0b09] text-[#e7dfd0]">
      <div className="mx-auto w-[1080px] px-0 py-7">
        <header className="mb-5 flex items-end justify-between px-1">
          <div>
            <p className="font-display text-[56px] leading-none tracking-tight">Docket</p>
            <p className="mt-2 max-w-[620px] text-[15px] leading-snug text-[#cfc6b4]">
              The Pentagon branded Anthropic a supply-chain risk. A judge called
              that unlawful. Both lines stay.
            </p>
          </div>
          <div className="text-right text-[11px] leading-5 text-[#8d8678]">
            <div>LATE AUG 2026</div>
            <div>N.D. CAL. · 26-cv-01996</div>
            <div>{infonaLabel}</div>
          </div>
        </header>

        <section className="overflow-hidden rounded-sm border border-[#2c2822] bg-[#0c0b09]">
          <Graph
            graph={graph}
            litNodes={litNodes}
            litEdges={litEdges}
            selected={selected}
            onSelect={setSelected}
          />
        </section>

        <form
          className="mt-5 flex gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void submit(question);
          }}
        >
          <label className="sr-only" htmlFor="ask">
            Ask the record
          </label>
          <input
            id="ask"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask who said what"
            className="h-12 flex-1 border border-[#3a342c] bg-[#14120e] px-4 text-[14px] text-[#e7dfd0] outline-none placeholder:text-[#6f6a60] focus:border-[#e7dfd0]"
          />
          <button
            type="submit"
            disabled={busy}
            className="h-12 border border-[#e7dfd0] px-5 text-[12px] tracking-[0.14em] uppercase disabled:opacity-50"
          >
            {busy ? "Asking" : "Ask"}
          </button>
        </form>

        <div className="mt-3 flex flex-wrap gap-2">
          {CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => void submit(chip)}
              className="border border-[#2c2822] px-3 py-1.5 text-[11px] text-[#cfc6b4] hover:border-[#e7dfd0] hover:text-[#e7dfd0]"
            >
              {chip}
            </button>
          ))}
        </div>

        {error ? <p className="mt-4 text-[13px] text-[#e25b2a]">{error}</p> : null}

        {result ? (
          <section className="mt-6 border-t border-[#2c2822] pt-5">
            <p className="text-[10px] tracking-[0.16em] text-[#8d8678] uppercase">
              {result.layer === "infona" ? "Infona answer · path from local cited graph" : "Local cited graph"}
            </p>
            <h2 className="font-display mt-2 text-[28px] leading-tight">{result.title}</h2>
            <p className="mt-3 max-w-[760px] text-[15px] leading-relaxed text-[#d8d0c2]">
              {result.body}
            </p>
            {result.infonaError ? (
              <p className="mt-2 text-[12px] text-[#8d8678]">
                Infona is set but ask failed ({result.infonaError}). Showing the local graph.
              </p>
            ) : null}
            <ol className="mt-5 space-y-3">
              {result.citations.map((row) => (
                <li key={`${row.url}-${row.quote}`} className="max-w-[760px]">
                  <p className="text-[11px] text-[#8d8678]">
                    {row.speaker} · {row.dateLabel} · {row.org}
                  </p>
                  <p className="font-display mt-1 text-[18px] leading-snug">
                    "{row.quote}"
                  </p>
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-[11px] text-[#c9a36a] underline decoration-[#3a342c] underline-offset-4 hover:text-[#e7dfd0]"
                  >
                    {row.source}
                  </a>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {selectedCopy ? (
          <aside className="mt-6 border-t border-[#2c2822] pt-4 text-[12px] text-[#8d8678]">
            <span className="text-[#cfc6b4]">{selectedCopy.kicker}</span>
            {selectedCopy.line}
          </aside>
        ) : (
          <p className="mt-6 text-[12px] text-[#5c574d]">
            Click a node. Ask a question. The path lights. Every quote has a live URL.
          </p>
        )}
      </div>
    </main>
  );
}

function speakerToNode(speaker: string): string | null {
  const actor = ACTORS.find((item) => item.name === speaker);
  if (actor) {
    return actor.id;
  }
  const row = STATEMENTS.find((item) => item.speaker === speaker);
  return row?.id ?? null;
}

function detailFor(id: string | null): { kicker: string; line: string } | null {
  if (!id) {
    return null;
  }
  const actor = ACTORS.find((item) => item.id === id);
  if (actor) {
    return { kicker: `${actor.name}. `, line: actor.role };
  }
  const topic = TOPICS.find((item) => item.id === id);
  if (topic) {
    return { kicker: `${topic.name}. `, line: "A live fight, not a resolved field." };
  }
  const row = STATEMENTS.find((item) => item.id === id);
  if (row) {
    return { kicker: `${row.speaker} · ${row.source}. `, line: `"${row.quote}"` };
  }
  return null;
}

function isAskResponse(value: unknown): value is AskResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (!("layer" in value) || !("title" in value) || !("body" in value)) {
    return false;
  }
  if (!("citations" in value) || !("litNodes" in value) || !("litEdges" in value)) {
    return false;
  }
  return (
    (value.layer === "local" || value.layer === "infona") &&
    typeof value.title === "string" &&
    typeof value.body === "string" &&
    Array.isArray(value.citations) &&
    Array.isArray(value.litNodes) &&
    Array.isArray(value.litEdges)
  );
}

function readError(value: unknown): string {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error;
  }
  return "Ask failed.";
}
