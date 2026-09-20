# Agent session-end fallback

The supported path is the installable **poppy-shorts plugin** (journey → preserve → tag), not a vendor automation.

| Path | Use |
| --- | --- |
| [`skills/poppy-journey/SKILL.md`](../skills/poppy-journey/SKILL.md) | Start→finish visual proof + inventory stubs |
| [`skills/poppy-preserve-content/SKILL.md`](../skills/poppy-preserve-content/SKILL.md) | After merge / sendit: preserve for content? |
| [`skills/tag-poppy-clips/SKILL.md`](../skills/tag-poppy-clips/SKILL.md) | Human nature + richness / engagement |
| [Session-end prompt](../docs/hooks/post-work-tag-clips.md) | Fallback if the agent cannot load skills |

Install: [`docs/INSTALL-PLUGIN.md`](../docs/INSTALL-PLUGIN.md). Keep secrets out of prompts. Call `inventory:journey` / `inventory:sync` / `inventory:tag` instead of pasting AWS or Fish keys.
