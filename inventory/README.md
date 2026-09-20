# Clip inventory

Versioned JSON store of every clip discovered under `contentSources`. Humans and agents tag **nature** and **engagement** so the story selector can prefer visually richer plates.

Canonical file: [`clips.json`](./clips.json) (`version: 1`).

```bash
npm run inventory:sync -- s3://your-bucket/gameplay/ s3://your-bucket/wip-evidence/
npm run inventory:tag -- <id> --richness 5 --engagement 4 --tags mech-flex,horror --notes "cold-open lighting"
```

See [`docs/INVENTORY.md`](../docs/INVENTORY.md) and the post-work hook [`docs/hooks/post-work-tag-clips.md`](../docs/hooks/post-work-tag-clips.md).
