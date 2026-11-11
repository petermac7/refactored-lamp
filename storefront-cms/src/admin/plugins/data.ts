/**
 * The official Payload plugins, as listed at https://payloadcms.com/docs/plugins/overview
 * Each entry carries a copy-paste prompt for an AI coding agent (e.g. Claude Code).
 */

export type PluginInfo = {
  category: 'Commerce' | 'Content' | 'Developer' | 'Operations' | 'SEO'
  description: string
  docs: string
  /** Extra environment variables the plugin needs, if any. */
  env?: string[]
  /** Named export to add to the `plugins` array. */
  exportName: string
  name: string
  package: string
  /** Extra packages installed alongside the plugin. */
  peers?: string[]
  /** Plugin-specific setup steps appended to the prompt. */
  steps: string[]
}

export const officialPlugins: PluginInfo[] = [
  {
    name: 'Form Builder',
    package: '@payloadcms/plugin-form-builder',
    exportName: 'formBuilderPlugin',
    category: 'Content',
    description:
      'Build forms in the admin panel and collect submissions. Powers the contact form and the Inbox in this project.',
    docs: 'https://payloadcms.com/docs/plugins/form-builder',
    steps: [
      'Configure which field types are enabled via the `fields` option and set `redirectRelationships` to the collections a form may redirect to.',
      'Make sure a Form block exists so editors can place forms on pages, and that the frontend posts to /api/form-submissions.',
      'Send a test submission and confirm it appears in the form-submissions collection.',
    ],
  },
  {
    name: 'SEO',
    package: '@payloadcms/plugin-seo',
    exportName: 'seoPlugin',
    category: 'SEO',
    description:
      'Meta title, description and image fields with a live search-result preview and length checks.',
    docs: 'https://payloadcms.com/docs/plugins/seo',
    steps: [
      'Enable it for the pages and posts collections, set `uploadsCollection` to media, and provide `generateTitle`, `generateDescription` and `generateURL` functions.',
      'Use the `meta` fields in each route\'s `generateMetadata` so the values reach the page <head>.',
    ],
  },
  {
    name: 'Redirects',
    package: '@payloadcms/plugin-redirects',
    exportName: 'redirectsPlugin',
    category: 'SEO',
    description: 'Manage URL redirects from the admin panel so changed slugs never lead to a 404.',
    docs: 'https://payloadcms.com/docs/plugins/redirects',
    steps: [
      'Enable it for the pages and posts collections.',
      'Make sure the frontend actually applies the redirects (for example in the catch-all page route or next.config redirects) and revalidates when a redirect changes.',
    ],
  },
  {
    name: 'Search',
    package: '@payloadcms/plugin-search',
    exportName: 'searchPlugin',
    category: 'Content',
    description:
      'Keeps a lightweight search collection in sync with your content for fast site search.',
    docs: 'https://payloadcms.com/docs/plugins/search',
    steps: [
      'Choose the collections to index and add a `beforeSync` function that copies the fields needed on the results page.',
      'Point the site search page at the search collection, then reindex existing documents from the admin panel.',
    ],
  },
  {
    name: 'Nested Docs',
    package: '@payloadcms/plugin-nested-docs',
    exportName: 'nestedDocsPlugin',
    category: 'Content',
    description:
      'Parent/child hierarchies with automatic breadcrumbs — for nested pages or category trees.',
    docs: 'https://payloadcms.com/docs/plugins/nested-docs',
    steps: [
      'Enable it for the collections that need a hierarchy and provide `generateLabel` and `generateURL` functions.',
      'If enabling it for pages, update the frontend routing to resolve nested URLs from the breadcrumbs field.',
    ],
  },
  {
    name: 'Import / Export',
    package: '@payloadcms/plugin-import-export',
    exportName: 'importExportPlugin',
    category: 'Operations',
    description: 'Export collection data to CSV or JSON from the list view, and import it back in.',
    docs: 'https://payloadcms.com/docs/plugins/import-export',
    steps: [
      'Enable it for the collections editors should be able to export (pages, posts and form-submissions are good candidates).',
      'Run an export from a list view and confirm the file downloads with the selected fields.',
    ],
  },
  {
    name: 'Ecommerce',
    package: '@payloadcms/plugin-ecommerce',
    exportName: 'ecommercePlugin',
    category: 'Commerce',
    description:
      'Products, variants, carts, orders, transactions and payment adapters for a full store backend.',
    docs: 'https://payloadcms.com/docs/ecommerce/overview',
    env: ['STRIPE_SECRET_KEY', 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'STRIPE_WEBHOOKS_SIGNING_SECRET'],
    steps: [
      'Configure the customers collection, access control functions, currencies and the Stripe payment adapter as described in the docs.',
      'Add the frontend pieces: the ecommerce provider, product pages, a cart and a checkout flow.',
      'Ask me for the Stripe test-mode keys rather than inventing values, and never commit them.',
    ],
  },
  {
    name: 'Stripe',
    package: '@payloadcms/plugin-stripe',
    exportName: 'stripePlugin',
    category: 'Commerce',
    description:
      'Two-way sync between Payload collections and Stripe, a Stripe REST proxy and webhook handling.',
    docs: 'https://payloadcms.com/docs/plugins/stripe',
    env: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOKS_ENDPOINT_SECRET'],
    steps: [
      'Pass `stripeSecretKey` and `stripeWebhooksEndpointSecret` from environment variables and set `isTestKey` while developing.',
      'Configure `sync` for the collections that should mirror Stripe objects, and add `webhooks` handlers for the events I need.',
      'Ask me for the Stripe test-mode keys rather than inventing values, and never commit them.',
    ],
  },
  {
    name: 'Multi-Tenant',
    package: '@payloadcms/plugin-multi-tenant',
    exportName: 'multiTenantPlugin',
    category: 'Operations',
    description:
      'Run several sites or brands from one Payload install, with content scoped to each tenant.',
    docs: 'https://payloadcms.com/docs/plugins/multi-tenant',
    steps: [
      'Create a tenants collection, then list the collections that should be tenant-scoped in the plugin options.',
      'Add the tenants relationship to users and decide which roles can see every tenant.',
      'Update frontend queries to filter by the current tenant (for example by domain).',
    ],
  },
  {
    name: 'Sentry',
    package: '@payloadcms/plugin-sentry',
    exportName: 'sentryPlugin',
    category: 'Operations',
    description: 'Report Payload errors and performance traces to Sentry.',
    docs: 'https://payloadcms.com/docs/plugins/sentry',
    peers: ['@sentry/nextjs'],
    env: ['NEXT_PUBLIC_SENTRY_DSN'],
    steps: [
      'Set up @sentry/nextjs for this Next.js app first (instrumentation files and next.config wrapper), then pass the Sentry instance to the plugin.',
      'Ask me for the Sentry DSN rather than inventing one.',
      'Trigger a test error and confirm it shows up in Sentry.',
    ],
  },
  {
    name: 'MCP',
    package: '@payloadcms/plugin-mcp',
    exportName: 'mcpPlugin',
    category: 'Developer',
    description:
      'Exposes your collections through a Model Context Protocol server so AI assistants can read and manage content.',
    docs: 'https://payloadcms.com/docs/plugins/mcp',
    steps: [
      'Enable only the collections and operations an assistant should have (start with read-only access to pages and posts).',
      'Create an API key in the admin panel for the MCP client and show me the client configuration to connect to it.',
    ],
  },
]

export const buildPrompt = (plugin: PluginInfo, payloadVersion: string, installed: boolean) => {
  const packages = [plugin.package, ...(plugin.peers || [])]
    .map((name) => (name.startsWith('@payloadcms/') ? `${name}@${payloadVersion}` : name))
    .join(' ')

  const lines = installed
    ? [
        `The official Payload ${plugin.name} plugin (${plugin.package}) is already installed in this project and registered in src/plugins/index.ts.`,
        '',
        `Review how it is configured against the docs at ${plugin.docs} and tell me which options I am not using yet. Then:`,
      ]
    : [
        `Install the official Payload ${plugin.name} plugin in this project (Payload ${payloadVersion}, Next.js App Router, pnpm).`,
        '',
        `1. Read the docs first: ${plugin.docs}`,
        `2. Run: pnpm add ${packages}  (the @payloadcms version must match the installed payload version exactly).`,
        `3. Import ${plugin.exportName} from '${plugin.package}' and add it to the plugins array in src/plugins/index.ts.`,
      ]

  let n = installed ? 1 : 4
  for (const step of plugin.steps) lines.push(`${n++}. ${step}`)
  if (plugin.env?.length) {
    lines.push(
      `${n++}. Add these variables to .env and .env.example (empty placeholders in the example file): ${plugin.env.join(', ')}.`,
    )
  }
  lines.push(
    `${n++}. Run pnpm generate:importmap and pnpm generate:types, then start the dev server and confirm the admin panel loads with no errors.`,
    `${n++}. Summarise what you changed and anything I need to do by hand.`,
  )

  return lines.join('\n')
}
