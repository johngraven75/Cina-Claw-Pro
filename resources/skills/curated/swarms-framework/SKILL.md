---
name: swarms-framework
description: Design, implement, test, review, and troubleshoot bounded workflows built with kyegomez/swarms. Use when the user mentions the Swarms Python framework, Agent, SequentialWorkflow, concurrent or hierarchical multi-agent architectures, tools, memory, autosave, model providers, or Swarms integrations.
---

# Swarms Framework

Use the framework as an explicitly scoped development dependency. A skill trigger does not authorize package installation, model calls, remote tools, persistent memory, or spawning agents.

## Design the workflow

1. Confirm the framework version, target repository, task contract, data sensitivity, model/provider, budget, and desired architecture.
2. Define each agent's input, output, allowed tools, data access, maximum loops, concurrency, timeout, retry limit, and stop condition.
3. Start with the smallest architecture that proves the task. Prefer one agent and one loop before adding orchestration.
4. Fetch current upstream API documentation and inspect installed signatures before writing version-sensitive code.
5. Unit-test orchestration with a fake or deterministic model and mocked tools. Run a live model workflow only when explicitly requested with a clear cost ceiling.
6. Report model and tool calls, persistence, artifacts, failures, costs, and how to stop or resume safely.

## Safe defaults

For examples and initial tests, use `max_loops=1`, disable persistent memory and autosave, omit tools, avoid remote MCP endpoints, and keep concurrency at one unless the user needs otherwise. Store state only in an explicit project path and never in hidden session data.

## Boundaries

- Do not install packages, request or reuse API keys, contact model providers, connect remote MCP servers, execute agent tools, or launch a multi-agent run merely because this skill triggered.
- Do not use automatic or unbounded loops. Set finite limits for tokens, time, retries, agents, concurrency, and spend.
- Review tool code and permissions. Use allowlists and require confirmation for destructive, public, costly, or external-write actions.
- Keep secrets in user-controlled secret storage, never source code or logs. Avoid placing sensitive prompts or outputs in persistent memory or autosave artifacts.
- Do not invent agent capabilities or report a simulated workflow as executed. Separate design, mocked validation, and live results.
- Follow current Codex delegation rules; a Swarms design request does not itself authorize this assistant to spawn subagents.

Source: https://github.com/kyegomez/swarms (Apache-2.0). The Python package, models, credentials, memory, and runtime are not bundled.
