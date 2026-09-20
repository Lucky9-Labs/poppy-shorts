# Storytelling pipeline (v0)

poppy-shorts is the **open render + story library**. Hullscape ([@Hullscape](https://www.youtube.com/@Hullscape)) is the first channel that should call it. Other Lucky9 channels can reuse the same adapters.

This is **not** a fork of Restart (or any other Lucky9 product). Restart already has Fish Audio cloning, persona voice routes, conversation TTS, and Whisper-cut VO. Those are closed patterns. Here we keep **interfaces** so poppy-shorts can grow the same *shape* of pipeline without importing proprietary code.

```
contentSources[]          Fish Audio (optional)
s3://bucket/prefix/       voice.provider = fish_audio
        │                 voice.referenceId = <clone id>
        ▼                        │
   [ingest]                  [voiceover]
 list catalog                 TTS mp3
        │                        │
        ▼                        ▼
  [transcribe]              public/voiceover/
 Whisper / offline                │
        │                        │
        ▼                        ▼
    [select] ──────────► [assemble] ──► PoppyShort
 transcript + catalog      beats + captions
 + inventory scores        + DaniDev SFX slots
                           + VO track
```

## Stages

| Stage | Module | Offline behavior |
| --- | --- | --- |
| Ingest | `src/story/ingest.ts` | Empty catalog if no S3 lister / no prefixes |
| Transcribe | `src/story/transcribe.ts` | Split `narration` locally (`offline`) |
| Select | `src/story/select.ts` | Placeholder plates; prefer inventory richness/engagement |
| Voiceover | `src/story/voice/` | Skip when `provider` is `offline` or the key is missing |
| Assemble | `src/story/assemble.ts` | Always produces `ShortProps` for Remotion |

Run a dry run with no credentials:

```bash
npm run story
# writes public/story-short.json (gitignored)
```

## Config knobs (no secrets)

```ts
{
  title: "Hullscape weekly",
  contentSources: [
    "s3://your-bucket/gameplay/",
    "s3://your-bucket/wip-evidence/",
  ],
  voice: {
    provider: "fish_audio", // or "offline"
    referenceId: "your-fish-voice-id",
    model: "s2.1-pro",
  },
  transcribe: {provider: "openai_whisper"}, // or "offline"
  narration: "We forged a mech. In a group chat named oops.",
}
```

API keys stay in the environment only (see `.env.example`):

- `FISH_AUDIO_API_KEY` — [Fish Audio](https://docs.fish.audio) bearer token
- `FISH_AUDIO_REFERENCE_ID` — persistent clone / library voice id (`reference_id` on `POST /v1/tts`)
- `FISH_AUDIO_MODEL` — optional `model` header (`s2.1-pro`, `s2.1-pro-free`, …)
- `OPENAI_API_KEY` — optional Whisper (`POST /v1/audio/transcriptions`)
- AWS default chain — same as `npm run catalog`

Never commit `.env`, clone samples, or presigned catalogs.

## Fish Audio adapter

`src/story/voice/fish-audio.ts` is a thin public-API client:

- TTS: `POST https://api.fish.audio/v1/tts` with `{ text, reference_id, format: "mp3" }`
- Clone sketch: `POST https://api.fish.audio/model` (`type=tts`, `train_mode=fast`) — implement file upload when you have a cleared reference clip

Swap providers through `VoiceProvider`. Remotion only sees `voiceover.src`.

## How this becomes auto-storytelling

Near term (this repo):

1. Drop weekly Hullscape captures into one or more S3 prefixes (`contentSources`).
2. `npm run catalog` (and later `npm run story`) builds a catalog + beat list.
3. Humans still write or lightly edit `narration` and captions (serious / goofy).
4. Optional Fish `referenceId` records a host VO so the Short is not silent.

Next increments (still in poppy-shorts, still adapters):

- Whisper words as cut points (already modeled as `TranscriptWord`)
- Clip scoring from transcript ↔ catalog filename / timecode
- Persist `referenceId` per channel (Hullscape host vs other shows)
- Write `voiceover/narration.mp3` under `public/` and pass `voiceover.src`

Restart (and similar internal tools) can keep their own orchestration. They should **call** these interfaces or emit `ShortProps`, not be copied into this public repo.

## ExampleShort

`ExampleShort` does not set `contentSources`, `voice`, or `voiceover`. It renders colored plates with no AWS and no Fish. Use it as the always-green smoke test.
