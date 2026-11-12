import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkPublicAssets } from '../check-public-assets.mjs';

test('release public allowlist accepts reviewed bytes and rejects media/sidecars/frames', async () => {
  const root = await mkdtemp(join(tmpdir(), 'nullworx-public-guard-'));
  try {
    await cp('public', root, { recursive: true });
    assert.equal((await checkPublicAssets(root)).length, 2);
    for (const name of ['loop30.mp4', 'fish-data.json', 'mask.png', 'frame.webp']) {
      const file = join(root, name);
      await writeFile(file, 'fixture only, no source media');
      await assert.rejects(checkPublicAssets(root), /Unapproved public asset/);
      await rm(file);
    }
    const extra = join(root, 'media');
    await mkdir(extra);
    await writeFile(join(extra, 'fin-motion.json'), '{}');
    await assert.rejects(checkPublicAssets(root), /Unapproved public asset/);
    await rm(extra, { recursive: true });
    await writeFile(join(root, 'material-wave-a/mineral-study.webp'), 'changed');
    await assert.rejects(checkPublicAssets(root), /hash drift/);
    await rm(join(root, 'material-wave-a/mineral-study.webp'));
    await symlink('/etc/hosts', join(root, 'material-wave-a/mineral-study.webp'));
    await assert.rejects(checkPublicAssets(root), /Unapproved public asset/);
  } finally { await rm(root, { recursive: true, force: true }); }
});
