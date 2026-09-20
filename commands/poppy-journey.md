---
name: poppy-journey
description: Capture start-to-finish visual proof and upsert poppy-shorts inventory stubs
---

Follow the **poppy-journey** skill (`skills/poppy-journey/SKILL.md`).

1. Confirm a visual change shipped.
2. Use the host ShowMe / Playwright / capture adapter. Do not vendor a Unity recorder.
3. Write a journey JSON (motion GIF preferred, or start/end stills) plus runtime/commit if available.
4. Offer to publish into a proof `contentSources` prefix; otherwise keep local paths.
5. Run `inventory:journey` so stubs exist for `/tag-poppy-clips` or `/poppy-preserve-content`.
6. If nothing visual changed, reply `No journey to capture`.
