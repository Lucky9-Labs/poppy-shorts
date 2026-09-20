# Clip inventory + tagging

When poppy-shorts lists dynamic S3 `contentSources`, it also keeps a **durable inventory** of each object’s *nature* and how useful it is for storytelling. Tags live in git (or your working copy). S3 binaries do not.

## Schema (`inventory/clips.json`, version 1)

| Field | Meaning |
| --- | --- |
| `id` | Stable slug of `s3Uri` (survives re-ingest) |
| `s3Uri` | Identity URI: `s3://bucket/key` or `file:relative/path` for local journey stubs |
| `sourcePrefix` | The `contentSources` folder it came from |
| `mediaType` | `video` / `image` / `audio` |
| `nature` | Suggested buckets: `gameplay`, `wip`, `bug`, `mech-flex`, `horror`, `absurd`, `hangar`, `ui`, `concept-art`, `b-roll` |
| `tags` | Extra freeform labels |
| `visualRichness` | Manual 1–5 (how much there is to *look at*) |
| `engagement` | Manual 1–5 (would this survive a smash cut?) |
| `hookPotential` | Optional 1–5 (first 1s energy) |
| `notes` | Why you scored it |
| `taggedBy` / `taggedAt` | Who last patched the row |
| `usedInShorts` | Composition ids that already burned this clip |

New S3 objects become **untagged stubs**. Re-running sync **does not wipe** scores, notes, or `usedInShorts`.

## Commands

```bash
# Upsert stubs from CONTENT_SOURCES or argv. Existing tags persist.
npm run inventory:sync
npm run inventory:sync -- s3://your-bucket/gameplay/ s3://your-bucket/wip-evidence/

# Manual tag (nature buckets go in --tags when they match the enum)
npm run inventory:tag -- lucky9-clips-gameplay-flex-mp4 \
  --richness 5 --engagement 4 --hook 5 \
  --tags mech-flex,horror \
  --notes "best hangar backlight this week" \
  --by lakshya

# JSON patch (agents / editor scripts)
npm run inventory:tag -- --id lucky9-clips-gameplay-flex-mp4 \
  --json '{"visualRichness":5,"engagement":4,"nature":["mech-flex"],"notes":"hook"}'

# Journey package (local GIF/stills or publishedPrefix)
npm run inventory:journey -- ./journeys/loadout.json
```

Without AWS credentials, `inventory:sync` keeps the on-disk file and does not invent a listing.

## Selector heuristic

`selectStoryBeats` ranks catalog videos/images by

```
score = visualRichness + engagement + 0.5 * hookPotential
```

Untagged clips score `0`, so a 5/5 mech-flex beat is chosen before muddy untagged gameplay. If no inventory is passed (offline `ExampleShort`), listing order is unchanged.

## How humans tag

1. Drop or export captures to an S3 prefix in `contentSources`.
2. `npm run inventory:sync` — confirm new stubs (`nature: []`, no scores).
3. Watch the clip (Studio, QuickTime, or the S3 console). Score richness / engagement honestly. 3 is “usable”; 5 is “this is the Short.”
4. Add `nature` buckets plus a one-line `notes`.
5. After a Short ships, append the composition id to `usedInShorts` so we do not over-repeat a hero shot.

## How agents tag

- Install the poppy-shorts **plugin** on the consumer repo. See [`docs/INSTALL-PLUGIN.md`](./INSTALL-PLUGIN.md).
- After a visual feature ships, run **`/poppy-journey`** so stubs exist (`inventory:journey`). After merge / sendit, run **`/poppy-preserve-content`**. Score with **`/tag-poppy-clips`**.
- Do not invent scores you have not seen. If you cannot open the media, leave scores empty and set `notes` to what the filename / prefix suggests (`wip`, `hangar`, …).
- Prefer `npm run inventory:tag` over hand-editing JSON so `taggedAt` is set.

## After work finishes

The consumer agent follows the installed plugin skills. Journey proof → optional preserve prompt → human scores. A copy-paste fallback lives at [`docs/hooks/post-work-tag-clips.md`](./hooks/post-work-tag-clips.md) if the agent cannot load skills.
