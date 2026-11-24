# CLAUDE.md

This repository holds Monetyo's brand: the coin-and-house mark, the logos generated from it, and the design tokens
(colours, typeface, easing) that every Monetyo product and website uses, so they look like one brand. It is published
to npm as `@monetyo/brand`.

The shared Monetyo git and docs guidelines and the `monetyo:*` skills come from the `monetyo` plugin (see
`.claude/settings.json`). This file adds what is specific to this repository.

## Foundational Context

- tailwindcss — 4 (peer dependency: the tokens are Tailwind CSS v4 `@theme` variables)
- @fontsource-variable/host-grotesk — 5
- @resvg/resvg-js — 2 (renders the exports)
- fonttools 4.68, uharfbuzz 0.57 (draw the logos, pinned in `.docker/python/Dockerfile`)

## Project structure

```
logos/          mark.svg is hand-authored; every other SVG, the favicon included, is generated from it
exports/        generated: png/ (every logo at fixed sizes), icons/ (favicon, app icons, avatar), social/ (link preview)
scripts/
├── draw-logos.py   draws the favicon, the name, the lockups and the one-colour versions from mark.svg and Host Grotesk
├── export-logos.ts renders logos/ into exports/
└── export-tokens.ts writes tokens/tokens.json from the CSS, for code that can't read CSS
tokens/
├── theme.css   entry point consumers import; only imports the files below
├── colors.css  the brand palette, the lens colour of the mark, semantic colours on :root
├── typography.css  the sans-serif font and the type styles (display-1 ... caption-5)
├── motion.css  the easing curve
└── tokens.json  generated from the CSS files above, never edit by hand
checks/         theme.css, compiled by `bun run lint` the way a consuming project imports the tokens
package.json    package name, exports, published files, the project scripts
.docker/, compose.yaml  the containers every tool and git hook runs in: app (Bun) and python
```

Every tool runs in Docker: `docker compose run --rm -T app <command>` or `docker compose run --rm -T python <command>`.
Never run `bun` or `python` on the host.

## Rules

- The package is public on npm, but all rights are reserved to Monetyo (`LICENSE.md`). Never add anything private.
- A token, a file path or an export is a public API. Renaming or removing one breaks every consumer, see `## Commits`.
- The brand palette is what `tokens/colors.css` holds. Never add a colour that only one product or page needs, such as
  colours for an app mock-up: those stay in that project.
- The mark's geometry and colours are design decisions. Change them only when the user asks for that change.
- Never edit a generated file in `logos/` or `exports/` by hand: change its source, then run both generators.

## Checks

The package works when every SVG is well-formed, the tokens compile, every file is formatted, and the generated logos
match their sources (running both generators leaves `git status` clean for `logos/`, `exports/` and
`tokens/tokens.json`):

```bash
docker compose run --rm -T app bun run lint
docker compose run --rm -T app bun run format:check
docker compose run --rm -T python python scripts/draw-logos.py
docker compose run --rm -T app bun run export
```

## Commits

- commitlint checks every message in the `commit-msg` hook. To check a draft first:
  `printf '<message>\n' | docker compose run --rm -T app bunx commitlint`. Types: the standard set plus `ai`.
- Never commit `node_modules/`.
- Commit types, read in brand terms: `feat` adds something consumers can use (a token, a logo variant, an export, an
  entry point); `fix` corrects something already shipped (a wrong colour value, a malformed SVG, a broken import
  path); `refactor` reorganises files with no change for consumers.
- Renaming or removing a token, a file in `logos/`, `exports/` or `tokens/`, or a path in `package.json`'s `exports` is
  a breaking change: `feat!:` with a `BREAKING CHANGE:` footer saying what consumers must change. Changing a value,
  such as a shade of blue, is not breaking, but it changes every product at once, so it is always its own commit.
- A source and everything generated from it change in the same commit.

## Pull requests

The Verification Plan checks the change where it is used: in at least one consuming project (`monetyo-launch` today),
point the dependency at the commit, build it, and say what to look at (the colour, the logo, the font).
