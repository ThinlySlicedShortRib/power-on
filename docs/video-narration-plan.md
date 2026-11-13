# Video narration plan: "Sean in a bubble"

Status: plan only. Nothing is filmed and nothing is built yet. Written against `main` at `997d62a`, which is the version that ships.

**Scope (decided):** Sean appears only at the **start of the story** and at the **start of each era**. That's **7 narrated clips**: `intro-open` plus one clip per era title card (`e1-title` … `e6-title`). Everything else (widget reactions, reactions to how the visitor moves, the ending gags) is parked in section 10, "Later / optional ideas".

---

## 1. What the story is today (the facts the plan is built on)

- **Where it runs.** `/[locale]` and `/[locale]/story` both render `PowerOnStandalone` → `PowerOn` (`src/features/power-on/PowerOn.tsx`). The old landing (`src/features/dive`) is unhooked and the site opens straight on the 1989 desk.
- **Intro.** An automatic opening shot: the camera sits close on the cube's sticker, with three captions about 4 s apart (`intro.open1–3`: "CERN, 1990. Someone taped this to a computer." / "It wasn't just any computer." / "It was the web's first server. All of it."). Then it pulls back to the desk page ("Every website you see started on *one* computer." plus the lede) and the **Power on** button (the HTML button, or the 3D power button via `desk.hitPower`). Pressing it plays the boot hum and the ROM boot text, then hands over to the story.
- **Six eras** (`src/features/power-on/content/eras.ts`, copy in `messages/<locale>/story.json`):

  | key | chapter | span | lines | memorable props and widgets |
  |---|---|---|---|---|
  | `e1` | Chapter 1 · CERN, "The document web" | 1989–1993 | 15 | CERN map, memo with Sendall's "Vague but exciting…" (`ph-memo`), **sticker** (`w-sticker`, peelable), line-mode browser (`w-term`), Usenet post, **Trojan Room coffee pot** (`w-coffee`), public-domain notice |
  | `e2` | Chapter 2 · Homepages | 1993–2000 | 13 | **modem** (`w-modem`, plays a real screech), 28-second sunset (`w-slow`), CGI, Lerdorf, **JavaScript in ten days** (`w-tenday`), browser wars, beige tower, **guestbook + hit counter** (`w-guest`), dot-com crash |
  | `e3` | Chapter 3 · Web 2.0 | 2004–2009 | 10 | **Gmail 1 GB on April Fools'** (`w-gmail`), XHR, Ajax, **draggable map** (`w-map`), jQuery, **vote/bump** (`w-vote`), Rails, rented racks, AWS invoice, **iPhone at 320 px** (`ph-phone`) |
  | `e4` | Chapter 4 · Apps in the browser | 2009–2016 | 11 | Node, **left-pad** (`w-npm`), React, **"HTML in my JavaScript?!"** (`w-jsx`, "Hear the room"), blank SPA page, Vue, flat design, **endless feed** (`w-feed`), Docker/Lambda |
  | `e5` | Chapter 5 · Everywhere | 2016–today | 12 | Next.js, **pendulum** (`w-pend`), JAMstack, Svelte, **S3 us-east-1 outage** (`w-outage`, "Run command"), streaming, server components, edge map, monorepo, **git push to production** (`w-deploy`) |
  | `e6` | Chapter 6 · What's next | 2026→? | 11 | agents log, **agent errand** (`w-agent`, "It asks before paying"), chat checkout, zero-click stats, AI-crawler gate, person/agent views (`w-views`), generated UI, three-pole pendulum (`w-pend3`), **agents haggling** (`w-haggle`, approve/decline), six-desk lineup. A confidence meter runs from Observed to Wild guess. |

- **Moving through it.** A tall invisible scroll track (`engine/scroll.ts`) drives everything. Each era is a title card (beat `-1`) followed by one segment per line, then a long **transition** segment with a year card (`trans.t1–t5`, e.g. "1993 → 1995 · Meanwhile, the web leaves the lab"), and after era 6 a **fin** segment. Visitors move with the **Next** button (only Next advances; tapping the scene doesn't), Back, keys (Space/→/↓/Enter/PgDn, ←/↑/PgUp), wheel or swipe, and the **era list** (`Hud.tsx`, bottom-left on desktop, top-left on phones), which jumps to an era's title card. **Autoplay** reads one line every 4.6 s and holds title cards for 3.2 s, at speeds ×0.75–×2. On the desk it presses Power on by itself after 2.6 s. Any manual input pauses it.
- **Audio today.** There is no spoken narration. Narration is typed text: each line types in, and in era 6 it streams word by word like model output. Sound is all WebAudio: a boot hum, SFX (the modem screech, blips) and a generative music track per era (110–132 BPM, `engine/music.ts`) that crossfades on era change. Controls are bottom-right on desktop (sound, music, volume, autoplay, speed, language) and a full-width bar with Back/Next on phones.
- **Ending.** "From one cube in Geneva to *everywhere*." "The web keeps swinging between the server and the browser…" Then the **⏻ Power off & start again** button, which returns to the desk.
- **Locales.** `en`, `es`, `zh-Hans`, `zh-Hant`. All four `story.json` files have identical keys, so every line is translated. Switching language reloads the page and resumes at the same era and beat (`saveResume`/`consumeResume`).
- **In flight (other agent, not touched here).** A "Before you start" welcome toast ("Turn your volume up… Choose your language"). It matters here because its Close click is a natural user gesture that unlocks audio (see 4.3).

**How the plan hooks in:** the intro clip hangs off the opening shot, and each era clip hangs off its **era title card** (`e1`–`e6`, beat `-1`). No clip depends on a line index or a widget event.

---

## 2. Concept

**The narrator is a tiny Sean who lives in the corner of his own website.** He made the site, so he's stuck in it now. He pops up in a 150 px bubble that trails your cursor like an over-keen museum guide who has done this tour too many times and still loves it. He turns up at the start and at the top of each chapter, says his bit, and gets out of the way. He doesn't read the text: it's already on screen, and he trusts you. He does what the text can't. He holds up the actual memo with "Vague but exciting…" in red and takes it personally. He does the modem screech with his mouth. He slaps a BETA sticker on his forehead in 2005. He hauls a box labelled `node_modules` into frame and can't lift it. He backs slowly away from the 2017 us-east-1 typo. He asks you to wiggle the mouse to prove you're human. One running thread ties it together: he's wearing his own copy of the cube's sticker, **"THIS NARRATOR IS A SERVER. DO NOT POWER HIM DOWN!!"**, and the story ends at a button labelled *Power off*.

**Persona and tone.** Warm, dry, a bit too invested. A friend who's been to the exhibition before and keeps leaning in to whisper the good bit. He jokes at his own expense, never at the visitor's or the historical people's: Tim, Nicola, Brendan, Rich and the rest are his heroes, and the jokes are about the situation. Short sentences, slightly theatrical physical comedy, real facts delivered deadpan. He talks to you through the lens, glances at the content when he refers to it, and is never sarcastic about the web itself. Rule of thumb: **one fact, one joke, one nudge** ("Go on, peel it") per clip.

---

## 3. Clips

Seven clips. Lengths assume about 2.5 spoken words per second. Every clip **starts and ends on the home pose** (see 5.3), so the first frame doubles as the poster and the in/out animation looks clean. IDs are the filenames (section 7).

"Looks: content" means he glances off-lens toward the side the site content is on. The player mirrors him so this always points at the page (see 4, M3). Clips with readable text on a prop are marked **no-flip**.

### 3.1 Intro

**`intro-open` · "I live here now" · ~22 s · no-flip (chest sticker)**
- *Trigger:* the opening close-up on the cube's sticker (opening beat 0). It runs across the three opening captions and the pull-back to the desk. If no user gesture has happened yet it plays **muted with captions**, so the first ~8 s are built to work silently; the first gesture (welcome toast Close, any click or key) unmutes it.
- *Script:*
  - (0–8 s, silent gag) Nose almost on the lens, as if the bubble were a peephole onto the sticker. He squints toward the content, finger to lips ("shh"), points at the sticker, mouths "don't", mimes peeling it and recoils, as if he's been told off. Caption: "(whispering) Don't. Touch. It."
  - (as the camera pulls back) "Hi. I'm Sean. I built this website, which means, legally, I live in it now. (taps his own sticker: THIS NARRATOR IS A SERVER. DO NOT POWER HIM DOWN!!) That cube is the first web server. All of it. There's a power button. You could press it. (leans in, whispers) Do it. Worst case, you switch on the entire 1990 internet. Which was mostly physicists."
- *On camera:* knocks on the inside of the bubble on "I live in it now", points toward content on "that cube", rubs his hands together on "Do it".
- *Tie-in:* the real sticker in the close-up ("Someone taped this to a computer."), the headline "Every website you see started on one computer.", and the Power on button. The chest sticker is set up here; its payoff is parked in section 10.

### 3.2 Eras (one per title card, beat −1)

Autoplay waits on each title card until the clip finishes (see 4.2).

**`e1-title` · "Vague but exciting" · 16 s · no-flip**
- *Props:* a printout of the memo's front page with "Vague but exciting…" scrawled in red marker.
- *Script:* "Chapter one. March 1989. Tim Berners-Lee hands his boss a proposal for, basically, the World Wide Web. And his boss writes on it: 'Vague, but exciting.' (holds up the memo) Which is also every performance review I've ever had. Anyway. Hit Next. And if you see a sticker… peel it."
- *On camera:* holds the memo up to the lens, slowly. After the performance-review line, a long, pained look straight into the lens.
- *Tie-in:* Sendall's scrawl is on the memo prop (`ph-memo`) at line 4 (`e1l04`). The sticker nudge sets up `w-sticker` ("Taped to the front: a warning. Go on, peel it back.", `e1l08`).

**`e2-title` · "Shaking hands" · 19 s**
- *Props:* a landline handset (or a banana, if that's funnier on the day), the mug.
- *Script:* "Chapter two. Everyone wants a homepage. But first you have to get online, and that sounded like this: (a committed three-second mouth modem screech, eeee-krrrr-bong-bong-shhhh). Sorry. That's two modems shaking hands. (yells off camera) MUM. GET OFF THE PHONE. (back to you) That picture's going to take twenty-eight seconds. I'll wait." (sips coffee)
- *On camera:* the screech is full body, handset to ear. The yell is handset clamped to his chest. Afterwards, an apologetic smile and a long sip.
- *Tie-in:* `w-modem` ("You're online. Don't pick up the phone.") and `w-slow` (100 KB in 28 s, `e2l03`).

**`e3-title` · "Beta forever" · 15 s · no-flip**
- *Props:* a glossy BETA starburst sticker.
- *Script:* "Chapter three. Web 2.0. Rule one: everything is in beta. (slaps the BETA sticker on his forehead) Forever. Gmail launched on April Fools' Day with a whole gigabyte free, and people genuinely thought it was a prank. Go drag the map. I'll be over here, getting rounded corners."
- *On camera:* the slap is deadpan and he keeps the sticker on for the rest of the clip. On "rounded corners" he squishes his cheeks into a rounded rectangle with both hands.
- *Tie-in:* the BETA badges throughout era 3, `w-gmail` ("Is it a joke?"), `w-map`, and the `w-vote` item "Ten reasons your site needs rounded corners."

**`e4-title` · "Eleven lines" · 22 s · no-flip**
- *Props:* a thin paper strip printed with the 11 lines of `left-pad`, and a big cardboard box labelled `node_modules` (stuffed with pillows so it looks heavy but is safe).
- *Script:* "Chapter four. The browser becomes the app. In 2013 React shows up, and a whole room of developers goes (as an outraged attendee) 'HTML? In my JavaScript?!' (calm again) I use it every day. In 2016 somebody unpublished eleven lines of code. (holds up the tiny strip) Eleven. And builds broke all over the world. Meanwhile, this (heaves the node_modules box up into frame, wobbles, fails) is what installing one thing felt like."
- *On camera:* the outrage is big, then an instant drop to calm. The strip is held between thumb and finger right up to the lens, and the box rises into frame from below and swamps him.
- *Tie-in:* `w-jsx` ("Hear the room": "HTML in my JavaScript?!") and `w-npm` ("added 1,342 packages…", then "'left-pad' is not in the npm registry").

**`e5-title` · "The pendulum" · 18 s**
- *Props:* a teabag on a string, used as a pendulum.
- *Script:* "Chapter five. Remember the server? It's back. The web just keeps swinging (swings the teabag across frame) server, browser, server. Oh, and in 2017 one engineer mistypes one command in us-east-1 and the internet's out for four hours. (beat; slowly backs away from the lens until he's half out of frame, then a sweaty thumbs-up) Status page says everything's fine."
- *On camera:* the teabag swings left and right across the lens. The back-away is slow and silent, eyes never leaving the lens.
- *Tie-in:* `w-pend` ("The pendulum swings back between server and browser", `e5l02`) and `w-outage` ("…the status page still says everything is fine.").

**`e6-title` · "Are you a person?" · 18 s · no-flip**
- *Props:* a cardboard ID badge on a lanyard reading "AGENT 🤖 (verified-ish)".
- *Script:* "Chapter six. The next reader of this website might not be a person. (squints at you, then puts on the AGENT badge) Quick check: are you a person? Wiggle the mouse. Or your thumb. Go on. (waits, watching; beat) …Thank you. Very human. Robots never wiggle. (beat) Yet."
- *On camera:* puts on the badge seriously, then leans in, suspicious. During the wait his eyes dart side to side as if following your wiggle. The "Yet" is a slow, worried look off to the side.
- *Tie-in:* `e6l01` ("The next reader of your website might not be a person."), `ph-agents`, "Agents get ID cards and wallets" (`e6l07`), and the person/agent view flip (`w-views`). The clip doesn't branch: the payoff works whether or not anyone wiggled. (A branching wiggle test is in section 10.)

**Clip budget:** 7 clips, about **2 minutes of finished footage** (22 + 16 + 19 + 15 + 22 + 18 + 18 ≈ 130 s). At 3–5 takes each, that's a **half-day shoot** including setup.

---

## 4. The player

All of this uses only the seven clips, CSS transforms and state `PowerOn` already has (`pos`, `mode`, `opening`, `autoplay.playing`, `soundOn`) plus pointer events. Difficulty: **easy** means it fits in an afternoon with no changes to the story engine. **Medium** means it needs a small hook into the engine.

### 4.1 Bubble lifecycle

- **Appears when a clip starts.** The bubble pops in (scale 0 → 1 with a small overshoot, ~250 ms) showing the clip's poster frame, then plays as soon as it can.
- **Shrinks away when the clip ends.** After the closing home pose it shrinks to a dot and disappears (~300 ms), and stays gone until the next era's title card. **Why shrink away rather than tuck into a corner:** a tucked bubble is still on screen for the whole era, which is exactly what we don't want. It would compete with the stage widgets and the controls, and it would need an idle loop so it didn't look frozen. Gone means no idle footage, no clash with the era badge or the phone control bar, and his next entrance is a small event again.
- **No idle loops.** Between clips there's nothing on screen, so `loop-idle`/`loop-look`/`loop-listen` aren't needed. While a clip buffers, the bubble shows its poster frame (the home pose). That's the only "still" state.
- **Leaving mid-clip.** If the visitor leaves the era while its clip is playing (Next past the end of the era, Back into the previous era, or an era-list jump), the clip fades out over 300 ms and the bubble shrinks away. Pressing Next *within* the same era doesn't cut him off: he keeps talking over that era's lines. Arriving on another era's title card starts that era's clip.
- **Each clip plays once per session** on its first visit to that title card. Coming back to a title card doesn't replay it (an optional replay control is in section 10).
- **Close button.** The bubble has a small ✕. Closing it turns the narrator off, which is remembered in `localStorage` like the speed. A narrator toggle in the controls turns him back on.

### 4.2 Mechanics

| # | Mechanic | How | Difficulty |
|---|---|---|---|
| M1 | **Clip controller.** One `<video>` element. Watches `mode`/`opening` and `pos.era`/`pos.beat`: on the opening shot or a not-yet-seen title card it loads that clip, pops the bubble in, plays, and shrinks it away on `ended`. One clip at a time, no queue. | a tiny controller | easy |
| M2 | **Springy follow, only while playing.** While a clip plays, the bubble trails the cursor with a lagged spring, offset ~40 px down and away from the pointer so it never sits under it (`pointer-events: none` except the ✕). It flips to the other side near screen edges and parks itself out of the way when the cursor is over the stage widget. When no clip is playing there's no bubble and nothing to follow. | rAF lerp | easy |
| M3 | **Mirror to face the page.** Every clip is shot looking to one side. `scaleX(-1)` flips him so his glance always points toward the narration and stage, not the screen edge. One shoot covers both sides. Needs text-free wardrobe; **no-flip** clips skip mirroring. | CSS | easy |
| M4 | **Era-flavoured follow latency, only while playing.** The follow physics matches each era's network: **e1** a 0.5 s "leased line" lag; **e2** dial-up, updating at 4 fps and arriving in steps; **e3** smooth; **e4** "slow to start, fast once running", late then snappy; **e5** edge, instant; **e6** the "agent" *predicts* the cursor and leads it slightly. `intro-open` uses the e1 feel. It's the story's latency theme, felt in the hand, for the 15–20 s he's on screen. | per-era spring params | medium |
| M5 | **Autoplay hold.** While a clip is playing on the desk (`intro-open`) or on a title card, autoplay doesn't advance; it resumes its normal timing once the clip ends or is closed. | small hook in the autoplay effect | medium |
| M6 | **Music duck.** While a clip plays with sound, duck the era music ~10 dB using the existing `music.applyLevel` path, and restore over 0.5 s. | small engine hook | easy |

**Running gags across the clips** (pick these props once and keep them):
1. **The sticker:** the cube's sticker in the opening, his own chest sticker from `intro-open` onward, and the Power off button at the end (payoff parked in section 10).
2. **The mug:** sipped while the 28-second picture loads in `e2-title`.
3. **The teabag pendulum:** swung in `e5-title`. It's a teabag because e6's shop is Fern & Kettle, the tea shop.
4. **BETA:** on his forehead in `e3-title`.

### 4.3 Phones

- There's no cursor, so the bubble pops in docked bottom-right **above the full-width control bar** (the bar reserves ~118 px plus the safe area), about 96–120 px across, and shrinks away the same way. Mirroring (M3) still applies, toward the left. The era badge is top-left, so there's no clash.
- **Tap → native Picture-in-Picture** (`video.requestPictureInPicture()` on Chrome/Android; iOS Safari supports PiP for inline `playsinline` video from a user gesture). The bubble then hides and the site gets its full width.
- **Era changes and PiP.** With only seven clips, each on its own title card, swapping the source inside a live PiP window rarely comes up, so the iOS issue (it can close the window on a source change) matters much less. The rule: when a clip ends, exit PiP and let the bubble shrink away as normal. On the next title card the new clip plays in the docked bubble, and the visitor can tap it into PiP again. If the visitor leaves an era mid-clip while in PiP, fade out, exit PiP, and start the next era's clip docked. A per-story reel to seek within isn't needed.
- Use native `<track kind="captions">` so captions show inside PiP too.
- The scripts are written so they work on touch as-is ("Wiggle the mouse. Or your thumb."), so there are no phone-only variants.
- **Audio unlock.** Video with sound needs a user gesture. `intro-open` may start before any gesture, which is why its first ~8 s are a silent gag and it starts muted with captions. The first tap (welcome toast Close, Next or Power on) unmutes.

### 4.4 Decided defaults

- **Narrator audio follows the existing Sound toggle.** No separate mute. Sound off means the clips play muted with captions on.
- **The bubble is on by default**, with a close button (✕). Closing is remembered; the controls can bring him back.
- **Autoplay waits on era title cards until the clip finishes** (and on the desk until `intro-open` finishes). Today a title card is 3.2 s and a clip is 15–22 s.

### 4.5 Rules so it stays fun, not annoying

- He's on screen only for the seven clips. No idle presence, no reactions.
- Respect `prefers-reduced-motion`: no follow and no pop/squash. He's docked like on phones and fades in and out.
- The player is decorative (`aria-hidden`). Everything he says is a joke on top of text that's already there, so nothing is lost without him. Captions are still provided.

---

## 5. Filming notes

### 5.1 Framing for a 120–180 px circle
- **Head and shoulders, dead centre.** Eyes about 42–45% down from the top of the square. Keep the whole head well inside the circle with generous headroom: a circle crop eats the corners, including the top of your head if you sit high.
- **Safe zone:** everything that matters (face, hands, props) lives in the **inner 70%** circle. Props enter from **below** (it reads best in a circle and keeps hands out of the crop edge).
- Camera at eye height, locked off on a tripod. Use a normal focal length (phone main 1× lens at ~1–1.3 m, or 35–50 mm on full frame). **No ultra-wide**: it balloons the nose at close range.
- Lock focus, exposure and white balance, and mark the floor and chair with tape so every take matches.
- **Eye-line marks:** (1) the lens, for talking to the visitor; (2) a sticky note ~30° to *one* side of the lens labelled CONTENT, for all "looks at the page" moments (the player mirrors for the other side). Always use the same side.

### 5.2 Background and lighting
- **Plain, dark, warm charcoal** background (seamless paper or a matt wall) to match the site's dark room. Nothing busy: at 150 px any texture becomes noise.
- **Lit like a desk lamp:** soft warm key (~3200–3600 K) from the CONTENT side at ~45°, a white bounce for fill on the other side, and a faint rim or hair light to separate him from the dark background. The site's lamp colour is amber (`--lamp`), so a warm key makes him look like he belongs in the room. Optionally put a practical lamp barely in frame.
- **No windows**: daylight drifts across a shoot and breaks continuity.

### 5.3 Performance and continuity
- **One continuous look for all clips:** same shirt, hair, glasses (or none), mug and chest sticker, shot in one session. Take a reference photo at the start.
- **Wardrobe:** a solid, mid-tone, distinctive colour that reads at 120 px (a mustard or teal cardigan, say). **No logos or text** (mirroring), no fine stripes (moiré at small sizes), and no green if you might key.
- **Home pose:** neutral, slight smile, looking into the lens, hands low or holding the mug. **Hold it for 1 s at the start and end of every take.** The first frame becomes the poster, and the pop-in/shrink-away animations land on it.
- Go **bigger and slower** than feels natural. Small expressions vanish at 150 px. Gestures stay close to the face.
- Slate every take: hold the clip ID up to the lens on a phone screen and clap once (for sync and for finding takes in the edit).

### 5.4 Audio
- A **lav mic** clipped mid-chest (hide the cable under the shirt, and keep it clear of the chest sticker), or a shotgun just above frame, recorded into a separate recorder or the camera at **48 kHz / 24-bit**. A backup recording on the phone is cheap insurance.
- A soft room: rug, curtains, a duvet behind the camera. Turn off fans and the fridge.
- Record **60 s of room tone** at the start and the end (sit still, mic live) to fill gaps.
- No music in the recording. The site's generative music plays under him, ducked (M6).
- Post: high-pass ~80 Hz, gentle noise reduction, light compression, de-ess. **Normalise to −16 LUFS integrated, −1 dBTP**, consistent across clips. The mouth-modem screech and "MUM, GET OFF THE PHONE" in `e2-title` will peak, so limit them.

### 5.5 Vertical vs square
- **Recommendation: shoot 4K vertical (2160×3840), 30 fps, keeping everything inside the central 2160×2160 square.** You get the square deliverable, extra room below for props rising in, a reframe margin, and free vertical cut-downs for socials. Square-only shooting gives no margin, and landscape wastes the frame's sides on a circle.
- Shutter 1/60. Don't shoot 60 fps unless you want slow-motion gags.

### 5.6 File specs (deliverables)
- **Video:** square **640×640**, 30 fps (sharp at 180 px on 3× screens and fine in PiP).
  - **MP4 / H.264** High profile, `yuv420p`, CRF ~23, cap ~1.2 Mbps (target **~0.8–1 Mbps**), `+faststart`. Audio **AAC-LC 96 kbps mono**.
  - **WebM / VP9**, 2-pass, CRF ~33 (target **~0.5–0.7 Mbps**). Audio **Opus 64 kbps mono**.
  - Roughly 1.5–2.5 MB per clip and about **12–16 MB for all seven** per format. Lazy-load: preload `intro-open` on the desk, then the current era's and the next era's title clips.
- **Poster:** one per clip (the home-pose first frame), 640×640 WebP (q≈75) plus a JPG fallback. It's what the bubble shows while a clip buffers.
- **Captions:** WebVTT, one file per clip per locale (7 × 4 = 28 files). At most 2 lines per cue, ≤ 32 Latin or ≤ 16 CJK characters per line, 1–5 s per cue. Bracket non-speech: `[mouth modem screech]`, `[whispering]`. Use each locale's existing era names and proper nouns from `messages/<locale>/story.json`, so the captions match the screen.
- Example encode:
  ```sh
  ffmpeg -i e1-title.mov -vf "crop=2160:2160:0:840,scale=640:640" -r 30 -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 23 -maxrate 1200k -bufsize 2400k -c:a aac -b:a 96k -ac 1 -movflags +faststart e1-title.mp4
  ffmpeg -i e1-title.mov -vf "crop=2160:2160:0:840,scale=640:640" -r 30 -c:v libvpx-vp9 -b:v 0 -crf 33 -row-mt 1 -c:a libopus -b:a 64k -ac 1 e1-title.webm
  ```
  (The crop offset depends on where the square sits in your vertical frame. 840 centres it.)

---

## 6. Language

The site ships in four locales. The options:

1. **Subtitles only** (English audio + WebVTT in `en`, `es`, `zh-Hans`, `zh-Hant`). One shoot, cheap to update, and the persona stays genuinely *Sean*. Most of the comedy is physical (the memo, the screech, BETA, the box, the teabag, the badge), so it survives translation.
2. **Re-record per language.** Best for viewers, but it multiplies the shoot, and only works for languages Sean speaks naturally. Doing it phonetically kills the comedy. `zh-Hans` and `zh-Hant` could share one Mandarin recording with different subtitle scripts. With only seven clips, this is far cheaper than it used to be.
3. **AI dubbing / voice clone + lip-sync.** Not recommended. The bubble is basically all face, so lip-sync errors are glaring. A cloned voice undercuts the "it's really me" premise, and every edit means re-dubbing three languages.

**Recommendation: option 1, plus a small option 2.** Shoot everything in English, ship captions for all four locales, with captions **on by default outside `en`** (on desktop, in a small speech-bubble label beside the player, because 150 px is too small for burnt-in or overlay text; native tracks in PiP). If Sean speaks Mandarin or Spanish even a little, re-record the **2 most-seen clips** (`intro-open` and `e1-title`) in that language, or all seven if it goes well, and play them for that locale. Imperfect but sincere is on-brand. Write scripts to avoid English-only puns. The current drafts mostly do, apart from "rounded corners", which subtitles still carry fine.

---

## 7. Filenames and where they live

Clip IDs match the code's own keys: era keys `e1`–`e6` from `eras.ts`, and locales from `src/i18n/routing.ts`.

```
public/narration/
  <id>.mp4             intro-open.mp4, e1-title.mp4 … e6-title.mp4
  <id>.webm
  <id>.webp / .jpg     poster
  captions/<locale>/<id>.vtt     e.g. captions/zh-Hant/e3-title.vtt
  lang/<locale>/<id>.mp4         (only re-recorded clips, e.g. lang/es/intro-open.mp4)
```

The full set: `intro-open`, `e1-title`, `e2-title`, `e3-title`, `e4-title`, `e5-title`, `e6-title`. Triggers hang off the opening shot and the era keys, never line indexes.

---

## 8. Shoot-day checklist

**Kit**
- [ ] Camera/phone, tripod, spare battery, ≥ 64 GB free
- [ ] Lav mic + recorder (or shotgun), headphones, spare batteries
- [ ] Key light + diffusion, bounce card, rim light, optional practical lamp
- [ ] Dark charcoal background, tape for floor, chair and eye-line marks
- [ ] Sticky note: CONTENT
- [ ] Phone/tablet showing the clip ID (slate) and this script (teleprompter app optional)
- [ ] A monitor or laptop showing a **live 150 px circular preview** of the camera feed. Check the crop on every setup.

**Props**
- [ ] Signature mug (with some coffee in it)
- [ ] Chest sticker: "THIS NARRATOR IS A SERVER. DO NOT POWER HIM DOWN!!" (make two, it'll get crumpled). Worn in every clip.
- [ ] Memo printout with "Vague but exciting…" in red marker
- [ ] Landline handset (or banana)
- [ ] Glossy BETA starburst stickers (several)
- [ ] 11-line `left-pad` paper strip
- [ ] Big `node_modules` box, pillow-stuffed
- [ ] Teabag on a string
- [ ] "AGENT 🤖 (verified-ish)" lanyard badge

**Shot order** (grouped by energy and props, not quite story order)
1. [ ] Room tone, 60 s
2. [ ] Reference photo of the look (chest sticker on)
3. [ ] `intro-open`: the silent close-up gag and the talk-to-lens half. Shoot the halves separately if easier and join them on a home pose.
4. [ ] Memo: `e1-title`
5. [ ] Handset and mug: `e2-title`
6. [ ] left-pad strip and box: `e4-title`
7. [ ] Teabag: `e5-title`
8. [ ] Agent badge: `e6-title`
9. [ ] **BETA last** (it marks the forehead): `e3-title`
10. [ ] Room tone again; a few spare 10 s "home pose" holds (for posters and fixes)

**Per take:** slate the ID → 1 s home pose → performance → 1 s home pose → 3–5 takes, one of them "bigger than feels right".

---

## 9. Open questions for Sean

1. **Which languages do you speak, and how well?** That decides whether any clips get re-recorded for `es` / `zh-Hans` / `zh-Hant`.
2. **Comfort level:** happy with the physical-comedy bits (mouth modem, "MUM, GET OFF THE PHONE", forehead sticker, backing out of frame)? Any you'd swap?

---

## 10. Later / optional ideas

Parked so nothing is lost. None of these are in scope for the first shoot.

**Ending**
- `fin`: on the fin card (`.po-fin.po-on`), taps his chest sticker: "So whatever you do, don't press (glances at the button) that." The sticker payoff.
- `hover-poweroff`: cursor over "⏻ Power off & start again": "No. No no no no." (clutches the sticker)
- `fin-poweroff`: Power off clicked: "Tell Tim I—", and the bubble does a CRT switch-off (line, then dot) synced to `audio.humFade`.

**Intro extras**
- `hover-power`: dwell on the Power on button or the 3D power button (`desk.hitPower`): "Do it. Do it."
- `boot`: on `startPower()`, fingers in ears for the hum, then "Starting httpd on port 80. That's the whole web booting." (Gasping "I'm up!" after a power-off.)

**Widget reactions** (keyed by widget ID, each would need a small event hook in its widget)
- `w-sticker-peel`: sticker peeled: "It's fine. It's a replica. (whispers) Probably."
- `w-coffee-empty`: coffee pot shows "Pot: EMPTY. Don't bother.": turns his mug upside down over his head.
- `w-term-used`: number typed in the line-mode browser: "Green text. No mouse. No ads. Bliss."
- `w-modem-connect`: Connect clicked: fingers in ears, mouths along with the real screech.
- `w-tenday-replay`: ten-day widget finishes: "JavaScript took ten days. This clip took me eleven takes."
- `w-guest-signed`: guestbook signed: writes "+1 WEBRING" on the back of his hand.
- `w-map-drag`: map dragged > 300 px: he's "dragged" sideways out of frame, clinging to the edge.
- `w-vote-bump`: 3rd bump: "It re-sorts and nothing reloads. In 2005 that was witchcraft."
- `ph-phone-show`: iPhone line (`e3l10`): bubble shrinks to 60 px, chipmunk voice: "Every page has to work at three hundred and twenty pixels now!"
- `w-npm-err`: the left-pad error appears (after the install runs, or on "Run again"): reading glasses on: "Eleven. Lines."
- `w-jsx-room`: "Hear the room" clicked: the outraged-attendee bit as its own clip.
- `w-feed-deep`: 30+ posts scrolled or liked: "The feed never ends. Neither do I. Blink twice if you need help."
- `w-outage-run`: "Run command" clicked: the back-away as its own clip.
- `w-deploy-push`: `git push` clicked: sunglasses on: "Live in eighteen regions in forty-one seconds."
- `w-agent-approve`: errand approved: pats the lens: "It asked before paying. Good agent."
- `w-haggle-approve` / `w-haggle-decline`: smug "I found this deal myself, actually." / sad for half a second ("disappointed, for about 4 ms").
- `hover-term`: dwell on a dotted glossary term (`.po-gl-term`): a silent impressed "ooh".

**Reactions to how the visitor moves**
- `react-idle-1/2`, `loop-asleep`, `react-wake`: going quiet escalates from "I'll just wait here. Like a 28.8k modem." to reading the proposal, to asleep with the BETA sticker on.
- `react-skip-1/2`: big era-list jumps: "You just did fifteen years in a second."
- `react-back`: lots of Back: reversed coffee un-sip, "Ahh, nostalgia."
- `react-fast`: fast cursor: grips the bubble, "Whoa, easy! I get motion sick." (with squash-and-stretch)
- `react-autoplay`: autoplay on: "Autopilot. Nice."
- `react-soundoff`: sound off mid-clip: holds up "I CAN'T HEAR ME EITHER".
- `react-lang-<locale>`: greeting after a language switch: "¡Hola!" / "你好！"

**Transitions and branches**
- `t1`–`t5`: 2–4 s costume-change stingers on the year cards (plugging in the handset, a popping bubblegum bubble for the dot-com crash, peeling off BETA, the teabag bonking him, "Is there a bot in here?").
- `e6-human` / `e6-nowiggle`: a real wiggle test (count cursor reversals for 6 s) with a "Suspiciously still." branch.
- A small replay control so a visitor can re-watch an era's clip.

**Player ideas**
- Idle/look loops so he could stay on screen and "track" the cursor between clips.
- Narrator on the cube's screen in the opening close-up (`VideoTexture` on the NeXTcube's monitor), jumping out into the bubble on the pull-back.
- A cut-out narrator shot on green with alpha video, so he floats with no bubble.
