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
- The contribution-snake workflow and its permissions are unchanged; its animation is now optional behind a disclosure.
- Prior SVG assets are retained for rollback, not deleted.
- Source illustrations must never be interpreted as hardware screenshots or financial performance results.

## Original image briefs

1. Hero pair: an architectural editorial poster; exact four-line headline, selected-work micro-label, acrylic slabs on concrete threaded vertically with orange; paper-white/light and charcoal/ivory dark.
2. Printing pair: a pale 3D-printed lattice cube on drafting paper with a restrained orange line; no text, UI, or logos.
3. Signal pair: fine time-series traces on research paper with restrained orange marks; no numerical claims, text, UI, or logos.
4. Footer pair: a drafting desk, plain concrete block, pen, and exact orange text “MAKE / COMPLEXITY / LEGIBLE.”; no other text.

## Verification and rollback

Check both themes, image paths, project links, section navigation, each disclosure, and narrow screens. A normal Git revert of the design commit restores the previous version without rewriting history or changing workflows.
