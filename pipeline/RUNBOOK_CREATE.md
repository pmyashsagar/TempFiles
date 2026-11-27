# Daily creator runbook (part 1 of the single daily routine, unattended)

> DEFAULT = FULL RUN, END TO END: build and stage the videos, then CONTINUE IN THE SAME SESSION with RUNBOOK_PUBLISH.md and post them. Staging is only an intermediate step, never the end of a normal run. Stop after staging ONLY if the routine prompt literally says `MODE=create-only`; that flag exists solely for one-off debugging and must never appear in the daily routine prompt.


Goal: from the It's My Notebook blog RSS, pick 2 NEW posts, make one 9:16 video (90-120 s) for each, stage them for publishing.
When both videos are staged, continue in the SAME session with RUNBOOK_PUBLISH.md, which posts them and deletes them. You never post anything in this runbook.

## 0. Inputs and state
- RSS: https://itsmynotebook.com/blog/rss.xml  (items: title, link, description, pubDate)
- State: `state/posted.json` on the `main` branch of pmyashsagar/TempFiles = list of source slugs already staged or posted. Never reuse a slug.
- NEW means: `pubDate` is AFTER `state/posted.json` -> `_last_run` (ISO timestamp), and the slug is not already a key in state. Never treat the whole feed as candidates (it holds ~25 old items). If `_last_run` is missing, use the `pubDate` of the newest slug already in state.
- Record EVERY blog you considered, not only the ones you build: add each non-chosen new slug as `{"status": "considered", "date": "<today>"}` so it is never picked again. Chosen ones become `staged`, then `posted`. At the end of the run set `_last_run` to the newest `pubDate` seen in the feed (not the wall-clock time), so a post published during the run is caught next time.
- If there are no new posts, stop quietly (no videos, no notification).
- Pick the 2 best NEW posts (not in state). Prefer: variety of topic/style between the two, posts with a story or concrete steps, newest first. Skip pure product-comparison pages if a story/how-to exists.
- Read the full article (curl the page, strip tags). EVERY fact in the video must come from the article. No invented numbers, dates or quotes.

## 1. Environment (fresh container every run)
1. Library: it is VENDORED in this repository under `lib/` (no other repository needs to be attached). `cd lib && npm install && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt -r requirements-voice.txt -r requirements-music.txt`. Then download the big files: `sh tools/fetch.sh voice` (Kokoro TTS model) and, for the score, `.venv/bin/python core/audio/sampler.py --need <your mix.py>` (it fetches the sample libraries it needs). If a download is blocked by the network policy, stop and send the push notification naming the blocked host. Set `LIB=<repo>/lib`.
2. ffmpeg 7+: the system has 6.x. `uv venv /root/ffmpeg7/.venv && uv pip install --python /root/ffmpeg7/.venv/bin/python imageio-ffmpeg`, symlink the binary (imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-*) to /root/ffbin/ffmpeg and `export PATH=/root/ffbin:$PATH`.
3. Instruments (about 1.1 GB, once per run): `cd $LIB && .venv/bin/python core/audio/sampler.py --need <your mix.py>`.
4. Fonts (GitHub raw is blocked; use the Google Fonts CSS API with &text=, woff2): Kalam 700 -> fonts/kalam700.woff2, Patrick Hand -> fonts/patrickhand.woff2, Caveat 600 -> fonts/caveat600.woff2. Request the CSS with `curl -s -G` and a generic browser User-Agent, `--data-urlencode "family=Kalam:wght@700"` and `--data-urlencode "text=<ASCII 32-126 plus ≈·×→’>"`, take the first https URL from the CSS and download it.
5. Hugging Face is blocked: there is NO speech-to-text check. Caption times are estimated (cues.mjs).
6. Engine files for this pipeline: `pipeline/engine/` in this repo (partA sketchnote engine, partI icon library, partD cut-paper scene blocks + the Pepys scenes as a worked example, partE renderer/transitions, mix.py, timeline.mjs, cues.mjs, glyphs.json). Copy to a project folder `<slug>/` and assemble: `cat partA.js partI.js partD.js partE.js > index.html` (replace partD's scenes with your own).

## 2. Choose the STYLE from the content (this is part of the job)
Read the article, then choose. Do not default to one style.
- Story / history / biography (a person, an event, a diary): CUT-PAPER NIGHT (partD blocks: skyGrad, stars, moon, skyline, houses, flameDraw, embers, persSil, candleDraw, pepysBust, windows). Dramatic light, warm glow, each scene its own full frame, burn transition between scenes. Then finish with a short NOTEBOOK (sketchnote) section for "what you can do" + brand call to action.
- How-to / prompts / lists / steps / checklists (journaling prompts, gratitude letter structure, end-of-year review): SKETCHNOTE on the brand's dotted cream paper (partA engine + partI icons: ribbon, rows with icons, checklists, sticker, big numbers). Warm mustard accent.
- Comparison (X vs Y, myths vs research, privacy guide): two-column SKETCHNOTE or an engraving/diagram look; use icons and ticks/crosses, one idea per scene.
- Other lemo-opuscar styles are available in $LIB/styles/*/STYLE.md; you may choose one if it fits the content better (read its STYLE.md first; write your own treatment before reading its demo).
Brand cues (always): cream paper #FAF4E6, warm ink #302A24, mustard #F1BF4E, tomato #E57255, teal #4B8F7E, lilac; handwriting fonts Kalam / Patrick Hand / Caveat; dotted grid; end card with "It's My Notebook" and itsmynotebook.com. Colours beyond these are welcome when the story needs them (fire, night, etc.).

## 3. Script and scenes
- 90-120 s total. Warm teacher/storyteller voice, not rushed. ~230-300 words. Start with a hook question or a surprising fact. Explain the context so a stranger understands the story. End with a gentle brand line (private, encrypted, no AI) and the site.
- Voice: Kokoro `af_heart`, speed 0.9, `core/tts/tts.py lines.json voice/`. Check durations: sum + gaps must land 90-120 s.
- timeline.mjs -> timeline.json; cues.mjs -> cues.json (hand-split each line into caption phrases of <= 36 characters per line, 2 lines max).
- Plan each scene as: title strip (y 130-400), picture (y 420-1320), caption slip below (y ~1500-1670).

## 4. HARD RULES from the owner (feedback already given; violating these fails QA)
1. Text: captions are the ONLY running text. No label plates/boxes that repeat what the caption says. Titles are 1 short line that does not repeat the caption. On-screen text is limited to graphics (big numbers, checklists, a year on a book, brand name/URL). Hide the caption when the same words are already big on screen (the opening question).
2. Layout: nothing overlaps. Labels never sit on drawings. Nothing from the previous scene shows in the next scene (each scene is a clean frame; transitions are the burn/page effect).
3. Sound: the VOICE must be clear. No fire crackle or loud effects. Pen/paper sounds only as a very faint texture (<= 0.2x), one soft whoosh per scene change. Music about 10 dB under the voice. Master -14 LUFS.
4. Quality: professional, tidy alignment, every element placed deliberately.
5. Facts only from the article; no claims about the product beyond what the site says (private, encrypted in the browser with your own passphrase, no AI).

## 5. Build and QA
- Render: `node $LIB/core/render/events.mjs <slug>`, `python mix.py`, `node $LIB/core/render/video.mjs <slug> --fps 30 --workers 3 --size 1080x1920 --out <slug>/out/video.mp4`, `sh $LIB/core/render/mux.sh out/video.mp4 out/mix.wav master.mp4 30 0`.
- QA (all must pass, else do not stage): contact sheet of stills every ~8 s and at every scene start/mid: no overlapping text/drawings, no cropped text, no label-in-drawing; readcheck OK; `blackdetect` only at transitions; loudness within -14.5..-13.5 LUFS; duration 90-120 s; voice clearly audible over everything else.
- Fix and re-render once if QA fails; if it still fails, do not stage.

## 6. Stage for publishing
For each video: branch `v-YYYYMMDD-<slug>` (no slash) in pmyashsagar/TempFiles containing ONLY `video.mp4` (master 1080x1920) and `meta.json`:
```
{ "slug": "...", "source_url": "https://itsmynotebook.com/blog/...", "order": 1 | 2,
  "instagram_caption": "<=2200 chars: hook, 3-6 short lines, CTA to itsmynotebook.com, blank line, 12-15 hashtags",
  "facebook_title": "...", "facebook_description": "caption text + link + hashtags",
  "youtube": { "title": "<=95 chars + #Shorts", "description": "...link...hashtags", "tags": ["..."], "category": "EDUCATION" },
  "qa": { "passed": true, "notes": "..." } }
```
order 1 = first video, order 2 = second video. Push the branches (this needs the TempFiles repository attached to the routine with push access; if git push is refused, stop, email/notify the owner and do not post). Update `state/posted.json` on main with both slugs (status "staged"). Do NOT keep videos on main.
If you only manage to make one good video, stage and post one; never post a video that failed QA.

## 7. If anything fails
Do not stage a video that failed QA. If the Gmail connector is available in this session, email the account owner (use the Gmail profile address) a short note saying what failed; otherwise write the failure to `state/last_error.txt` on main. Never post anything from this runbook.
