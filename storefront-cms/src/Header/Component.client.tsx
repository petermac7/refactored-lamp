'use client'
import { Check, ChevronDown, Menu, Search, Share, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Logo } from '@/components/Logo/Logo'
import { linkHref } from '@/builder/shared'
import { cn } from '@/utilities/ui'

type NavItem = NonNullable<Header['navItems']>[number]
type LinkData = NavItem['link']

const hrefFor = (link: LinkData): string => linkHref(link) || '#'

const newTab = (link: LinkData) =>
  link.newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

export const HeaderClient: React.FC<{ data: Header }> = ({ data }) => {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [following, setFollowing] = useState(false)
  const [shared, setShared] = useState(false)
  const [query, setQuery] = useState('')

  const brand = data?.brandName || 'Your Brand'
  const navItems = data?.navItems || []

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    try {
      setFollowing(window.localStorage.getItem('sf-following') === '1')
    } catch {
      // storage unavailable
    }
  }, [])

  const toggleFollow = () => {
    const next = !following
    setFollowing(next)
    try {
      window.localStorage.setItem('sf-following', next ? '1' : '0')
    } catch {
      // storage unavailable
    }
    if (next && data?.followUrl) window.open(data.followUrl, '_blank', 'noopener,noreferrer')
  }

  const share = async () => {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: brand, url })
      else {
        await navigator.clipboard.writeText(url)
        setShared(true)
        setTimeout(() => setShared(false), 1800)
      }
    } catch {
      // share dismissed
    }
  }

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search')
  }

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))
  // Several items may point at the same page; only the first one is highlighted.
  const activeIndex = navItems.findIndex(
    (item) => !item.children?.length && isActive(hrefFor(item.link)),
  )

  const searchBox = data?.showSearch !== false && (
    <form className="sf-search" onSubmit={onSearch} role="search">
      <Search aria-hidden className="size-5 shrink-0" />
      <input
        aria-label={`Search all ${brand}`}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={`Search all ${brand}`}
        type="search"
        value={query}
      />
    </form>
  )

  return (
    <header className="sf-header relative z-30">
      <div className="sf-wide flex items-center gap-4 py-2 lg:gap-7">
        <Link aria-label={`${brand} home`} className="shrink-0" href="/">
          <Logo brand={brand} logo={data?.logo} />
        </Link>

        <div className="min-w-0 grow">
          <p className="mb-2 hidden text-sm lg:block">{brand}</p>
          <div className="flex items-center gap-3 lg:gap-5">
            {data?.showFollow !== false && (
              <button
                aria-pressed={following}
                className="sf-follow"
                onClick={toggleFollow}
                type="button"
              >
                {following ? (
                  <>
                    <Check className="size-3.5" /> Following
                  </>
                ) : (
                  'Follow'
                )}
              </button>
            )}
            {data?.showShare !== false && (
              <button
                aria-label={shared ? 'Link copied' : 'Share this page'}
                className="sf-icon-btn"
                onClick={share}
                title={shared ? 'Link copied' : 'Share'}
                type="button"
              >
                {shared ? <Check className="size-5" /> : <Share className="size-5" />}
              </button>
            )}

            <nav aria-label="Main" className="hidden items-center gap-1 xl:flex">
              {navItems.map((item, i) => {
                const href = hrefFor(item.link)
                const children = item.children || []
                const active = i === activeIndex
                return (
                  <div className="group relative" key={i}>
                    <Link
                      className={cn(
                        'sf-nav-link',
                        active && 'sf-nav-active',
                        item.boxed && 'sf-nav-boxed',
                      )}
                      href={href}
                      {...newTab(item.link)}
                    >
                      <span>{item.link.label}</span>
                      {children.length > 0 && <ChevronDown aria-hidden className="size-3.5" />}
                    </Link>
                    {children.length > 0 && (
                      <div className="sf-dropdown">
                        {children.map((child, j) => (
                          <Link href={hrefFor(child.link)} key={j} {...newTab(child.link)}>
                            {child.link.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>
        </div>

        <div className="hidden w-full max-w-[21.5rem] min-[112rem]:block">{searchBox}</div>
        {data?.showSearch !== false && (
          <Link aria-label="Search" className="sf-icon-btn min-[112rem]:hidden" href="/search">
            <Search className="size-5" />
          </Link>
        )}

        <button
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="sf-icon-btn xl:hidden"
          onClick={() => setOpen(!open)}
          type="button"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div className="sf-mobile-nav xl:hidden">
          <div className="sf-wide flex flex-col gap-1 py-4">
            {searchBox}
            {navItems.map((item, i) => (
              <React.Fragment key={i}>
                <Link className="sf-nav-link" href={hrefFor(item.link)} {...newTab(item.link)}>
                  {item.link.label}
                </Link>
                {(item.children || []).map((child, j) => (
                  <Link
                    className="py-1.5 pl-6 text-sm"
                    href={hrefFor(child.link)}
                    key={j}
                    {...newTab(child.link)}
                  >
                    {child.link.label}
                  </Link>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
