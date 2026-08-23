# Unreleased

## OpenRouter Ox Alpha default

- Fresh configurations and newly configured OpenRouter accounts now select `stealth/ox-alpha` (Ox Alpha) through the existing OpenClaw architecture on Windows, macOS, and Linux.
- Seeded metadata records reasoning, text and image input, a 1,048,576-token context window, and a 131,072-token output limit.
- The legacy `openrouter/free` route remains supported as an explicit operator choice.
- Existing and upgraded provider/model settings, fallbacks, credentials, headers, and concurrency choices remain unchanged. The first-boot seed runs only when both the model-provider section and default-agent model are absent.
- The cloud fallback list remains intentionally empty; Cina-Claw Pro does not silently switch to a paid model.

## External prerequisite and limitation

An OpenRouter API key is required and is stored through the operating system's protected credential storage. Ox Alpha is an externally operated stealth preview that is currently listed as free. Availability, pricing, quotas, capabilities, identity, retention terms, and other provider conditions can change independently of Cina-Claw Pro.
