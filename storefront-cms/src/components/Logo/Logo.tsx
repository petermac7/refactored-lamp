import clsx from 'clsx'
import React from 'react'

import type { Media as MediaType } from '@/payload-types'

import { getMediaUrl } from '@/utilities/getMediaUrl'

interface Props {
  brand?: string | null
  className?: string
  logo?: MediaType | number | string | null
}

/**
 * Shows the uploaded logo, or a generated mark (initial in a filled badge)
 * above a letter-spaced wordmark when no logo has been uploaded yet.
 */
export const Logo = ({ brand: brandFromProps, className, logo }: Props) => {
  const brand = brandFromProps || 'Your Brand'

  if (logo && typeof logo === 'object' && logo.url) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        alt={logo.alt || brand}
        className={clsx('h-14 w-auto max-w-[10rem] object-contain', className)}
        src={getMediaUrl(logo.url, logo.updatedAt)}
      />
    )
  }

  const split = Math.ceil(brand.length / 2)

  return (
    <span className={clsx('sf-logo', className)}>
      <span aria-hidden className="sf-logo-mark">
        {brand.charAt(0).toUpperCase()}
      </span>
      <span className="sf-logo-word">
        <b>{brand.slice(0, split)}</b>
        {brand.slice(split)}
      </span>
    </span>
  )
}
