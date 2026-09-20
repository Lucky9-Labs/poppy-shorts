# Post-work hook: tag new captures in poppy-shorts inventory

Provider-agnostic. Copy this prompt into a Codex automation, Cursor rule, or any agent “session end” routine. Do not embed API keys.

## When to run

After a session that **created, exported, uploaded, or moved** gameplay, WIP evidence, hangar shots, UI captures, or concept art that may land in an S3 `contentSources` prefix.

## Prompt (copy)

```
You just finished work that may have produced new visual clips.

1. List any new or changed media paths from this session (local exports and intended s3://bucket/prefix/key destinations).
2. Run `npm run inventory:sync` with the relevant s3:// prefixes (or CONTENT_SOURCES). Do not wipe inventory/clips.json tags.
3. For each new stub (empty nature / no visualRichness):
   - Suggest nature buckets from: gameplay, wip, bug, mech-flex, horror, absurd, hangar, ui, concept-art, b-roll
   - Do NOT invent 1–5 scores unless you actually viewed the clip.
   - Ask the operator to confirm richness, engagement, hookPotential, and notes.
4. Apply confirmed tags with:
   npm run inventory:tag -- <id> --richness N --engagement N --tags <buckets> --notes "..." --by <operator>
5. Remind the operator that the story selector prefers higher richness + engagement.

If no new media was produced, reply “No new clips to tag” and stop.
```

## Operator checklist

- [ ] New files are in the correct S3 prefix (not this public git repo unless they are tiny and cleared)
- [ ] `inventory:sync` added stubs
- [ ] Scores are from a human who watched the clip
- [ ] `inventory/clips.json` is committed if tags should persist for the team
