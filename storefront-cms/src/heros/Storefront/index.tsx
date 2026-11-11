import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'

/**
 * Brand-storefront banner: a wide photo with a spaced-out eyebrow,
 * a large script headline and an uppercase tagline overlaid on the left.
 */
export const StorefrontHero: React.FC<Page['hero']> = ({
  eyebrow,
  headline,
  links,
  media,
  tagline,
}) => {
  return (
    <div className="sf-wide">
      <div className="sf-hero relative overflow-hidden text-white">
        {media && typeof media === 'object' ? (
          <Media fill imgClassName="object-cover" pictureClassName="absolute inset-0" priority resource={media} />
        ) : (
          <div aria-hidden className="sf-placeholder absolute inset-0" />
        )}
        <div aria-hidden className="sf-hero-shade absolute inset-0" />
        <div className="sf-hero-copy absolute flex flex-col items-center">
          {eyebrow && <p className="sf-hero-eyebrow">{eyebrow}</p>}
          {headline && <h1 className="sf-hero-headline">{headline}</h1>}
          {tagline && <p className="sf-hero-tagline">{tagline}</p>}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="mt-5 flex gap-3">
              {links.map(({ link }, i) => (
                <li key={i}>
                  <CMSLink {...link} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
