'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'

import './admin.css'

const links = [
  { href: '/admin/builder', label: 'Visual Builder' },
  { href: '/admin/templates', label: 'Templates' },
  { href: '/admin/inbox', label: 'Inbox' },
  { href: '/admin/plugins', label: 'Plugins' },
]

/** Extra sidebar links for the custom admin views, with an unread badge on Inbox. */
const NavLinks: React.FC = () => {
  const pathname = usePathname()
  const [unread, setUnread] = useState(0)

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/form-submissions?limit=0&depth=0&where[read][not_equals]=true', {
        credentials: 'include',
      })
      if (res.ok) setUnread((await res.json()).totalDocs || 0)
    } catch {
      // badge is optional
    }
  }, [])

  useEffect(() => {
    void refresh()
    window.addEventListener('sf-inbox-changed', refresh)
    return () => window.removeEventListener('sf-inbox-changed', refresh)
  }, [refresh, pathname])

  return (
    <div className="sfa-nav">
      <p className="sfa-nav__label">Site builder</p>
      {links.map((link) => (
        <Link
          aria-current={pathname.startsWith(link.href) ? 'page' : undefined}
          className="sfa-nav__link"
          href={link.href}
          key={link.href}
        >
          {link.label}
          {link.label === 'Inbox' && unread > 0 && (
            <span aria-label={`${unread} unread`} className="sfa-nav__badge">
              {unread}
            </span>
          )}
        </Link>
      ))}
    </div>
  )
}

export default NavLinks
