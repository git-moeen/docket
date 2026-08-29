import { Docket } from "@/components/Docket";
import { buildGraph } from "@/lib/graph";
import { infonaStatus } from "@/lib/infona";

export default function Page() {
  const graph = buildGraph();
  const infona = infonaStatus();
  const infonaLabel =
    infona.kind === "on"
      ? `INFONA  ·  ${infona.url}  ·  kg ${infona.kg}`
      : "LOCAL CITED GRAPH  ·  Infona unset";

  return <Docket graph={graph} infonaLabel={infonaLabel} />;
}
