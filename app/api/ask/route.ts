import { askLocal } from "@/lib/ask-local";
import { askInfona, infonaStatus } from "@/lib/infona";

export const dynamic = "force-dynamic";

type AskBody = {
  question?: unknown;
};

export async function POST(request: Request): Promise<Response> {
  let body: AskBody;
  try {
    body = (await request.json()) as AskBody;
  } catch {
    return Response.json({ error: "Expected JSON." }, { status: 400 });
  }

  if (typeof body.question !== "string" || body.question.trim() === "") {
    return Response.json({ error: "Ask who said what." }, { status: 400 });
  }

  const question = body.question.trim();
  const local = askLocal(question);
  const status = infonaStatus();

  if (status.kind === "off") {
    return Response.json({
      layer: "local",
      infona: status,
      ...local,
    });
  }

  try {
    const answer = await askInfona(question);
    return Response.json({
      layer: "infona",
      infona: status,
      ...local,
      title: local.title,
      body: answer,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Infona ask failed";
    return Response.json({
      layer: "local",
      infona: status,
      infonaError: detail,
      ...local,
    });
  }
}
