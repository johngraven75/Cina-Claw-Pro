// @vitest-environment node

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

type PackageManifest = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const manifest = JSON.parse(
  readFileSync(join(process.cwd(), 'package.json'), 'utf8'),
) as PackageManifest;

describe('packaged gateway runtime compatibility', () => {
  it('pins the last gateway-verified Electron and WebSocket runtime line', () => {
    expect(manifest.devDependencies?.electron).toBe('41.10.3');
    expect(manifest.dependencies?.ws).toBe('8.21.0');
  });
});
