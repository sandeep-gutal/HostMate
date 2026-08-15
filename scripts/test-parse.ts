import { parseScript } from "../src/lib/parse-script";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const split = parseScript(`## Opening\nHello\n## Closing\nBye`);
assert(split.length === 2, "expected 2 sections");
assert(split[0].title === "Opening", split[0].title);
assert(split[1].content.includes("Bye"), "closing content");

const block = parseScript("Just a speech with no headers at all.");
assert(block.length === 1 && block[0].title === "Full script", "single block");

console.log("parse-script ok");
