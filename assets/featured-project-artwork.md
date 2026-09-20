# Featured Project Artwork

Conceptual cover illustrations generated with Codex's built-in image generation on 2026-09-20. These are not photographs of internal systems, source documents, real candidate records, or performance evidence. Automotive models are unbranded styling cues, not exact product depictions or an endorsement.

## Export Manifest

All four published covers are 1024 × 640 JPEGs (8:5), matching the existing Selected Public Builds artwork. Native 1586 × 992 PNG outputs were resized and JPEG-encoded at quality 88 with macOS `sips`; no compositional repainting or overlays were applied during export.

| File | Bytes | SHA-256 |
| --- | ---: | --- |
| `field-notes-mbods-light.jpg` | 179080 | `2c547160e14cd05cefe5d77f7233ba4d0ff43f7cfe39aaa346c73b16b291a1c4` |
| `field-notes-mbods-dark.jpg` | 173730 | `ff0c8aa1109b538ca494a8f097c144ac80ff4f2e398586066f21bccd00806066` |
| `field-notes-talent-light.jpg` | 183052 | `36645fbd16301fc41047dbd5a9d43dfb33d92219712106963b382882dc4f74d1` |
| `field-notes-talent-dark.jpg` | 164305 | `7a31d6bedc4a681360c27d5b6eca67cd35d0f57ca33da0b7e07a994767055d87` |

Light covers use `field-notes-print-light.jpg` and `field-notes-signal-light.jpg` as style references. Each dark version uses its generated light anchor plus `field-notes-print-dark.jpg`. Original generation IDs: MBODS light `exec-a81ba36f-5681-4255-8e3b-1226a0688d6f`, dark `exec-5b1541da-9e45-425e-bc84-5238a1fd1c9b`; Talent light `exec-06e92506-d253-477c-8ad1-4886042da701`, dark `exec-86df4659-ca66-42d4-9bb5-6ac6539e7cdc`.

## MB Org Diagnosis — Light Prompt

```text
Use case: photorealistic-natural
Asset type: landscape README cover artwork for enterprise AI transformation, 8:5 ratio.
Input images: Image 1 and Image 2 are style references only: emulate their quiet architecture-studio editorial still-life photography, paper texture, restrained technical-drafting atmosphere, soft optics.
Primary request: A focused, restrained physical metaphor for MB Org Diagnosis. On tactile warm-ivory fine graphite drafting paper, a few small blank cream document sheets on the left resolve into a coherent connected process model made of clear glass / acrylic blocks at the center. The blocks are simple low rectangular and square solids, physically joined by subtle transparent link pieces, forming one calm unified system rather than an infographic. A single hair-thin vivid orange path threads through the composition, from the document sheets toward and through the physical model. Add faint non-semantic graphite construction lines only: no legible diagram or data. Optional far-background element: a very small, subtly blurred premium silver sedan design scale model, Mercedes-inspired in general proportion only, no badges or logos, non-promotional.
Scene/backdrop: architecture and industrial design studio worktable, background softly dark and out of focus.
Style/medium: realistic editorial product/still-life photograph, medium-format camera, shallow depth of field, tactile materials, real optical refraction and reflections.
Composition/framing: landscape exactly 8:5; main objects centered within the middle 85% to survive a small proportional crop; modest lower camera angle, generous negative space, no border.
Lighting/mood: soft natural sidelight, warm ivory paper, charcoal shadows, controlled subtle highlights in glass.
Color palette: warm ivory, charcoal graphite, clear glass, tiny restrained vivid orange accent.
Constraints: no text, no letters, no numbers, no logos, no watermark, no UI, no readable internal data, no charts, no humans, no photos within scene, no car advertising, no busy infographic, no exaggerated neon, no border.
```

## MB Org Diagnosis — Dark Prompt

```text
Use case: lighting-weather
Asset type: landscape README cover artwork, dark variant, exactly 8:5.
Input images: Image 1 is the required edit target / light anchor. Preserve its exact scene, layout, composition, camera perspective, crop, object count and object placement: blank cream paper sheets at lower left, central connected clear acrylic process blocks, thin orange pathway, distant small blurred silver unbranded sedan model. Image 2 is a lighting and dark-material style reference only.
Primary request: Transform only the scene lighting and drafting surface into an elegant dark companion. The paper/drafting work surface becomes deep charcoal graphite, background remains a warm dark architecture-studio blur, the connected blocks retain physically realistic clear glass/acrylic with warm amber edge reflections, and the single orange pathway remains restrained, thin, and non-neon. Keep faint construction lines only as texture, not readable diagrams.
Style/medium: same realistic architecture-studio editorial still-life photo, tactile materials, medium-format optics, shallow depth of field.
Lighting/mood: controlled warm amber sidelight and deep charcoal shadows, sophisticated and quietly cinematic; no neon glow.
Constraints: change only lighting/colors/material dark treatment; preserve all composition invariants from Image 1. No text, letters, numbers, logos, watermark, UI, readable data, charts, humans, car advertising, border, busy infographic.
```

## Talent Platform — Light Prompt

```text
Use case: photorealistic-natural
Asset type: landscape README cover artwork for a Talent Platform
Primary request: create a realistic architecture/editorial still life that communicates full-lifecycle recruiting through tactile records and careful human decisions.
Input images: Image references previously shown: style references only, matching their restrained material study, warm drafting-desk photography, natural tactile grain, and a single subtle orange line.
Scene/backdrop: refined graphite drafting desk with warm cream drafting paper; softly out-of-focus studio background with very subtle automotive design cues and, only if included, a tiny softly blurred unbranded silver premium sedan scale model.
Subject: a neat shallow fan and row of tactile ivory profile dossier/index cards standing upright in a low, refined clear smoked-glass holder. The central front card has only a simple blind-embossed abstract person outline, no face. Translucent smoked-glass divider layers suggest stages. One extremely fine orange thread or line connects the physical records.
Style/medium: premium photoreal editorial still-life photography, architectural material-study sensibility, credible enterprise craft.
Composition/framing: landscape 8:5 ratio; eye-level three-quarter close view; main subjects strictly within central 85% of the frame; generous understated negative space; no border.
Lighting/mood: quiet natural side light from the left, warm ivory atmosphere, soft shadows, fine tactile paper grain.
Color palette: warm cream and ivory paper, graphite/charcoal surroundings, restrained orange accent, hints of black/brass.
Materials/textures: toothy cotton paper, matte graphite surface, polished smoked glass, a single slim black-and-brass fountain pen.
Text (verbatim): ""
Constraints: No visible text, letters, numbers, data, internal documents, UI, logos, watermarks, borders, or identifiable people. No generic HR clipart. No futuristic holographic UI. No exact automobile brand/logo/marks. The embossed outline must be abstract and faceless.
```

## Talent Platform — Dark Prompt

```text
Use case: lighting-weather
Asset type: dark-mode landscape README cover artwork for a Talent Platform
Input images: Image 1 is the edit target; preserve its exact composition, objects, framing, and material arrangement. Image 2 is a dark-mode style reference only.
Primary request: transform the same Talent Platform still-life into its paired dark variant.
Scene/backdrop: same dossier cards in the same low smoked-glass holder, same divider layers, same fine orange thread, same fountain pen and subtle automotive background.
Style/medium: premium photoreal architecture/editorial material-study photography.
Composition/framing: preserve Image 1 exactly; landscape 8:5; main subjects in central 85%; no border.
Lighting/mood: change only the lighting and dark material palette: charcoal drafting desk and charcoal surroundings, warm ivory card faces remain softly luminous, restrained amber side highlights, natural low-key studio illumination, never neon.
Color palette: near-charcoal black/graphite field, warm ivory cards, restrained burnt-orange thread, subtle brass.
Materials/textures: retain tactile toothy paper, matte graphite, smoked glass, realistic reflections, fine grain.
Text (verbatim): ""
Constraints: preserve the subject layout from Image 1. No text, letters, numbers, visible documents or data, UI, logos, watermarks, borders, identifiable people, generic HR clipart, or futuristic holograms. No branding/marks on the car model. Change only lighting, exposure, background darkness, and the desk/paper palette.
```
