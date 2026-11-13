import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// Reviewed baseline public files only. A new asset needs its own rights review.
export const approvedAssets = {
  // Six owner-approved Signature Hero review captures, copied without re-encoding.
  'signature-hero-01/carbon-1440.png': '819fb12d94901ad7e9c71094e138ee8c4745eef27a3a7da43f5dc7a46cf434e0',
  'signature-hero-01/carbon-390.png': 'e4544a10c345d51adf76a43d68ec19d459987078ba2d34076420319ec7fe9200',
  'signature-hero-01/porcelain-1440.png': 'c63e526bb9f3fd037cb5d75d5bffc708f98108869a72076de7c4331aa4948050',
  'signature-hero-01/porcelain-390.png': '083f23a2817506f4f0e28c87994b4a112eb61349fcf353e33dac05ca7117d2f9',
  'signature-hero-01/cobalt-1440.png': 'c9f5e94d70ac12fcdb4badf63f87a0da51966653143e607e962d4b1052e1027d',
  'signature-hero-01/cobalt-390.png': '542f968b3a3ad20a62470ac931dcb8ce1dffc21a5df0834c608a325b07e91ec5',
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
  console.log('PASS: only the eight reviewed public assets; no video, sidecars, masks or extracted frames.');
}
