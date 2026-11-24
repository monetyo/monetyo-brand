/**
 * Renders the SVGs in logos/ into the PNG and ICO files in exports/, for every
 * place that can't use SVG: email, social profiles, app and browser icons.
 *
 * Run with `docker compose run --rm app bun run export`.
 */

import { mkdir, rm } from "node:fs/promises"

import { Resvg } from "@resvg/resvg-js"

const SAND = "#f4f2ee"

const SQUARE_SIZES = [64, 128, 256, 512, 1024]
const WIDE_WIDTHS = [512, 1024, 2048]

const SQUARE = ["mark", "mark-ink", "mark-white"]
const WIDE = ["wordmark", "wordmark-white", "lockup", "lockup-reversed", "lockup-ink", "lockup-white"]

/**
 * Reads a logo's content and viewBox, so it can be placed inside another SVG.
 */
async function logo(name: string) {
  const source = await Bun.file(`logos/${name}.svg`).text()
  const [, viewBox, content] = source.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>(.*)<\/svg>/s) ?? []
  if (!viewBox || content === undefined) throw new Error(`logos/${name}.svg has no viewBox`)
  return { viewBox, content }
}

/**
 * Renders an SVG to a PNG of the given width.
 */
function png(svg: string, width: number) {
  return new Resvg(svg, { fitTo: { mode: "width", value: width } }).render().asPng()
}

/**
 * Builds a square icon: the mark centred on an optional background, taking up
 * `scale` of the side, so platforms that crop or round the corners keep it whole.
 */
async function icon(size: number, scale: number, background?: string) {
  const { viewBox, content } = await logo("mark")
  const inner = size * scale
  const offset = (size - inner) / 2
  const fill = background ? `<rect width="${size}" height="${size}" fill="${background}"/>` : ""
  return png(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">${fill}` +
      `<svg x="${offset}" y="${offset}" width="${inner}" height="${inner}" viewBox="${viewBox}">${content}</svg></svg>`,
    size
  )
}

/**
 * Packs PNG images into an ICO file. Since Windows Vista, an ICO entry can hold
 * a PNG as it is, so no bitmap conversion is needed.
 *
 * @see https://en.wikipedia.org/wiki/ICO_(file_format)#Outline
 */
function ico(images: { size: number; data: Uint8Array }[]) {
  const header = Buffer.alloc(6 + images.length * 16)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  let offset = header.length
  images.forEach(({ size, data }, index) => {
    const entry = 6 + index * 16
    header.writeUInt8(size % 256, entry)
    header.writeUInt8(size % 256, entry + 1)
    header.writeUInt16LE(1, entry + 4)
    header.writeUInt16LE(32, entry + 6)
    header.writeUInt32LE(data.length, entry + 8)
    header.writeUInt32LE(offset, entry + 12)
    offset += data.length
  })
  return Buffer.concat([header, ...images.map(({ data }) => data)])
}

await rm("exports", { recursive: true, force: true })
await mkdir("exports/png", { recursive: true })
await mkdir("exports/icons", { recursive: true })
await mkdir("exports/social", { recursive: true })

for (const name of SQUARE) {
  const source = await Bun.file(`logos/${name}.svg`).text()
  for (const size of SQUARE_SIZES) await Bun.write(`exports/png/${name}-${size}.png`, png(source, size))
}

for (const name of WIDE) {
  const source = await Bun.file(`logos/${name}.svg`).text()
  for (const width of WIDE_WIDTHS) await Bun.write(`exports/png/${name}-${width}w.png`, png(source, width))
}

const favicon = await Bun.file("logos/favicon.svg").text()
await Bun.write("exports/icons/favicon.ico", ico([16, 32, 48].map((size) => ({ size, data: png(favicon, size) }))))

// Platforms that add their own mask or rounded corners get the mark smaller, on
// the brand background, inside the area they never cut.
await Bun.write("exports/icons/apple-touch-icon.png", await icon(180, 0.7, SAND))
await Bun.write("exports/icons/icon-192.png", await icon(192, 0.9))
await Bun.write("exports/icons/icon-512.png", await icon(512, 0.9))
await Bun.write("exports/icons/icon-maskable-512.png", await icon(512, 0.6, SAND))
await Bun.write("exports/icons/avatar-1024.png", await icon(1024, 0.6, SAND))

// The default image a link preview shows when a page has none of its own.
const lockup = await logo("lockup")
const [, , lockupWidth = 1, lockupHeight = 1] = lockup.viewBox.split(" ").map(Number)
const width = 600
const height = (width * lockupHeight) / lockupWidth
await Bun.write(
  "exports/social/og-1200x630.png",
  png(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="${SAND}"/>` +
      `<svg x="${(1200 - width) / 2}" y="${(630 - height) / 2}" width="${width}" height="${height}" viewBox="${lockup.viewBox}">${lockup.content}</svg></svg>`,
    1200
  )
)
