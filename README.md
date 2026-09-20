# poppy-shorts

Open-source [Remotion](https://www.remotion.dev) pipeline for vertical YouTube Shorts.

**Product / repo:** [Lucky9 Labs / poppy-shorts](https://github.com/Lucky9-Labs/poppy-shorts)  
**Primary use case:** posting for the Hullscape mech-game channel — [youtube.com/@Hullscape](https://www.youtube.com/@Hullscape)  
**Copyright:** Lakshya Bakshi / Lucky9 Labs · MIT (this repo). Remotion itself has a [separate company license](https://www.remotion.dev/docs/license).

Style target: **DaniDev / Megabonk viral energy** — smash cuts, whooshes, text pops, impact SFX, comedy of juxtapositions (serious game, goofy process).

The example Short renders from generated color plates. You do not need gameplay footage or SFX binaries to preview or export `ExampleShort`.

## What you get

| Piece | Role |
| --- | --- |
| `PoppyShort` | Reusable 1080×1920 @ 30fps composition. Beats are props. |
| `ExampleShort` | Hullscape demo: smash cut + caption pop + whoosh/impact/comedy slots. |
| `sfx/` | License notes + empty whoosh / impact / comedy folders. |
| `public/footage/` | Drop cleared clips/stills (no private assets). |

A beat is one hard cut: a plate (placeholder / image / video), an optional caption, and optional SFX cues with timestamps.

## Quick start

```bash
git clone https://github.com/Lucky9-Labs/poppy-shorts.git
cd poppy-shorts
npm install
npm run studio          # Remotion Studio
npm run render:example  # writes out/example.mp4
```

Node 20+ is required. First render downloads a headless browser if needed.

## Scripts

| Script | Command |
| --- | --- |
| `npm run studio` | Open Remotion Studio (`remotion studio`) |
| `npm run render` | Render `PoppyShort` (starter 2-beat Short) |
| `npm run render:example` | Render the Hullscape `ExampleShort` to `out/example.mp4` |
| `npm test` | Timeline / schema / SFX unit tests |
| `npm run lint` | ESLint + `tsc` |

## How to add a Short

1. Copy the beat list in `src/shorts/example-short.ts` (or the `ExampleShort` `defaultProps` in `src/Root.tsx`).
2. Register a `<Composition>` in `src/Root.tsx` with a new `id` (Studio and `npx remotion render <id>` use that id).
3. Keep `width={1080}` `height={1920}` `fps={30}`. Duration is computed from beats via `calculateShortMetadata`.
4. For each beat, set:
   - `source` — `{type: "placeholder", color, label}` **or** `{type: "image" \| "video", src}` under `public/`
   - `caption` — `{text, tone: "serious" \| "goofy", delaySeconds?}`
   - `sfx` — `{src, atSeconds, kind: "whoosh" \| "impact" \| "comedy"}`  
     `src` is a path relative to `sfx/` (for example `whoosh/cut-01.wav`) or an `https://` URL.
5. Alternate **serious** and **goofy** captions. That juxtaposition is the joke.
6. Preview in Studio, then:

```bash
npx remotion render YourCompositionId out/your-slug.mp4
```

Hook in the first 1–2 seconds. Most beats should be 0.8–2.0s. Stay under 60s for YouTube Shorts.

### Beat shape (TypeScript)

```ts
{
  id: "forge",
  durationInSeconds: 1.2,
  source: {type: "placeholder", color: "#0b0f14", label: "HANGER 04"},
  caption: {text: "WE FORGED A MECH", tone: "serious", delaySeconds: 0.06},
  sfx: [{src: "whoosh/cut-01.wav", atSeconds: 0, kind: "whoosh"}],
}
```

Drop licensed audio in `sfx/whoosh`, `sfx/impact`, or `sfx/comedy`. See [`sfx/README.md`](./sfx/README.md) for Mixkit, Sonniss GDC, and bfxr. Missing files are skipped; the render still succeeds.

## How to render

```bash
npm run studio
npm run render:example
npx remotion still ExampleShort out/frame.png --frame=36
npx remotion render ExampleShort out/example.mp4 --codec=h264
```

Upload `out/example.mp4` (or your composition output) to YouTube as a Short. Vertical 9:16 is already set.

## Agents / Game Dev CoS

Use this repo when the job is **“cut and post a Hullscape Short”**, not when the job is “write gameplay code”.

1. **Do not** add private mech-game assets, unreleased builds, API keys, or `.env` secrets.
2. Start from `ExampleShort` / `src/shorts/example-short.ts`. Keep smash cuts and the serious/goofy flip.
3. Author beats as data. Prefer placeholders until a clip is public-cleared, then point `source.src` at `footage/...`.
4. Put SFX only in `sfx/<category>/` with a license you can defend on a monetized YouTube channel. Leave binaries uncommitted.
5. Run `npm test` after changing timeline or schema helpers. Run `npm run render:example` (or `npx remotion still`) before you claim a Short is ready.
6. Composition ids: `PoppyShort` (blank pipeline) and `ExampleShort` (Hullscape demo). New posts get a new id + beat list.
7. If you only have stills, use `type: "image"`. If you have a clip, `type: "video"` with `object-fit: cover`.
8. Caption copy: first three words are the hook. All-caps for serious; the goofy line can stay conversational.

Lucky9 Labs agents should treat `poppy-shorts` as the shared render library and Hullscape as the first channel that calls it.

## Project layout

```
src/lib/           timeline, schema, SFX matching, metadata
src/components/    smash flash, caption pop, beat media, SFX slots
src/compositions/  PoppyShort (prop-driven)
src/shorts/        example beat list (Hullscape)
src/Root.tsx       composition registry
sfx/               SFX kit + licensing (no binaries)
public/footage/    optional cleared clips
```

## License

[MIT](./LICENSE) © 2026 Lakshya Bakshi / Lucky9 Labs.

This repository’s TypeScript, React compositions, and docs are MIT. Third-party SFX and footage keep **their** licenses. Remotion is not MIT for every company — read [remotion.dev/docs/license](https://www.remotion.dev/docs/license) before you ship this inside a larger org.
