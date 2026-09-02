# Cinematic walkthrough films — the IMPACT 3D playbook (new in v2)

The studio describes its films as "cinematic property films" and
"conceptual documentary" presentations: the viewer should finish the film
understanding the whole project and wanting the lifestyle it shows. Manji's
three published tenets: camera work with finesse and a thoughtful camera
strategy that highlights key features; background music as the heartbeat of
the narrative; harmony in post-production between visuals, camera and music.

Contents
1. Film structure
2. Shot vocabulary
3. Shot durations and rhythm
4. Camera moves in 3ds Max
5. Lighting arc and scene states
6. Motion in the environment
7. Music and sound
8. Edit and post
9. Delivery specs and render budget
10. Storyboard template

---

## 1. Film structure (60–150 s)

| Act | Content | Mood | Share |
|---|---|---|---|
| Opening | Title on black or on a slow aerial; location context (river, hills, city) | Early morning | 10 % |
| Approach | Drive or walk toward the site; gate; landscape | Morning | 10 % |
| Arrival | Entrance, foyer, first reveal of the main space | Late morning | 10 % |
| Interior journey | Living → dining/kitchen → bedrooms → bathrooms → special rooms (pooja, theatre, gym) | Midday to afternoon | 35 % |
| Outdoor life | Pool, deck, garden, terrace, amenities | Golden hour | 15 % |
| Dusk reveal | The hero exterior as lights come on; interior glow | Blue hour | 10 % |
| Night and closing | Night aerial or pool reflection; logo; credits | Moonlit night | 10 % |

The time of day advances through the film. Never cut from night back to
noon; if a room needs daylight after the dusk reveal, place it earlier.

For apartment towers: replace "Approach" with a podium and amenity sequence
and add a "view from the balcony" beat in the interior journey. For
townships and resorts: extend "Outdoor life" and add a community or arrival
sequence.

## 2. Shot vocabulary

- **Establishing aerial**: slow orbit or push-in, 8–12 s, 40–100 m altitude.
- **Approach dolly**: camera at 1.4 m moving 0.5–1 m/s along the drive or
  path, slight parallax from foreground planting.
- **Reveal**: camera passes a doorway, column or jaali and the space opens;
  the most used interior move.
- **Slow push-in**: 24–28 mm, 0.2–0.4 m/s, toward a hero feature (staircase,
  headboard wall, kitchen island).
- **Lateral track**: parallel to a facade or a run of glazing, 0.3–0.6 m/s.
- **Crane / rise**: from eye level to 4–6 m over the pool or garden.
- **Detail rack focus**: 50–85 mm, f/2.8, focus pull from a prop to the
  room, 3–4 s.
- **Window connection**: start inside looking out, dolly through the open
  door to outside.
- **Static beauty frame**: 3–4 s hold of a still-quality frame; use it to
  land a beat with the music.

No whip pans, no handheld shake, no fisheye. Motion is slow and continuous.

## 3. Shot durations and rhythm

- Standard shot 4–6 s; aerial 8–12 s; detail 3–4 s.
- Cut on the music: downbeats for reveals, phrases for act changes.
- Vary move type across consecutive shots (push, then track, then rise).
- Ease in and out on every camera key (Bezier, 15–20 % of the shot length).
- ShotRunner durations: set each camera's shot length in frames at 25 fps
  (5 s = 125 frames) and export per-camera `.vrscene` states.

## 4. Camera moves in 3ds Max

- Physical camera with target; animate position on a path constraint for
  dollies, target on a separate path for reveals.
- Keep focal length constant within a shot; zoom is not a move the studio
  uses.
- Motion blur on for film (shutter 180°), off for the still frames pulled
  from the film.
- Use MaxDirector's storyboard flow: scout views → storyboard → plan →
  build; feed it the act structure above as the brief, one act per request
  to keep shots coherent.
- Avoid passing through furniture or door swings; check every path at 1 m/s
  in the viewport before rendering.

## 5. Lighting arc and scene states

Create one scene state per mood (`MORNING`, `MIDDAY`, `GOLDEN`, `BLUE`,
`NIGHT`) with the sun, sky/HDRI, light groups and exposure stored. Every
shot references one state. Transitions between states happen on cuts, not
inside a shot, except for a single "lights come on" dusk timelapse (8–10 s)
where interior and landscape groups animate from 0 to 100 % over the shot.

Keep white balance per state identical between stills and film so marketing
stills cut from the film match the rendered stills.

## 6. Motion in the environment

The studio uses simulation so "natural elements such as water and trees look
alive". In production:
- Trees and shrubs: Forest Pack animated (wind) or GrowFX/animated proxies;
  amplitude low, period 4–8 s.
- Grass: wind modifier on the lawn scatter, subtle.
- Water: animated ripple normal maps or a Phoenix FD pool for hero pool
  shots; fountain and infinity edge as particle or mesh sim.
- Curtains: cloth sim with a gentle draft on interior reveals.
- People: animated 3D people at distance (walking, sitting), never static
  cutouts in film; cars moving at 20–30 km/h on drives.
- Birds at dawn, ceiling fans turning, TV content playing, candle flicker
  at night.

## 7. Music and sound

Music is chosen before the edit and drives the cut.
- Genre: cinematic orchestral or ambient-piano with a build; for Indian
  context a restrained fusion (sitar or bansuri motif over ambient pads) works
  for resorts and villas; modern electronic-ambient for towers.
- Structure: intro (0–15 s) quiet, build through the interior journey, peak
  at the dusk reveal, resolve at night.
- Sound design layer: birds in the morning, water at the pool, footsteps
  and door slides on reveals, wind in trees, city hum for urban aerials,
  crickets at night. Keep it 12–18 dB under the music.
- Licensing: only licensed or original tracks; keep the licence in the
  project folder.

## 8. Edit and post

- Assemble to the music first with grey placeholder frames, then swap in
  renders; this is how the studio reaches "harmony" between visuals, camera
  and music.
- Grade per scene state, then a film-wide LUT; match to the stills' LUT.
- Transitions: straight cuts and slow dissolves only; one long dissolve is
  allowed at the dusk timelapse.
- Titles: project name, architect, location; clean sans-serif; no motion
  graphics gimmicks. Studio card at the end.
- Export a stills pack: 6–10 frames pulled from the film at full quality
  with motion blur off.

## 9. Delivery specs and render budget

- 3840 × 2160, 25 fps, 60–150 s; also a 1080 × 1920 vertical cut (30–45 s)
  for Instagram Reels, re-framed from wider renders (render at 3840 × 2160
  with safe margins, not a separate pass).
- Corona: noise limit 4–5 % with denoise for animation, anti-flicker on
  (UHD cache "animation" preset). V-Ray/Vantage via ShotRunner: samples or
  noise threshold per shot; success is fresh frames on disk, not the exit
  code.
- Budget: 25 fps × 120 s = 3000 frames. At 2–4 min/frame on a GPU render
  node that is 100–200 node-hours; Vantage cuts it to minutes per shot at
  the cost of some material fidelity, so use Vantage for the interior
  journey and full V-Ray/Corona for the hero exteriors and dusk reveal.
- Deliver H.264 (high bitrate) plus ProRes 422 master from the editing
  application; Vantage does not write MOV or ProRes itself.

## 10. Storyboard template

```
SHOT  ACT        SPACE/LOCATION      MOVE            LENS  DUR  STATE   NOTE
01    Opening    Aerial over site    slow orbit      28    10s  MORNING title over
02    Approach   Drive to gate       dolly forward   24    6s   MORNING frangipani foreground
03    Arrival    Foyer               reveal          20    5s   MORNING door opens
04    Interior   Living → pool view  push-in         22    6s   MIDDAY  jaali shadow
...
14    Dusk       Front facade        static → lights timelapse 28 10s GOLDEN→BLUE lights come on
15    Night      Pool reflection     lateral track   35    6s   NIGHT   logo
```
