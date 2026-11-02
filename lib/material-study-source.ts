import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { MATERIAL_SOURCE_FILES } from "./material-studies";

/** Server-only fixed allowlist; never accepts a user-provided filesystem path. */
export async function getMaterialStudySources() {
  return Object.fromEntries(await Promise.all(MATERIAL_SOURCE_FILES.map(async file =>
    [file, await readFile(path.join(process.cwd(), "components", file), "utf8")])));
}
