export type ActorId = "white-house" | "hegseth" | "lin" | "anthropic";
export type TopicId = "supply-chain-risk" | "first-amendment" | "military-ai";

export type Actor = {
  id: ActorId;
  name: string;
  short: string;
  role: string;
};

export type Topic = {
  id: TopicId;
  name: string;
};

export type Statement = {
  id: string;
  actor: ActorId;
  speaker: string;
  org: string;
  date: string;
  url: string;
  source: string;
  quote: string;
  card: string;
  topics: TopicId[];
};

export type Mismatch = {
  id: string;
  a: string;
  b: string;
  label: string;
};

export const ACTORS: Actor[] = [
  { id: "white-house", name: "White House", short: "WH", role: "Executive" },
  { id: "hegseth", name: "Pete Hegseth", short: "DoD", role: "Secretary of War" },
  { id: "lin", name: "Judge Rita Lin", short: "LIN", role: "N.D. Cal." },
  { id: "anthropic", name: "Anthropic", short: "ANT", role: "Claude" },
];

export const TOPICS: Topic[] = [
  { id: "supply-chain-risk", name: "Supply-chain risk" },
  { id: "first-amendment", name: "First Amendment" },
  { id: "military-ai", name: "Military AI use" },
];

// Every quote was pulled from a live URL. If a page failed, the row was dropped.
export const STATEMENTS: Statement[] = [
  {
    id: "wh-woke",
    actor: "white-house",
    speaker: "White House",
    org: "White House",
    date: "2026-02-27",
    url: "https://www.bbc.co.uk/news/articles/cm2q7z5mlrmo",
    source: "bbc.co.uk",
    quote:
      "a radical left, woke company attempting to control military activity",
    card: "a radical left, woke company attempting to control military activity",
    topics: ["military-ai", "supply-chain-risk"],
  },
  {
    id: "wh-tos",
    actor: "white-house",
    speaker: "White House",
    org: "White House",
    date: "2026-02-27",
    url: "https://www.theverge.com/policy/886489/pentagon-anthropic-trump-dod",
    source: "theverge.com",
    quote:
      "The Leftwing nut jobs at Anthropic have made a DISASTROUS MISTAKE trying to STRONG-ARM the Department of War, and force them to obey their Terms of Service instead of our Constitution.",
    card: "force them to obey their Terms of Service instead of our Constitution",
    topics: ["military-ai", "first-amendment"],
  },
  {
    id: "hegseth-scr",
    actor: "hegseth",
    speaker: "Pete Hegseth",
    org: "Department of War",
    date: "2026-02-27",
    url: "https://www.govinfo.gov/content/pkg/USCOURTS-cand-3_26-cv-01996/pdf/USCOURTS-cand-3_26-cv-01996-1.pdf",
    source: "govinfo.gov",
    quote:
      "I am directing the Department of War to designate Anthropic a Supply Chain Risk to National Security.",
    card: "designate Anthropic a Supply Chain Risk to National Security",
    topics: ["supply-chain-risk"],
  },
  {
    id: "hegseth-access",
    actor: "hegseth",
    speaker: "Pete Hegseth",
    org: "Department of War",
    date: "2026-02-27",
    url: "https://www.govinfo.gov/content/pkg/USCOURTS-cand-3_26-cv-01996/pdf/USCOURTS-cand-3_26-cv-01996-1.pdf",
    source: "govinfo.gov",
    quote:
      "the Department of War must have full, unrestricted access to Anthropic's models for every LAWFUL purpose in defense of the Republic.",
    card: "full, unrestricted access … for every LAWFUL purpose",
    topics: ["military-ai"],
  },
  {
    id: "anthropic-exceptions",
    actor: "anthropic",
    speaker: "Anthropic",
    org: "Anthropic",
    date: "2026-02-27",
    url: "https://www.anthropic.com/news/statement-comments-secretary-war",
    source: "anthropic.com",
    quote:
      "No amount of intimidation or punishment from the Department of War will change our position on mass domestic surveillance or fully autonomous weapons.",
    card: "will not change our position on mass surveillance or autonomous weapons",
    topics: ["military-ai"],
  },
  {
    id: "anthropic-reliable",
    actor: "anthropic",
    speaker: "Anthropic",
    org: "Anthropic",
    date: "2026-02-27",
    url: "https://www.anthropic.com/news/statement-comments-secretary-war",
    source: "anthropic.com",
    quote:
      "we do not believe that today's frontier AI models are reliable enough to be used in fully autonomous weapons.",
    card: "not reliable enough to be used in fully autonomous weapons",
    topics: ["military-ai"],
  },
  {
    id: "lin-blank",
    actor: "lin",
    speaker: "Judge Rita Lin",
    org: "N.D. Cal.",
    date: "2026-08-27",
    url: "https://www.cnn.com/2026/08/27/tech/anthropic-pentagon-supply-chain-risk-unlawful-hnk",
    source: "cnn.com",
    quote:
      "The empty invocation of national security is not a blank check to punish and retaliate against government critics.",
    card: "national security is not a blank check to punish and retaliate",
    topics: ["first-amendment", "supply-chain-risk"],
  },
  {
    id: "lin-illegal",
    actor: "lin",
    speaker: "Judge Rita Lin",
    org: "N.D. Cal.",
    date: "2026-08-27",
    url: "https://fedscoop.com/anthropic-government-ban-court-ruling/",
    source: "fedscoop.com",
    quote:
      "the broad measures imposed on Anthropic were illegal and baseless",
    card: "the broad measures imposed on Anthropic were illegal and baseless",
    topics: ["supply-chain-risk", "first-amendment"],
  },
  {
    id: "lin-1a",
    actor: "lin",
    speaker: "Judge Rita Lin",
    org: "N.D. Cal.",
    date: "2026-08-27",
    url: "https://www.cnn.com/2026/08/27/tech/anthropic-pentagon-supply-chain-risk-unlawful-hnk",
    source: "cnn.com",
    quote:
      "constituted unlawful retaliation in violation of the First Amendment",
    card: "unlawful retaliation in violation of the First Amendment",
    topics: ["first-amendment"],
  },
  {
    id: "lin-saboteur",
    actor: "lin",
    speaker: "Judge Rita Lin",
    org: "N.D. Cal.",
    date: "2026-08-27",
    url: "https://www.cnn.com/2026/08/27/tech/anthropic-pentagon-supply-chain-risk-unlawful-hnk",
    source: "cnn.com",
    quote:
      "None of that is consistent with a genuine fear that Anthropic is a saboteur who would poison its software to harm national security",
    card: "not consistent with a genuine fear that Anthropic is a saboteur",
    topics: ["supply-chain-risk"],
  },
  {
    id: "anthropic-welcome",
    actor: "anthropic",
    speaker: "Anthropic",
    org: "Anthropic",
    date: "2026-08-28",
    url: "https://techcrunch.com/2026/08/28/anthropic-gets-its-first-court-win-over-the-pentagons-supply-chain-risk-label/",
    source: "techcrunch.com",
    quote:
      "We welcome the court's ruling that this supply chain risk designation was unlawful",
    card: "We welcome the court's ruling that this designation was unlawful",
    topics: ["supply-chain-risk", "first-amendment"],
  },
];

export const MISMATCHES: Mismatch[] = [
  {
    id: "fight-wh-court",
    a: "wh-woke",
    b: "lin-blank",
    label: "WH vs court",
  },
  {
    id: "fight-scr",
    a: "hegseth-scr",
    b: "lin-illegal",
    label: "risk vs unlawful",
  },
  {
    id: "fight-use",
    a: "hegseth-access",
    b: "anthropic-exceptions",
    label: "all uses vs two lines",
  },
];
