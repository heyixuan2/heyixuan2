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

- A single self-contained SVG is loaded by `picture`; D3 owns the weekly bar scale. Native SVG owns the modest daily mark field, text, and explicit legend. No runtime script, third-party widget, tracker, fonts, or network calls are embedded.
- Daily color uses GitHub's existing five levels, not a newly invented score. Bar height represents the sum for each week, with zero baseline and the same scale across the two mobile panels.
- Desktop is a continuous 53/54-week calendar; mobile portrait recomposes it into two chronological half-year panels. It does not just shrink the desktop labels.
- Motion reveals weeks chronologically over roughly 3.6 seconds, once, then holds. Reduced-motion users receive a static file; each SVG also has its own reduced-motion rule. Static links are always available.
- Embedded SVG images cannot supply real hover/tap tooltips or interactive filtering inside GitHub's README. Essential source, units, and meaning are visible. Clicking through to GitHub is the inspection path, and its controls retain normal keyboard/touch behavior. No scrolling or gestures are captured.
- At most one chart is displayed at once, with fewer than 500 SVG marks. Canvas or WebGL would remove accessible semantics without a useful performance benefit.

### Motion strip

Source lives in `videos/profile-motion`. The approved light and dark GIFs are 1600×360, 4.8 seconds at a nominal 15 fps and loop with a final hold. Each stays below 600 KB. Reduced-motion visitors receive a final-frame PNG instead, and explicit static links remain available. The GIFs contain no script, tracking, or runtime dependency.

Typography follows the original architectural hero: bold, compact sans-serif display type, not a monospace headline. The source hero artwork is unchanged. The motion strip uses locally bundled Inter Black 900 for the three large steps and JetBrains Mono only for small utility labels, with the fonts' licenses retained. Heavy weight must not come at the expense of readable word gaps, line spacing, or space above the orange rules. Both themes share the same layout.
