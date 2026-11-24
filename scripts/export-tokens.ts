/**
 * Writes the design tokens in tokens/*.css to tokens/tokens.json, for code that
 * can't read CSS variables: emails, a canvas, a native app.
 *
 * The CSS stays the single source; run with `docker compose run --rm app bun run export`.
 */

type Palette = Record<string, string | Record<string, string>>

const read = (file: string) => Bun.file(`tokens/${file}`).text()

/**
 * Collects every `--prefix-name: value;` declaration in a block of CSS.
 */
function declarations(css: string, prefix: string) {
  const pattern = new RegExp(`--${prefix}-([a-z0-9-]+):\\s*([^;]+);`, "g")
  return [...css.matchAll(pattern)].map(([, name, value]) => [name, value.trim()] as const)
}

const colors = await read("colors.css")
const theme = colors.match(/@theme\s*{([^}]*)}/)?.[1] ?? ""
const root = colors.match(/:root\s*{([^}]*)}/)?.[1] ?? ""

// A scale (sand-100, sand-150...) becomes an object; a single colour (ink, lens) stays a value.
const palette: Palette = {}
const hex: Record<string, string> = {}
for (const [name, value] of declarations(theme, "color")) {
  if (!value.startsWith("#")) continue
  hex[name] = value
  const [, scale, step] = name.match(/^([a-z]+)-(\d+)$/) ?? []
  if (scale && step) palette[scale] = { ...(palette[scale] as Record<string, string>), [step]: value }
  else palette[name] = value
}

const semantic = Object.fromEntries(
  [...root.matchAll(/--([a-z-]+):\s*var\(--color-([a-z0-9-]+)\);/g)].map(([, role, color]) => {
    if (!hex[color]) throw new Error(`--${role} points to --color-${color}, which isn't in the palette`)
    return [role, hex[color]]
  })
)

const font = Object.fromEntries(declarations(await read("typography.css"), "font"))
const ease = Object.fromEntries(declarations(await read("motion.css"), "ease"))

const tokens = { color: palette, semantic, font, ease }
await Bun.write("tokens/tokens.json", `${JSON.stringify(tokens, null, 2)}\n`)
