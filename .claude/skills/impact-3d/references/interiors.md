# Interiors — the IMPACT 3D playbook (new in v2)

Impact 3D interiors read as photographed rooms in a real Indian home or
hospitality space: sunlight with direction, materials you can feel, a view
through the window that connects to the exterior set, and a lived-in but
disciplined staging. The interior work sits inside the same time-of-day
narrative as the exteriors (early morning, early evening, moonlit night).

## What the films show (read before the rest)

Sixteen IMPACT 3D films were analysed shot by shot (`films-catalogue.md`).
The interior frames in them agree on this recipe:

- **One wide per room, one styled close-up.** The wide is a static frame
  or a slow pan at about 1.2 m; the close-up is at shallow depth on a
  single group of objects: glasses on an open magazine on a velvet ottoman,
  lilies in a white vase with a copper vase and a blue glass bottle, a
  nightstand with a clock and yellow flowers, three books and a succulent on
  a coffee table, a tray with coffee, croissants and fruit beside a red
  espresso machine, pancakes on the breakfast bar with a bag of vegetables,
  pomegranates on marble, a dining table set with gold cutlery and white
  roses.
- **Daylight through sheers or louvers.** Sheer beige or white curtains,
  wooden louvers throwing stripes, a curtain blowing in a breeze. Midday is
  bright and even in the wides; sunset fills the window in the bedroom.
- **One bold artwork per room.** A large circular abstract over a grey
  textured stone headboard wall, a red skyline painting in the dining room,
  black-and-white abstracts in a corridor.
- **Palette.** Earth tones: tan leather, striped rugs in browns and creams,
  grey stone feature walls, wood panelling, brass or copper accents, one
  colour accent (blue velvet, teal chairs, green velvet, mustard).
- **Chandeliers as camera subjects.** Ring, tiered gold, four-ring, black
  modern; the studio shoots top-down through them onto the table.
- **The balcony as the hinge.** Two chairs, a small table with coffee cups
  or a bowl of nuts and two glasses, potted plants, candles at dusk; often
  photographed from outside looking in through the sliding glass so the warm
  interior sits against the cool evening.
- **Warm practicals from dusk.** Cove LEDs behind wall panels, pendants,
  bedside lamps, Edison-bulb clusters; ceilings never washed flat.
- **Life without clutter.** Steam from a pot, a TV showing content, a
  ceiling fan turning, drawers sliding open, a person mid-distance in the
  amenity spaces, never in the bedrooms.
- **Amenity interiors count as interiors.** Lobby with a receptionist and
  a chandelier, library with a rolling ladder or shelves spelling READ,
  games room with a pool table and carrom boards under green dome pendants,
  banquet hall with a golden tiered ceiling, kids room with a mural and a
  ball pit, cinema with a star ceiling, yoga room with a circular cutout,
  salon, spa tray with rolled towels, cafe counter with the project logo.
- **Indian cues.** A pooja niche or mandir dressed with marigold garlands,
  a Ganesha with a lamp and flowers, a jhoola in a shaded pavilion, jaali
  and golden screens, brass and copper, lotus in a bowl.

Contents
1. Shot list by room
2. Camera
3. Lighting by mood (with MaxGaffer reference descriptions)
4. Corona / V-Ray settings
5. Materials
6. Staging and Indian interior vocabulary
7. Indoor–outdoor connection
8. Post-production
9. Common mistakes
10. Image-generation prompt pattern

---

## 1. Shot list by room

Default per room: one hero wide, one reverse or cross-view, one detail
vignette. Multiply by the moods the brief asks for.

| Room | Hero | Secondary | Detail vignette |
|---|---|---|---|
| Living room | From entry toward the main glazing (garden/pool visible) | From the glazing back to the seating and staircase | Coffee table styling, sofa fabric in raking light |
| Dining | Along the table length toward the window or the kitchen island | From the kitchen looking back at dining | Tableware, pendant over table |
| Kitchen | Island in the foreground, run of cabinets behind, window at the end | 35 mm from the corner, countertop level | Stone counter, brass tap, fruit |
| Master bedroom | Foot of bed, headboard wall as backdrop, balcony door to one side | From the window toward the bed and wardrobe | Bedside lamp, textiles, book |
| Guest / kids bedroom | Diagonal from the door | Desk or window seat | Shelf styling |
| Bathroom | From the door: vanity, then shower/tub as the deep element | Detail of stone and fixtures | Water droplets, towels |
| Entrance foyer / lobby | Symmetrical, doors open, exterior visible | Reception or console detail | Floor pattern, art |
| Pooja room | Frontal, low camera, lit by lamps and skylight | Through the jaali screen | Brass bell, diya, marigold |
| Home theatre / lounge | Low camera, screen glow as key at night | Bar or seating detail | Wall light, leather |
| Terrace / balcony (transitional) | From inside looking out, sliding door open | From outside looking in at night | Planter, seating, city view |
| Office / showroom | From reception into the open plan | Meeting room through glass | Product or workstation detail |

Name: `LIVING_MORNING_01`, `MASTER_NIGHT_02`, and so on.

## 2. Camera

- Physical camera, full-frame sensor, focal 18–24 mm for the hero, 24–28 mm
  for medium, 35–50 mm for vignettes. Do not go below 16 mm; ultra-wide
  stretches furniture and breaks the photographic feel Impact 3D relies on.
- Height 1.1–1.5 m; the films sit at about 1.2 m for wides. Bedrooms and
  lounges 0.9–1.2 m so beds and sofas gain presence. Kitchens 1.2–1.4 m to
  keep the counter as a horizontal band. Close-ups drop to table height.
- Two-point perspective. Tilt the camera to zero and use lens shift (Corona
  camera "vertical tilt correction" or VRayPhysicalCamera auto vertical
  tilt). Aerials are the only exception.
- Aspect ratios: 3:2 for brochures and portfolio, 4:5 for Instagram, 16:9
  when the still doubles as a film frame. Compose for the tightest crop.
- Depth of field: f/8–f/11 on wides (everything sharp), f/2.8–f/4 on
  vignettes with focus on the nearest styled object.
- Place cameras where a photographer could stand. If a wall must be hidden,
  use camera clipping, not a removed wall, so bounce light stays correct.

## 3. Lighting by mood

Interiors carry the same three-mood arc as the exteriors, but the practicals
do more of the work as the day ends. Keep every light in a named group so
LightMix / Light Mix can balance after rendering.

Groups to create in every interior scene: `SUN_SKY`, `HDRI`, `CEILING`,
`COVE`, `WALL`, `TASK` (table, floor, bedside lamps), `DECOR` (candles,
niche lights), `EXT_LANDSCAPE` (garden lights visible through glass),
`SCREEN` (TV or projector when relevant).

### Early morning
- Corona Sun elevation 12–25°, warm (5200–5600 K), intensity 1.0; Corona Sky
  or an early-morning HDRI at 0.8–1.0. Sun must enter through the glazing and
  rake across the floor. If the plan orientation does not allow it, rotate
  the sun within reason and note it in the brief.
- Practicals off or at 5 %. No cove light.
- Camera EV +1.5 to +3 (Corona) with white balance 5500–6000 K. Highlight
  compression 3–5 so the window view stays readable.
- Optional Corona Volume/fog at very low density for visible sun shafts in
  double-height spaces only.
- MaxGaffer reference description: "bright bedroom or living room photograph,
  low sun through sheer curtains, long warm floor highlights, cool blue-white
  shadows, window view exposed, no artificial lights".

### Early evening (golden into blue hour)
- Sun below 8° or off; sky/HDRI shifted to blue-hour (7000–9000 K), intensity
  0.3–0.5. The exterior view goes cool and deep blue.
- Practicals on: COVE 100 %, CEILING 40–60 %, TASK 100 %, DECOR 100 %,
  EXT_LANDSCAPE 100 %. Warm practicals at 2700–3000 K.
- Camera EV −1 to +1, white balance 4000–4500 K so warm interior sits against
  cool exterior. This warm-inside/cool-outside contrast is the most recognisable
  Impact 3D interior mood.
- MaxGaffer reference: "luxury living room at dusk, warm lamps and cove
  lighting, blue evening sky and garden lights visible through floor-to-ceiling
  glass, rich contrast, no direct sun".

### Moonlit night
- Sky/HDRI night at 0.05–0.15, deep blue, or Corona Sky with sun below the
  horizon plus a weak cool "moon" Corona light (disk, 6500–7500 K) outside the
  main window.
- Practicals lead: COVE 100 %, WALL 80 %, TASK 100 %, DECOR 100 %, CEILING
  20–40 % (avoid a flat ceiling wash). SCREEN on if the room has one.
- Camera EV −2 to −4, white balance 3800–4200 K. Keep shadows dark; let the
  light pool.
- MaxGaffer reference: "night interior, layered warm lamps and hidden LED
  coves, dark blue window, glossy floor reflections, moody but readable".

### Lighting rules
- One dominant source per shot. Sun in the morning, cove/lamps in the evening.
- Practicals use IES profiles for spots and downlights; soft boxes only for
  cove and hidden LED.
- Never boost the global exposure to "see" a night scene; add or brighten a
  practical instead.
- Keep the exterior lighting scene state identical to the exterior set so
  film cuts between inside and outside match.

## 4. Corona / V-Ray settings

Corona (studio default):
- Noise limit 2–3 %, time limit off, denoise "Corona High Quality" at 0.65,
  Path tracing + UHD cache, GI/AA balance 16.
- Tone mapping: exposure per camera, highlight compression 3–6, white balance
  per mood, contrast 2–3, saturation 0 to +0.05, filmic curve or LUT (a
  Kodak-type print LUT at 40–60 % opacity), bloom 2–4 %, glare 2–4 % with
  moderate dispersion. Same LUT across the project.
- Render elements: Beauty, LightMix per group, CShading_Albedo, Reflect,
  Refract, ZDepth, Mask by material for glass and metals, CryptoMatte.
- Resolution 4000 × 2667 for 3:2 stills; 3840 × 2160 for 16:9 film frames.

V-Ray 7 via Sthyra:
- Progressive, noise threshold 0.005–0.008, Light Cache + Brute Force, denoiser
  on. VFB layers replicate the Corona tone mapping (exposure, white balance,
  highlight burn, filmic, LUT, bloom/glare). Light Mix element with the same
  group names. ShotRunner handles the Vantage batch for film frames.

## 5. Materials

Impact 3D interiors succeed on material credibility. Build with reference
photos (MatForge takes one photo per material) and treat these rules as
non-negotiable:

| Element | Recipe | Watch for |
|---|---|---|
| Italian marble / Statuario floor | 4K albedo with veining, roughness 0.05–0.12 with subtle variation map, slight bump from polish irregularities, reflection glossy not mirror | Tiling repeats across a large floor; randomise with multi-texture or a large-scale mask |
| Kota stone / Jaisalmer / Kadappa | Matte-satin, roughness 0.35–0.5, chipped edges via bevel, dust in grout lines | Avoid uniform colour; real Kota shifts green-grey |
| Teak / walnut veneer | Directional grain, roughness 0.2–0.35 with anisotropy, clear coat only on lacquered pieces | Grain scale: 1 m board width max |
| Wall paint | Roughness 0.6–0.8, faint roller noise bump, dielectric Fresnel | Flat unlit grey; add subtle tint |
| Lime plaster / textured wall | Displacement or high-res normal, roughness 0.7+ | Over-strong normal maps |
| Fabric (sofa, headboard) | Sheen/velvet layer, fine weave normal, roughness 0.7–0.9, slight translucency on sheers | No specular at all reads dead |
| Sheer curtains | Thin translucency, opacity 0.4–0.6, wind-bent cloth sim or modelled folds | Flat planes; always have folds |
| Rug | Fur/hair (Corona Hair or Forest Pack strands) or displacement 5–8 mm, colour variation | Height too uniform |
| Brass / gold fittings | Metal, roughness 0.15–0.3, warm reflect colour, fingerprints on handles | Perfect mirror gold |
| Black / bronze metal | Roughness 0.3–0.45, slight anisotropy on brushed | |
| Glass (partition, coffee table) | Thin-walled for panes, solid for table tops, IOR 1.52, faint green tint on edges | Refraction on thin panes doubles render time and mis-colours the view |
| Leather | Roughness 0.3–0.45, grain normal, worn edges | |
| Terrazzo | Chip map with distinct roughness per chip via mask, satin | Chips too small or too even |
| Ceramic tile | Grout as separate darker matte material, tile roughness 0.1–0.2 | Grout on the same shader |
| Plants (indoor) | Two-sided leaf translucency, slight subsurface | Solid, non-translucent leaves |

Scale check with a real object in every room (door 2.1 m, switch plate
86 mm, tile 600 mm). Add a roughness variation map to every reflective
surface; that variation is what separates a render from a diagram.

## 6. Staging and Indian interior vocabulary

Stage for a story, then remove 20 %. Impact 3D rooms are lived-in but never
cluttered.

Per room:
- Living: layered rugs, throw on the sofa, coffee-table books, a brass tray,
  a floor plant (fiddle-leaf fig, areca palm), art with a real subject, a
  jhoola (wooden swing) if the plan allows it, an open magazine.
- Dining: table half-set, water jug, fruit bowl, a pendant cluster, a
  sideboard with a brass lamp.
- Kitchen: a cutting board with produce, a kettle, one open shelf, a bowl
  of lemons, a copper or brass pot.
- Master bedroom: turned-down bed, bedside book and glasses, a robe on a
  chair, curtains half-drawn, slippers.
- Bathroom: folded towels, a plant, soap and a wooden tray, water beads on
  the glass.
- Pooja room: brass diya, bell, marigold garland, incense smoke (volume
  sliver), a skylight or niche light, a jaali screen.
- Foyer: console with a mirror, a bench, shoes not visible, a hanging light.
- Office/showroom: screens with real content, chairs pushed back unevenly,
  one person at distance if the brief wants scale.

Indian vocabulary to use deliberately (from the studio's stated influence of
"vibrant colours, spiritual motifs, and fusion of tradition and modernity"):
jaali screens as light filters, brass and copper accents, Kota/Jaisalmer
stone floors, teak, cane and rattan, terrazzo, lime plaster, temple-inspired
niches, marigold and jasmine, block-print textiles, a mandir niche lit
warmly, indoor courtyards (chowk) with a tree. Keep saturation controlled:
one vibrant accent per room against warm neutrals.

## 7. Indoor–outdoor connection

Impact 3D compositions show the "connection with different indoor and
outdoor areas". For every interior hero:
- Make the window view a real place: the same landscape scene as the exterior
  set, with Forest Pack scatter, the pool, the compound wall and the sky at
  the same time of day.
- Open at least one door or sliding panel in the evening and night shots so
  the garden lighting reads.
- Expose for the interior and let highlight compression hold the exterior;
  do not composite a photo behind the glass.
- Use curtains, pergola shadows and jaali patterns to bring the outside light
  onto interior surfaces.

## 8. Post-production

Order: Corona VFB (or VFB layers) → Lightroom/Camera Raw → Photoshop.
- Per mood: exposure balance, white balance nudge, highlight roll-off,
  shadow lift no more than 10 %, clarity 5–10 on stone and wood only.
- Glare and bloom from the renderer, never painted. Subtle chromatic
  aberration 0.2–0.4 px at edges. Vignette 5–10 %.
- Colour: keep skin-tone-safe warm mid-tones, cool the window view slightly
  in evening and night shots to strengthen the contrast.
- Add: dust in sun shafts (morning), steam from a cup, TV screen glow, faint
  reflections on glossy floors; remove: fireflies, hot pixels, distracting
  highlights on chrome.
- Set-wide pass: open all frames side by side and match black point, LUT
  opacity and vignette. Consistency is the studio's stated goal in post.

## 9. Common mistakes

- Wide lens below 16 mm, or camera at 1.7 m in a bedroom.
- Global exposure raised for night; ceilings washed flat.
- Marble mirror-polished with zero roughness variation.
- Curtains as flat planes; rugs without pile.
- Window view black, blown out, or a pasted photo.
- Every prop centred and symmetrical; no sign of use.
- Different LUTs or white balance logic across rooms in one set.
- Saturated colour everywhere instead of one accent.

## 10. Image-generation prompt pattern (2026)

Use when the deliverable is a concept image rather than a 3ds Max render.
Model: **Nano Banana Pro** by default (photorealism, materials, 4K,
relighting, multi-reference); GPT Image 2 only if the frame carries text.
Ask for "4K, 3:2". Then write the prompt in this order, as full sentences,
not keyword soup:

1. **Frame**: "Photorealistic architectural interior photograph,
   V-Ray 7 render quality, [room] in a contemporary Indian villa in
   Ahmedabad."
2. **Camera**: "24 mm full-frame at 1.2 m, two-point perspective with
   corrected verticals, f/8, ISO 100, 3:2."
3. **Light**: one mood sentence. Morning: "low sun raking across the
   floor through sheer curtains, cool blue-white shadows, no artificial
   lights." Evening: "warm 2700 K cove and lamp light against a blue-hour
   garden seen through floor-to-ceiling glass." Night: "layered warm
   practicals, dark blue window, glossy floor reflections."
4. **Materials, named with their finish**: "honed Statuario marble
   floor with soft veining and subtle roughness variation, teak veneer
   wall with visible grain, brushed brass fittings with fingerprints,
   linen sofa with fabric sheen, sheer curtains with folds." Finish
   words (honed, brushed, satin, lacquered, weathered) do more than
   adjectives like luxurious.
5. **Staging**: one styled object group and one life cue: "coffee
   table with three books and a succulent, steam rising from a cup."
6. **Indoor-outdoor**: "glazing opening to a landscaped garden and
   pool, jaali screen casting patterned light."
7. **Render anchors**: "physically based materials, global
   illumination, soft contact shadows, subtle bloom and glare, filmic
   ACES grade, natural colour, no HDR halo."
8. **Negatives** (where the model takes them): "no fisheye, no
   oversaturation, no floating furniture, no duplicated objects, no
   text, no watermark, no cartoon."

With reference images, compose instead of describing: "same room layout
as @image1, materials from @image2, lighting mood of @image3". Generate
the still, upscale, then animate with a minimal motion prompt ("slow
push-in, curtain moving in a breeze") if a clip is needed.
