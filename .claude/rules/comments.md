---
paths:
  - "tokens/**/*.css"
  - "scripts/**"
  - "package.json"
  - ".gitignore"
---

# Comments

A comment explains a design decision from a bird's-eye view: intent, and why, never a restatement of what the next
lines already say. If a comment could be deleted after reading the code once, delete it. Never add one out of habit,
on every token or every block; most need none. Keep the ones that remain short, in plain language, two lines at most.

## What earns a comment

- A rule a consumer must follow to use a token correctly. Verified pattern, from `tokens/colors.css`:

  ```css
  /* The dark space the coin and the house share in the mark. Only for drawing
    the mark, never as a colour of its own. */
  ```

- A constraint someone would otherwise undo: why a namespace is cleared, why a value looks wrong. If it comes from
  something found online, link it with `@see` rather than re-explaining it:

  ```css
  /* @see https://tailwindcss.com/docs/theme#overriding-the-default-theme */
  ```

## What never does

- A comment naming the token below it (`/* Blue 500 */` above `--color-blue-500`).
- A comment in an SVG. The files in `logos/` are shipped and inlined as they are, so they stay free of comments,
  metadata and editor leftovers.
