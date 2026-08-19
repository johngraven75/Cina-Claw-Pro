// @vitest-environment node

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const workflowsRoot = join(process.cwd(), '.github', 'workflows');

function nodeVersions(workflow: string): string[] {
  const content = readFileSync(join(workflowsRoot, workflow), 'utf8');
  return [...content.matchAll(/node-version:\s*['"]?([^'"\s]+)/g)]
    .map((match) => match[1])
    .filter((version) => !version.startsWith('${{'));
}

describe('CI Node runtime standard', () => {
  it('uses the Node.js 24 release line for every explicit workflow declaration', () => {
    const workflowFiles = readdirSync(workflowsRoot).filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'));
    const explicitVersions = workflowFiles.flatMap(nodeVersions);

    expect(explicitVersions.length).toBeGreaterThan(0);
    for (const version of explicitVersions) {
      expect(version).toMatch(/^24(?:\.\d+\.\d+)?$/);
    }

    const e2eWorkflow = readFileSync(join(workflowsRoot, 'electron-e2e.yml'), 'utf8');
    expect(e2eWorkflow).toMatch(/node:\s*'24(?:\.15\.0)?'/);
    expect(e2eWorkflow).not.toMatch(/node:\s*'2[02]/);
  });
});
