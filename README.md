[![Commitlint][badge-commitlint]][workflow-commitlint]
[![Format][badge-format]][workflow-format]
[![Lint][badge-lint]][workflow-lint]
[![Generated][badge-generated]][workflow-generated]
[![npm][badge-npm]][npm]

Monetyo's brand as a package: the coin-and-house mark, the logos built from it and the design tokens (colours,
typeface and easing) that every Monetyo product and website uses, so they all look like one brand. The tokens are
[Tailwind CSS](https://tailwindcss.com/) v4 theme variables.

## Using it in a project

1. Add the package from [npm](https://www.npmjs.com/package/@monetyo/brand):

   ```bash
   bun add @monetyo/brand
   ```

2. Import the tokens in your main stylesheet, right after Tailwind:

   ```css
   @import "tailwindcss";
   @import "@monetyo/brand/theme.css";
   ```

   This brings in the colours, the [Host Grotesk](https://fonts.google.com/specimen/Host+Grotesk) font, the type
   styles and the easing curve, as utilities (`bg-blue-500`, `text-foreground`, `heading-2`, `ease-out-expo`) and as
   CSS variables (`var(--color-blue-500)`).

3. Use the logos from `@monetyo/brand/logos/` as SVG, or from `@monetyo/brand/exports/` where SVG doesn't work, such
   as in emails and app icons.

4. Where CSS isn't available, such as in an email or on a canvas, read the same values from
   `@monetyo/brand/tokens.json`:

   ```ts
   import tokens from "@monetyo/brand/tokens.json" with { type: "json" }

   tokens.color.blue["500"] // "#2341f5"
   tokens.semantic.foreground // "#1b1916"
   ```

> [!CAUTION]
> The tokens replace Tailwind's default palette instead of adding to it, so only Monetyo's colours exist in a project
> that imports them. A class such as `bg-red-500` silently produces nothing.

The semantic colours (`background`, `foreground`, `surface`, `muted`, `border`, `accent`, `danger`) are CSS variables
on `:root`, so a project can set them differently for a theme or a section without touching the palette.

Text is set with the type styles rather than size utilities: `display-1` and `display-2` for a page's main heading,
`heading-2` to `heading-6`, `lead` for an introduction, `body-2` to `body-6`, `eyebrow`, `quote`, `caption-5`, and
`button-md` and `button-sm` for button labels. Each sets size, line height, weight and tracking together, and the
larger ones scale with the viewport.

## Choosing a logo

The lockup is the default: the mark next to the name, as in a site header. Use the mark alone where space is tight
or the name is already there, such as an app icon or an avatar, and the wordmark alone only where the mark is shown
nearby. The name is drawn as shapes, so every logo looks the same with or without the font installed.

| Background                       | Mark             | Lockup                | Wordmark             |
| -------------------------------- | ---------------- | --------------------- | -------------------- |
| Light (`sand`, `white`)          | `mark.svg`       | `lockup.svg`          | `wordmark.svg`       |
| Dark (`ink`)                     | `mark.svg`       | `lockup-reversed.svg` | `wordmark-white.svg` |
| Blue, a photo, or a busy pattern | `mark-white.svg` | `lockup-white.svg`    | `wordmark-white.svg` |
| One colour only, such as print   | `mark-ink.svg`   | `lockup-ink.svg`      | `wordmark.svg`       |

In one colour, the space the coin and the house share is cut out of both, so the mark keeps its meaning without its
colours.

`exports/` has every logo as PNG at several sizes, ready-made icons for browsers, home screens, web app manifests and
social profiles, padded so platforms that crop or round them keep the mark whole, and a default image for link
previews.

### Using it well

- Leave clear space around a logo of at least half the mark's height on every side.
- Don't use the mark smaller than 16 pixels, or the lockup less than 16 pixels tall: below that, the shared space stops
  reading.
- Never recolour, stretch, rotate, outline or add effects to a logo, and never rebuild the name in a font. Use the
  files as they are.
- Never put the full-colour mark on `blue-500`: the coin disappears into it. Use the white version.

## Contributing

How to work on this repository, change the brand and release a new version is in
[CONTRIBUTING.md](CONTRIBUTING.md).

## Licence

Copyright (c) 2026 Monetyo. All rights reserved. The package is public so Monetyo's projects can install it, but no
licence is granted to use, copy or distribute any of it, and the name and logos are trademarks of Monetyo. See
[LICENSE.md](LICENSE.md).

[badge-commitlint]: https://img.shields.io/github/actions/workflow/status/monetyo/monetyo-brand/commitlint.yml?branch=main&label=commitlint&style=flat-square&logo=githubactions&logoColor=white
[badge-format]: https://img.shields.io/github/actions/workflow/status/monetyo/monetyo-brand/format.yml?branch=main&label=format&style=flat-square&logo=githubactions&logoColor=white
[badge-lint]: https://img.shields.io/github/actions/workflow/status/monetyo/monetyo-brand/lint.yml?branch=main&label=lint&style=flat-square&logo=githubactions&logoColor=white
[badge-generated]: https://img.shields.io/github/actions/workflow/status/monetyo/monetyo-brand/generated.yml?branch=main&label=generated&style=flat-square&logo=githubactions&logoColor=white
[badge-npm]: https://img.shields.io/npm/v/@monetyo/brand?label=npm&style=flat-square&logo=npm&logoColor=white
[workflow-commitlint]: https://github.com/monetyo/monetyo-brand/actions/workflows/commitlint.yml
[workflow-format]: https://github.com/monetyo/monetyo-brand/actions/workflows/format.yml
[workflow-lint]: https://github.com/monetyo/monetyo-brand/actions/workflows/lint.yml
[workflow-generated]: https://github.com/monetyo/monetyo-brand/actions/workflows/generated.yml
[npm]: https://www.npmjs.com/package/@monetyo/brand
