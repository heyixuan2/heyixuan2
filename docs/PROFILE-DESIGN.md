# Field Notes — profile design

The profile uses GitHub-native Markdown/HTML with original light and dark raster artwork. It does not depend on JavaScript, custom CSS, tracking services, or externally hosted stats widgets.

## Theme behavior

Each artwork uses a `picture` element with `prefers-color-scheme` sources. GitHub selects the source for the visitor's appearance preference. Ordinary Markdown text follows GitHub's native theme. The appearance link opens the visitor's GitHub settings; it is not a private in-README toggle and may require signing in.

The light image is the fallback. Key copy remains in real text and alt attributes. Illustrations do not substitute for essential accessible text.

References: [responsive images](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/quickstart-for-writing-on-github), [appearance settings](https://docs.github.com/en/get-started/accessibility/managing-your-theme-settings).

## Art direction

- Architectural field notes: warm paper, black typography, and orange accents.
- Dark counterpart: charcoal studio, warm ivory type, same orange and composition.
- Hero: “Think in systems. Build for people.” with acrylic planes and a connecting thread.
- Projects: conceptual 3D-printing and time-series artwork, not actual screenshots, test output, or performance evidence.
- Footer: “Make complexity legible.” on a drafting desk.

Images were produced with the built-in image-generation tool from the selected visual references. No avatar, biography setting, or GitHub sidebar setting was changed.

## Maintenance

- Keep each light/dark pair at the same aspect ratio; update both together.
- Keep project detail in native disclosure sections and the visible summaries concise.
- Existing experience and impact claims were preserved from the previous README.
- The contribution-snake workflow and its permissions are unchanged; its old README embed is replaced by the custom calendar.
- Prior SVG assets are retained for rollback, not deleted.
- Source illustrations must never be interpreted as hardware screenshots or financial performance results.

## Original image briefs

1. Hero pair: an architectural editorial poster; exact four-line headline, selected-work micro-label, acrylic slabs on concrete threaded vertically with orange; paper-white/light and charcoal/ivory dark.
2. Printing pair: a pale 3D-printed lattice cube on drafting paper with a restrained orange line; no text, UI, or logos.
3. Signal pair: fine time-series traces on research paper with restrained orange marks; no numerical claims, text, UI, or logos.
4. Footer pair: a drafting desk, plain concrete block, pen, and exact orange text “MAKE / COMPLEXITY / LEGIBLE.”; no other text.

## Verification and rollback

Check both themes, image paths, project links, section navigation, each disclosure, and narrow screens. A normal Git revert of the design commit restores the previous version without rewriting history or changing workflows.

## FDE direction

Positioning is “From idea to MVP. Built for enterprise realities.” This describes an approach, not a claim to hold a specific job title. The private enterprise story credits sole development and team business input without publishing an internal project name, architecture, screenshots, or data. No deployment, compliance, adoption, or ROI claims have been added. Existing public impact facts are retained.

## Custom contribution chart

The chart reads only the unauthenticated, publicly visible GitHub contribution calendar. GitHub's public aggregate can include anonymized private activity if the account owner has enabled it; the generator never requests private repositories, event details, or credentials. All daily values, dates, and GitHub's intensity levels are preserved. The total is the sum of displayed days, including the leading days used to complete the first calendar week. It is not hardcoded.

Run `npm ci --ignore-scripts` and `npm run build` from `tools/contributions`. The parser fails closed if GitHub changes its markup or returns incomplete data. The previous assets stay available if a fetch or validation fails. Source range and refresh date are printed on every chart; it is a snapshot, not a live stream.

The dedicated GitHub Actions workflow refreshes the chart daily and can also be run manually. Dependencies and actions are pinned. It needs no personal access token; its repository token is used only to commit generated contribution assets. The fetch is anonymous. A failed refresh fails the workflow rather than substituting fabricated or empty data.

### Rendering and mobile contract

- A single self-contained SVG is loaded by `picture`; D3 owns the responsive height scale. Native SVG owns the glass cuboids, oblique projection, gradients, consistent ground shadows, text, and explicit legend. No runtime script, third-party widget, tracker, fonts, or network calls are embedded.
- Daily color and height redundantly encode GitHub's existing five ordinal levels, not a newly invented score or linear count scale. A low clear plinth marks a zero day, not nonzero activity. Exact dates and counts are preserved in every SVG mark and in `assets/contributions.json`.
- Desktop and wide landscape use a continuous 53/54-week calendar. Mobile portrait recomposes it into two chronological half-year panels, recalculating positions, dimensions, and label spacing. It does not just shrink the desktop labels. Both panels share the same height and tint mapping.
- Motion reveals days in chronological week order over roughly 3.6 seconds, once, then holds. Reduced-motion users receive a static file; each SVG also has its own reduced-motion rule. Data geometry never moves or changes to imply live events.
- Embedded SVG images cannot supply real hover/tap tooltips or interactive filtering inside GitHub's README. Essential source, units, and meaning are visible. Clicking through to GitHub is the inspection path, and its controls retain normal keyboard/touch behavior. No scrolling or gestures are captured.
- At most one chart is displayed at once, with 350–378 daily marks referencing five shared local glass shapes. Each SVG is kept below 220 KB. The only SVG references are local fragments, never external resources. Browser-side Canvas or WebGL is unnecessary, and offline rendering needs only the existing Node dependencies.

### Approved glass calendar (2026-09-20)

The user approved the revised concept with “这次对了”. The approved direction is a warm architectural field of rectangular glass cuboids viewed obliquely from above, not the rejected cylindrical or front-on designs. The reference is concept image `exec-3097a08d-3fca-4283-a71e-95f0d3c1c556.png`, shown in the task; it is a material/layout study, not a dataset or a raster used in production.

Locked: compact editorial header, warm-paper and charcoal theme pair, orange transparent faces and white refractive edges, consistent soft directional shadows, a rectangular calendar receding toward the upper right, one mark per real day, bounded height and tint by activity level, five-level glass legend, source range/total/update date, and two-panel narrow continuation. Flexible: renderer-specific face gradients, exact pixel sizes, and label spacing. The concept's illustrative dates and distribution are replaced by the real fetched values. Shadows and reflections are deterministic SVG approximations, not AI-generated or ray-traced imagery.

Technical contract: one image instance, shared material definitions, moderate vector count, no user interaction/state/URL persistence inside the image. Public GitHub's native contribution grid remains the flat inspection alternative on the profile. No hover-only information, drag capture, mobile controls, sensors, or new permissions are introduced. The existing daily GitHub Actions job executes the same generator in GitHub's hosted runner; it does not use the owner's computer. Failed fetches or validation keep the last valid assets. The snapshot is not live, and GitHub scheduling and image caches can delay visibility.

Verification covers all eight theme/layout/motion combinations, exact mark/count/date preservation, zero days and outliers, 350–378-day calendars, finite in-frame geometry, back-to-front paint order, deterministic regeneration, no external SVG resources, reduced motion, and unchanged profile navigation/project content. Review the actual browser-rendered light/dark, portrait, and landscape states before publication. Rollback is a normal revert of the chart change; no workflow, authentication, or provider changes are required.

### Motion strip

Source lives in `videos/profile-motion`. The approved light and dark GIFs are 1600×360, 4.8 seconds at a nominal 15 fps and loop with a final hold. Each stays below 600 KB. Reduced-motion visitors receive a final-frame PNG instead, and explicit static links remain available. The GIFs contain no script, tracking, or runtime dependency.

Typography follows the original architectural hero: bold, compact sans-serif display type, not a monospace headline. The source hero artwork is unchanged. The motion strip uses locally bundled Inter Black 900 for the three large steps and JetBrains Mono only for small utility labels, with the fonts' licenses retained. Heavy weight must not come at the expense of readable word gaps, line spacing, or space above the orange rules. Both themes share the same layout.

### Motion-study guardrails (2026-09-19)

The user explicitly reaffirmed the existing look after seeing animation work in progress. Upgrade motion, not the visual identity: keep the warm paper/charcoal surfaces, natural shadows, glass/concrete sculpture, exact heavy headline lettering, project illustrations, and existing content/layout.

At that point the flat orange contribution calendar remained the default and the isometric field was unapproved. This historical constraint was superseded by the explicit glass-calendar approval above; real public data and GitHub's native flat calendar remain available.

The hero source lives under `videos/profile-motion/hero-next`. Reject cutout seams, broken rods, cropped glass, or changed letterforms even if automated checks pass. The final treatment leaves the original poster intact for the entire sequence and adds only a thin orange signal along the existing rod and brief glass-edge traces. The overlay clears completely before the final hold. The rejected clean-plate studies are not used or published.

### Approved hero publication (2026-09-19)

After reviewing the light and dark local previews, the user explicitly requested publication to GitHub. The README uses paired eight-second GIFs at a nominal 15 fps, with the original JPEGs selected for reduced-motion visitors and linked as always-available still editions. The GIF palette necessarily quantizes photographic colors; the untouched full-color originals remain the static source of truth. No JavaScript, iframe, replay button, or external animation service is embedded in the README.

The original typography, imagery, project covers, profile copy, flat contribution chart, and daily contribution-refresh workflow are unchanged. To regenerate the GIFs, run `npm run check`, `npm run check:dark`, `npm run render:light`, `npm run render:dark`, and `npm run verify:delivery` in `videos/profile-motion/hero-next`. The delivery check verifies dimensions, duration, asset weight, motion presence, unchanged headline pixels during motion, and a tightly bounded opening-to-final palette difference. Inspect the actual encoded frames before publishing. Reverting the hero publication commit restores the previous static hero without affecting the contribution workflow.
