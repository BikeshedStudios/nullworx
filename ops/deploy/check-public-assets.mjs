import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Reviewed baseline public files only. A new asset needs its own rights review.
export const approvedAssets = {
  'material-wave-a/mineral-study.webp': '7821ec1ef7053b25259421e746a533e001702df081a113ac38db24bb0542edba',
  'tools/fin-editor-012.html': '4a2811a7e37a49611c0fe336e090f135ee238b52495b0ce0df325950f9ec2c85',
};
export async function checkPublicAssets(root = 'public') {
  const found = [];
  async function walk(directory, prefix = '') {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const name = prefix + entry.name;
      if (entry.isDirectory()) await walk(resolve(directory, entry.name), name + '/');
      else {
        if (!entry.isFile() || !Object.hasOwn(approvedAssets, name)) throw new Error(`Unapproved public asset: ${name}`);
        const bytes = await readFile(resolve(directory, entry.name));
        const sha256 = createHash('sha256').update(bytes).digest('hex');
        if (sha256 !== approvedAssets[name]) throw new Error(`Public asset hash drift: ${name}`);
        found.push({ path: name, bytes: bytes.length, sha256 });
      }
    }
  }
  await walk(root);
  if (found.length !== Object.keys(approvedAssets).length) throw new Error('Missing approved public asset');
  return found;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(await checkPublicAssets(), null, 2));
  console.log('PASS: only the two reviewed public assets; no video, sidecars, masks or extracted frames.');
}
