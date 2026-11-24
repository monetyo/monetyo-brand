---
paths:
  - "README.md"
---

# README

`README.md` is for the people who use or change the brand: a developer adding it to a project, or someone changing a
colour or a logo. The shared docs guideline sets the voice and structure; this rule sets what it covers here.

## What it covers

In this order:

- Badges: one CI status badge per workflow that runs on every push, then the npm version.
- One paragraph: what the package is for.
- `Using it in a project`: from installing the package to using its tokens and logos.
- `Contributing`: a link to `CONTRIBUTING.md`, which holds everything about working on the repository (running the
  tools, commits, breaking changes, hooks and CI, releasing). Never repeat any of it in the README.
- `Licence`: all rights reserved to Monetyo, linking to `LICENSE.md`.

Keep it true when a change moves an import path, an install command or how a version is released, or adds something
a consumer must know (a new entry point, a new kind of asset, a new dependency). Adding a colour or a logo variant
changes nothing there.

## What stays out

- A list of every token or every file. The CSS and the `logos/` folder say that, and a README that lists them goes
  stale the day a colour is added. Name the entry points instead.
