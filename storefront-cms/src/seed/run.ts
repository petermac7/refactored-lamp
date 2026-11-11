/* eslint-disable @typescript-eslint/no-explicit-any */
import config from '@payload-config'
import { getPayload } from 'payload'

import { makeContext, templates } from '../templates'
import { h, ol, p, quote, rich, ul } from '../templates/lexical'
import { renderImage, seedImages } from './images'

/**
 * Seeds a fresh database: admin login, starter images, storefront pages,
 * blog posts, contact form, sample inbox messages and navigation.
 *
 *   pnpm seed
 *
 * Reads the admin login from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD in .env.
 * Refuses to run when pages already exist, so it can never overwrite your content.
 */

const context = { disableRevalidate: true }

const template = (id: string) => {
  const found = templates.find((t) => t.id === id)
  if (!found) throw new Error(`Unknown template: ${id}`)
  return found
}

const run = async () => {
  const payload = await getPayload({ config })

  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (!email || !password) {
    throw new Error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env before seeding.')
  }

  const existing = await payload.count({ collection: 'pages' })
  if (existing.totalDocs > 0) {
    payload.logger.info('Pages already exist — skipping seed so nothing is overwritten.')
    return
  }

  payload.logger.info('Creating admin user…')
  const users = await payload.find({ collection: 'users', limit: 1, where: { email: { equals: email } } })
  const admin =
    users.docs[0] ||
    (await payload.create({ collection: 'users', data: { name: 'Site Admin', email, password } }))

  payload.logger.info('Generating starter images…')
  const media: any[] = []
  for (const image of seedImages) {
    const data = await renderImage(image.svg())
    media.push(
      await payload.create({
        collection: 'media',
        data: { alt: image.alt },
        file: { name: image.name, data, mimetype: 'image/jpeg', size: data.byteLength },
      }),
    )
  }

  payload.logger.info('Creating contact form…')
  const form = await payload.create({
    collection: 'forms',
    data: {
      title: 'Contact Form',
      confirmationMessage: rich(
        h('h3', 'Thanks — your message is on its way.'),
        p('We reply within one business day.'),
      ),
      confirmationType: 'message',
      fields: [
        { name: 'full-name', blockType: 'text', label: 'Full name', required: true, width: 50 },
        { name: 'email', blockType: 'email', label: 'Email', required: true, width: 50 },
        { name: 'subject', blockType: 'text', label: 'Subject', required: false, width: 100 },
        { name: 'message', blockType: 'textarea', label: 'Message', required: true, width: 100 },
      ],
      submitButtonLabel: 'Send message',
    } as any,
  })

  const ctx = makeContext(media, form.id)

  payload.logger.info('Creating pages…')
  const pageSpecs: { overrides?: (data: any) => any; slug: string; template: string; title: string }[] = [
    {
      slug: 'home',
      template: 'storefront-home',
      title: 'Home',
      overrides: (data) => ({
        ...data,
        hero: { ...data.hero, eyebrow: 'Your Brand', headline: 'Polka Dot', tagline: 'Out now' },
      }),
    },
    { slug: 'shop', template: 'shop-collection', title: 'Shop' },
    { slug: 'about', template: 'about', title: 'About Us' },
    { slug: 'faq', template: 'faq', title: 'FAQ' },
    { slug: 'contact', template: 'contact', title: 'Contact' },
  ]

  const pages: Record<string, any> = {}
  for (const spec of pageSpecs) {
    const built = template(spec.template).build(ctx)
    const data = spec.overrides ? spec.overrides(built) : built
    pages[spec.slug] = await payload.create({
      collection: 'pages',
      context,
      data: {
        ...data,
        _status: 'published',
        generateSlug: false,
        meta: { title: spec.title, description: `${spec.title} — Your Brand` },
        slug: spec.slug,
        title: spec.title,
      } as any,
    })
  }

  payload.logger.info('Creating blog posts…')
  const category = await payload.create({
    collection: 'categories',
    data: { slug: 'news', title: 'News' } as any,
  })

  const posts = [
    {
      slug: 'introducing-the-polka-dot-collection',
      title: 'Introducing the Polka Dot Collection',
      image: media[1],
      description: 'Our most requested pattern is here, across tumblers, bottles and mugs.',
      content: rich(
        p('The Polka Dot Collection is out now: six pieces in cream and black, each with the same hand-drawn dot pattern.'),
        h('h2', 'What is new'),
        ul([
          'A 40 oz tumbler with a handle and straw lid',
          'A leak-proof 32 oz travel bottle',
          'A 14 oz insulated mug for the desk',
        ]),
        h('h2', 'Why polka dots'),
        p('You asked. Pattern requests have topped our customer survey two years running, and dots won by a wide margin.'),
        quote('It is the first bottle I have owned that people stop me to ask about.'),
        h('h2', 'Price and availability'),
        p('Everything in the collection is available today while stock lasts.'),
      ),
    },
    {
      slug: 'how-to-clean-your-tumbler',
      title: 'How to Clean Your Tumbler Properly',
      image: media[2],
      description: 'A two-minute routine that keeps lids, straws and seals fresh.',
      content: rich(
        p('A quick rinse is not enough. This routine takes about two minutes and prevents smells and stains.'),
        h('h2', 'What you will need'),
        ul(['Warm water and mild dish soap', 'A bottle brush', 'A straw brush']),
        h('h2', 'Steps'),
        ol([
          'Take the lid apart and remove the silicone seal.',
          'Scrub the body, lid and straw with soapy water.',
          'Rinse well and leave everything to air-dry upside down.',
        ]),
        h('h2', 'Tips'),
        p('Once a week, soak the lid and seal in a mix of water and white vinegar for ten minutes.'),
      ),
    },
    {
      slug: '5-ways-to-drink-more-water',
      title: '5 Easy Ways to Drink More Water Every Day',
      image: media[3],
      description: 'Small habits that make staying hydrated automatic.',
      content: rich(
        p('Most people know they should drink more water. These five habits make it happen without thinking about it.'),
        h('h2', '1. Fill up before you sit down'),
        p('Start every work block with a full bottle within reach.'),
        h('h2', '2. Use a straw lid'),
        p('It sounds small, but sipping through a straw adds up over a day.'),
        h('h2', '3. Tie it to a routine'),
        p('Drink a glass after brushing your teeth and before each meal.'),
        h('h2', '4. Keep it cold'),
        p('Insulated bottles keep water cold all day, which makes it far more appealing.'),
        h('h2', '5. Track it loosely'),
        p('Aim to refill a set number of times rather than counting ounces.'),
      ),
    },
  ]

  for (const post of posts) {
    await payload.create({
      collection: 'posts',
      context,
      data: {
        _status: 'published',
        authors: [admin.id],
        categories: [category.id],
        content: post.content,
        generateSlug: false,
        heroImage: post.image.id,
        meta: { description: post.description, image: post.image.id, title: post.title },
        publishedAt: new Date().toISOString(),
        slug: post.slug,
        title: post.title,
      } as any,
    })
  }

  payload.logger.info('Adding sample inbox messages…')
  const messages = [
    {
      read: true,
      data: [
        ['full-name', 'Dana Whitfield'],
        ['email', 'dana@example.com'],
        ['subject', 'Wholesale enquiry'],
        ['message', 'Hi — I run a small gym and would like to stock your tumblers. Do you offer wholesale pricing for 50+ units?'],
      ],
    },
    {
      read: false,
      data: [
        ['full-name', 'Marcus Lee'],
        ['email', 'marcus@example.com'],
        ['subject', 'Replacement lid'],
        ['message', 'My straw lid cracked after a drop. Is it covered by the warranty, and how do I get a replacement?'],
      ],
    },
    {
      read: false,
      data: [
        ['full-name', 'Sofia Alvarez'],
        ['email', 'sofia@example.com'],
        ['subject', 'Restock date'],
        ['message', 'Any idea when the cream polka dot tumbler will be back in stock? (Sample message — safe to delete.)'],
      ],
    },
  ]
  for (const message of messages) {
    await payload.create({
      collection: 'form-submissions',
      data: {
        form: form.id,
        read: message.read,
        submissionData: message.data.map(([field, value]) => ({ field, value })),
      } as any,
    })
  }

  payload.logger.info('Setting up navigation…')
  const ref = (slug: string, label: string) => ({
    link: { type: 'reference', label, reference: { relationTo: 'pages', value: pages[slug].id } },
  })
  const custom = (url: string, label: string) => ({ link: { type: 'custom', label, url } })

  await payload.updateGlobal({
    slug: 'header',
    context,
    data: {
      brandName: 'Your Brand',
      navItems: [
        ref('home', 'Home'),
        custom('/shop', 'New Arrivals'),
        custom('/shop', 'Special Promo'),
        custom('/shop', 'Best Sellers'),
        {
          ...custom('/shop', 'Tumblers'),
          children: [custom('/shop', '40 oz Tumblers'), custom('/shop', '32 oz Tumblers'), custom('/shop', 'Lids & Straws')],
        },
        {
          ...custom('/shop', 'Sport'),
          children: [custom('/shop', 'Flip Bottles'), custom('/shop', 'Shaker Bottles')],
        },
        {
          ...custom('/posts', 'More'),
          boxed: true,
          children: [custom('/posts', 'Blog'), ref('about', 'About Us'), ref('faq', 'FAQ'), ref('contact', 'Contact')],
        },
      ],
    } as any,
  })

  await payload.updateGlobal({
    slug: 'footer',
    context,
    data: {
      navItems: [custom('/posts', 'Blog'), ref('faq', 'FAQ'), ref('contact', 'Contact'), custom('/admin', 'Admin')],
    } as any,
  })

  payload.logger.info(`Seed complete. Log in at /admin as ${email}.`)
}

try {
  await run()
  process.exit(0)
} catch (error) {
  console.error(error)
  process.exit(1)
}
