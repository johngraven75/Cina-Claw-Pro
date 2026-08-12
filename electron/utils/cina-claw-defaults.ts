type ConfigRecord = Record<string, unknown>;

function record(value: unknown): ConfigRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as ConfigRecord : {};
}

/** Seed safe, bounded autonomous behavior without overwriting operator choices. */
export function applyCinaClawAutonomyDefaults(config: ConfigRecord): boolean {
  let changed = false;
  const tools = record(config.tools);
  if (tools.codeMode === undefined) {
    tools.codeMode = { enabled: true, maxPendingToolCalls: 24, timeoutMs: 300_000 };
    changed = true;
  } else if (tools.codeMode && typeof tools.codeMode === 'object' && !Array.isArray(tools.codeMode)) {
    // Cina-Claw v1.0.2 seeded pre-release names that OpenClaw 2026.7.1
    // rejects under its strict CodeMode schema. Migrate them in place so an
    // affected installation can recover before Gateway validation runs.
    const codeMode = tools.codeMode as ConfigRecord;
    if (codeMode.maxPendingToolCalls === undefined && typeof codeMode.maxToolCalls === 'number') {
      codeMode.maxPendingToolCalls = codeMode.maxToolCalls;
      changed = true;
    }
    if (codeMode.timeoutMs === undefined && typeof codeMode.maxDurationMs === 'number') {
      codeMode.timeoutMs = codeMode.maxDurationMs;
      changed = true;
    }
    if ('maxToolCalls' in codeMode) { delete codeMode.maxToolCalls; changed = true; }
    if ('maxDurationMs' in codeMode) { delete codeMode.maxDurationMs; changed = true; }
    tools.codeMode = codeMode;
  }
  const experimental = record(tools.experimental);
  if (experimental.planTool === undefined) { experimental.planTool = true; changed = true; }
  tools.experimental = experimental;
  const exec = record(tools.exec);
  if (exec.host === undefined) { exec.host = 'gateway'; changed = true; }
  if (exec.security === undefined) { exec.security = 'allowlist'; changed = true; }
  if (exec.ask === undefined) { exec.ask = 'on-miss'; changed = true; }
  tools.exec = exec;
  config.tools = tools;

  const agents = record(config.agents);
  const defaults = record(agents.defaults);
  if (defaults.maxConcurrent === undefined) { defaults.maxConcurrent = 4; changed = true; }
  const subagents = record(defaults.subagents);
  if (subagents.allowAgents === undefined) {
    subagents.allowAgents = Array.isArray(subagents.allow) ? subagents.allow : ['*'];
    changed = true;
  }
  // OpenClaw's strict Subagent schema calls this field allowAgents. Remove
  // the obsolete v1.0.2 alias even when a canonical value already exists.
  if ('allow' in subagents) { delete subagents.allow; changed = true; }
  if (subagents.maxConcurrent === undefined) { subagents.maxConcurrent = 4; changed = true; }
  if (subagents.delegationMode === undefined) { subagents.delegationMode = 'prefer'; changed = true; }
  if (subagents.runTimeoutSeconds === undefined) { subagents.runTimeoutSeconds = 900; changed = true; }
  if (subagents.announceTimeoutMs === undefined) { subagents.announceTimeoutMs = 120_000; changed = true; }
  if (subagents.archiveAfterMinutes === undefined) { subagents.archiveAfterMinutes = 60; changed = true; }
  defaults.subagents = subagents;
  agents.defaults = defaults;
  config.agents = agents;
  return changed;
}
