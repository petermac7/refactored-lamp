import sharp from 'sharp'

/**
 * Generates the starter imagery (illustrated polka-dot drinkware) so the site
 * looks complete on first run without downloading or licensing any photos.
 * Replace these in Media with your own product photography.
 */

type Cup = {
  body: string
  dot: string
  h: number
  handle?: boolean
  lid: string
  rot?: number
  straw?: boolean
  w: number
  x: number
  y: number
}

let uid = 0

const cup = ({ body, dot, h, handle, lid, rot = 0, straw, w, x, y }: Cup) => {
  const id = ++uid
  const bw = w * 0.39 // half-width at the base
  const r = w * 0.08
  const top = -h / 2
  const bottom = h / 2
  const bodyPath = `M ${-w / 2} ${top} L ${w / 2} ${top} L ${bw} ${bottom - r} Q ${bw} ${bottom} ${bw - r} ${bottom} L ${-bw + r} ${bottom} Q ${-bw} ${bottom} ${-bw} ${bottom - r} Z`
  const step = w * 0.2

  return `
  <g transform="translate(${x} ${y}) rotate(${rot})">
    <defs>
      <pattern id="dots${id}" width="${step}" height="${step}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <circle cx="${step / 2}" cy="${step / 2}" r="${w * 0.03}" fill="${dot}"/>
      </pattern>
      <clipPath id="clip${id}"><path d="${bodyPath}"/></clipPath>
      <linearGradient id="shade${id}" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stop-color="#000" stop-opacity="0.2"/>
        <stop offset="0.32" stop-color="#fff" stop-opacity="0.14"/>
        <stop offset="1" stop-color="#000" stop-opacity="0.28"/>
      </linearGradient>
    </defs>
    ${
      handle
        ? `<path d="M ${w * 0.44} ${-h * 0.26} C ${w * 0.98} ${-h * 0.26}, ${w * 0.98} ${h * 0.2}, ${w * 0.4} ${h * 0.2}" fill="none" stroke="${body}" stroke-width="${w * 0.13}" stroke-linecap="round"/>`
        : ''
    }
    ${
      straw
        ? `<rect x="${-w * 0.06}" y="${top - h * 0.3}" width="${w * 0.12}" height="${h * 0.36}" rx="${w * 0.06}" fill="${lid}"/>`
        : ''
    }
    <path d="${bodyPath}" fill="${body}"/>
    <rect x="${-w / 2}" y="${top}" width="${w}" height="${h}" fill="url(#dots${id})" clip-path="url(#clip${id})"/>
    <rect x="${-w / 2}" y="${top}" width="${w}" height="${h}" fill="url(#shade${id})" clip-path="url(#clip${id})"/>
    <rect x="${-w * 0.545}" y="${top - h * 0.075}" width="${w * 1.09}" height="${h * 0.1}" rx="${h * 0.03}" fill="${lid}"/>
    <rect x="${-w * 0.545}" y="${top - h * 0.075}" width="${w * 1.09}" height="${h * 0.1}" rx="${h * 0.03}" fill="url(#shade${id})"/>
  </g>`
}

const CREAM = '#f1e6dc'
const INK = '#1d1d1f'

const svg = (width: number, height: number, inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${inner}</svg>`

const hero = () =>
  svg(
    1920,
    776,
    `
    <defs>
      <linearGradient id="wall" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="#8d8a86"/>
        <stop offset="0.55" stop-color="#6f6b67"/>
        <stop offset="1" stop-color="#3a3836"/>
      </linearGradient>
      <radialGradient id="glow" cx="0.72" cy="0.5" r="0.55">
        <stop offset="0" stop-color="#d9a98a" stop-opacity="0.55"/>
        <stop offset="1" stop-color="#d9a98a" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1920" height="776" fill="url(#wall)"/>
    ${[250, 520, 790].map((x) => `<rect x="${x}" y="-20" width="210" height="820" rx="4" fill="#fff" opacity="0.07"/>`).join('')}
    <path d="M -40 700 L 760 60" stroke="#161616" stroke-width="46" stroke-linecap="round"/>
    ${[120, 330, 540].map((x) => `<rect x="${x}" y="${700 - (x + 40) * 0.8 + 30}" width="20" height="800" fill="#161616"/>`).join('')}
    <rect width="1920" height="776" fill="url(#glow)"/>
    ${cup({ x: 1190, y: 420, w: 230, h: 470, body: INK, dot: '#3b3b40', lid: '#0f0f10', rot: -6, handle: true })}
    ${cup({ x: 1440, y: 480, w: 210, h: 420, body: INK, dot: '#3b3b40', lid: '#0f0f10', rot: 8 })}
    ${cup({ x: 1640, y: 470, w: 200, h: 440, body: CREAM, dot: INK, lid: '#e6d6c8', rot: 16 })}
    ${cup({ x: 1800, y: 540, w: 210, h: 360, body: CREAM, dot: INK, lid: '#e6d6c8', rot: 30, handle: true })}
    ${cup({ x: 1010, y: 600, w: 200, h: 380, body: CREAM, dot: INK, lid: '#f7f1ea', rot: -34, straw: true })}
    ${cup({ x: 1290, y: 690, w: 190, h: 340, body: CREAM, dot: INK, lid: '#f7f1ea', rot: 22, straw: true })}
  `,
  )

const product = (bg: string, c: Omit<Cup, 'h' | 'w' | 'x' | 'y'> & { h?: number; w?: number }) =>
  svg(
    1200,
    1200,
    `
    <rect width="1200" height="1200" fill="${bg}"/>
    <ellipse cx="600" cy="1010" rx="300" ry="38" fill="#000" opacity="0.14"/>
    ${cup({ x: 600, y: 640, w: c.w || 400, h: c.h || 720, ...c })}
  `,
  )

export const seedImages: { alt: string; name: string; svg: () => string }[] = [
  { name: 'banner-polka-dot.jpg', alt: 'Six polka-dot tumblers and bottles in cream and black', svg: hero },
  {
    name: 'tumbler-cream.jpg',
    alt: 'Cream tumbler with black polka dots, handle and straw lid',
    svg: () => product('#e9ddd2', { body: CREAM, dot: INK, lid: '#fbf7f2', handle: true, straw: true }),
  },
  {
    name: 'bottle-black.jpg',
    alt: 'Black travel bottle with tonal polka dots',
    svg: () => product('#cfd3d6', { body: INK, dot: '#3b3b40', lid: '#0f0f10', w: 340, h: 760 }),
  },
  {
    name: 'sport-bottle-sage.jpg',
    alt: 'Sage green sport bottle with white polka dots',
    svg: () => product('#dfe6dc', { body: '#8fa58c', dot: '#f4f4ee', lid: '#5f735d', w: 320, h: 740 }),
  },
  {
    name: 'mug-blush.jpg',
    alt: 'Blush pink insulated mug with white polka dots and handle',
    svg: () => product('#f3e3e0', { body: '#e0a9a4', dot: '#fff7f5', lid: '#c98d88', handle: true, w: 420, h: 520 }),
  },
  {
    name: 'tumbler-navy.jpg',
    alt: 'Navy tumbler with cream polka dots and straw lid',
    svg: () => product('#dde3ec', { body: '#27375a', dot: CREAM, lid: '#18233c', straw: true }),
  },
  {
    name: 'kids-bottle-yellow.jpg',
    alt: 'Yellow kids bottle with black polka dots',
    svg: () => product('#f4eccd', { body: '#f1c84b', dot: INK, lid: '#2a2a2a', w: 300, h: 560, straw: true }),
  },
]

export const renderImage = async (source: string) =>
  sharp(Buffer.from(source)).jpeg({ quality: 88 }).toBuffer()
