---
name: tag-poppy-clips
description: Sync the poppy-shorts clip inventory and prompt the human to tag new captures
---

Follow the **tag-poppy-clips** skill (`skills/tag-poppy-clips/SKILL.md`).

1. List new media from this session.
2. Run `inventory:sync` against the owning poppy-shorts checkout (or `CONTENT_SOURCES`).
3. Ask the human for nature buckets and 1–5 richness / engagement. Do not invent scores.
4. Run `inventory:tag` with confirmed values.
5. If nothing new was captured, reply `No new clips to tag`.
