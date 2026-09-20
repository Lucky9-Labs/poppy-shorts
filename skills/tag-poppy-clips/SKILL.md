---
name: tag-poppy-clips
description: After shipping features that produced captures, ShowMe GIFs, or videos, sync the poppy-shorts clip inventory and prompt the human for nature tags plus 1–5 richness/engagement scores. Use when new gameplay, WIP, hangar, UI, or concept-art media was exported or uploaded. Do not invent scores you have not seen.
---

# Tag poppy-shorts clips

Portable skill for **any** consumer project that uses [poppy-shorts](https://github.com/Lucky9-Labs/poppy-shorts) as its Shorts pipeline. Hullscape is only an example channel.

Tagging is this skill + the inventory CLIs + a human who watched the clip. Install notes: [`docs/INSTALL-SKILL.md`](../../docs/INSTALL-SKILL.md).

## When to use

Run after work that **created, exported, uploaded, or moved** visual media that may become Shorts raw:

- Gameplay captures, editor recordings, ShowMe GIFs, trailers
- WIP evidence, bug repros, hangar / mech flex, UI screens, concept art
- Files destined for an S3 `contentSources` prefix (`s3://bucket/prefix/`)

If the session produced **no** new media, say `No new clips to tag` and stop.

## Locate poppy-shorts and the inventory

Find a checkout or package that contains `inventory/clips.json` and the npm scripts. Try, in order:

1. **This repo** (you are already in poppy-shorts): `package.json` name is `poppy-shorts`.
2. **Sibling checkout**: `../poppy-shorts` (or a path the user names).
3. **npm / file dependency**: `node_modules/poppy-shorts` or an `overrides` path.

`inventory:sync` writes `inventory/clips.json` relative to the **current working directory**. Run the CLI from the repo that owns the inventory (usually the poppy-shorts checkout, or a consumer that copied `inventory/`).

```bash
# inside poppy-shorts
npm run inventory:sync
npm run inventory:tag -- <id> --richness 5 --engagement 4 --tags mech-flex,horror --notes "..."

# from a sibling consumer repo
npm run --prefix ../poppy-shorts inventory:sync -- s3://your-bucket/gameplay/
npm run --prefix ../poppy-shorts inventory:tag -- <id> --richness 5 --engagement 4 --tags gameplay --notes "..."
```

Pass `s3://bucket/prefix/` folders when you know them. Otherwise rely on `CONTENT_SOURCES` in that checkout’s `.env` (never commit keys).

## Workflow

1. List new or changed media from this session (local paths and intended `s3://…` keys).
2. Sync stubs. **Do not hand-wipe** `inventory/clips.json`.

   ```bash
   npm run inventory:sync -- s3://bucket/gameplay/ s3://bucket/wip-evidence/
   ```

3. For each **new stub** (`nature` empty, no `visualRichness`):
   - Suggest `nature` buckets from: `gameplay`, `wip`, `bug`, `mech-flex`, `horror`, `absurd`, `hangar`, `ui`, `concept-art`, `b-roll`
   - Extra freeform labels go in `--tags` only when they are **not** in that list (the CLI maps known buckets to `nature`)
   - **Do not invent 1–5 scores** unless you actually viewed the clip. Ask the human.
4. Apply confirmed tags:

   ```bash
   npm run inventory:tag -- <id> \
     --richness N --engagement N --hook N \
     --tags mech-flex,horror \
     --notes "one line why" \
     --by <operator>
   ```

   JSON patch is fine for agents once the human confirmed numbers:

   ```bash
   npm run inventory:tag -- --id <id> --json '{"visualRichness":5,"engagement":4,"nature":["mech-flex"]}'
   ```

5. Remind the operator: the story selector prefers `visualRichness + engagement + 0.5 * hookPotential`. Untagged clips score 0.

## Rules

- No secrets in chat, git, or skill files (`AWS_*`, `FISH_AUDIO_API_KEY`, …).
- No private game binaries in a public inventory repo unless they are tiny and cleared.
- Scores are a **human** judgment. Filename guesses may fill `nature` / `notes` only.

## Example (Hullscape)

A session exported a hangar flex take to `s3://my-bucket/gameplay/flex-03.mp4`. Sync, then ask: richness? engagement? nature `mech-flex` + `hangar`? Tag only after the human answers.
