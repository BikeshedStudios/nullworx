import { createHash } from "node:crypto";
import { readFile, copyFile, mkdir, access } from "node:fs/promises";
import path from "node:path";
const args = process.argv.slice(2),
  flag = args.indexOf("--experiments");
if (flag < 0 || !args[flag + 1])
  throw new Error(
    "Usage: pnpm media:provision --experiments /absolute/path/to/experiments",
  );
const source = path.resolve(args[flag + 1]),
  dest = path.resolve("public/media/local");
const entries = [
  [
    "loop30/loop30-v2.mp4",
    "loop30-v2.mp4",
    "807bb27edac1d4bd71be9c5efc79d6386c4d97bd26589dee5e7fa784e029b238",
  ],
  [
    "ui-forge-digital-wake-01/public/media/fish-annotations.json",
    "fish-annotations.json",
    null,
  ],
  [
    "ui-forge-digital-wake-01/public/media/fish-data.json",
    "fish-data.json",
    null,
  ],
  [
    "ui-forge-digital-wake-01/public/media/fin-motion-012.json",
    "fin-motion-012.json",
    "bfa4c0d882ae9e97fc29bad34f252d2084f57efcd555c54e6b88beba161fa96a",
  ],
  [
    "ui-forge-digital-wake-01/public/media/fin-regions-012.json",
    "fin-regions-012.json",
    "9d9a356a8b8bcf438dea432cd8178d16700ceaf674a6073b0a85c44de8a106d0",
  ],
  [
    "ui-forge-white-journey-01/public/media/local/loop30-v2-vp9.webm",
    "loop30-v2-vp9.webm",
    "07b91c8db464f093509b23876e7b4bc2ca9c14f51c7cd2a5ae8c11540154310b",
  ],
];
const hash = (b) => createHash("sha256").update(b).digest("hex");
const prepared = [];
for (const [rel, name, expected] of entries) {
  const file = path.join(source, rel);
  if (
    name.endsWith(".webm") &&
    !(await access(file).then(
      () => true,
      () => false,
    ))
  ) {
    console.log("Optional VP9 compatibility copy absent");
    continue;
  }
  const buffer = await readFile(file),
    sha = hash(buffer);
  if (expected && sha !== expected)
    throw new Error(`Source hash mismatch: ${name}`);
  prepared.push({ file, name, sha, buffer });
}
const fin = JSON.parse(
  prepared.find((p) => p.name === "fin-motion-012.json").buffer.toString(),
);
if (
  fin.fishDataSha256 !==
    prepared.find((p) => p.name === "fish-data.json").sha ||
  fin.regionSha256 !==
    prepared.find((p) => p.name === "fin-regions-012.json").sha
)
  throw new Error("Fin/mask linkage mismatch");
await mkdir(dest, { recursive: true });
for (const p of prepared) {
  const target = path.join(dest, p.name),
    exists = await access(target).then(
      () => true,
      () => false,
    );
  if (exists) {
    if (hash(await readFile(target)) !== p.sha)
      throw new Error(`Preserving existing different file: ${target}`);
  } else await copyFile(p.file, target, 1);
  console.log(`${p.name} ${p.buffer.length} bytes SHA256 ${p.sha}`);
}
console.log(
  "Local-only provisioning complete. No upload, publication, or rights grant. Restart an existing production preview to refresh public files.",
);
