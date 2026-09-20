import {describe, expect, it, vi} from "vitest";
import {
  buildFishCloneRequest,
  buildFishTtsRequest,
  createFishAudioProvider,
} from "./fish-audio";

describe("buildFishTtsRequest", () => {
  it("targets the public Fish Audio TTS endpoint with reference_id", () => {
    const request = buildFishTtsRequest({
      apiKey: "test-key",
      text: "We forged a mech.",
      referenceId: "voice_abc",
      model: "s2.1-pro",
    });

    expect(request.url).toBe("https://api.fish.audio/v1/tts");
    expect(request.headers.Authorization).toBe("Bearer test-key");
    expect(request.headers.model).toBe("s2.1-pro");
    expect(request.body).toEqual({
      text: "We forged a mech.",
      reference_id: "voice_abc",
      format: "mp3",
    });
  });
});

describe("buildFishCloneRequest", () => {
  it("targets POST /model for a persistent clone (public Fish API)", () => {
    const request = buildFishCloneRequest({
      apiKey: "test-key",
      title: "Hullscape host",
    });
    expect(request.url).toBe("https://api.fish.audio/model");
    expect(request.headers.Authorization).toBe("Bearer test-key");
    expect(request.fields.type).toBe("tts");
  });
});

describe("createFishAudioProvider", () => {
  it("refuses to call the network when FISH_AUDIO_API_KEY is missing", async () => {
    const provider = createFishAudioProvider({apiKey: ""});
    await expect(
      provider.generateSpeech({text: "hello", referenceId: "voice_abc"}),
    ).rejects.toThrow(/FISH_AUDIO_API_KEY/);
  });

  it("POSTs TTS and returns audio bytes from a mocked fetch", async () => {
    const fetchMock = vi.fn(async () => {
      return new Response(new Uint8Array([1, 2, 3]), {status: 200});
    });
    const provider = createFishAudioProvider({
      apiKey: "test-key",
      fetchImpl: fetchMock,
    });

    const result = await provider.generateSpeech({
      text: "hello",
      referenceId: "voice_abc",
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(result.mimeType).toBe("audio/mpeg");
    expect(result.bytes.byteLength).toBe(3);
  });
});
