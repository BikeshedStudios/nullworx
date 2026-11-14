import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { FRONTIER_SOURCE_FILES } from "./visual-frontier";

/** Fixed allowlist; no request path is ever used to access the filesystem. */
export async function getFrontierSources() {
  return Object.fromEntries(await Promise.all(FRONTIER_SOURCE_FILES.map(async file =>
    [file, await readFile(join(process.cwd(), "components/visual-frontier", file), "utf8")])));
}
