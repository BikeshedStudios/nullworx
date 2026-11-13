import { readFile } from "node:fs/promises";
import path from "node:path";
import { asciiPlayground } from "@/lib/ascii-playground";
import { AsciiPlayground } from "./ascii-playground";

export async function AsciiStudy() {
  const sources = Object.fromEntries(await Promise.all(asciiPlayground.files.map(async file => [file, await readFile(path.join(process.cwd(), "components/white-journey", file), "utf8")])));
  return <AsciiPlayground sources={sources} />;
}
