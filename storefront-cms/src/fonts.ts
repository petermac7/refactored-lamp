import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import { Lobster } from 'next/font/google'

const script = Lobster({ subsets: ['latin'], variable: '--font-script', weight: '400' })

/** Font CSS variables for <html> — shared by the site and the visual builder canvas. */
export const fontVariables = [GeistSans.variable, GeistMono.variable, script.variable].join(' ')
