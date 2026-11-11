import Link from 'next/link'
import React from 'react'

import '@/admin/admin.css'

const shortcuts = [
  {
    href: '/admin/builder',
    text: 'Drag-and-drop editor with Content, Style and Advanced tabs.',
    title: 'Visual Builder',
  },
  {
    href: '/admin/templates',
    text: 'Start a page or blog post from a pre-made layout.',
    title: 'Templates',
  },
  {
    href: '/admin/collections/pages',
    text: 'Edit pages with the block builder and live preview.',
    title: 'Pages',
  },
  {
    href: '/admin/collections/posts',
    text: 'Write, schedule and publish blog posts.',
    title: 'Blog posts',
  },
  {
    href: '/admin/inbox',
    text: 'Read and reply to contact form messages.',
    title: 'Inbox',
  },
  {
    href: '/admin/globals/header',
    text: 'Brand name, logo, navigation and dropdowns.',
    title: 'Header & navigation',
  },
  {
    href: '/admin/plugins',
    text: 'Official Payload plugins with copy-paste install prompts.',
    title: 'Plugins',
  },
]

const BeforeDashboard: React.FC = () => {
  return (
    <div className="sfa-welcome">
      <h2>Welcome to your site builder</h2>
      <p>
        Jump straight in, or{' '}
        <a href="/" rel="noopener noreferrer" target="_blank">
          view the live site ↗
        </a>
      </p>
      <div className="sfa-grid">
        {shortcuts.map((shortcut) => (
          <Link className="sfa-card" href={shortcut.href} key={shortcut.href}>
            <h3>{shortcut.title}</h3>
            <p>{shortcut.text}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default BeforeDashboard
