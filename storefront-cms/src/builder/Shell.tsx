/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'

import { cn } from '@/utilities/ui'

const space: Record<string, string> = {
  lg: '4rem',
  md: '2rem',
  sm: '1rem',
  xl: '6rem',
  xs: '0.5rem',
}

const radius: Record<string, string> = { lg: '1.5rem', md: '0.75rem', sm: '0.375rem' }

const shadow: Record<string, string> = {
  lg: '0 20px 40px -12px rgb(0 0 0 / 28%)',
  md: '0 8px 20px -6px rgb(0 0 0 / 20%)',
  sm: '0 2px 6px rgb(0 0 0 / 14%)',
}

const maxWidth: Record<string, string> = { medium: '64rem', narrow: '48rem', wide: '80rem' }

/**
 * Wraps every builder element and applies its Style and Advanced tab options,
 * so the section components themselves stay untouched and shared with the block editor.
 */
export const Shell: React.FC<{ children: React.ReactNode; editing?: boolean; p: any }> = ({
  children,
  editing,
  p,
}) => {
  const style: React.CSSProperties = {
    marginBottom: space[p.aMarginBottom],
    marginTop: space[p.aMarginTop],
    paddingBottom: space[p.sPadBottom],
    paddingInline: space[p.sPadX],
    paddingTop: space[p.sPadTop],
  }
  if (p.sBg) style.background = p.sBg
  if (p.sText) style.color = p.sText
  if (p.sAlign && p.sAlign !== 'default') style.textAlign = p.sAlign
  if (radius[p.sRadius]) {
    style.borderRadius = radius[p.sRadius]
    style.overflow = 'hidden'
  }
  if (shadow[p.sShadow]) style.boxShadow = shadow[p.sShadow]
  if (maxWidth[p.aMaxWidth]) {
    style.maxWidth = maxWidth[p.aMaxWidth]
    style.marginInline = 'auto'
  }

  // In the editor, "hidden" elements stay visible but faded so they can still be selected.
  const hide =
    p.aHide === 'mobile'
      ? editing
        ? 'sfb-ghost-mobile'
        : 'max-md:hidden'
      : p.aHide === 'desktop'
        ? editing
          ? 'sfb-ghost-desktop'
          : 'md:hidden'
        : ''

  return (
    <div
      className={cn(
        'sfb-shell',
        p.sText && 'sfb-recolor',
        hide,
        !editing && p.aAnim && p.aAnim !== 'none' && `sfb-anim-${p.aAnim}`,
        p.aClass,
      )}
      id={p.aId || undefined}
      style={style}
    >
      {children}
    </div>
  )
}
