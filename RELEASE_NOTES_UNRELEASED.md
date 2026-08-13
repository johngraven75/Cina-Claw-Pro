# Unreleased

## Startup-ready local default

- Fresh configurations now select local Ollama `qwen3-vl:8b`, with reasoning, image input, tool use, guarded planning, and subagent delegation enabled through the existing OpenClaw architecture.
- The former advertised-only `gemma4:latest` local preset is replaced by a first-boot model that is explicitly registered with multimodal reasoning capabilities.
- Existing and upgraded provider/model settings are unchanged. The seed runs only when both the model-provider section and default-agent model are absent.
- Cloud fallback is intentionally empty. Prompts remain local and fail closed when Ollama or the model is unavailable.

## External prerequisite and limitation

Ollama is not bundled. Install and start Ollama, then run `ollama pull qwen3-vl:8b`. Hardware performance depends on the user's machine, and no single local model can support literally every request or tool.
