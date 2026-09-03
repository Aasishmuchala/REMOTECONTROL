# V-Ray 7 quality pipeline (2026) — render, materials, grade

The IMPACT 3D look was built in Corona; the Sthyra pipeline renders in
V-Ray 7 on 3ds Max 2026 with Chaos Vantage 3 for previews. This file is
the V-Ray-native spec: what to set, what to build, what to ask the tools
for, so that "Impact 3D quality" comes out of V-Ray rather than a
translation of Corona settings. Values marked MatForge match
`core/recipes.py` in the MatForge repo so materials made there drop in
unchanged.

Feature timeline used here (verify against the installed build):
V-Ray 7.0 (Nov 2024): Gaussian splats, Luminaires, firefly removal,
virtual tours, VFB region render, Chaos Scatter 2.0, Enmesh, GPU
caustics. 7.2 (Aug 2025): AI Material Generator, AI Enhancer for people
and vegetation, Night Sky, splats on GPU with clipping, OpenPBR, Cosmos
multi-import. 7.3 (Apr 2026): native parallax interiors, Quick Sun
Caustics, relightable splats, AMD GPU. A later 2026 update adds viewport
real-time rendering and Veras AI ideation; treat those as optional.

Contents
1. Scene and colour setup
2. Render settings that hit the bar
3. Lighting in V-Ray terms
4. Materials: the 2026 VRayMtl rules
5. Material recipes by class (MatForge-aligned)
6. Texture and detail standards
7. Vegetation, people, cars, context
8. VFB2 grade recipe
9. Render elements for comp
10. Vantage and preview discipline
11. Quality gates before delivery
12. Phrasebook for briefing the tools

---

## 1. Scene and colour setup

- 3ds Max 2026, units in centimetres or metres, system unit consistent
  across merged assets. Real-world scale is what makes roughness, bump
  and displacement values below behave.
- Colour management OCIO with the ACEScg working space (3ds Max 2024+),
  ACES 1.3 output transform for display. Textures: colour maps tagged
  sRGB, data maps (roughness, normal, height, metalness) tagged Raw or
  Utility-Linear. Never gamma 1.0 hacks on colour maps.
- V-Ray colour management "OCIO" to match; VFB display transform set to
  the same view. Mismatched spaces are the number-one cause of dull
  V-Ray images.
- Physical camera only. Exposure by EV, not by light multipliers.
- Scene hygiene: no overlapping faces, glass as single thin shells
  where "thin-walled" is set, interiors built as closed rooms so bounce
  is correct, ground plane extends past every camera.

## 2. Render settings that hit the bar

Stills (hero, 4000 px on the long edge, 5000–6000 for print):
- Engine: V-Ray GPU (RTX, hybrid) for interiors and product frames,
  V-Ray CPU for dense vegetation or when memory exceeds the GPU. Both
  reach the same look when noise threshold is the stop condition.
- Progressive, noise threshold 0.005 hero / 0.008 supporting, min
  shading rate 6 (CPU), max subdivs 24, time limit 0.
- GI: Brute Force primary, Light Cache secondary, retrace 2.0, subdivs
  3000; interiors add "use camera path" for animations only.
- Denoiser: NVIDIA AI denoiser on GPU or Intel Open Image Denoise on
  CPU, strength 1.0, and keep the denoiser render element so it can be
  mixed back to 70–85 % in comp. Firefly removal on.
- Lens: motion blur off for stills, depth of field on the physical
  camera only for vignettes, bokeh 6–8 blades.
- Caustics: Quick Sun Caustics on for pool and water shots; full
  photon caustics only when the pool is the hero.
- Anti-aliasing filter: Lanczos 2.0 for stills, Box for film frames
  that go through Vantage.

Film frames (3840 × 2160, 25 fps):
- Noise threshold 0.01 with denoiser and anti-flicker (Light Cache
  "fly-through" for camera-only motion, otherwise per-frame with
  denoiser temporal mode).
- Motion blur on, 180-degree shutter (0.5 duration).
- Vantage for the amenity walk and interior tour; full V-Ray for the
  nature opener, arrival, dusk reveal and night aerial.

## 3. Lighting in V-Ray terms

- Sun: VRaySun with VRaySky, intensity 1.0, size multiplier 2–4 for
  softer shadow edges at golden hour, turbidity 3 (morning) to 5
  (haze), ozone 0.35. Filter colour left white; warmth comes from the
  sun's altitude and the camera white balance.
- Sky alternatives: VRayLight dome with a 16k HDRI at multiplier
  0.8–1.2 for blue hour and night; Night Sky (7.2+) for the moonlit
  finale with a real moon and stars.
- Interior daylight: no portals needed with Light Cache retrace; keep
  glazing thin-walled so daylight passes without refraction cost.
- Practicals: VRayLight disc and plane for coves and panels, VRayLight
  sphere for bulbs, IES profiles on downlights, and Luminaires (7.0+)
  for Cosmos fixtures so the emissive geometry lights the room
  correctly. Colour 2700–3000 K interiors, 3000 K landscape, 6500 K
  screens.
- Every light in a named group for Light Mix: `SUN_SKY`, `HDRI`,
  `CEILING`, `COVE`, `WALL`, `TASK`, `DECOR`, `EXT_LANDSCAPE`,
  `INTERIOR_GLOW`, `LANDSCAPE`, `FACADE`, `POOL`, `STREET`, `SCREEN`.
  Render once per mood, balance in the VFB, save the mix as a preset so
  stills and film match.
- Exposure per mood on the physical camera: day interiors EV 11–13,
  day exteriors EV 13–15, golden hour EV 10–12, blue hour EV 7–9,
  night EV 4–6 (ISO 100, f/8, shutter derived). White balance 5500 K
  morning, 4500 K evening, 4000 K night.
- MaxGaffer owns exposure and white balance from the reference image;
  hand it the mood description from the exteriors or interiors playbook
  and let its solver set EV and Kelvin.

## 4. Materials: the 2026 VRayMtl rules

1. **VRayMtl in roughness mode, Fresnel on, metalness workflow.**
   Never the legacy glossiness mode. Dielectric IOR 1.5, glass 1.52,
   water 1.33, metals via metalness 1.0 with the albedo tinting the
   reflection. MatForge writes exactly this.
2. **Roughness always varies.** A roughness map or a VRayColor2Bump-free
   noise mix on every surface, with the class variation below. Flat
   roughness is the plastic look.
3. **Microfacet GGX** with GTR tail 2.0; anisotropy only on brushed
   metals and lacquered wood.
4. **Layers where the eye lands.** Coat for lacquered wood, painted
   metal, glazed tile, leather; sheen for fabrics and velvet; thin
   film for soap, oil and some glass; translucency for marble, wax,
   paper, leaves (VRay2SidedMtl for thin leaves).
5. **Bump is a percentage.** VRayMtl bump 10–50 on the 0–100 scale;
   normal maps through VRayNormalMap at gamma 1.0 with flip green
   checked against the map's convention. Displacement through
   VRayDisplacementMod in world units, 0.3–3 mm for interiors, up to
   30 mm for lawns and rubble, and Enmesh for repeating relief
   (rattan, perforated screens, jaali).
6. **OpenPBR when importing** (7.2+) from Substance or Adobe
   libraries; keep native VRayMtl for anything authored in-house so
   MatForge, Vantage and Light Mix stay predictable.
7. **AI Material Generator (7.2+)** is a starting point for a photo of a
   real surface; run the result through the class rules below, fix the
   IOR, roughness range and scale, and add wear maps before it ships.
8. **Wear and dirt.** VRayDirt (or VRayCurvature) driving a mask for
   edge wear on metal and wood and dust in grout and corners; VRayDistanceTex
   for water lines on pool copings and moss at the base of walls.
9. **Randomise repeats.** VRayUVWRandomizer with stochastic tiling on
   floors, lawns, cladding and brick; VRayMultiSubTex by object ID for
   planks, tiles and bricks so no two neighbours share a map.
10. **Scans for hero surfaces.** Chaos Scans (VRayScannedMtl) for car
    paint, leather and fabrics in a hero close-up; Cosmos materials
    elsewhere, rescaled to real-world size.

## 5. Material recipes by class (MatForge-aligned)

Roughness values are the base with the variation range that the
roughness map must cover. Bump is the VRayMtl percentage.

| Class | IOR / metalness | Roughness (± variation) | Bump % | Displacement | Layers | Notes |
|---|---|---|---|---|---|---|
| Statuario / Italian marble | 1.5 / 0 | 0.12 (±0.08) | 10 | none | translucency 0.15, colour 0.93/0.91/0.88 | large-scale mask across the floor so veins never tile |
| Granite, terrazzo (polished) | 1.5 / 0 | 0.18 (±0.10) | 12 | none | none | chip mask drives a second roughness |
| Kota, Jaisalmer, sandstone | 1.5 / 0 | 0.70 (±0.20) | 50 | 3 mm | none | per-slab colour via MultiSubTex |
| Concrete, plaster | 1.5 / 0 | 0.75 (±0.15) | 40 | 2 mm | none | staining at parapets with VRayDirt |
| Microcement, polished concrete | 1.5 / 0 | 0.30 (±0.12) | 15 | 0.3 mm | none | trowel marks in the roughness map |
| Terracotta, clay brick, jaali | 1.5 / 0 | 0.62 (±0.18) | 45 | 1.5 mm | none | jaali relief through Enmesh |
| Wood, interior lacquered | 1.5 / 0 | 0.45 (±0.20) | 30 | 0.8 mm | coat 0.25 at gloss 0.92 | anisotropy 0.2 along grain on tabletops |
| Wood, exterior weathered | 1.5 / 0 | 0.65 (±0.30) | 45 | 1.5 mm | none | silvering mask on the sun side |
| Painted wall | 1.5 / 0 | 0.70 (±0.08) | 12 | none | none | roller noise in bump only |
| Fabric, linen, upholstery | 1.5 / 0 | 0.85 (±0.10) | 35 | none | sheen 0.85 grey at gloss 0.55 | weave normal at 1:1 scale |
| Velvet | 1.5 / 0 | 0.90 (±0.05) | 30 | none | sheen 1.0 tinted at gloss 0.35 | reads only with a rim light |
| Leather | 1.5 / 0 | 0.50 (±0.20) | 40 | none | coat 0.15 at gloss 0.80, sheen 0.6 at 0.45 | worn edges via VRayDirt |
| Rug, carpet | 1.5 / 0 | 0.85 (±0.10) | 30 | 5–8 mm or VRayFur | none | fur for the hero rug only |
| Sheer curtain | 1.5 / 0 | 0.60 | 10 | none | opacity 0.45, translucency | modelled folds, never a flat plane |
| Glass, glazing | 1.5 / 0 | 0.02 (±0.02) | 4 | none | refraction IOR 1.52, thin-walled, fog 0.98/1.0/0.985 at 0.05, affect shadows | solid shells only for table tops and bottles |
| Glass, frosted | 1.5 / 0 | 0.30 (±0.05) | 6 | none | refraction gloss 0.60, thin-walled | |
| Glazed ceramic tile | 1.5 / 0 | 0.08 (±0.05) | 6 | none | coat 0.40 at gloss 0.97 | grout as a separate matte material |
| Brass, gold fittings | 1.5 / 1.0 | 0.20 (±0.08) | 8 | none | none | albedo 0.94/0.78/0.45 warm; fingerprints in roughness |
| Stainless, satin metal | 1.5 / 1.0 | 0.20 (±0.08) | 8 | none | none | |
| Brushed metal | 1.5 / 1.0 | 0.35 (±0.15) | 20 | none | anisotropy 0.55 | rotate anisotropy per part |
| Chrome | 1.5 / 1.0 | 0.03 (±0.02) | 4 | none | none | needs a real environment to reflect |
| Powder-coated metal | 1.5 / 0 | 0.40 (±0.10) | 15 | none | coat 0.35 at gloss 0.90 | |
| Corten, rust | 1.5 / 0.25 | 0.65 (±0.25) | 40 | 0.5 mm | none | metalness mask, not a flat 0.25 |
| Car paint | 1.5 / 0.85 | 0.30 (±0.05) | 3 | none | coat 1.0 at gloss 0.98, flakes | Chaos Scan preferred |
| Pool water | 1.33 / 0 | 0.02 (±0.02) | 8 | ripple normal or Phoenix | refraction 1.33, fog 0.96/0.99/1.0 at 0.02, affect shadows | Quick Sun Caustics on |
| Foliage | 1.45 / 0 | 0.35 (±0.20) | 25 | none | VRay2SidedMtl translucency 0.55/0.68/0.38 at 0.40, clip opacity | never refraction |
| Lawn | 1.45 / 0 | 0.50 (±0.20) | 30 | scatter, not displacement | 2-sided | three grass models, colour variation |

## 6. Texture and detail standards

- Hero surfaces 8K, secondary 4K, background 2K. Real-world scale set
  in the map's UV tiling, checked against a 1 m cube.
- Full PBR set: albedo, roughness, normal, height, and metalness or
  opacity where the class needs it; ambient occlusion baked into
  albedo only for background props.
- Stochastic tiling or UDIMs on any surface larger than 4 m.
- Chamfer or VRayEdgesTex rounding on every visible hard edge; nothing
  in a photograph has a zero-radius edge.
- Two levels of detail in every frame: a large form (the sofa) and a
  fine one (the stitch line, the fabric weave, the dust on the shelf).
- Props from Cosmos are rescaled and re-materialed to the table above;
  their default materials are not hero quality.

## 7. Vegetation, people, cars, context

- Chaos Scatter 2.0 for lawns (three grass models, camera-distance
  density, edge falloff along paths), shrubs and ground cover; Forest
  Pack renders equally well if the asset library is already there.
  Trees: three species, three ages, Cosmos or GrowFX, wind on for
  film.
- People: Cosmos animated people at mid-distance; run the 7.2 AI
  Enhancer on people and vegetation in post for stills only, then
  compare against the raw frame and keep the enhancer result only
  where it does not change materials or light.
- Cars: Cosmos or scanned models with car-paint scans; one luxury
  sedan or SUV does the arrival.
- Context: capture the real site as a 3D Gaussian Splat (7.0+, GPU and
  clipping in 7.2, relightable in 7.3) and clip the modelled plot into
  it for riverfront, lake and city-edge projects; this is how the real
  Sabarmati or Hyderabad lake context in the films gets matched.
- Interiors behind glass in tower exteriors: native parallax interiors
  (7.3) on every lit window so the night facade reads as furnished
  without modelling every flat.

## 8. VFB2 grade recipe

Apply in the VFB as layers, save as a preset per mood, reuse in film.
1. Exposure: 0 (camera EV already set); white balance per mood.
2. Highlight burn 0.6–0.8 so the window view and the sky hold.
3. Filmic tone map or ACES view transform; contrast 1.1–1.2.
4. Curves: gentle S, black point lifted 2–3 %.
5. Hue/saturation: saturation 1.05, warm midtones for interiors.
6. LUT: one print-style LUT at 40–60 % opacity across the whole
   project.
7. Lens effects: bloom size 2–4 % at intensity 0.2, glare with 6-blade
   aperture at 0.15 and mild dispersion; only from real bright sources.
8. Chromatic aberration 0.3 px at the frame edge, vignette 8–12 %.
9. Denoiser blend 70–85 % where fine texture must survive.
10. Sharpen 0.2 at the end, never before the denoiser.

## 9. Render elements for comp

Beauty, Light Mix (one per group), Denoiser, Cryptomatte (material and
object), MultiMatte for glass and metals, Reflection, Refraction, GI,
Lighting, Specular, Z-depth, Normals, ExtraTex with VRayDirt for AO, and
Velocity for film. EXR 16-bit half, ACEScg, one multi-layer file per
frame.

## 10. Vantage and preview discipline

- Vantage 3 live link for lighting and camera work; every MaxGaffer
  iteration is mirrored there.
- Vantage renders the amenity walk and the interior tour of films; its
  material fidelity is lower on coat, sheen and translucency, so hero
  interiors and the dusk reveal go through full V-Ray.
- ShotRunner exports one `.vrscene` per camera; success is fresh frames
  on disk.

## 11. Quality gates before delivery

- [ ] OCIO ACEScg confirmed in both 3ds Max and the VFB; colour maps
      sRGB, data maps raw.
- [ ] Every VRayMtl in roughness mode with a roughness map or variation.
- [ ] Texture scale checked against a real object in every room.
- [ ] Edges chamfered or VRayEdgesTex on all visible hard edges.
- [ ] No pure white albedo above 0.9 and no pure black below 0.03.
- [ ] Noise threshold reached, denoiser blended, no fireflies.
- [ ] Light Mix groups named and saved as a preset per mood.
- [ ] Glass thin-walled where it should be; refraction only on solids.
- [ ] Window view is rendered geometry, splat or parallax interior,
      not a pasted photo.
- [ ] Grade applied as VFB layers and saved, LUT shared across the set.

## 12. Phrasebook for briefing the tools

Use these phrases in briefs, storyboards and prompts so the request maps
to a V-Ray 7 setting rather than a mood word.

| Say | Means in V-Ray 7 |
|---|---|
| "hero still at 6k, noise 0.005, denoiser blended 80 %" | progressive, threshold 0.005, denoiser element mixed in comp |
| "ACEScg pipeline, filmic view" | OCIO working space and VFB display transform |
| "roughness-mode VRayMtl with coat" | modern shading model, layer enabled |
| "VRayUVWRandomizer stochastic" | no visible tiling |
| "Enmesh jaali" | repeating relief geometry without displacement cost |
| "Luminaire pendants" | Cosmos fixtures lighting the room |
| "Night Sky with moon at 20 degrees" | 7.2 night sky system |
| "splat context, clipped to the plot" | Gaussian splat environment |
| "parallax interiors on the tower" | 7.3 windows |
| "Quick Sun Caustics on the pool" | 7.3 caustics |
| "Light Mix preset GOLDEN" | saved VFB light balance |
| "Chaos Scatter lawn, three models, camera falloff" | vegetation spec |
