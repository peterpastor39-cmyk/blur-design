# Blur hero — first interaction study

20 October 2026

## Review

- Live preview: http://localhost:3000/hero-study
- Figma exploration: https://www.figma.com/design/TPJOv3OOOfSabSxcu7b00O/Blur-Landing-Page?node-id=377-600
- Original design: https://www.figma.com/design/TPJOv3OOOfSabSxcu7b00O/Blur-Landing-Page?node-id=375-253

The existing Cormorant Garamond headline is the source of the character field. Its outlined SVG was exported from text node 375:277, preserving the user's three-line composition and the distinctive Q. The original text remains editable in Figma. The browser effect uses those vector outlines as a sampling mask, rather than substituting a similar serif font.

## Figma changes

Changed five Inter Tight Medium layers to the already available Aspekta 500: 375:271, 375:272, 375:273, 375:274, 375:276. These are navigation and Book a call text. Other Inter/Montserrat layers in the original design were left as found; this is not an all-sans font migration.

Created section 377:599 to the right of the original, with study frame 377:600. The resting character field is editable IBM Plex Mono text, node 377:630. Its source Cormorant layer remains in the clone at zero opacity, node 377:622. The study's call button uses dark lettering on its light fill. The original headline, portfolio and service sections were not redesigned or renamed.

Figma represents the resting composition. The continuous pointer interaction is implemented in the browser preview.

## Reference and behavior

Reference: https://artefakt.mov/ — inspected and interacted with directly. A character-built wordmark bends and disperses under pointer movement. This study adapts that behavior to Blur's existing serif headline. It is a first 2D spring/lens approximation, not a claim to reproduce the reference's original rendering engine or exact physics.

- Pointer movement displaces nearby glyphs and changes their character pattern.
- Moving away lets the letters settle back into the original silhouette.
- Pressing/tapping sends an outward ripple.
- Original / Interactive switches compare the treatments.
- Pause stops motion; the operating system's reduced-motion preference is respected.
- Characters randomize continuously on staggered clocks without hovering; the silhouette stays still until pointer interaction. Animation pauses when the document is hidden.
- A semantic H1 remains accessible; the canvas is decorative. If the renderer cannot initialize, the original SVG remains visible.

The Framer project redirects to sign-in and was not inspected beyond that screen. No credentials were entered, and it was not needed to complete the Artefakt-based experiment.

## Local code

The existing homepage surface experiment remains at /. The new study is isolated at /hero-study. The shared root font now uses local Aspekta through next/font/local, removing the existing Inter download dependency. The supplied Aspekta webfont and its OFL license are in public/fonts/.

Navigation and call links in this hero-only study open the corresponding existing Figma nodes; they are not a live booking or full-site flow.

## Verification

- TypeScript check passed.
- Production build passed after removing the network-dependent Inter font import.
- Local preview returned HTTP 200.
- Browser verified Aspekta as the computed navigation family, a ready character canvas with 2,068 sampled points at the reviewed desktop viewport, and no horizontal overflow.
- Pointer interaction produced nonzero displacement (17.13px in the sampled state).
- Original comparison removed the canvas and restored the solid serif image.
- Pause and resume controls were exercised; paused state returned zero displacement.
- Figma read-back confirmed all five replacements use Aspekta 500; the study screenshot was visually reviewed.

The browser viewport reviewed was desktop. Mobile layouts and reduced-motion code are included but were not independently exercised in this first pass. No public deployment was performed.
