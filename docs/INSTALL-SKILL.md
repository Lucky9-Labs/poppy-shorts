# Install the `tag-poppy-clips` skill

poppy-shorts ships a portable [Agent Skill](https://cursor.com/docs/skills.md) that syncs clip inventory and asks a human for nature tags plus richness / engagement scores. Any consumer repo (Hullscape, another Lucky9 channel, or a third-party Shorts project) can install it.

The inventory system stays in this repo (`inventory:sync`, `inventory:tag`, `inventory/clips.json`). The skill only tells an agent **when** and **how** to call those CLIs.

## What you are installing

| Path | Role |
| --- | --- |
| [`skills/tag-poppy-clips/SKILL.md`](../skills/tag-poppy-clips/SKILL.md) | Portable skill (copy this folder) |
| [`plugin.json`](../plugin.json) | Agent Plugins manifest (skills-only) |
| [`.cursor-plugin/plugin.json`](../.cursor-plugin/plugin.json) | Cursor Plugin wrapper |
| [`.cursor-plugin/marketplace.json`](../.cursor-plugin/marketplace.json) | Lets Cursor import this GitHub repo as a marketplace |
| [`commands/tag-poppy-clips.md`](../commands/tag-poppy-clips.md) | Slash command that follows the same skill |

## Option A — copy the skill folder (any agent)

Works in Cursor, Codex, Claude Code, or any runner that loads Agent Skills.

```bash
# from the poppy-shorts checkout
SKILL=skills/tag-poppy-clips

# project-scoped (recommended for a consumer repo)
mkdir -p ../your-game/.cursor/skills
cp -R "$SKILL" ../your-game/.cursor/skills/tag-poppy-clips

# Codex / Claude-compatible project folders (same contents)
mkdir -p ../your-game/.agents/skills ../your-game/.codex/skills
cp -R "$SKILL" ../your-game/.agents/skills/tag-poppy-clips
cp -R "$SKILL" ../your-game/.codex/skills/tag-poppy-clips

# user-global on this machine
mkdir -p ~/.cursor/skills
cp -R "$SKILL" ~/.cursor/skills/tag-poppy-clips
```

A symlink is fine if you keep a sibling checkout:

```bash
ln -s "$(pwd)/skills/tag-poppy-clips" ../your-game/.cursor/skills/tag-poppy-clips
```

Reload the window (or restart the agent) so it rediscovers skills.

This poppy-shorts checkout already symlinks the same folder to `.cursor/skills/tag-poppy-clips` and `.agents/skills/tag-poppy-clips` so agents working **here** discover it without a plugin install.

## Option B — Cursor plugin from this repo

Skills are not imported from GitHub on their own. This repo wraps the skill in a thin plugin so you can install from the poppy-shorts URL.

1. Open **Customize** in the Cursor sidebar.
2. Choose **From GitHub Repository** (or Dashboard → Plugins & MCPs → Team Marketplaces → **Import from Repo**).
3. Paste `https://github.com/Lucky9-Labs/poppy-shorts`.
4. Install the **poppy-shorts** plugin (project or user scope).

Cursor reads `.cursor-plugin/marketplace.json` (`source: "."`) and loads `skills/tag-poppy-clips`. After install, the skill appears under Customize → Skills. Invoke it with `/tag-poppy-clips`.

To try the same plugin without a marketplace:

```bash
mkdir -p ~/.cursor/plugins/local/poppy-shorts
# copy this checkout (or its skill + plugin manifests) into that folder
# then Developer: Reload Window
```

Plugin packaging is optional. Copying the skill folder (Option A) is enough.

## Option C — npm / sibling checkout for the CLIs

The skill is markdown. The CLIs still need a poppy-shorts tree with `npm install`.

```bash
# sibling checkout (typical)
git clone https://github.com/Lucky9-Labs/poppy-shorts.git ../poppy-shorts
cd ../poppy-shorts && npm install

# from the consumer repo
npm run --prefix ../poppy-shorts inventory:sync -- s3://your-bucket/gameplay/
npm run --prefix ../poppy-shorts inventory:tag -- <id> --richness 5 --engagement 4 --tags gameplay --notes "..."
```

If poppy-shorts is a git dependency of the consumer (`github:Lucky9-Labs/poppy-shorts` or a `file:` path), run the same scripts via `--prefix node_modules/poppy-shorts` **from the directory that should own `inventory/clips.json`**, or `cd` into that package first. `inventory:sync` writes `inventory/clips.json` relative to the current working directory.

This package is not published to the public npm registry (`private: true`). Prefer a git clone or `file:` / `github:` dependency over `npx` from the registry.

## After work finishes (Cursor / Codex)

When a session **created, exported, uploaded, or moved** captures, ShowMe GIFs, or videos:

| Product | How to invoke |
| --- | --- |
| Cursor Agent | Type `/tag-poppy-clips`, or ask “tag new clips” after the feature ships. The agent should pick the skill from its description. |
| Cursor Cloud Agent | Same skill if it is installed on the project, published to the team marketplace, or copied into `.cursor/skills/` of the consumer repo. |
| Codex | Copy the folder into `.agents/skills/` or `.codex/skills/` (Option A), then ask “run tag-poppy-clips” / “tag new clips” at session end. |

The agent must:

1. List new media from the session.
2. Run `inventory:sync` (never hand-wipe tags).
3. Prompt **you** for nature buckets and 1–5 richness / engagement. It must not invent scores it has not seen.
4. Run `inventory:tag` with the confirmed values.
5. Reply `No new clips to tag` if nothing was captured.

Full workflow: [`skills/tag-poppy-clips/SKILL.md`](../skills/tag-poppy-clips/SKILL.md). Schema and ranking: [`docs/INVENTORY.md`](./INVENTORY.md).

## Hullscape example

A Hullscape (or any channel) session exports `s3://my-bucket/gameplay/flex-03.mp4`. In the game repo, invoke `/tag-poppy-clips`. The agent syncs stubs from that prefix, asks for richness / engagement / `mech-flex` + `hangar`, then patches `inventory/clips.json` in the poppy-shorts checkout.
