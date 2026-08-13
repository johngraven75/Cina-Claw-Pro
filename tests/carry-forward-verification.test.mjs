import { readFile } from 'node:fs/promises';
import test from 'node:test';
import assert from 'node:assert/strict';

const checks = [
  ['productName: Cina-Claw Pro', 'electron-builder.yml'],
  ['artifactName: Cina-Claw-Pro-${version}-${os}-${arch}.${ext}', 'electron-builder.yml'],
  ['"openclaw": "2026.7.1"', 'package.json'],
  ['export function CinaCommandCenter', 'src/pages/Chat/CinaCommandCenter.tsx'],
  ['.cina-core-card', 'src/styles/globals.css'],
  ['composer.attachFiles', 'src/pages/Chat/ChatInput.tsx'],
  ['openrouter/free', 'src/lib/providers.ts'],
  ['gemini-3-flash-preview', 'src/lib/providers.ts'],
  ['gemma4:latest', 'src/lib/providers.ts'],
  ['applyCinaClawAutonomyDefaults', 'electron/utils/cina-claw-defaults.ts'],
  ['safeStorage.encryptString', 'electron/services/secrets/secret-store.ts'],
  ['webapp-testing', 'resources/skills/preinstalled-manifest.json'],
  ['cina-curated-2026.08.13', 'resources/skills/preinstalled-manifest.json'],
  ['google-agent-skills-catalog', 'resources/skills/preinstalled-manifest.json'],
  ['voltagent-awesome-agent-skills-catalog', 'resources/skills/preinstalled-manifest.json'],
  ['export function Agents', 'src/pages/Agents/index.tsx'],
  ['export function Cron', 'src/pages/Cron/index.tsx'],
  ['"commandCenter"', 'shared/i18n/locales/en/chat.json'],
  ['export const VOICE_PROFILES', 'shared/voice.ts'],
  ['export function createVoiceApi', 'electron/services/voice-api.ts'],
  ['## Default Model Behavior', 'resources/context/AGENTS.clawx.md'],
  ['verify:carry-forward', 'package.json'],
];

test('every accepted Cina-Claw Pro capability remains present', async () => {
  for (const [token, file] of checks) assert.match(await readFile(file, 'utf8'), new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${file} must retain ${token}`);
});

test('the published registry documents every enforced token', async () => {
  const registry = await readFile('docs/CARRY_FORWARD.md', 'utf8');
  for (const [token] of checks) assert.ok(registry.includes(token), `registry must document ${token}`);
});
