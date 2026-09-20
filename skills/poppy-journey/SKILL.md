---
name: poppy-journey
description: Capture start-to-finish visual proof of a feature that just shipped, write a poppy-shorts journey package, and upsert clip-inventory stubs. Prefer the host project's ShowMe / Playwright / capture adapter. Use after a feature lands and you need a GIF or before/after for Shorts inventory.
---

# poppy-journey

Portable skill for **any** consumer project that uses [poppy-shorts](https://github.com/Lucky9-Labs/poppy-shorts). Hullscape is only an example channel.

This skill records **verified visual proof** of a real change (start → finish), then upserts inventory stubs. It is not a merge-bot job. Install: [`docs/INSTALL-PLUGIN.md`](../../docs/INSTALL-PLUGIN.md).

## When to use

Before capturing, run `npm run --prefix <poppy-shorts> poppy:init` from the consumer repo if `.poppy/config.json` does not exist. This creates the project-owned config and local `content/`, `journeys/`, and `inventory/` folders. Do not require the operator to know this setup step; the agent should perform it automatically.

Run after a feature **ships in the consuming project** and you can show the change:

- A UI, hangar, gameplay, or tool flow that looks different than before
- Motion (dash, camera, smash cut, loadout swap) — prefer a short **GIF**
- Static contrast (label contrast, layout) — a before/after screenshot pair is enough

If nothing visual changed, say `No journey to capture` and stop.

## Use the host capture adapter — do not reinvent it

Search the **consumer** repo (not this skill) for an existing ShowMe / capture path. Prefer, in order:

1. A `showme` skill (`skills/showme/SKILL.md`, `.cursor/skills/showme/`, `.agents/skills/showme/`)
2. `npm run showme` or `scripts/showme` / `bin/showme`
3. The project's Playwright (or similar) screenshot / video runner

Follow **that** adapter's instructions. Do **not** vendor Unity ShowMe binaries, copy a proprietary mech-game capture stack, or invent a new editor recorder when the host already has one.

If `locateShowmeAdapter` would return `none` (no skill, script, or Playwright config), ask the human for a GIF or stills they already exported. Browser / OS screenshots are a last resort.

## Journey package

Write a small JSON file the human can keep next to the consumer repo (gitignored binaries; JSON is fine):

```json
{
  "version": 1,
  "feature": "hangar loadout swap",
  "caption": "Empty rack to painted mech in one take",
  "runtime": {
    "identity": "unity-editor",
    "commit": "<short sha if available>",
    "branch": "<branch if available>"
  },
  "artifacts": [
    {"role": "motion", "path": "journeys/loadout.gif"}
  ]
}
```

Rules:

- Prefer **one motion GIF** (`role: "motion"`) that spans the change.
- Otherwise `{role:"start"}` + `{role:"end"}` stills.
- `caption` is one line: what changed, not a trailer script.
- `runtime.identity` is whatever the host adapter reports (editor, player, Playwright project). Commit/branch from `git` when available.
- Do not embed secrets or private build URLs.

## Publish or keep local

If the consumer (or sibling poppy-shorts checkout) has `contentSources` / a proof bucket (`wip-evidence`, `proof`, `captures`, `showme`):

1. Ask: “Publish these artifacts to `<prefix>`?”
2. If yes, use the **host** upload path (`aws s3 cp`, project script). Set `publishedPrefix` on the JSON.
3. If no, or nothing is configured, keep `file:` local paths. Do not invent a bucket.

`chooseProofPrefix` prefers `wip-evidence` / `proof` / `captures` over generic gameplay prefixes.

## Upsert inventory stubs

From the repo that owns `inventory/clips.json` (usually a poppy-shorts checkout):

```bash
npm run inventory:journey -- ./journeys/<feature>.json
```

That writes untagged stubs (scores empty). Existing tags are never wiped. Then offer `/tag-poppy-clips` or `/poppy-preserve-content` so a human can score them.

Sibling consumer:

```bash
npm run --prefix ../poppy-shorts inventory:journey -- "$(pwd)/journeys/<feature>.json"
```

## Example (Hullscape)

A loadout-swap PR lands. The game repo has a ShowMe skill. Follow it, save `journeys/loadout.gif`, write the JSON above, upsert stubs, then ask whether to preserve for a smash-cut Short.
