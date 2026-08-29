# Docket

The Pentagon branded Anthropic a supply-chain risk. A judge called that unlawful. Both lines stay.

```bash
npm i
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The graph is the product. Ask a question and the path lights. Every quote has a live URL. Nothing here is synthetic.

[Infona](https://github.com/infona-ai/infona-oss) is the data layer. This repo does not clone it. `npm run dev` uses the labeled local graph so you do not need Neo4j.

When a live Infona API is up:

```bash
INFONA_URL=http://localhost:8000 npm run ingest
INFONA_URL=http://localhost:8000 npm run dev
```

`ingest` runs `infona ingest` then `infona er rebuild` against that URL. Ask talks to the same API. If Infona is unset or down, the page says so and stays on the local cited graph.
