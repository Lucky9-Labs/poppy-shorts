---
name: poppy-preserve-content
description: After a PR merge or sendit completion in a consuming project, ask the human whether to preserve the work for Shorts content. If yes, collect a use (smash-cut, expectation-vs-reality, WIP flex, bug comedy, hangar process, trailer B-roll), nature tags, and richness/engagement, then point at journey artifacts and tag-poppy-clips. If no, exit quietly.
---

# poppy-preserve-content

Portable skill installed **into the consuming project** via the poppy-shorts plugin. The consumer's agent runs this when finishing work (merge, sendit, ship). Hullscape is only an example.

Tagging and preservation stay in-session. Install: [`docs/INSTALL-PLUGIN.md`](../../docs/INSTALL-PLUGIN.md).

## When to use

Run **after** the feature is actually shipped in this repo:

- PR merged, sendit completed, or the human says the work is done
- A `/poppy-journey` package may already exist from the same session

Do not run this on every file edit. If the session did not ship, stop.

## Prompt

Ask once, clearly:

> Preserve this work for content?

### If no

Reply with nothing more than `Not preserving for content.` and exit. Do not argue, invent a Short, or open inventory.

### If yes

1. Ask how it would best be used. Offer these uses (operator can pick one or write their own):
   - `smash-cut-short` — punchy gameplay / process cut
   - `expectation-vs-reality` — serious setup, goofy outcome
   - `wip-flex` — unfinished but visually rich
   - `bug-comedy` — the bug *is* the joke
   - `hangar-process` — bay / loadout / paint
   - `trailer-b-roll` — atmosphere, no punchline
2. Suggest nature buckets from that use (`gameplay`, `wip`, `bug`, `mech-flex`, `horror`, `absurd`, `hangar`, `ui`, `concept-art`, `b-roll`). The human can override.
3. Ask for 1–5 **visualRichness** and **engagement** (and optional hook). Do not invent scores you have not seen.
4. Point at journey artifacts if `/poppy-journey` already ran (`journeys/<feature>.json`). If not, offer to run `poppy-journey` first so there is proof to tag.
5. Apply tags with the inventory CLI or hand off to **`tag-poppy-clips`**:

   ```bash
   npm run inventory:tag -- <id> \
     --richness N --engagement N \
     --tags hangar,wip \
     --notes "hangar-process — <one line>" \
     --by <operator>
   ```

   From a sibling consumer repo, prefix the poppy-shorts checkout:

   ```bash
   npm run --prefix ../poppy-shorts inventory:tag -- <id> --richness N --engagement N --tags hangar,wip --notes "..."
   ```

## Rules

- Installed via the plugin; the **consumer agent** follows this skill. No remote merge job.
- Scores are human judgments. Filename guesses may fill `nature` / notes only.
- No secrets in chat or journey JSON.

## Example (Hullscape)

Sendit completes a hangar lighting tweak. Ask: preserve for content? Operator says yes, `hangar-process`, richness 4, engagement 3. Journey GIF already at `journeys/hangar-light.gif`. Tag the stub and stop.
