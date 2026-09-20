# Agent session-end fallback

The supported tagging path is the installable **`tag-poppy-clips`** skill, not a vendor automation.

| Path | Use |
| --- | --- |
| [`skills/tag-poppy-clips/SKILL.md`](../skills/tag-poppy-clips/SKILL.md) | Install this (copy folder or Cursor plugin). See [`docs/INSTALL-SKILL.md`](../docs/INSTALL-SKILL.md). |
| [Session-end prompt](../docs/hooks/post-work-tag-clips.md) | Fallback if the agent cannot load skills. Copy the prompt into a Codex / Cursor session-end instruction. |

Keep secrets out of prompts. Call `npm run inventory:sync` and `npm run inventory:tag` instead of pasting AWS or Fish keys.
