# Agent hooks

Templates you can copy into Codex automations or Cursor routines. They are markdown on purpose — not bound to one vendor.

| Hook | Use |
| --- | --- |
| [Post-work clip tagging](../docs/hooks/post-work-tag-clips.md) | After a feature/session, prompt the operator to tag new captures in `inventory/clips.json` |

Keep secrets out of hooks. Call `npm run inventory:sync` and `npm run inventory:tag` instead of pasting AWS or Fish keys.
