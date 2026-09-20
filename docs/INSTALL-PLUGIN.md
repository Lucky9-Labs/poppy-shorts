# Install the poppy-shorts Cursor plugin

**Version 0.2.1** adds the lifecycle preserve gate (mark on merge/sendit/export/journey shell, nudge `/poppy-preserve-content` on Stop). Version as we go: **patch** (`0.2.x`) is the default for incremental ships (hooks, docs, fixes, small skills); **minor** (`0.x.0`) is only for a bigger feature cut or API-shape change. Do not leap a minor for a single incremental feature like this gate.

The plugin owns the **content-capture loop** for any consumer project (Hullscape is only an example):

```
finish a feature → /poppy-journey (visual proof) → /poppy-preserve-content? → /tag-poppy-clips
```

Inventory CLIs stay in this repo (`inventory:sync`, `inventory:journey`, `inventory:tag`). The skills tell an agent when and how to call them. Nothing waits on a remote merge job.

## Connect a consumer project

After installing the plugin, the consumer project owns its channel and media connection. Create `.poppy/config.json` in that project:

```json
{
  "channel": "My Channel",
  "awsRegion": "us-east-1",
  "contentSources": ["s3://my-bucket/gameplay/", "s3://my-bucket/proof/"]
}
```

The package reads this file for catalog, inventory, and story commands. `CONTENT_SOURCES` and `AWS_REGION` remain supported as environment overrides. The config contains no secrets; credentials still come from the AWS default credential chain.

## What you are installing

| Path | Role |
| --- | --- |
| [`skills/poppy-journey/SKILL.md`](../skills/poppy-journey/SKILL.md) | Start→finish capture via the **host** ShowMe / Playwright adapter; write a journey package; upsert stubs |
| [`skills/poppy-preserve-content/SKILL.md`](../skills/poppy-preserve-content/SKILL.md) | After merge / sendit: “Preserve this work for content?” If no, exit |
| [`skills/tag-poppy-clips/SKILL.md`](../skills/tag-poppy-clips/SKILL.md) | Sync inventory; prompt for nature + 1–5 richness / engagement |
| [`plugin.json`](../plugin.json) | Agent Plugins manifest (all three skills) |
| [`.cursor-plugin/plugin.json`](../.cursor-plugin/plugin.json) | Cursor Plugin wrapper (`skills/` + `commands/` + hooks) |
| [`.claude-plugin/plugin.json`](../.claude-plugin/plugin.json) | Claude Code plugin wrapper (`hooks/hooks.json`) |
| [`.codex-plugin/plugin.json`](../.codex-plugin/plugin.json) | Codex plugin wrapper (`hooks/hooks.json`) |
| [`.cursor-plugin/marketplace.json`](../.cursor-plugin/marketplace.json) | Import this GitHub repo as a marketplace |
| [`commands/`](../commands/) | `/poppy-journey`, `/poppy-preserve-content`, `/tag-poppy-clips` |
| [`hooks/`](../hooks/) | Lifecycle preserve gate (mark on shell, nudge on Stop) |

## Option A — copy skill folders (any agent)

Works in Cursor, Codex, Claude Code, or any runner that loads Agent Skills.

```bash
# from the poppy-shorts checkout
for skill in poppy-journey poppy-preserve-content tag-poppy-clips; do
  mkdir -p ../your-game/.cursor/skills ../your-game/.agents/skills
  cp -R "skills/$skill" "../your-game/.cursor/skills/$skill"
  cp -R "skills/$skill" "../your-game/.agents/skills/$skill"
done
```

User-global:

```bash
mkdir -p ~/.cursor/skills
cp -R skills/poppy-journey skills/poppy-preserve-content skills/tag-poppy-clips ~/.cursor/skills/
```

Symlinks are fine if you keep a sibling checkout:

```bash
ln -s "$(pwd)/skills/poppy-journey" ../your-game/.cursor/skills/poppy-journey
```

Reload the window so skills rediscover. This poppy-shorts checkout already symlinks every skill into `.cursor/skills/` and `.agents/skills/`.

## Option B — Cursor plugin from this repo

Skills are not imported from GitHub on their own. This repo wraps them in a thin plugin.

1. Open **Customize** in the Cursor sidebar.
2. Choose **From GitHub Repository** (or Dashboard → Plugins & MCPs → Team Marketplaces → **Import from Repo**).
3. Paste `https://github.com/Lucky9-Labs/poppy-shorts`.
4. Install the **poppy-shorts** plugin (project or user scope) **on the consumer repo**.

Cursor reads `.cursor-plugin/marketplace.json` (`source: "."`) and loads every folder under `skills/`. After install, invoke `/poppy-journey`, `/poppy-preserve-content`, or `/tag-poppy-clips`.

Local try-out:

```bash
mkdir -p ~/.cursor/plugins/local/poppy-shorts
# copy this checkout (or its skills + plugin manifests) into that folder
# then Developer: Reload Window
```

## Option C — npm / sibling checkout for the CLIs

The skills are markdown. The CLIs still need a poppy-shorts tree with `npm install`.

```bash
git clone https://github.com/Lucky9-Labs/poppy-shorts.git ../poppy-shorts
cd ../poppy-shorts && npm install

# from the consumer repo
npm run --prefix ../poppy-shorts inventory:journey -- "$(pwd)/journeys/feature.json"
npm run --prefix ../poppy-shorts inventory:sync -- s3://your-bucket/wip-evidence/
npm run --prefix ../poppy-shorts inventory:tag -- <id> --richness 5 --engagement 4 --tags hangar --notes "..."
```

If poppy-shorts is a `github:` or `file:` dependency, run the same scripts via `--prefix node_modules/poppy-shorts` from the consumer directory. The consumer's `.poppy/config.json` is discovered from the current working directory, so the connection stays project-owned.

## After a feature finishes (Cursor / Codex)

| Step | Invoke | What happens |
| --- | --- | --- |
| 1. Visual proof | `/poppy-journey` | Host ShowMe / Playwright capture → journey JSON → `inventory:journey` stubs |
| 2. Ship / merge | `/poppy-preserve-content` | “Preserve this work for content?” If no, stop. If yes, pick a Shorts use |
| 3. Score | `/tag-poppy-clips` | Human nature + richness / engagement via `inventory:tag` |

| Product | How to invoke |
| --- | --- |
| Cursor Agent | Type `/poppy-journey` (or `/poppy-preserve-content` after merge). The agent should also pick skills from their descriptions. |
| Cursor Cloud Agent | Same skills if the plugin is installed on the project, published to the team marketplace, or copied into `.cursor/skills/`. |
| Codex | Copy the three folders into `.agents/skills/` or `.codex/skills/` (Option A), then ask “run poppy-journey” / “preserve this for content”. |

## Host ShowMe adapter (do not vendor)

poppy-shorts does **not** ship Unity ShowMe binaries. `locateShowmeAdapter` only looks for what the consumer already has:

- `skills/showme/SKILL.md` or `.cursor/skills/showme/`
- `npm run showme` / `scripts/showme`
- `playwright.config.ts` (use that project's screenshot / video runner)

If none exist, the journey skill asks the human for a GIF or stills.

## Hullscape example

A hangar lighting PR merges in the game repo (plugin installed there). The agent runs `/poppy-journey` through the game's ShowMe skill, writes `journeys/hangar-light.gif`, upserts stubs, then `/poppy-preserve-content`. The operator picks `hangar-process`, scores 4 / 3, and `/tag-poppy-clips` patches `inventory/clips.json` in the poppy-shorts checkout.

## Hooks

The plugin ships an installable **preserve gate** so Cursor, Claude Code, and Codex can ask “Preserve this work for content?” from **lifecycle signals**, not from a markdown reminder.

| Host | Config | Mark | Stop |
| --- | --- | --- | --- |
| Cursor | [`hooks/cursor-hooks.json`](../hooks/cursor-hooks.json) via `.cursor-plugin/plugin.json` | `afterShellExecution` → `preserve-gate.mjs --mark` | `stop` (`loop_limit: 1`) → `--stop-cursor` |
| Claude Code | [`hooks/hooks.json`](../hooks/hooks.json) via `.claude-plugin/plugin.json` | `PostToolUse` matcher `Bash` → `--mark` | `Stop` → `--stop-claude` |
| Codex | Same `hooks/hooks.json` via `.codex-plugin/plugin.json` | `PostToolUse` matcher `Bash` (Codex shell alias) → `--mark` | `Stop` → `--stop-claude` |

What fires:

1. After a shell/tool completion that looks like `git merge`, `gh pr merge`, `sendit`, `inventory:journey` / `inventory:sync`, ffmpeg / OBS / Blender / Remotion export, or a capture/screenshot / `.mp4|.webm|.mov|.png|.gif` path, the hook writes `.poppy/preserve-pending.json` in the **consumer project**.
2. When the agent **Stop**s, the gate re-checks that flag plus git porcelain, recent files under `captures` / `journeys` / `exports` / `Recordings` / `inventory` / `content-pipeline`, and untagged `inventory/clips.json` stubs.
3. If a signal exists, the agent is told to run `/poppy-preserve-content` (then tag if yes). If not, the hook stays silent.
4. Loop guards: Cursor `loop_count` / `loop_limit: 1`; Claude/Codex `stop_hook_active`. The pending flag is marked `consumedAt` when a followup is emitted.

**PR-merge is not a native hook event.** Hosts do not fire “GitHub PR merged.” We approximate it: the mark step watches merge/sendit **shell** commands, then Stop asks the preserve question. There is no GitHub merge bot and no remote tagging job.

### Trust

Hooks run local Node (`scripts/preserve-gate.mjs`). They do not send network requests or read secrets.

- **Claude Code / Codex:** type `/hooks` to inspect plugin hooks. Codex **requires a trust review** — plugin-bundled hooks stay skipped until you accept the current definition.
- **Cursor:** Settings → **Hooks** tab. Installed plugins expand `${CURSOR_PLUGIN_ROOT}`. If that env var is missing, the script falls back to `CLAUDE_PLUGIN_ROOT`, `PLUGIN_ROOT`, then the parent of `scripts/` via `import.meta.url`.

### Disable

Turn the plugin off, leave Codex hooks untrusted, set Claude `"disableAllHooks": true`, or drop the `hooks` field from the host manifest. The copy-paste fallback remains [`docs/hooks/post-work-tag-clips.md`](./hooks/post-work-tag-clips.md) when hooks cannot load.

Details: [`hooks/README.md`](../hooks/README.md).
