# Impact 3D films with Seedance 2.0 — the creative playbook (2026)

`cinematic-films.md` §12 covers the mechanics of one clip. This file is
the film: how the studio's storytelling, camera finesse, light arc,
staging and music become Seedance 2.0 prompts, with two films written
out clip by clip. Use it when the user wants "an Impact 3D style video"
and there is no 3ds Max scene, or wants a previs the client can approve
before the render.

Contents
1. The project bible (what every clip shares)
2. The studio's creative DNA as prompt language
3. Beat bank: Impact-style moments to build a film from
4. Film blueprints per mode
5. Worked film A: amenity tour, 1:36
6. Worked film B: lifestyle protagonist, 1:36
7. Day in the life: beats and sample prompts
8. Music and sound in the prompts
9. Transitions and the edit
10. Vertical cut
11. Creative rules and failure fixes

---

## 1. The project bible (what every clip shares)

Seedance 2.0 takes 9 images, 3 videos and 3 audio files per generation.
Consistency across thirty clips comes from feeding the same bible to
every clip, not from prompt wording. Build it first with Nano Banana Pro
(or V-Ray frames), at the film's aspect ratio, 4K, artefact-free:

| Slot | Content | Used by |
|---|---|---|
| @image1 | hero facade, three-quarter, MORNING or GOLDEN | reveal, arrival, day-to-dusk |
| @image2 | same facade at NIGHT, windows lit | dusk, night, finale |
| @image3 | lobby with chandelier and reception | lobby, protagonist entrance |
| @image4 | pool deck with cabanas, water level | pool, dusk, cabana night |
| @image5 | living room toward the view | home act |
| @image6 | master bedroom with sheers | home act |
| @image7 | the car (dark grey sedan or SUV), three-quarter | every arrival beat |
| @image8 | protagonist(s), full body and face, plain light clothes | lifestyle and day-in-the-life modes |
| @image9 | entrance wall with the project logo in raking light | arrival, brand moment |

Per clip: the first frame is the bible image for that space ("@image1 is
the first frame"), and the other bible images that could appear in the
clip are attached as references ("the car is @image7, the people are
@image8"). Swap slots as needed for amenities (gym, games room, kids
room, library, yoga deck, cafe) but keep the facade, car and people
slots fixed for the whole film.

Optional: @video1 a 3–5 s studio shot whose camera move you want copied;
@audio1 the score excerpt for the clip so the move lands on the beat.

## 2. The studio's creative DNA as prompt language

Each tenet from SKILL.md §2, in the words Seedance 2.0 responds to.

| Tenet | Prompt phrases |
|---|---|
| Start with nature, not the building | "macro palm frond with a sun starburst through the fronds", "dew on grass, a lotus with water drops", "a flock of birds crosses a hazy sun", "tree reflections in still water, a jogger crosses in the reflection", "misty sunrise aerial with god rays" |
| The camera has finesse | "static frame, only the air moves", "slow, eased dolly in", "slow tilt up from the lawn to the roofline, foliage in the lower corners", "aerial track following the car at 30 m", "very slow push down through the ring pendant" |
| The car is the viewer | "a dark grey sedan (@image7) rounds the curve toward the entrance", "rear track behind the car at walking pace", "the car turns in past the branded entrance wall (@image9) in raking light", "the car stops at the porch, a door opens" |
| Light tells time | MORNING "low sun rakes across, long shadows, soft haze"; GOLDEN "low warm sun on the facade, lens flare through leaves"; BLUE "deep blue sky, warm interior glow through glass, path lights on"; NIGHT "moonlit dark blue sky, uplit trees, lit windows with people on balconies" |
| Warm inside, cool outside | "warm 2700 K interior against a blue-hour garden", "balcony seen from outside through sliding glass, candles inside" |
| One life detail per frame | "steam rises from a pot", "coffee pours with latte art", "pancakes on the island", "a sheer curtain lifts in a breeze", "a ceiling fan turns", "an open book on the bench" |
| People are mid-distance | "a couple walks away from camera at mid-distance, never looking back", "a receptionist behind the desk", "children in the playroom, small in frame", "joggers on the far path" |
| Indian cues, no irony | "a jhoola swing on the veranda", "a mandir with marigold garlands and a lit diya", "a jaali screen casting patterned light", "clay urns with lotus", "a carrom board in the games room" |
| Brand moments | "the project logo on the entrance wall in raking light (@image9)", "the logo embroidered on a folded towel", "the logo lit at the club reception" (logos come from the bible image, never from text in the prompt) |
| End at night | "the facade at night (@image2), warm windows, deep blue sky", "fire pit and pergola lounge", "night aerial, the entry road lit, the city grid beyond" |

## 3. Beat bank: Impact-style moments to build a film from

Pick from these, in this act order. Each line is a beat plus its sound.

**Openers**
- Macro palm frond, sun starburst through fronds, fronds sway. Birds.
- Tree reflections in still water, a jogger crosses the reflection. Dawn birds, a single footstep rhythm.
- Flock of birds across a hazy sun. Wingbeats.
- Dew on grass, sprinklers catching the sun. Water hiss.
- Lotus with water drops, a drop falls. One water-drop sound.
- Misty sunrise aerial, god rays through the trees. Wind, distant birds.
- Sun shimmer on a lake, then the towers on the far shore. Water lap.
- Low track along mist on the water toward a lit entrance portal (LE PARQUE). Wind.

**Reveal and arrival**
- Tilt up the facade through trees, starburst at the top. Leaves.
- Extreme low angle straight up at two towers, clouds drift. Wind.
- Aerial follow of the sedan round the curve. Tyres on tarmac, engine.
- Rear track down the palm-lined road. Engine hum.
- Lateral track over a balustrade bridge, lily pond below. Water.
- Entrance wall logo in raking light, the car passes. Engine fades.
- Extreme close-ups: hood ornament, grille blur, a hand pulls a door handle that lights on touch (2026). Click, chime.
- The car stops at the porch, a door opens. Door thunk.

**Lobby and amenities**
- Couple through glass doors under a suspended chandelier. Footsteps on stone.
- Top-down into the spiral stair. Quiet.
- Water-level across the pool to umbrellas and loungers. Water lap.
- Symmetrical lap pool, towers mirrored, a swimmer breaks the mirror. Splash.
- Gym with the logo on a treadmill screen, one runner mid-distance. Treadmill hum.
- Games room: billiard rack close-up, a hand racks the last ball. Ball click.
- Kids room ball pit with a giraffe mural, children small in frame. Laughter.
- Library, sun through slats on the shelves, one reader. Page turn.
- Yoga deck at sunrise, women in warrior pose facing the garden. Breath, birds.
- Cafe table close-up: cappuccino with latte art, a croissant. Cup on saucer.
- Banquet hall with a grid of glowing spheres. Reverb hush.
- Outdoor cinema at night, screen glow on faces. Film murmur.
- Sports court at midday, a tennis hit. Ball hit, echo.
- Mandir with marigolds, a diya flame moves. Bell, once.

**Home**
- Living toward the pool view, sheer lifts. Fan tick.
- Top-down through the ring pendant onto the dining table. Cutlery.
- Kitchen island, pancakes, steam, slow dolly in. Sizzle.
- Master bedroom pan, striped rug, sheers, golden light. Quiet.
- Balcony chairs and a drink, the city beyond. Ice in a glass.
- Bathroom: spa bottles on a marble tray, water running. Water.

**Dusk**
- Balcony looking in, candles, warm inside vs blue outside. Crickets start.
- Day-to-dusk repeat of the plaza, the lights come on. Music swell.
- Pool lit, three waterfalls, bougainvillea. Water.
- Sun glint on the facade as birds cross. Wingbeats.
- Rooftop infinity pool edge at blue hour, city lights. Wind.

**Night**
- Facade with lit balconies and people on them. Distant chatter.
- Fire pit in the pergola lounge, a couple. Fire crackle.
- String lights over the cafe terrace. Glasses.
- Rotunda reflected in a lily pond with a fire pit. Crickets.
- Searchlights into the sky, fireworks over the lake (launch films). Fireworks.
- Night aerial, entry road lit, city grid beyond. Score alone.

**Lifestyle and human (2026 modes)**
- Eyes open in extreme close-up, a hand taps the alarm at 06:00. Alarm chime.
- Sheer curtains slide open on their own, morning light floods in. Motor hush.
- Coffee pours from the machine with steam. Pour.
- A woman in profile on the balcony at sunset, hair moves. Wind.
- Heels on the pool deck in slow motion, her reflection in the water. Heel clicks, slowed.
- A hand touches the water, one droplet. One drop.
- Speed-ramped pour of sparkling wine into a flute. Fizz.
- A smartwatch tap, then a run along the jogging track. Watch chime, breathing.
- A couple on loungers at the cabana at night, warm inside the cabana. Music, low.

## 4. Film blueprints per mode

| Mode | Clips × length | Beat spine | Score to prompt or attach | People |
|---|---|---|---|---|
| Amenity tour (default) | 13 × 6–10 s, multi-shot | opener → reveal → arrival → lobby → pool → amenities ×2 → home ×3 → dusk → night → night aerial | soft piano with light strings, or acoustic fingerpicking (2023 look), or minimal ambient piano (2025 look) | a couple walking through |
| Lifestyle protagonist | 10 × 8–12 s | shimmer → her on the balcony → arrival in close-ups → lobby entrance → landscape track from behind → detail beats → cabana night → balcony night | ethereal female vocal over synth pads, foley loud | one protagonist (@image8) |
| Day in the life | 16 × 6–10 s | sunrise → alarm → curtains → breakfast → lobby → exercise → pool → dusk sport → club dinner → night party → night aerial | synth-pop, dense foley | a couple (@image8) |
| Landscape estate | 14 × 8–12 s | misty aerial → mist track to the portal → sedan trilogy → farm plots → glasshouse cafe → lagoon pool → villa door blur → night pond → extreme night aerial | orchestral piano and strings, or Indian fusion with diegetic layer | a family, kids at football |
| Interior-led | 12 × 6–8 s | styled close-up first → living pan → dining pendant → kitchen → master → bath → balcony → dusk repeat → night | contemplative piano | none or one person |
| Commercial | 10 × 6–8 s | aerial → facade glint → lobby → co-working → cafe → terrace → night facade | electronic pulse, synth pads | staff and visitors mid-distance |
| Architect documentary | Veo 3.1 for the interview clips; Seedance 2.0 for everything else | interview → reveal → the architect's key ideas as frames → interview → night | soft piano under voice | the architect (Veo), residents (Seedance) |

Generate every clip a second or two long, trim in the edit; title card
and credits are edit work (8–11 s in total).

## 5. Worked film A: amenity tour, 1:36

Settings for every clip: 16:9, 2K (or 1080p), std, high bitrate, 24 fps,
genre drama, native audio ON with the sound written into each prompt for
previs, OFF for the delivery pass (one score in the edit). Bible from §1.

```
C01  OPEN  8 s
Shot 1: Macro palm frond, a sun starburst breaks through the fronds as
they sway. Camera: static, a slight breathing drift. MORNING, soft haze.
Shot 2: Tree reflections in still water; a jogger crosses the reflection
at mid-distance. Camera: static. Sound: dawn birds, a soft piano note.
Photorealistic architectural film, V-Ray 7 render look, natural colour,
no text.

C02  REVEAL  6 s
@image1 is the facade. Villa facade seen past foliage in the lower
corners of the frame. Camera: slow, eased tilt up from the lawn to the
roofline, a starburst at the top. MORNING. Sound: leaves, birds, piano.

C03  ARRIVAL  10 s
The car is @image7, the entrance wall is @image9.
Shot 1: Aerial track following a dark grey sedan round the curve of a
palm-lined road toward the entrance, 30 m up, 30 degrees down. GOLDEN.
Shot 2: Rear track behind the car at walking pace down the palm-lined
road, sun flare through the trees.
Shot 3: The car turns in past the entrance wall with the project logo in
raking light. Camera: static. Sound: tyres on tarmac, a low engine, the
score builds.

C04  PORCH AND LOBBY  8 s
The lobby is @image3, the people are @image8.
Shot 1: The car stops under the porch, a rear door opens. Camera: static
at 1.6 m. GOLDEN.
Shot 2: A couple walks away from camera through the glass doors into a
double-height lobby under a suspended chandelier; a receptionist behind
the desk. Camera: slow dolly following at mid-distance. Sound: door
thunk, footsteps on stone.

C05  POOL  8 s
@image4 is the first frame.
Shot 1: Camera at water level looking across the pool to cabanas and
loungers; ripples catch the sun. Camera: slow dolly forward just above
the water. MIDDAY, bright.
Shot 2: Symmetrical lap pool mirroring the towers; a swimmer breaks the
mirror at the far end. Camera: static. Sound: water lap, a splash.

C06  AMENITIES A  10 s
Shot 1: Gym with floor-to-ceiling glass to the garden; one runner
mid-distance on a treadmill. Camera: slow lateral track.
Shot 2: Games room, close-up of a billiard rack on green baize at
shallow depth; a hand racks the last ball. Camera: static, slow rack
focus.
Shot 3: Kids room with a ball pit and a giraffe mural, two children small
in frame. Camera: static. Sound: treadmill hum, ball click, laughter.

C07  AMENITIES B  10 s
Shot 1: Library, sun through wood slats striping the shelves, one reader
at the far table. Camera: very slow push in.
Shot 2: Yoga deck at sunrise, three women in warrior pose facing the
garden, mid-distance. Camera: static. MORNING.
Shot 3: Cafe table close-up: cappuccino with latte art, a croissant, the
garden soft behind. Camera: static. Sound: page turn, breath, a cup set
on a saucer.

C08  HOME LIVING  6 s
@image5 is the first frame. Living room looking toward the pool through
floor-to-ceiling glass; a sheer curtain lifts in a breeze, a ceiling fan
turns. Camera: static, nothing changes except the air and the light.
MIDDAY. Sound: fan tick, birds outside.

C09  HOME DINING AND KITCHEN  8 s
Shot 1: Dining table seen from above through a ring pendant; a candle
flickers, a bowl of pomegranates on marble. Camera: very slow push down.
Shot 2: Kitchen island with pancakes and fruit, steam rises from a pot.
Camera: slow, eased dolly in. Sound: cutlery, a soft sizzle.

C10  HOME BEDROOM  6 s
@image6 is the first frame. Master bedroom with a low bed and striped
rug; sheers glow in low golden light. Camera: slow pan left to right,
eased. GOLDEN. Sound: quiet room tone.

C11  DUSK  8 s
@image1 is the first frame, @image2 is the last frame.
Shot 1: Balcony seen from outside through sliding glass, candles and a
drink inside, warm interior against a deep blue garden. Camera: static.
BLUE. Sound: crickets begin.
Shot 2: The same facade; the sky deepens from day to blue hour and the
windows, path lights and pool lights come on one by one. Camera: static.
Sound: the score swells.

C12  NIGHT  8 s
@image2 is the first frame.
Shot 1: Facade at night with lit balconies and small figures on them,
moonlit dark blue sky, uplit trees. Camera: static.
Shot 2: Fire pit in the pergola lounge, a couple at mid-distance, string
lights above. Camera: slow dolly in. NIGHT. Sound: fire crackle, distant
chatter.

C13  NIGHT AERIAL  8 s
The estate at night, the entry road lit with ground lights, the city grid
beyond. Camera: slow aerial pull back and rise, eased. NIGHT. Sound: the
score alone, resolving.
```

Edit: title card after C01 (3 s), credits after C13 (8 s), straight cuts
on the downbeat, one dissolve inside C11 shot 2 only, film-wide LUT
matching the stills pack.

## 6. Worked film B: lifestyle protagonist, 1:36

THE CASCADES mode. @image8 is the protagonist in every clip that shows
her; keep her face three-quarter lit and visible in the bible image.
Genre drama, audio ON for foley in previs, delivery scored in the edit
with an ethereal female vocal over synth pads.

```
L01  SHIMMER  6 s
Sun shimmer on water fills the frame, then a slow tilt reveals the twin
towers on the far shore. GOLDEN. Sound: water, a held vocal note.

L02  HER  8 s
@image8 on a balcony in profile at sunset, hair moving, the city soft
behind. Camera: static, shallow depth. Shot 2 begins with a warm yellow
light leak: her hand on the glass rail. Sound: wind, the vocal.

L03  ARRIVAL IN CLOSE-UPS  10 s
The car is @image7.
Shot 1: Extreme close-up of the winged hood ornament, sun flare.
Shot 2: The grille blurs past camera.
Shot 3: A hand pulls a flush door handle that lights up on touch.
Shot 4: The car on the curved drive to the lit lobby. Camera: static
each shot, cuts on the beat. GOLDEN to BLUE. Sound: a click, a chime,
engine.

L04  LOBBY  8 s
@image3 is the first frame. She walks away from camera into a
double-height lobby under a suspended glass chandelier; her heels echo.
Camera: slow dolly following at mid-distance. Sound: heels on stone.

L05  LANDSCAPE  8 s
Tracked from behind through the landscape at sunset, sun through white
blossoms in the foreground, the towers ahead. Camera: handheld-style
low follow, slow. GOLDEN. Sound: birds, gravel steps.

L06  DETAILS  10 s
Shot 1: A hand touches the pool water, a single droplet rises and falls.
Sound: one water drop.
Shot 2: A speed-ramped pour of sparkling wine into a flute, slow then
fast. Sound: fizz.
Shot 3: A dining table with gold cutlery and candles, top-down through
the pendant. Camera: very slow push down.

L07  CABANA NIGHT  8 s
@image4 is the first frame. A white cabana lit warm from inside on the
pool deck at night, the pool black-blue; she sits inside, small in frame.
Camera: slow dolly in across the deck. NIGHT. Sound: crickets, water,
the vocal returns.

L08  HEELS  6 s
Her heels on the wet deck in slow motion, her reflection in the pool,
warm cabana light on the water. Camera: low, static. Sound: slowed heel
clicks.

L09  FACADE NIGHT  6 s
@image2 is the first frame. The twin towers and skybridge at night,
windows lit, a deep blue sky. Camera: slow aerial rise. Sound: score.

L10  HER, NIGHT  8 s
@image8 on the balcony at night, city lights below, she looks out; a warm
light leak closes the frame. Camera: static, shallow depth. Sound: the
vocal resolves, then silence for the credits.
```

## 7. Day in the life: beats and sample prompts

CENTURY MIRAI mode. Sixteen clips; the feature graphics (workout readout,
charging percentage, pool temperature) are edit overlays, never in the
prompt. Sample prompts:

```
D02  ALARM  6 s
Extreme close-up: a woman's eyes open in soft morning light; a hand taps
an alarm clock as it flips to 06:00. Camera: static, macro. Sound: a
gentle alarm chime, one tap.

D03  CURTAINS  6 s
@image6 is the first frame. Sheer curtains slide open on their own and
morning light floods the bedroom. Camera: slow dolly in. MORNING.
Sound: a motor hush, birds.

D08  RUN  8 s
@image8 taps a smartwatch, then runs along the jogging track past the
towers, mid-distance, tracked from the side. Camera: lateral track at
running pace. MORNING. Sound: a watch chime, breathing, footsteps.
```

The remaining beats follow §3 "Lifestyle and human" in the order of the
mode row in §4, ending with the night party on the roof and a night
aerial.

## 8. Music and sound in the prompts

- Seedance 2.0 generates audio in the same pass. For previs, write the
  score into every clip with the same phrase so the cut holds together:
  "soft piano with light strings, slow, uplifting" (residential 2018–20),
  "acoustic guitar fingerpicking with string pads" (2023), "minimal
  ambient piano and pads" (2025), "ethereal female vocal over synth pads"
  (2026 lifestyle), "electronic pulse, four on the floor, synth pads"
  (commercial), "flute and sitar over soft percussion" (Indian fusion).
- For delivery, turn native audio off and score once in the edit; the
  studio cuts to one track. Keep the diegetic layer from the prompts by
  generating hero clips twice (audio on for the foley stems).
- Diegetic sounds are named per clip (§3 gives them): birds at dawn,
  a single water drop, a car door, a tennis hit, a ceiling fan, crickets
  and fire at night, a champagne pour. In the mix they sit 12–18 dB
  under the music.
- Attach @audio1 (a 4–15 s score excerpt) to hero clips so the move and
  the cut land on the downbeat: "the camera move follows the rhythm of
  @audio1".
- Silence over the credits.

## 9. Transitions and the edit

- Straight cuts on the downbeat, phrase changes on act changes.
- Multi-shot clips: two or three shots per generation, labelled "Shot
  1:", "Shot 2:", "Shot 3:", each with its own camera line; the model
  cuts between them. Four shots only for the close-up arrival montage.
- The day-to-dusk match cut is one clip: the day still first, the night
  still as last frame, "lights come on one by one".
- Lifestyle mode: "Shot 2 begins with a warm yellow light leak" and
  "golden bokeh drifts across the cut" are the studio's 2026 transitions.
- Rack-focus reveal: "the room starts soft and resolves sharp".
- Speed ramp only on a pour or a splash.
- Never cut back to noon after dusk; the film ends at night.

## 10. Vertical cut

Regenerate 6–8 hero clips at 9:16 for the 30–45 s Reels cut: the
opener, the tilt-up, the arrival close-ups, the pool, one home frame, the
day-to-dusk repeat and the night facade. Reframe the bible stills to 9:16
with Nano Banana Pro (outpaint, "extend the scene above and below,
nothing else changes") before using them as first frames.

## 11. Creative rules and failure fixes

Rules
- The building is never the first shot. Nature, water, light or the
  protagonist come first.
- One idea per shot, one camera move, one life detail. Static frames are
  the majority.
- People at mid-distance, never at the camera; the protagonist is the
  only exception and needs @image8 in every clip she is in.
- The car, the facade and the people never change: same bible slots in
  every clip that shows them.
- Warm inside, cool outside from dusk on; night ends the film.
- Brand and Indian cues are shown, not written: logo wall from the bible,
  marigolds, jaali, jhoola, mandir. No text in any generated frame.

Fixes
- The facade changes between clips: attach @image1 or @image2 to every
  clip that shows it, and say "the building is exactly @image1".
- Extra towers, doors or furniture appear: "nothing changes except the
  camera, the people and the light".
- The car's model drifts: "the car is exactly @image7" in every arrival
  clip, and keep the arrival to four short shots.
- The protagonist's face drifts: three-quarter lit bible image, keep her
  mid-distance or in profile except for two close-ups.
- A random orchestral bed under everything: audio off, or name the score
  in every clip, or attach @audio1.
- Signage or captions appear: remove any text from the bible stills.
- Moves feel fast: add "slow, eased, the move takes the whole clip".
