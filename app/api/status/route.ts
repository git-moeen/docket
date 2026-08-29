import { infonaStatus } from "@/lib/infona";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return Response.json({ infona: infonaStatus() });
}
