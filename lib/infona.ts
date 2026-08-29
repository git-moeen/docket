export type InfonaStatus =
  | { kind: "off" }
  | { kind: "on"; url: string; tenant: string; kg: string };

export function infonaUrl(): string | undefined {
  const raw = process.env.INFONA_URL ?? process.env.INFONA_API_URL;
  if (!raw) {
    return undefined;
  }
  const trimmed = raw.trim().replace(/\/$/, "");
  return trimmed.length > 0 ? trimmed : undefined;
}

export function infonaStatus(): InfonaStatus {
  const url = infonaUrl();
  if (!url) {
    return { kind: "off" };
  }
  return {
    kind: "on",
    url,
    tenant: process.env.INFONA_TENANT?.trim() || "default",
    kg: process.env.INFONA_KG?.trim() || "docket",
  };
}

export async function askInfona(question: string): Promise<string> {
  const status = infonaStatus();
  if (status.kind === "off") {
    throw new Error("INFONA_URL is not set");
  }

  const { Client } = await import("@infona-ai/cli");
  const client = new Client({
    baseUrl: status.url,
    apiKey: process.env.INFONA_API_KEY,
    tenant: status.tenant,
  });
  const result = await client.ask(question, { kg: status.kg });
  const answer = pickAnswer(result);
  if (!answer) {
    throw new Error("Infona returned no answer");
  }
  return answer;
}

function pickAnswer(result: Record<string, unknown>): string | null {
  const keys = ["answer", "narrative_answer"];
  for (const key of keys) {
    const value = result[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }
  return null;
}
