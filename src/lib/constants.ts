/**
 * Shared vertical-Short constants for the poppy-shorts pipeline.
 * YouTube Shorts and Reels expect 9:16; this project locks 1080×1920 @ 30fps.
 */

/** Width of every composition in this repo (9:16 Short). */
export const SHORTS_WIDTH = 1080;

/** Height of every composition in this repo (9:16 Short). */
export const SHORTS_HEIGHT = 1920;

/** Timeline frame rate. Keep audio cues and smash cuts on this grid. */
export const SHORTS_FPS = 30;

/** YouTube Shorts hard cap in seconds. Pipeline beats should stay under this. */
export const YOUTUBE_SHORT_MAX_SECONDS = 60;
