# Exteriors — the IMPACT 3D playbook

Impact 3D exteriors (ANUTHAM, VERANTES, VENETIAN on the Sabarmati Riverfront,
LE PARQUE, Meraki Hills, Apricity, Riviera Elegance, Sahaj 22, Poulomi
Palazzo, URBANA) share a formula: architecture placed in a living landscape,
photographed at the times of day when light has direction, with the interior
glowing through the glass so the building reads as inhabited.

## What the films show (read before the rest)

From the shot-by-shot analyses in `films-catalogue.md`, the studio's
exterior frames repeat these moves:

- **The building is revealed through trees.** Low-angle tilt-up with
  foliage in the bottom corners, then an extreme low angle straight up at
  the towers with trees framing, then a facade seen through branches.
- **Arrival is a sequence, not a shot.** Aerial follow of a grey or black
  luxury car around a curve; rear track down a palm-lined road at low sun;
  lateral track over a balustrade bridge on a lily pond; the branded
  entrance wall with the logo in raking light and its shadow on the wall;
  the car turning in and stopping at the porch; people walking in.
- **Sunrise and sunset carry the exteriors.** A huge orange sun behind a
  bridge or tower, silhouettes, sun glint on glass with a flock of birds,
  morning mist on the water with god rays, long shadows across paving.
  Midday appears only for sports courts, playgrounds and pools.
- **Water is the mirror.** Towers reflected symmetrically in a still lake
  or lap pool; a water-level camera across the pool to striped umbrellas;
  three cabanas reflected in still water; a lily pond with a gazebo.
- **Landscape gets its own beats.** Top-down over the courtyard lawn,
  organic farm plots, a brook through the lawn, tiered gardens with
  cascading vines, corten screens on a stone path, clay urns with lotus,
  bougainvillea over a waterfall wall, a flowering tree in a circular
  planter with joggers around it.
- **Amenity exteriors.** Pool with cabanas, lagoon pool with rock edges,
  lap pool with trees on islands, rooftop infinity pool, tennis court shot
  symmetrically and then from above, glass-walled badminton court, sunken
  seating with a small pool, playground with a red or spiral slide,
  amphitheatre, outdoor cinema with string lights, rooftop fire pit.
- **Dusk is the hero.** Pool with underwater lights and fountains, interior
  glow through every window, the plaza frame repeated with lights on,
  balconies with candles, a lit entrance with a car and its headlights.
- **Night finale.** Low-angle tower with lit windows and people on
  balconies, cabanas lit from within against a deep blue sky, fire pit,
  entry road with ground lights, a night aerial with a city grid or a lit
  estate ringed by dark forest, and once each a full moon, four searchlights
  and fireworks over a lake.
- **Indian cues.** A brick entrance with a tiled roof, a white carved
  temple seen through wood slats, a golden jaali pavilion with pigeons, a
  mandir in the garden lit at night, purple and pink flowering trees.

Contents
1. Shot list by project type
2. Camera
3. Lighting by mood (with MaxGaffer reference descriptions)
4. Sky and atmosphere
5. Materials (facade)
6. Landscape and environment recipe
7. Entourage
8. Night exteriors
9. Post-production
10. Common mistakes
11. Image-generation prompt pattern

---

## 1. Shot list by project type

| Type | Hero | Supporting | Aerial |
|---|---|---|---|
| Villa / bungalow | Three-quarter front from the garden or pool, 1.6 m | Entrance approach; rear from the pool deck; terrace looking out | 25–40 m drone, 30° down, showing plot and landscape |
| Row bungalows / township | Street view along the row with a lead house | Cluster from the internal green; clubhouse | Masterplan aerial with roads and planting |
| Apartment tower | Podium-level view up the facade with landscape foreground | Entrance plaza; amenity deck; balcony view out | Skyline aerial at dusk |
| Resort / farmhouse | Arrival through the trees; pool and pavilion | Courtyard; villa cluster; restaurant deck | Site aerial with water and plantation |
| Riverfront / urban | From the promenade with people and water | Corner at street level; night skyline | High aerial with the river |

Per hero: morning, evening and night variants. Supporting shots pick one mood
each so the set covers the arc without repetition.

Name: `FRONT_MORNING_01`, `POOL_EVENING_02`, `AERIAL_NIGHT_01`.

## 2. Camera

- Full-frame physical camera. 24–35 mm for heroes, 50–85 mm for facade
  details and compressed street views, 20–24 mm for tight plots. Keep the
  building under 60 % of frame width so landscape and sky carry the mood.
- Heights: eye-level 1.6 m; elevated 4–6 m from a neighbouring terrace for
  pools; drone 15–40 m; masterplan 100–200 m.
- Verticals corrected on all ground-level shots (lens shift). Aerials keep
  natural convergence.
- Foreground layer in every shot: a branch, a planter, a pool edge, a
  pergola shadow. Impact 3D frames through something.
- Depth of field off or f/11 on architecture; f/4 only for detail shots.

## 3. Lighting by mood

Groups: `SUN_SKY`, `HDRI`, `INTERIOR_GLOW` (interior lights seen through
glass), `LANDSCAPE` (path lights, uplighters on trees), `FACADE` (wall
grazers, cove under eaves), `POOL` (underwater), `STREET` (poles, cars).

### Early morning
- Corona Sun elevation 15–30°, azimuth raking across the main facade at
  60–80° to the camera axis so texture shows; colour 5000–5600 K; intensity
  1.0. Corona Sky with slight haze, or a low-sun HDRI at 1.0.
- Ground fog / Corona Volume at very low density for depth in large sites.
- EV −0.5 to +1, white balance 5500–6000 K.
- Interior lights off. Dew and long shadows on the lawn.
- MaxGaffer reference: "modern villa photographed just after sunrise, low
  warm sun from the side, long shadows across the lawn, soft haze, pale blue
  sky, no artificial lights".

### Early evening (golden hour into blue hour)
- Sun 5–12° with 3500–4500 K warmth for golden hour; or sun off and sky
  7000–9000 K for blue hour. Blue hour is the studio's most frequent hero
  mood because the interior glow reads.
- INTERIOR_GLOW 100 % (warm 2700–3000 K), LANDSCAPE 60–100 %, FACADE 50 %,
  POOL 100 %.
- EV −2 to −3.5, white balance 4500–5500 K. Aim for sky luminance and
  interior luminance roughly equal.
- MaxGaffer reference: "luxury villa at dusk, warm interior lights glowing
  through floor-to-ceiling glass, deep blue sky, illuminated pool and garden
  path lights, balanced exposure".

### Moonlit night
- Sky HDRI night 0.05–0.1 or Corona Sky with a cool moon light (disk, 7000 K)
  from behind the camera or three-quarter back.
- INTERIOR_GLOW 100 %, LANDSCAPE 100 %, FACADE 80 %, POOL 100 %, STREET as
  needed.
- EV −4 to −6, white balance 3800–4500 K. Shadows stay dark blue; only lit
  surfaces are bright.
- MaxGaffer reference: "night photograph of a villa with landscape lighting,
  moonlit dark-blue sky, warm rooms glowing, uplit trees, reflections in the
  pool, no flat ambient light".

## 4. Sky and atmosphere

- Prefer a physical sky (Corona Sky / VRaySky) for morning and golden hour;
  an HDRI for blue hour and night for cloud interest. Match HDRI sun position
  to the Corona Sun when both are used.
- Add aerial perspective: Corona Volume / VRayEnvironmentFog at 0.002–0.005
  density on sites over 100 m deep, morning only.
- Clouds: a few, never a dramatic storm; the architecture is the subject.
- Gujarat light is hard; soften it by choosing time of day, not by lowering
  sun intensity.

## 5. Materials (facade)

| Element | Recipe | Watch for |
|---|---|---|
| Exposed concrete | Board-form or smooth 4K, roughness 0.5–0.7 with variation, faint water staining at parapets, tie holes | Uniform grey |
| Exposed brick / wire-cut brick | Individual brick variation (multi-texture), mortar recessed, roughness 0.6–0.8 | Tiled repeat visible |
| Natural stone cladding (Dholpur, Jaisalmer, granite) | Per-slab colour variation, 0.3–0.5 roughness, bevelled edges | Perfectly flat panels |
| Render / paint | Roughness 0.7+, subtle noise bump, dirt at the base | Flat white |
| Wood louvers / cladding (teak, ipe) | Directional grain, roughness 0.3–0.45, weathering on the sunny side | Mirror-like varnish |
| Glass (facade) | Thin-walled, low reflection tint, slight blue-green, interior visible | Opaque mirror glass hiding the interior |
| Metal (MS, aluminium fins) | Roughness 0.3–0.4, powder-coat finish, edge wear | |
| Terracotta jaali | Baked-clay roughness 0.6, colour variation per block | |
| Roof (metal, tile, terrace waterproofing) | Correct scale, dust, standing water patches for morning | |
| Paving (cobbles, Kota, pavers) | Displacement or normal, grout, puddles after rain for evening shots | |
| Pool water | Corona/V-Ray refractive water with caustics, ripple normal at 0.1–0.2 strength, light blue tint from tile | Static glass-flat water |

## 6. Landscape and environment recipe (Forest Pack)

The studio credits Forest Pack for "high-quality scattering with a natural
feel". Build it in layers:

1. **Lawn**: three grass models (short, medium, with clover) scattered on
   the lawn surface; density by camera falloff; slight colour variation via
   Forest Colour; a subtle displacement on the ground so the lawn is not a
   plane.
2. **Edges**: shrubs and ground cover along paths and walls (ixora, hibiscus,
   duranta, bougainvillea on walls, ferns in shade).
3. **Trees**: at least three species with 2–3 age variants each. Regional
   palette: frangipani (champa), neem, gulmohar, palms (foxtail, royal),
   banyan or peepal for older sites, plumeria near pools, bamboo screens
   for privacy.
4. **Planters and pots**: near entrances and on terraces; matched to the
   material palette (terracotta, concrete, brass).
5. **Water**: pool with wet deck edge, fountain or water body with ripple
   maps; in films the studio simulates water and tree motion; in stills imply
   it with wind-bent grass and ripples.
6. **Ground detail**: fallen leaves, gravel margins, tyre marks on the drive.
7. **Context**: neighbouring buildings low-detail but present; compound wall
   with a gate; road with markings; sky-line for towers.

Forest Pack rules: enable camera-based density falloff, use Forest Colour
for hue/lightness variation, exclude a 1 m band around cameras to avoid
foreground blobs, and never place identical silhouettes adjacent.

## 7. Entourage

- People at mid-distance, walking or seated, scale-checked at 1.7 m; a
  family at the entrance for villas, joggers on a riverfront, staff in a
  resort. Avoid hero-sized foreground people.
- Cars in the drive at correct scale; one car maximum for villas, a few for
  townships; wet reflections in evening shots.
- Birds at dawn, a dog on the lawn, a swing on the veranda.
- Interior visible through glass must be furnished and lit; empty interiors
  kill the "inhabited" feel.

## 8. Night exteriors

- Light the landscape first (path lights, uplighters at 2 m from tree
  trunks, step lights), then the facade (grazers under eaves, cove under
  cantilevers), then the interior glow.
- Pool underwater lights at 3000 K; the pool is often the brightest object
  in a night hero.
- Moon as a single cool disk light; sky HDRI at very low intensity for
  reflection detail only.
- Keep the sky dark blue, not black; keep unlit facade planes readable at
  2–5 % luminance.
- Light Mix: render once, balance groups in post; save the balance as a
  preset for the film so stills and film match.

## 9. Post-production

- Renderer: bloom and glare from bright practicals and the pool, moderate
  dispersion; highlight compression so the sky holds.
- Lightroom: white balance per mood, dehaze −5 to +5, clarity on stone and
  brick only, graduated filter darkening the top of the sky.
- Photoshop: sky replacement only if the render sky is featureless and the
  sun direction matches; light wrap where facade meets sky; lens flare only
  for golden hour and only from an in-frame sun.
- Consistency pass across the set: same LUT, same vignette, same black
  point.

## 10. Common mistakes

- Noon sun with no shadow direction; sun in front of the camera lighting the
  facade flat.
- Landscape with one tree species or clones side by side.
- Glass as a mirror; interiors dark in dusk shots.
- Aerials with corrected verticals (looks fake) or ground shots with
  keystoning.
- Pool water without caustics or ripples.
- Night exteriors with global ambient raised instead of practicals.
- Foreground people larger than 1.8 m or staring at the camera.

## 11. Image-generation prompt pattern

"Photorealistic architectural exterior photograph, [contemporary villa /
apartment tower / resort] in Ahmedabad, Gujarat, [mood: early morning low
sun with haze / dusk with warm interior glow through glass and blue-hour sky
/ moonlit night with landscape lighting and an illuminated pool],
[materials: exposed brick, teak louvers, stone cladding, glass], lush
Forest Pack style landscape with frangipani, palms and bougainvillea, pool
with ripples, family at the entrance at distance, 28 mm full-frame,
corrected verticals, three-quarter view, foreground branch, Chaos Corona
render quality, subtle bloom and glare, filmic grade, 3:2".
