# Cina-Claw Pro v1.0.8

## Release summary

Cina-Claw Pro v1.0.8 fixes the v1.0.7 installed-app symptom where a chat
turn showed the thinking indicator for about 20 seconds and then
disappeared with no reply and no error. It also removes Ox Alpha from
every user-visible surface. It builds on v1.0.7 (catalog v2, Cina harness
layer, chat switches, pre-attached models, Ollama autoconfig); nothing
from v1.0.7 is removed except the Ox Alpha names and picker alias below.

## Included changes

### Empty-turn fix (PR #30)

- Root cause: the ACP `prompt()` call resolves successfully when the
  agent stops, even if the model stopped early with no assistant text,
  thought, tool call, or plan. The renderer therefore cleared the
  thinking indicator and showed nothing, because no operation had
  failed.
- Fix: a completed turn with no assistant content after the last user
  message is now detected (pure helper in `src/lib/acp/empty-turn.ts`)
  and shown as a prompt error banner instead of disappearing. The
  banner explains that the model finished without a reply and suggests
  retrying or switching to a larger model — for example, Ollama
  `llama3.2:3b` or `qwen3-vl:8b-instruct`. A 1B model is usually too
  small for agentic chat.
- What counts as content: assistant text (whitespace-only text does
  not count), a thought block, a tool call, a plan, or a permission
  request. A turn that produced any of those is not flagged.
- The banner is dismissible per turn and clears automatically when a
  later turn produces content.

### Ox Alpha removal (PR #30)

- Ox Alpha is removed from every user-visible surface: the provider
  registry entry, the provider list, the Models page dock, and all four
  locales (English, Chinese, Japanese, Russian) now name OpenRouter's
  successor, GLM 5.3 Flash (metered, not a free preview), instead, and
  the deprecated `OX_ALPHA_PICK` picker alias is gone.
- The retired model ID remains only as an invisible config-load
  migration matcher, so existing installs saved on it still migrate to
  the successor instead of 404-ing again. It is never seeded, listed,
  or selectable.

### Adding an installed Ollama model to the chat picker

- The chat picker lists configured provider models, not the raw Ollama
  installed-model list. Pulling a model in Ollama alone does not make
  it appear in the picker — this is why `llama3.2:3b` was not listed
  even though it was installed.
- To use an installed Ollama model in v1.0.8: open Settings > AI
  Providers, edit the Ollama account, set its Model ID to the installed
  tag (for example `llama3.2:3b`), save, then pick it in Chat. Ollama
  must be running, and the tag must already be pulled (`ollama list`
  shows it).
- If the selected model is not pulled, Chat still shows the
  v1.0.7 autoconfig actions (Start Ollama / Pull for pre-attached
  Qwen3-VL builds) and, for other installed models, the installed-model
  hint pointing at Settings > AI Providers.

## Validation

Verified before merge: new `acp-empty-turn` unit tests (6), plus the
free-model-catalog, timeline-groups, cina-claw-defaults, chat-acp-page,
and acp-chat-store suites pass; web + node typecheck clean; production
Vite build succeeds. The release workflow's own verify-source +
package-windows steps are the Windows packaging evidence for this
release.

Windows installers are unsigned unless the repository is supplied with
a trusted Windows signing identity. Windows SmartScreen may display a
warning for unsigned artifacts.

## Known limitations (honest, at release preparation time)

- A live installed-Windows run of this build (new chat, "hi" test with
  a configured model) has not yet been observed on real Windows. Do
  not treat chat as live-Windows-verified until that run returns a
  reply.
- The chat picker still does not auto-list every installed Ollama tag;
  adding one through Settings > AI Providers (above) is required.
  Auto-listing installed Ollama models in the picker is a follow-up,
  not part of this release.
