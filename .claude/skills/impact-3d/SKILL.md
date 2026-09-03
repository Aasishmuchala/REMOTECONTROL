---
name: impact-3d
description: |
  Art-direct and produce architectural visualization in the style of IMPACT 3D
  (Impact Design Studio, Ahmedabad — Manji Vagjiyani, 3ds Max + Chaos Corona):
  EXTERIORS (villas, bungalows, apartment towers, resorts, townships),
  INTERIORS (living rooms, bedrooms, kitchens, bathrooms, lobbies, pooja rooms,
  offices, showrooms) and CINEMATIC WALKTHROUGH FILMS. Covers camera, time-of-day
  lighting narrative, Corona/V-Ray render setup, material realism, Forest Pack
  environments, Indian architectural context, staging, post-production, and
  briefs for the Sthyra pipeline (MaxDirector, MaxGaffer, MatForge, ShotRunner),
  grounded in a shot-by-shot catalogue of 17 films from the studio's channel,
  with a V-Ray 7 (2026) render, material and VFB grade spec, Nano Banana
  Pro as the default model for generated concept images and Seedance 2.0
  as the default model for generated walkthrough clips.
  Use this skill whenever the user mentions Impact 3D, Manji Vagjiyani, Impact
  Design Studio, archviz, architectural rendering, exterior or interior render,
  villa/bungalow/apartment visualization, 3D walkthrough, property film, Corona
  render, "make it look like Impact 3D", or wants render briefs, lighting specs,
  material lists, shot lists, or image- and video-generation prompts for
  architecture —
  even if they only say "render this house" or "render this room".
triggers:
  - "impact 3d"
  - "manji"
  - "archviz"
  - "architectural visualization"
  - "exterior render"
  - "interior render"
  - "villa render"
  - "walkthrough"
  - "corona render"
  - "3ds max render"
---

# IMPACT 3D — Archviz Art Direction (v2: exteriors + interiors + films)

Reproduce the look, storytelling and production discipline of IMPACT 3D
(Impact Design Studio, Ahmedabad, est. 2010, owner Manji Vagjiyani). Version 1
of this skill covered exteriors only. Version 2 adds a full **interiors**
playbook, a **cinematic film** playbook, and the bridge into the Sthyra tools.

Ground truth comes from two places. First, shot-by-shot analyses of 17
films on the studio's YouTube channel (@manjivagjiyani is the IMPACT 3D
channel): ANUTHAM, VENETIAN, THE VARANDA, WESTERN MARINA, APARNA AQUA,
SUVARNABHOOMI, LE PARQUE (three cuts), Anaya, Swati Crimson, Serenity
Lavish, Swati CLOVER, TROGON, Center Court, THE CASCADES and CENTURY MIRAI;
see
`references/films-catalogue.md`. Second, the studio's published breakdowns
(Chaos Corona blog interview, Autodesk AREA "Making of VERANTES", project
pages). `references/sources.md` lists both and what could not be verified.

## 1. Route first

| User wants | Read | Then produce |
|---|---|---|
| Exterior still (villa, bungalow, tower, resort, aerial) | `references/exteriors.md` | shot list + lighting spec + environment recipe + post recipe |
| Interior still (any room, lobby, showroom, office) | `references/interiors.md` | shot list + lighting/LightMix spec + material & staging list + post recipe |
| Walkthrough / property film / animation | `references/cinematic-films.md` | storyboard + shot durations + music/sound brief + edit plan |
| Both exterior and interior of one project | all three | one project bible; keep one time-of-day arc across shots |
| Image-gen prompt only (concept image, relight, image-to-image polish) | §7 below, then §10/§11 of the relevant reference | model choice + prompt block from `assets/brief-template.md` §5 |
| Video-gen prompt only (animate a frame, walkthrough clip, day-to-dusk clip) | §7 below, then `references/cinematic-films.md` §12 | per-shot clip prompts from `assets/brief-template.md` §6 |
| "Make an Impact 3D style video" with Seedance 2.0 (whole film, previs, no 3ds Max scene) | `references/seedance-films.md` | project bible, beat list, film blueprint and a Seedance prompt per clip |
| Brief for MaxDirector / MaxGaffer / MatForge / ShotRunner | §6 below + `assets/brief-template.md` | filled template |
| "What does an Impact 3D film look like?", reference a specific project, match a specific shot | `references/films-catalogue.md` | the pattern list or the film entry, with video id |
| V-Ray render settings, VRayMtl recipes, VFB grade, texture standards, Chaos Scatter, splats, parallax interiors | `references/vray-quality.md` | settings block + material table rows + grade preset |

Ask only if the answer changes the deliverable: project type, room list, which
times of day, aspect ratio and channel (Instagram 4:5, brochure 3:2, film 16:9).
Otherwise assume: villa or apartment in Gujarat, three moods (early morning,
early evening, moonlit night), 3:2 stills at 4000 px, 16:9 4K film.

## 2. The IMPACT 3D signature (apply to every deliverable)

1. **Story before pixels.** Every image answers "what is it like to live here?"
   Pick a moment, a season, a person's activity, then compose for that. Manji's
   own framing: the goal is "a conceptual documentary" that helps the viewer
   "visualize a lifestyle". In the films this means a cold open on nature,
   an arrival by car, and one life detail in every interior frame.
2. **Time-of-day is the narrative device.** Present the same space at **early
   morning**, **early evening (golden/blue hour)** and **moonlit night** so the
   viewer sees how the architecture changes. Every film runs dawn to night and
   ends at night; the same plaza is shown by day and again as the lights come
   on. Never deliver only noon.
3. **Material realism is non-negotiable.** "Every surface texture and material
   should feel as naturally realistic as possible": micro-roughness variation,
   edge wear, correct IOR, real-world texture scale, no plastic sheen.
4. **The environment is alive.** Forest Pack scatter for lawns, shrubs, trees
   with species variation; water and foliage in motion (simulated in films,
   implied by ripples and wind-bent grass in stills).
5. **Indian context, rendered with confidence.** Vibrant but controlled colour,
   spiritual and cultural motifs (jaali, pooja niche, brass, marigold, jhoola),
   fusion of tradition and modernity, regional planting (frangipani, neem,
   palms, bougainvillea), the hard bright light of Gujarat softened by time of
   day.
6. **Camera highlights key features and connections.** Compositions show the
   relationship between indoor and outdoor: the living room framing the pool,
   the courtyard seen through the jaali, the terrace looking back at the city.
   Signature frames: tilt-up through trees, top-down through the pendant,
   through a screen or half-open door, balcony looking in at dusk, a
   symmetrical reflection in still water, a product close-up at shallow depth.
7. **Film = visuals + camera + music in unison.** Camera work with "finesse",
   music as the "heartbeat", and harmony in post. No shot exists without a
   reason in the edit.
8. **Post-production for harmony, not rescue.** Grade for consistency across
   the set; add glare, bloom, subtle chromatic aberration and vignette; never
   fix bad lighting in Photoshop.

## 3. Universal production workflow

Run these steps for any deliverable; the references specialise each step.

1. **Brief** — project, location, architect, audience, channel, moods, hero
   features. Fill `assets/brief-template.md` §1.
2. **Shot list** — 1 hero + 2–4 supporting per space or facade; one shot per
   mood minimum. Name shots `SPACE_MOOD_NN` (e.g. `LIVING_EVENING_02`).
3. **Blocking** — physical camera, focal length, height, tilt correction. Lock
   cameras before lighting.
4. **Lighting** — sun/sky or HDRI for the mood, then practicals in named light
   groups (LightMix in Corona, Light Mix in V-Ray). Exposure set per camera.
5. **Materials** — VRayMtl in roughness mode with Fresnel and metalness,
   roughness variation on every surface, coat/sheen/translucency where the
   class needs it, displacement or Enmesh where the eye lands; recipes and
   texture standards in `references/vray-quality.md` §4–6.
6. **Environment and staging** — scatter, water, entourage, props with a story.
7. **Render** — V-Ray 7 progressive, noise threshold 0.005 hero, denoiser
   element blended in comp, ACEScg colour management, Light Mix groups
   (`references/vray-quality.md` §1–3, §9). Corona equivalents: noise limit
   2–3 %, denoise 0.65. Test at 1/4 res per mood first.
8. **Post** — VFB2 layers (exposure, highlight burn, filmic/ACES, LUT,
   bloom, glare, CA, vignette) saved as a preset per mood
   (`references/vray-quality.md` §8), then a set-wide pass for consistency.
9. **QA** — run §7 checklist, then deliver with shot names and mood tags.

## 4. Exterior vs interior at a glance

| Decision | Exterior | Interior |
|---|---|---|
| Camera height | 1.6 m eye-level, 15–40 m elevated, 100 m+ aerial | 1.1–1.5 m; 0.9 m for bedrooms/lounges |
| Focal length | 24–35 mm (35 mm full frame); 50–85 mm for facade details | 18–24 mm; 35 mm for vignettes; never wider than 16 mm |
| Key light | Corona Sun + Sky or HDRI; sun 15–35° elevation for morning/evening | Sun/sky through openings; practicals carry evening and night |
| Fill | Sky dome, ground bounce | Walls and ceiling bounce; cove/indirect LED strips |
| Signature mood | Golden-hour facade with interior glow; moonlit night with landscape lighting | Morning light raking across floor; evening warm practicals against blue exterior |
| Environment | Forest Pack lawn, shrubs, trees; water; cars; people at distance | Layered textiles, plants, books, food, everyday traces; window view matters |
| Exposure (Corona EV) | −1 to +1 day; −4 to −6 night | +1 to +3 day; −1 to +1 evening; −2 to −4 night |
| Post emphasis | Atmosphere, haze, sky grade | Warmth, contrast in shadows, highlight roll-off |

## 5. V-Ray 7 (2026) is the production renderer

Impact 3D renders in Chaos Corona; the Sthyra tools target V-Ray 7 on
3ds Max 2026 with Vantage 3. Read `references/vray-quality.md` for the
full spec: ACEScg colour setup, render settings, lighting with Luminaires
and Night Sky, the VRayMtl rules, a MatForge-aligned recipe table for
every material class, texture standards, Chaos Scatter, Gaussian-splat
context, parallax interiors, the VFB2 grade recipe, render elements and
quality gates. Use this translation only when reading Corona advice:

| Corona | V-Ray 7 | Note |
|---|---|---|
| Corona Sun + Corona Sky | VRaySun + VRaySky | Match elevation/azimuth; Corona intensity 1.0 ≈ VRaySun intensity 1.0 with physical camera |
| Corona Light (disk/rect/sphere) | VRayLight (disc/plane/sphere) | Keep light groups named identically for Light Mix |
| Corona LightMix | V-Ray Light Mix render element | Same workflow: one render, balance later |
| CoronaPhysicalMtl | VRayMtl (roughness mode ON) | MatForge already writes roughness mode + Fresnel |
| Corona Camera exposure EV | VRayPhysicalCamera exposure value | Same EV convention |
| Corona tone mapping (highlight compress, LUT) | V-Ray Frame Buffer layers (Filmic, LUT) | Apply the same LUT file |
| Corona Volume Material / Corona Distance | VRayEnvironmentFog / VRayDistanceTex | Use fog sparingly for morning shots |
| Corona Proxy / Forest Pack | VRayProxy / Forest Pack | Forest Pack renders in both |

## 6. Sthyra tool hand-offs

- **MaxDirector** (cameras, storyboard): give it the shot list from the
  reference §"Shot list" plus the mood arc. Brief language: "establishing
  aerial at early morning, approach dolly, arrival at entrance, living room
  reveal toward pool at golden hour, night exterior with landscape lighting".
- **MaxGaffer** (lighting match): hand it one reference image per mood. Use
  the mood reference descriptions in `references/exteriors.md` §3 and
  `references/interiors.md` §3 to pick references; lock white balance to the
  values listed there before pressing MATCH LIGHTING.
- **MatForge** (materials): submit the material list from
  `references/interiors.md` §5 or `references/exteriors.md` §5, one reference
  photo per material, at 4K for hero surfaces and 2K elsewhere.
- **ShotRunner** (Vantage batch): each camera becomes a timed shot; set
  durations from `references/cinematic-films.md` §3.

## 7. Model choice for generated images and clips (2026)

Default: **Nano Banana Pro** (Gemini 3 Pro Image) for every arch viz
concept image, relight, plan-or-sketch-to-render and image-to-image polish
of a V-Ray frame. It wins on photorealism, material consistency, native
4K, multi-reference composition, localized edits and day-to-night
relighting, and it is fast enough to iterate twenty variants.
Use **GPT Image 2** only when the image carries readable text or an exact
layout: presentation boards, signage, brochure spreads, diagrams.
Nano Banana 2 (Flash) is the fallback for bulk, low-cost variants.

Nano Banana Pro rules:
- Write the prompt as sentences in the order given in the playbooks
  (frame, camera, light, materials with finish words, staging, render
  anchors). It reasons over the whole description; keyword lists
  underperform.
- Ask for 4K and the aspect ratio explicitly ("4K, 3:2").
- Feed references and compose: "layout of @image1, materials of @image2,
  light of @image3". Up to several references; the V-Ray clay or draft
  render is the best @image1.
- Relight instead of regenerating: "same image, change to blue hour with
  warm interior lights on" keeps geometry and materials.
- Localized edits for staging: "add a brass tray with three books on the
  coffee table, nothing else changes".
- It still invents plausible but wrong architecture; lock massing with a
  reference or a V-Ray frame, never from text alone for a real project.

Default for clips: **Seedance 2.0** (ByteDance, Feb 2026) for every
generated walkthrough shot, animated hero frame, day-to-dusk repeat, car
arrival, product close-up and previs film. It leads the image-to-video
leaderboards, keeps geometry and materials from a locked first frame,
takes up to 9 image, 3 video and 3 audio references addressed as @image1,
@video1, @audio1, locks a last frame, and renders 4–15 s at 1080p or 2K
(4K in "std" mode on hosts that expose it) with native audio.
Use **Veo 3.1** only when the architect speaks on camera and lip-sync
matters. Use **Seedance 2.5** when one beat must run longer than 15 s or
an existing clip needs extending. Seedance 2.0 Mini is the fallback for
bulk 720p drafts and animatics. For a whole film rather than a clip, go
to `references/seedance-films.md`: the project bible that keeps thirty
clips on the same building, the studio's creative DNA as prompt language,
a beat bank, blueprints per film mode and two films written out clip by
clip.

Seedance 2.0 rules:
- Every clip starts from a still: the V-Ray frame or the Nano Banana Pro
  still as @image1 first frame. Fix any artefact in the still first; the
  clip inherits it.
- One camera instruction per clip, taken from the studio's shot vocabulary
  (`references/cinematic-films.md` §3), with pacing words ("slow, eased
  dolly in") rather than numbers. Two moves in one prompt fight.
- Two or three sentences in this order: subject, action, camera,
  setting and light, style, audio. The first twenty words lock the shot.
- Shot length 4–6 s (8–12 s for aerial openers) so the edit keeps the
  studio's 3–5 s rhythm; ask for 16:9, 1080p or 2K, high bitrate.
- Day-to-dusk repeat: @image1 the day frame, @image2 the dusk frame as
  the last frame, "lights come on, sky deepens, camera static".
- Borrow motion, not looks: "camera movement of @video1" from a studio
  film or an earlier approved clip; keep the look from the still.
- Audio: hand it the score as @audio1 so the move lands on the beat, or
  turn native audio off and cut to music in DaVinci. Never keep its
  default orchestral bed.
- No on-screen text: titles, feature overlays, RERA cards are edit work.
- People at mid-distance only, never facing camera; a protagonist
  close-up needs a Nano Banana Pro reference of the same person.

## 8. QA checklist before delivery

- [ ] Every space has at least one morning, one evening and one night frame
      (or the user explicitly chose fewer moods).
- [ ] Verticals are corrected (no keystoning) unless the shot is an aerial.
- [ ] No material reads as plastic; every VRayMtl is in roughness mode with
      a roughness map or variation, coat/sheen where the class needs it.
- [ ] ACEScg colour management confirmed; colour maps sRGB, data maps raw;
      noise threshold reached and denoiser blended, no fireflies.
- [ ] Texture scale checked against a known object (door 2.1 m, brick 230 mm,
      tile 600 mm).
- [ ] Vegetation has at least three species and size variation; no cloned
      silhouettes side by side.
- [ ] Interiors show a believable window view and daylight direction that
      matches the exterior sun.
- [ ] Practical lights are grouped and named; night shots are lit by
      practicals, not by a global boost.
- [ ] Human presence is implied (props, an open book, a towel) or shown at
      distance with correct scale.
- [ ] Set-wide grade is consistent: same LUT, same white balance logic per
      mood, same vignette strength.
- [ ] Every interior frame has one styled close-up object group and one
      life cue (steam, a drink, an open book, a fan, a person mid-distance).
- [ ] Films: cold open on nature, arrival by car, dusk repeat of a daytime
      frame, night finale, credits with architect and RERA.
- [ ] Generated clips: each starts from an approved still, one camera
      move, no geometry drift between first and last frame, no baked-in
      text, native audio off or scored to the film's track.
- [ ] Shot names follow `SPACE_MOOD_NN`; deliverables listed with resolution.

## 9. Files in this skill

- `references/exteriors.md` — facades, aerials, landscape, night exteriors.
- `references/interiors.md` — room-by-room playbook, LightMix, staging,
  Indian interior vocabulary (new in v2).
- `references/cinematic-films.md` — film modes, the arc every film follows,
  shot vocabulary, music and sound, delivery specs, Seedance 2.0 clip
  recipes (rebuilt in v2 from the channel).
- `references/films-catalogue.md` — 17 films analysed shot by shot, cross-film
  patterns, the 2018 to 2026 evolution, video ids (new in v2).
- `references/seedance-films.md` — Impact 3D style films made with
  Seedance 2.0: project bible, creative DNA as prompt language, beat bank,
  blueprints per mode, two fully written films, music, transitions,
  vertical cut, creative rules (new in v2).
- `references/vray-quality.md` — V-Ray 7 (2026) render settings, lighting,
  VRayMtl rules and MatForge-aligned material recipes, texture standards,
  vegetation and context, VFB2 grade, render elements, quality gates,
  briefing phrasebook (new in v2).
- `references/sources.md` — channel and article catalogue, project list,
  verification caveats.
- `assets/brief-template.md` — fill-in brief for stills, films, image-gen
  and video-gen prompts.
