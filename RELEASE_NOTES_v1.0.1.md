# Cina-Claw Pro v1.0.1

## Highlights

- Includes the complete v1.0.0 Windows-first autonomous multimodal AI command center release.
- Windows-native voice chat with five female and five male style profiles, microphone dictation, automatic spoken replies, and speed/depth controls.
- Managed all-model guidance for truthfulness, relevance, factual support, confidentiality, credential protection, and maximal safe completion.

## Reliability fixes

- Uses stable hyphenated Windows installer filenames so the GitHub asset, updater metadata, blockmap, and SHA-256 manifest agree exactly.
- Pins Windows packaging to the supported Node 22 runtime to avoid the Node 23+ Windows `fetch()` cleanup crash.
- Makes the Windows Electron E2E gateway fixture deterministic when a `file://` renderer reload retains the existing page.
- Separates full source verification from Windows packaging while keeping installer publication blocked on a green verification gate.

## Known limitations

- This community build is unsigned unless the repository is supplied with a trusted Windows signing identity, so SmartScreen may warn.
- Provider free tiers, quotas, multimodal capabilities, and model inventories may change.
- Local Ollama requires the selected model to be installed separately.
- Installed Windows language packs determine the underlying system speech voices available to the ten Cina-Claw profiles.
- Local speech stays on-device; prompts sent to hosted AI models are processed under the selected provider's privacy terms.
