<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/orrery-mark-dark.svg">
    <img src="assets/orrery-mark.svg" alt="Armillary" width="80">
  </picture>
</p>

<h1 align="center">Armillary</h1>

<p align="center">
  <strong>The design system for <a href="https://github.com/forge-orbit/orrery">Orrery</a>,
  built on <a href="https://github.com/meta/astryx">Astryx</a>.</strong><br>
  One set of brand tokens, components and content renderers for Forge Orbit's screens.
</p>

<p align="center">
  <em>Status: design phase. Nothing to install yet — no packages are published.</em>
</p>

---

## Why Armillary

[Orrery](https://github.com/forge-orbit/orrery) is self-hosted project management for teams of
humans *and* AI agents. Before building its UI, the team wants the design system first, so every
screen shares one language instead of each one improvising.

An **armillary sphere** is a frame of rings modeling the coordinate grid of the sky — the sibling
instrument of an orrery. A design system is the frame every screen is built on.

> The mark above is the Orrery logo, standing in until Armillary has one of its own.

## Built on Astryx

[Astryx](https://github.com/meta/astryx) is an open source design system that grew inside Meta:
MIT-licensed, built on React 19 and StyleX (invisible to consumers), with 150+ accessible
components, themes defined as CSS custom-property overrides, dark mode, templates and a CLI.
It's designed so people and AI agents build the same way, and it's currently in beta.

Armillary builds **on** Astryx — it doesn't fork or re-implement it. Credit for the component
foundations belongs to Meta and the Astryx team. Armillary is a separate project, not affiliated
with or endorsed by Meta.

## What's planned

All of this is proposed, not built. Package names are placeholders.

- **A brand theme.** Forge Orbit's palette, typography, spacing and radii as Astryx
  CSS-variable overrides, light first with a dark mode. Possible package:
  `@forge-orbit/armillary-theme`.
- **Orrery components.** Issue cards, board columns, agent session rows and status badges, the
  needs-input answer form, and vault doc views, composed from Astryx primitives. Possible
  package: `@forge-orbit/armillary`.
- **Rich-content renderers.** Tables, charts, checklists, key-value pairs, test results and
  Mermaid diagrams for Orrery's comments and agent progress reports. Blocks stay declarative
  source with versioned schemas, a renderer registry and a fallback for unknown blocks,
  following the rules proposed in
  [orrery#15](https://github.com/forge-orbit/orrery/issues/15).

## Brand tokens

| Token | Value |
| --- | --- |
| Ink | `#14161B` |
| Cream | `#F6F3EC` |
| Accent | `#F2561D` |
| Headings | Instrument Serif |
| Text | Inter |
| Code | JetBrains Mono |

Light-first "instrument" look: warm paper, dark ink, one orange accent.

## Where it's used

Orrery's planned stack is a Go API plus a React SPA ([orrery#1](https://github.com/forge-orbit/orrery/issues/1));
the React side is what Armillary serves. The website lives at
[forge-orbit.github.io/orrery-site](https://forge-orbit.github.io/orrery-site/).

## Contributing

Nothing is decided yet. The best way to help is to join the discussion: open an issue in this
repo or in [forge-orbit/orrery](https://github.com/forge-orbit/orrery), labeled
[`need discussion`](https://github.com/forge-orbit/orrery/labels/need%20discussion).

## License

MIT. See [LICENSE](LICENSE).

---

<p align="center">Built by <a href="https://github.com/forge-orbit">Forge Orbit</a></p>
