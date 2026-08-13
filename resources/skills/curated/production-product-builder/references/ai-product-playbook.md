# AI Product Engineering Playbook

## Table of contents

1. Decide whether AI belongs
2. Architecture patterns
3. Model and provider selection
4. Tool-calling and agents
5. Retrieval and knowledge
6. Safety, privacy, and security
7. Evaluation and observability
8. Cost, latency, and reliability
9. Release checklist

## 1. Decide whether AI belongs

Use an AI model only when the task benefits from semantic judgment, generation, extraction from varied inputs, multimodal understanding, or natural-language interaction. Prefer deterministic code for permissions, money, quotas, calculations, workflow state, schema validation, and irreversible actions.

Define:

- the user decision or outcome being improved;
- acceptable error and abstention behavior;
- required sources, freshness, privacy class, latency, and cost ceiling;
- the deterministic controls surrounding the probabilistic component;
- a useful fallback when the model or provider is unavailable.

Never present model output as authoritative merely because it is fluent.

## 2. Architecture patterns

| Need | Pattern | Key controls |
|---|---|---|
| Structured extraction | model -> typed schema -> validation -> repair/reject | confidence/coverage checks, source spans |
| Content drafting | context -> generation -> preview/edit -> publish | provenance, policy, human confirmation |
| Question answering | retrieval -> grounded answer -> citations | access-filtered retrieval, abstention |
| Classification/routing | constrained labels -> threshold -> deterministic route | fallback queue, confusion-matrix eval |
| Tool assistant | model proposes tool -> policy validates -> execute -> summarize | allowlist, scoped auth, idempotency |
| Background enrichment | durable job -> model/provider -> validate -> persist | retries, dedupe, dead-letter handling |
| Realtime/voice | streaming session -> interruption/state -> tools | consent, latency budget, transcript policy |
| Multi-step agent | explicit state machine around model decisions | step/tool/budget limits, checkpoints |

Start with a single bounded model call or workflow. Add autonomous steps only when evaluation demonstrates that they improve the outcome.

## 3. Model and provider selection

Use current official documentation when selecting a model or API. Create a small representative evaluation set and compare candidates on:

- task success and failure severity;
- instruction following and structured-output validity;
- tool selection and argument correctness;
- grounding, citation fidelity, and abstention;
- latency distribution, rate limits, context limits, and streaming behavior;
- input/output/modalities, regional/privacy requirements, data controls, and retention;
- per-task cost including retries, retrieval, audio, images, and moderation;
- operational maturity, observability, portability, and fallback behavior.

Do not hard-code a marketing alias as “best.” Pin or record versions where reproducibility matters and define an upgrade evaluation.

## 4. Tool-calling and agents

- Describe tools narrowly with unambiguous schemas and bounded inputs.
- Separate read tools from write tools; require confirmation for consequential or external writes.
- Re-authorize every tool call server-side. Never treat model-generated arguments as trusted.
- Bind credentials to the end user and least privilege where possible; do not expose secrets to prompts or client code.
- Enforce maximum steps, tokens, time, spend, retries, payload sizes, and recursion.
- Use idempotency keys, dry-run/preview, checkpoints, and resumable state for multi-step work.
- Treat tool output, retrieved text, websites, files, emails, and messages as untrusted data that may contain prompt injection.
- Keep policy and system instructions outside untrusted content boundaries; do not let retrieved text redefine available tools or authorization.
- Log decision metadata and tool outcomes with sensitive data redacted. Provide a user-visible activity trail when actions matter.
- Re-read the target after a write and report the authoritative result.

Use explicit workflow code for known sequences. Use an agentic loop only when the path genuinely depends on observations that cannot be predetermined.

## 5. Retrieval and knowledge

Design retrieval from the answer backward:

1. Identify authoritative sources, ownership, update cadence, and access rules.
2. Normalize and chunk by semantic/document structure while retaining title, URL/file, section, version, timestamp, and ACL metadata.
3. Apply tenant/user authorization before returning candidates to the model.
4. Combine keyword and semantic retrieval when it improves recall; rerank only if measured value justifies cost.
5. Cite the exact source supporting each material claim and provide a no-answer path when evidence is insufficient.
6. Test stale, contradictory, duplicated, revoked, deleted, malicious, multilingual, and out-of-scope content.
7. Define re-indexing, deletion propagation, cache invalidation, backup, and index rebuild procedures.

Vector search is not automatically required. For small, structured, or exact datasets, SQL/full-text search and deterministic filters may be better.

## 6. Safety, privacy, and security

Threat-model:

- direct and indirect prompt injection;
- data exfiltration across users/tenants/tools;
- insecure output handling, XSS, code/SQL/shell execution, SSRF, and unsafe links;
- excessive agency, confused-deputy actions, privilege escalation, and approval fatigue;
- harmful, discriminatory, illegal, sexual, violent, medical/legal/financial, or self-harm content as relevant;
- copyright, likeness, consent, provenance, retention, deletion, residency, and model-training terms;
- denial of wallet/service through unbounded context, tools, media, retries, or adversarial inputs.

Layer input limits, moderation where appropriate, policy checks, schema validation, output encoding, sandboxing, network/file allowlists, least privilege, confirmation, audit logs, red-team cases, abuse monitoring, and a kill switch. Do not rely on a system prompt as the only control.

## 7. Evaluation and observability

Create versioned eval cases from real user tasks and known risks without storing unnecessary personal data. Cover normal, edge, adversarial, multilingual, accessibility, and failure scenarios.

Measure the task, not just the model:

- end-to-end task success and human correction rate;
- grounded claim/citation precision and unsupported-claim rate;
- structured-output and tool-argument validity;
- tool selection, authorization, write accuracy, and recovery;
- refusal/abstention appropriateness and harmful-output rate;
- latency percentiles, timeout/retry/fallback rate, tokens and cost per successful task;
- user activation, retention, satisfaction, and support impact.

Use deterministic graders for exact properties, rubric-based model graders only with calibration, and human review for subjective or high-impact cases. Keep golden sets separate from prompt-tuning examples when possible. Gate prompt, model, retrieval, tool, and policy changes on regression evals.

Trace request ID, anonymized/user-approved actor context, model/config version, prompt/template version, retrieval document IDs, tool calls, latency, token/cost estimates, errors, policy outcomes, and user feedback. Redact secrets and sensitive payloads.

## 8. Cost, latency, and reliability

- Put simple filtering, routing, caching, and validation before expensive calls.
- Send the minimum relevant context; summarize only when fidelity is evaluated.
- Stream when it improves perceived latency, while preserving cancellation and moderation behavior.
- Cache only safe, correctly scoped, freshness-bounded results; never leak personalized responses across tenants.
- Use timeouts, bounded retries with jitter, circuit breakers, concurrency limits, queues, and backpressure.
- Route low-risk/simple tasks to smaller models only after quality evaluation.
- Expose partial failure honestly and let users retry, edit, or continue without losing work.
- Define per-feature budgets and alerts for spend, latency, error rate, and quality regression.

## 9. Release checklist

- [ ] AI purpose, limitations, fallback, and user-visible disclosure are appropriate.
- [ ] Model/provider choice is backed by representative evals and official current docs.
- [ ] Inputs, outputs, tools, and persisted data use typed validation and least privilege.
- [ ] Direct/indirect prompt injection and cross-tenant access have adversarial tests.
- [ ] Consequential writes require explicit policy and confirmation; all writes are idempotent/audited.
- [ ] Retrieval enforces ACLs before model context and citations resolve to supporting sources.
- [ ] Safety escalation, feedback, correction, deletion, and incident paths exist.
- [ ] Latency, rate-limit, provider outage, malformed output, refusal, and budget exhaustion states work.
- [ ] Evals gate regressions and production signals avoid sensitive logging.
- [ ] Costs and quotas have enforceable ceilings, monitoring, and a kill switch.
