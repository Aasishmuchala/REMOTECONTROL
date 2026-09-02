# Sources and verification notes

## Who
- **Studio**: IMPACT 3D / Impact Design Studio / Impact 3D Animation LLP,
  Ahmedabad, Gujarat, India. Established 2010 by two brothers. Tagline:
  "We connect, communicate and add values to a future reality."
- **Owner**: Manji Vagjiyani (also spelled Vaghjiyani).
- **Tools stated publicly**: Autodesk 3ds Max, Chaos Corona (primary), V-Ray
  (also listed), Forest Pack, simulations for water and trees, camera
  animation, Photoshop post.
- **Services**: architectural imagery (exterior and interior stills),
  cinematic property films / walkthrough animations, interactive
  environments, 360° panoramic tours, interior architectural photography.

## Channels
- YouTube (personal): Manji Vaghjiyani —
  https://www.youtube.com/@manjivagjiyani (channel id UCzf5i6tiFHp2efNgt7RATjQ)
- YouTube (studio): IMPACT 3D — https://www.youtube.com/channel/UC69klyto5yMmUcQjv4UniLQ
- Known video titles (from search indexes): "ANUTHAM BY RAVI DESAI _ IMPACT
  3D", "VENETIAN _ IMPACT3D" (Sabarmati Riverfront), "Impact Project 3D
  walkthrough" (Oct 2022). Studio naming convention: `PROJECT _ IMPACT 3D`.
- Website: https://impactdesign.co.in (projects: Anutham, Meraki Hills
  (Udaipur), Le Parque (Gala, Ahmedabad; architect and landscape Bill
  Bensley), Poulomi Palazzo (Hyderabad), URBANA, Pravite Residence, Ekaaya
  Resort, The North Apartment, Swati Senior)
- Behance: https://www.behance.net/IMPACT3D (MARIGOLD by HM Architect,
  Riviera Elegance Gandhidham-Kutch, Sahaj 22 Mehsana)
- Pinterest board "3D Architectural Interior Rendering - IMPACT 3D":
  https://in.pinterest.com/impact65251255/3d-architectural-interior-rendering-impact-3d/
- Instagram: @impact_3d, @manji_impact3d
- LinkedIn: https://in.linkedin.com/company/impact-3d

## Published breakdowns used for the playbooks
1. Chaos Corona blog, "Mastering the art of archviz: Insights from Impact
   Design Studio" —
   https://blog.corona-renderer.com/mastering-the-art-of-archviz-insights-from-impact-design-studio/
   Key points: studio history (2010, two brothers, ANUTHAM as turning point,
   recognition on the Corona forum); Indian culture as influence (vibrant
   colours, spiritual motifs, tradition-modern fusion); villa breakdown —
   materials "as naturally realistic as possible", lighting for early
   morning, early evening and moonlit night, Forest Pack scattering,
   simulations for water and trees, camera animation to show indoor-outdoor
   connection; storytelling tips — camera work with finesse, background music
   as the heartbeat, harmony in post-production.
2. Autodesk AREA, 3ds Max blog, "Making of VERANTES: A 3D arch viz
   breakdown" (18 Jul 2019) —
   https://area.autodesk.com/blogs/the-3ds-max-blog/making-of-verantes-a-3d-arch-viz-breakdown/
3. Project page: Anutham — https://impactdesign.co.in/projects/anutham/
   (Ravi Desai; architecture 9th Street Architects; landscape Tierra Design,
   Singapore; 3ds Max + Corona; "conceptual documentary presentation" to help
   viewers "visualize a lifestyle").

## What was verified and what was not
- The YouTube channel and the article pages could not be opened from the
  build environment (network egress to youtube.com, vimeo.com, behance.net,
  area.autodesk.com, blog.corona-renderer.com and impactdesign.co.in is
  blocked). Content above comes from search-engine summaries of those pages
  and from indexed video titles.
- Numeric settings in the playbooks (EV ranges, Kelvin, roughness values,
  noise limits, durations) are standard Corona/V-Ray archviz practice tuned
  to reproduce the studio's published look; they are not quoted from Manji
  Vagjiyani. Treat them as starting points and calibrate against the
  reference images.
- To tighten the skill further from the videos themselves: on a machine with
  YouTube access, pull the channel's video list and transcripts (for example
  with `yt-dlp --flat-playlist -J` and `--write-auto-sub`) into
  `references/videos/` and update the playbooks with anything the videos
  contradict.
