import {loadFont as loadAnton} from "@remotion/google-fonts/Anton";
import {loadFont as loadBangers} from "@remotion/google-fonts/Bangers";

/**
 * Heavy display faces for smash-cut captions.
 * Anton = serious mech-game energy. Bangers = goofy process punchline.
 */
const anton = loadAnton("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

const bangers = loadBangers("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

export const seriousFontFamily = anton.fontFamily;
export const goofyFontFamily = bangers.fontFamily;
