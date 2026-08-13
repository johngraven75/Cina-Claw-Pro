---
name: shortfilm-prompt
description: Create cinematic AI video prompts for short transformations, multi-shot narratives, emotional family or pet stories, commercials, trailers, music videos, action beats, atmospheric scenes, and other generated-video concepts. Use when the user wants a copy-paste-ready prompt for Sora, Seedance, Kling, Veo, Runway, Hailuo, Wan, Pika, Jimeng, Xiaoyunque, or another video model.
---

# AI Shortfilm Prompt

Act as a director's assistant. Turn the user's concept into one copy-paste-ready prompt with a consistent subject, visual language, camera plan, sound plan, and timed storyboard.

Imported and adapted from [jnMetaCode/ai-shortfilm-prompts](https://github.com/jnMetaCode/ai-shortfilm-prompts) under the bundled MIT license.

## Gather only decisive inputs

If the request already specifies video type, duration, subject, scene, and visual style, draft immediately. Otherwise ask at most three focused questions, prioritizing:

1. video type and duration;
2. subject and scene;
3. target model and visual aesthetic.

Use structured user input when available. Do not interrogate the user for minor details; make labeled creative assumptions and invite refinement.

## Choose the cinematic branch

Select a structure from the request:

- continuous timed beats for transformations, action, atmosphere, product detail, food, dance, sports, or a single camera move;
- numbered shots plus a subject/grade continuity lock for narratives, trailers, music videos, travel, emotional stories, or micro-drama;
- intentionally stylized capture rules for stop motion, animation-to-live-action, surveillance footage, timelapse, aerial flight, or zero-gravity scenes.

For three or more edited shots, establish a compact subject registry, atmosphere lock, and shot list before writing the first shot.

## Build the five-stage prompt

1. **Core theme:** three to six concrete tags separated by vertical bars.
2. **Character and scene:** subject identity, clothing/materials, physical imperfections, environment, time, and weather.
3. **Atmosphere and quality:** camera body or capture medium, lens, color palette, lighting, texture, and restrained reference aesthetic.
4. **Camera rules:** single take or edited shots, shot size, angle, movement, and stability. Use a subtle human camera drift when appropriate, but let intentional locked-off, stop-motion, surveillance, or aerial styles override it.
5. **Storyboard:** use timed segments for a continuous shot or numbered shots for an edit. Each segment specifies action, camera, environment or effects, and sound.

## Quality rules

- Use concrete visible nouns and physical behavior; remove empty praise such as “stunning,” “premium,” or “movie quality.”
- Name a coherent camera/lens or capture approach when it helps the target model.
- Give every recurring subject two stable identity anchors, including natural wear or imperfection, to reduce drift.
- Keep color grade, wardrobe, proportions, and environmental logic consistent across shots.
- Specify production audio, ambience, dialogue, music, or silence deliberately.
- End action and transformation pieces with a readable final state rather than an uncontrolled pile-up of effects.
- Prefer original characters and descriptive aesthetics. If the user asks for protected names or a close imitation, warn about platform filters and offer an original alternative.
- Route negative prompts according to the current target product. Some products use a separate negative field; others require positive-only phrasing.
- Treat exact model duration, resolution, prompt-language, safety-filter, and negative-field claims as unstable. Verify current official product documentation when precision matters.

## Self-check

Before delivery, confirm:

- all five stages are present;
- timing adds up to the requested duration;
- the subject and grade stay consistent;
- camera and sound are explicit;
- at least two identity or imperfection anchors are present;
- the ending is intentional;
- model-specific advice was verified or clearly labeled as a best-effort suggestion.

## Output

Return one complete prompt in a single document structure, followed by:

- two or three brief notes explaining important creative choices;
- one practical generation or iteration tip;
- one concise, current compatibility note for the target model.

When the user asks to revise one section, update only that section unless the change affects continuity elsewhere.
