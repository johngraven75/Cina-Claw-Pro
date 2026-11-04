# Cina-Claw Pro v1.0.9

## Release summary

Cina-Claw Pro v1.0.9 adds automatic listing of downloaded Ollama
models in the chat picker. It builds on v1.0.8 (empty-turn fix and
Ox Alpha removal); nothing from v1.0.8 is removed.

## Included changes

### Auto-add downloaded Ollama models to the chat picker (PR #32)

- The chat picker now lists every model Ollama reports as installed
  (`ollama list` tags), under the enabled Ollama account, in addition
  to configured provider models. Pulling a model no longer requires a
  Settings > AI Providers edit to make it appear — for example,
  `llama3.2:3b` shows up once Ollama is up and the tag is pulled, and
  the list refreshes when the picker is opened.
- Listing is not selection: the selected model does not change until
  the user picks a listed model. Uncensored-named models stay hidden
  until the per-session uncensored opt-in is on, as before.
- The "Use pulled model instead" fallback for a not-pulled selected
  model now switches through the model's real picker option, so it
  works for auto-added models too, not only for pre-attached ones.
- Installed tags are normalised for display and routing: a trailing
  `:latest` is stripped, and an already-configured model is never
  duplicated in the picker.

## Validation

Verified before merge: web typecheck clean; the new picker logic was
run against the actual source and lists installed tags correctly,
keeps the configured model first with no duplicates, and adds nothing
without an Ollama account. The full local test suite could not run in
the build sandbox (the test runner fails with a write error before
any test runs); the release workflow's own verify-source +
package-windows steps are the Windows packaging evidence for this
release, and the PR's CI suite should be watched before treating the
feature as fully verified.

Windows installers are unsigned unless the repository is supplied with
a trusted Windows signing identity. Windows SmartScreen may display a
warning for unsigned artifacts.

## Known limitations (honest, at release preparation time)

- A live installed-Windows run of this build (new chat, "hi" test with
  a configured or auto-added model) has not yet been observed on real
  Windows. Do not treat chat as live-Windows-verified until that run
  returns a reply.
- The in-app Ollama start and model-pull actions remain allowlisted to
  the pre-attached Qwen3-VL builds only; other models must still be
  pulled with `ollama pull` (or Ollama's own UI) before they appear.
