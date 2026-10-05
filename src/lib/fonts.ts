import {
  Caveat,
  Comic_Neue,
  Geist,
  Geist_Mono,
  Instrument_Serif,
  Noto_Sans_SC,
  Noto_Sans_TC,
  Open_Sans,
  Press_Start_2P,
  VT323,
} from "next/font/google";

// Era faces. Each is exposed as a CSS variable; components pick them via var(--font-*).
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});
const vt323 = VT323({ subsets: ["latin"], weight: "400", variable: "--font-vt323", preload: false });
const comicNeue = Comic_Neue({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-comic", preload: false });
const openSans = Open_Sans({ subsets: ["latin"], weight: ["300", "400", "600", "700"], variable: "--font-open-sans", preload: false });
const caveat = Caveat({ subsets: ["latin"], weight: "600", variable: "--font-caveat", preload: false });
const pressStart = Press_Start_2P({ subsets: ["latin"], weight: "400", variable: "--font-press-start", preload: false });

// CJK fallbacks: none of the era faces have Chinese glyphs. Google serves these sliced by
// unicode-range, so only the characters on the page are downloaded.
const notoTC = Noto_Sans_TC({ subsets: ["latin"], variable: "--font-cjk-tc", preload: false });
const notoSC = Noto_Sans_SC({ subsets: ["latin"], variable: "--font-cjk-sc", preload: false });

export const fontVariables = [
  geist, geistMono, instrumentSerif, vt323, comicNeue, openSans, caveat, pressStart, notoTC, notoSC,
].map((f) => f.variable).join(" ");
