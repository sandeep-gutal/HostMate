export type ParsedSection = {
  title: string;
  content: string;
};

const KNOWN =
  /^(opening|welcome|flag hoisting|lamp lighting|house rules|year in review|segment transitions?|transitions?|closing|vote of thanks|cake|birthday child intro|national anthem).*$/i;

function isHeader(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^#{1,3}\s+\S/.test(trimmed)) return true;
  if (/^\*\*.+\*\*$/.test(trimmed)) return true;
  if (KNOWN.test(trimmed.replace(/[:\-]+$/, "").trim())) return true;
  if (/^[A-Z][A-Za-z0-9 /&'\-]{2,}:\s*$/.test(trimmed)) return true;
  if (
    /^[A-Z][A-Z0-9 /&'\-]{4,}$/.test(trimmed) &&
    trimmed.length < 60 &&
    !trimmed.includes(".")
  ) {
    return true;
  }
  return false;
}

function cleanTitle(line: string): string {
  return line
    .trim()
    .replace(/^#{1,3}\s+/, "")
    .replace(/^\*\*|\*\*$/g, "")
    .replace(/[:\-]+$/, "")
    .trim();
}

export function parseScript(raw: string): ParsedSection[] {
  const text = raw.replace(/\r\n/g, "\n").trim();
  if (!text) return [];

  const lines = text.split("\n");
  const headerCount = lines.filter((l) => isHeader(l)).length;

  if (headerCount < 2) {
    return [{ title: "Full script", content: text }];
  }

  const sections: ParsedSection[] = [];
  let title = "Script";
  let buf: string[] = [];
  let started = false;

  const flush = () => {
    const content = buf.join("\n").trim();
    if (!started && !content) return;
    sections.push({ title, content });
    buf = [];
  };

  for (const line of lines) {
    if (isHeader(line)) {
      if (started || buf.some((l) => l.trim())) {
        flush();
      }
      title = cleanTitle(line) || "Section";
      started = true;
      continue;
    }
    buf.push(line);
  }
  flush();

  const useful = sections.filter((s) => s.content.length > 0);
  return useful.length ? useful : [{ title: "Full script", content: text }];
}

export function ensureCoreSections(sections: ParsedSection[]): ParsedSection[] {
  if (sections.length === 1 && sections[0].title === "Full script") {
    return sections;
  }
  return sections;
}
