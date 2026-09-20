# poppy-shorts SFX kit

Drop licensed one-shots here. Remotion serves this folder through `public/sfx` (a symlink). **Do not commit binary SFX** — `.gitignore` already ignores wav/mp3/ogg/aiff/flac/m4a.

The example composition (`ExampleShort`) already has whoosh / impact / comedy **slots**. If a file is missing, the slot is skipped and the Short still renders.

## Folder layout

| Path | Use on a smash-cut Short |
| --- | --- |
| `sfx/whoosh/` | Whip / whoosh on the cut (frame 0 of a beat) |
| `sfx/impact/` | Hit / boom when the caption lands |
| `sfx/comedy/` | Optional sting for the goofy juxtaposition beat |

Suggested starter filenames (match the Hullscape example cues):

- `sfx/whoosh/cut-01.wav`
- `sfx/impact/hit-01.wav`
- `sfx/comedy/boing-01.wav`

Trim one-shots short (50–250 ms). Loud, dry, and mono mix best against gameplay.

## Where to get legal SFX

Always read the license on the download page. Prefer files you can use in YouTube monetized videos.

### Mixkit

- Site: [https://mixkit.co/free-sound-effects/](https://mixkit.co/free-sound-effects/)
- Typical terms: Mixkit Sound Effects License — free for commercial and non-commercial use, including YouTube, without attribution. You may not sell the files as a standalone SFX pack.
- Search: “whoosh”, “impact”, “hit”, “cartoon”.

### Sonniss GDC / Game Audio Bundle

- Site: [https://sonniss.com/gameaudiogdc](https://sonniss.com/gameaudiogdc)
- Annual Game Developers Conference giveaway. Royalty-free for games, trailers, and videos **if you downloaded the pack under that year’s license**. Keep your download receipt.
- Do not redistribute the pack inside this repo.

### bfxr

- Site: [https://www.bfxr.net/](https://www.bfxr.net/)
- You generate the sound. Exports are yours. Great for goofy 8-bit hits that match “serious game, silly process”.
- Export WAV and drop it into `comedy/` or `impact/`.

## How agents should add a file

1. Confirm the license allows YouTube / Shorts use.
2. Save as `sfx/<category>/<descriptive-name>.wav` (keep it small).
3. Point a beat `sfx` cue at that relative path (`whoosh/cut-01.wav`).
4. Leave binaries uncommitted unless Lucky9 Labs explicitly vendors a cleared kit later.
