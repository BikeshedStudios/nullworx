import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { FORGE_STUDIES } from "./forge-studies";

/** Server-only, fixed allowlist. Code shown to readers is the source used by the preview. */
export async function getForgeStudySources() {
  const files = [...new Set(FORGE_STUDIES.flatMap(study => [...study.files]))];
  return Object.fromEntries(await Promise.all(files.map(async file => [file, await readFile(path.join(process.cwd(), "components/forge-factory-01", file), "utf8")])));
}
