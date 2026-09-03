# IMPACT 3D brief template

Copy, fill, and hand the relevant section to MaxDirector, MaxGaffer,
MatForge, ShotRunner, or an image-generation tool.

## 1. Project
- Name / client / architect / location:
- Type: villa | row bungalows | apartment tower | resort | interior-only | office/showroom
- Audience and channel: brochure 3:2 | Instagram 4:5 | film 16:9 | Reels 9:16
- Hero features (max 3):
- Moods requested: early morning | early evening | moonlit night | (midday only if asked)
- Spaces (interiors): living, dining, kitchen, master bedroom, …
- Facades / views (exteriors): front, pool side, entrance, aerial, …
- Indian-context cues to include (jaali, brass, marigold, jhoola, Kota stone, …):

## 2. Shot list
```
SHOT ID              SPACE/VIEW        LENS  HEIGHT  MOOD     NOTE
LIVING_MORNING_01    living → pool     22    1.3 m   morning  sun rakes floor, jaali shadow
LIVING_EVENING_02    glazing → sofa    24    1.2 m   evening  cove + lamps vs blue garden
FRONT_NIGHT_01       3/4 front         28    1.6 m   night    pool lit, uplit frangipani
```

## 3. Lighting spec (per mood; give to MaxGaffer with one reference image)
- Mood:
- Sun elevation / azimuth / Kelvin / intensity:
- Sky or HDRI / intensity:
- Light groups and levels (SUN_SKY, HDRI, CEILING, COVE, WALL, TASK, DECOR,
  EXT_LANDSCAPE, INTERIOR_GLOW, LANDSCAPE, FACADE, POOL):
- Camera EV / white balance / highlight compression:
- Reference image description:

## 4. Material list (give to MatForge, one reference photo each)
```
NAME                 TYPE        RES  HERO?  NOTES
Statuario_floor      stone       4K   yes    roughness variation, large-scale mask
Teak_veneer_wall     wood        4K   yes    grain along 2.4 m panels
Linen_sofa           fabric      2K   no     sheen layer
Brass_fittings       metal       2K   no     warm reflect, fingerprints
Lawn_grass           foliage     2K   no     Forest Pack, 3 variants
```

## 5. Image-generation prompt (when no 3ds Max render is planned)
Model: Nano Banana Pro (default for arch viz) | GPT Image 2 (text boards only)
Output: 4K, [3:2 | 4:5 | 16:9]
"Photorealistic architectural [interior|exterior] photograph, V-Ray 7
render quality, [space or facade] of a contemporary [villa|apartment|
resort] in [city], India. [Camera: mm, height, perspective, aperture,
aspect]. [Light: one mood sentence]. [Materials with finish words:
honed, brushed, satin, lacquered, weathered]. [Staging or landscape and
one life cue]. [Indoor-outdoor connection]. Physically based materials,
global illumination, subtle bloom and glare, filmic ACES grade, natural
colour."
Negative: fisheye, HDR halo, oversaturated, empty rooms, cloned trees,
flat noon light, floating furniture, duplicated objects, text, watermark.
References: "layout of @image1, materials of @image2, light of @image3".

## 6. Film (give to MaxDirector as acts, then ShotRunner for durations)
- Length / fps / aspect:
- Acts and shots (use references/cinematic-films.md §10):
- Scene states: MORNING, MIDDAY, GOLDEN, BLUE, NIGHT
- Music brief (genre, build, peak at dusk reveal):
- Sound design layers:
- Deliverables: 4K H.264, ProRes master, vertical cut, stills pack

Generated clips (previs, animatic, or a film with no 3ds Max scene):
Model: Seedance 2.0 (default) | Veo 3.1 (architect on camera, lip-sync) |
Seedance 2.5 (beat over 15 s, extend a clip) | Seedance 2.0 Mini (drafts)
Output: 16:9, 1080p or 2K std, high bitrate, 4–6 s per shot, audio off
unless the score is attached as @audio1
Per shot (see references/cinematic-films.md §12):
"@image1 is the first frame. [Subject], [what moves]. Camera: [one move,
slow and eased]. [Scene state sentence]. Photorealistic architectural
film, V-Ray 7 render look, 24 fps, natural colour, no text. Audio: [none
| ambient only | follow @audio1]."
Inputs: @image1 still | @image2 last frame (day-to-dusk) | @video1 camera
reference | @audio1 score excerpt

## 7. Post recipe
- LUT and opacity:
- Bloom / glare / CA / vignette:
- Per-mood white balance nudges:
- Set-wide consistency check done: yes/no
