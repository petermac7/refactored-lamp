import { h, ol, p, quote, rich, ul } from './lexical'

/**
 * Pre-made templates. Each one builds the starting data for a new draft page or post.
 * Add your own by appending to `templates` — it shows up at /admin/templates automatically.
 */

export type TemplateContext = {
  /** Returns a wide banner-shaped image if the library has one, else any image. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  banner: () => any
  /** The form to drop into form blocks (first form found), if any: its ID, or the document in the visual builder. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formId?: any
  /** Returns a media ID from the library (cycling), or undefined when the library is empty. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: (index: number) => any
}

type MediaLike = { height?: null | number; id: number | string; width?: null | number }

/**
 * Builds the context templates use to pick images and a form from what already exists.
 * `pick` decides what a template receives for an image: its ID (Payload block editor)
 * or the whole document (visual builder) — so both editors share these templates.
 */
export const makeContext = (
  media: MediaLike[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form?: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pick: (m: MediaLike) => any = (m) => m.id,
): TemplateContext => {
  const isWide = (m: MediaLike) => Boolean(m.width && m.height && m.width / m.height > 1.6)
  const wide = media.filter(isWide)
  const regular = media.filter((m) => !isWide(m))
  const pool = regular.length ? regular : media
  const first = wide[0] || media[0]

  return {
    banner: () => (first ? pick(first) : undefined),
    formId: form,
    image: (index) => (pool.length ? pick(pool[index % pool.length]) : undefined),
  }
}

export type Template = {
  build: (ctx: TemplateContext) => Record<string, unknown>
  /** Names of the blocks used, shown on the template card. */
  blocks: string[]
  collection: 'pages' | 'posts'
  description: string
  id: string
  name: string
}

const heroText = (title: string, intro: string) => ({
  type: 'lowImpact',
  richText: rich(h('h1', title), p(intro)),
})

const heroImage = (ctx: TemplateContext, title: string, intro: string) => {
  const media = ctx.banner()
  return media
    ? { type: 'mediumImpact', media, richText: rich(h('h1', title), p(intro)) }
    : heroText(title, intro)
}

const products = (ctx: TemplateContext, count: number, offset = 0) =>
  [
    { name: 'Everyday Tumbler 40 oz', price: '$34.99', rating: 4.8, badge: 'Best seller' },
    { name: 'Travel Bottle 32 oz', price: '$29.99', rating: 4.7 },
    { name: 'Sport Flip Bottle 24 oz', price: '$24.99', rating: 4.6, badge: 'New' },
    { name: 'Insulated Mug 14 oz', price: '$19.99', compareAtPrice: '$24.99', rating: 4.9 },
    { name: 'Straw Lid 2-Pack', price: '$9.99', rating: 4.5 },
    { name: 'Carry Sleeve', price: '$14.99', rating: 4.4 },
    { name: 'Kids Bottle 12 oz', price: '$17.99', rating: 4.7 },
    { name: 'Gift Set', price: '$54.99', compareAtPrice: '$64.99', rating: 4.9, badge: 'Bundle' },
  ]
    .slice(0, count)
    .map((item, i) => ({ ...item, image: ctx.image(i + offset), url: '/shop' }))

const testimonials = [
  {
    name: 'Jordan M.',
    quote: 'I bought one for the gym and ended up ordering three more for the family.',
    rating: 5,
    role: 'Verified buyer',
  },
  {
    name: 'Priya S.',
    quote: 'Keeps ice all day and actually fits in my cup holder. The pattern gets compliments.',
    rating: 5,
    role: 'Verified buyer',
  },
  {
    name: 'Alex R.',
    quote: 'Solid build, no leaks, and customer service replaced a lid within two days.',
    rating: 4,
    role: 'Verified buyer',
  },
]

const faqItems = [
  {
    question: 'How long does shipping take?',
    answer: 'Orders ship within 1–2 business days. Standard delivery takes 3–5 business days.',
  },
  {
    question: 'What is your return policy?',
    answer: 'Unused items can be returned within 30 days of delivery for a full refund.',
  },
  {
    question: 'Are your products dishwasher safe?',
    answer: 'Lids and straws are top-rack dishwasher safe. We recommend hand-washing the body.',
  },
  {
    question: 'Do you offer wholesale pricing?',
    answer: 'Yes. Send us a message through the contact form and our team will follow up.',
  },
]

const cta = (title: string, text: string, label: string, url: string) => ({
  blockType: 'cta',
  links: [{ link: { type: 'custom', appearance: 'default', label, url } }],
  richText: rich(h('h3', title), p(text)),
})

export const templates: Template[] = [
  {
    id: 'storefront-home',
    collection: 'pages',
    name: 'Storefront Home',
    description:
      'Brand-store homepage: wide banner with script headline, category tiles, best sellers and reviews.',
    blocks: ['Storefront Banner', 'Promo Tiles', 'Product Grid', 'Feature Grid', 'Testimonials'],
    build: (ctx) => ({
      title: 'Storefront Home',
      hero: ctx.banner()
        ? {
            type: 'storefront',
            eyebrow: 'Your Brand',
            headline: 'New Collection',
            media: ctx.banner(),
            tagline: 'Out now',
          }
        : heroText('New Collection', 'Out now — add a banner image to switch to the storefront banner.'),
      layout: [
        {
          blockType: 'promoTiles',
          columns: '3',
          tiles: [
            { label: 'New arrivals', caption: 'Fresh this season', image: ctx.image(3), url: '/shop' },
            { label: 'Best sellers', caption: 'Customer favourites', image: ctx.image(4), url: '/shop' },
            { label: 'Special promo', caption: 'Limited time', image: ctx.image(5), url: '/shop' },
          ],
        },
        {
          blockType: 'productGrid',
          columns: '4',
          items: products(ctx, 4),
          subtitle: 'The pieces our customers reorder most.',
          title: 'Best sellers',
        },
        {
          blockType: 'featureGrid',
          columns: '3',
          items: [
            { icon: 'truck', title: 'Fast, free shipping', text: 'Free delivery on orders over $50.' },
            { icon: 'shield', title: 'Lifetime warranty', text: 'If it breaks, we replace it.' },
            { icon: 'refresh', title: '30-day returns', text: 'Not right? Send it back, no questions.' },
          ],
        },
        { blockType: 'testimonials', items: testimonials, title: 'Loved by customers' },
      ],
    }),
  },
  {
    id: 'landing-page',
    collection: 'pages',
    name: 'Landing Page',
    description: 'Single-product or campaign page built to convert: benefits, proof, FAQ and a call to action.',
    blocks: ['Hero', 'Logo Cloud', 'Image + Text', 'Stats', 'Testimonials', 'FAQ', 'Call to Action'],
    build: (ctx) => ({
      title: 'Landing Page',
      hero: heroImage(
        ctx,
        'The headline that explains your offer',
        'One or two sentences on who this is for and why it is worth their time.',
      ),
      layout: [
        {
          blockType: 'logoCloud',
          logos: [{ name: 'Daily Press' }, { name: 'Outdoor Weekly' }, { name: 'Gear Lab' }, { name: 'The Review' }],
          title: 'As featured in',
        },
        {
          blockType: 'splitContent',
          buttonLabel: 'Shop now',
          buttonUrl: '/shop',
          eyebrow: 'Why it works',
          image: ctx.image(1),
          imagePosition: 'left',
          text: 'Describe the main benefit in plain language. Focus on what changes for the customer, not on the feature list.',
          title: 'Lead with the biggest benefit',
        },
        {
          blockType: 'splitContent',
          eyebrow: 'How it is made',
          image: ctx.image(2),
          imagePosition: 'right',
          text: 'Use the second section for materials, process or the story behind the product.',
          title: 'Back it up with detail',
        },
        {
          blockType: 'stats',
          items: [
            { label: 'Happy customers', value: '50k+' },
            { label: 'Average rating', value: '4.8/5' },
            { label: 'Countries shipped', value: '32' },
          ],
        },
        { blockType: 'testimonials', items: testimonials, title: 'What customers say' },
        { blockType: 'faq', items: faqItems, title: 'Questions, answered' },
        cta('Ready to try it?', 'Free shipping and 30-day returns on every order.', 'Shop now', '/shop'),
      ],
    }),
  },
  {
    id: 'shop-collection',
    collection: 'pages',
    name: 'Shop / Collection',
    description: 'Product listing page with a heading, an eight-product grid and a trust strip.',
    blocks: ['Heading', 'Product Grid', 'Feature Grid'],
    build: (ctx) => ({
      title: 'Shop',
      hero: { type: 'none' },
      layout: [
        {
          blockType: 'heading',
          align: 'center',
          eyebrow: 'Collection',
          subtitle: 'Every product in one place. Link each tile to its product or marketplace listing.',
          title: 'Shop all',
        },
        { blockType: 'productGrid', columns: '4', items: products(ctx, 8) },
        {
          blockType: 'featureGrid',
          columns: '3',
          items: [
            { icon: 'truck', title: 'Free shipping over $50' },
            { icon: 'refresh', title: '30-day returns' },
            { icon: 'shield', title: 'Lifetime warranty' },
          ],
        },
      ],
    }),
  },
  {
    id: 'about',
    collection: 'pages',
    name: 'About Us',
    description: 'Brand story page with mission, numbers and the team.',
    blocks: ['Hero', 'Image + Text', 'Stats', 'Team', 'Call to Action'],
    build: (ctx) => ({
      title: 'About Us',
      hero: heroText('Our story', 'Who we are, what we make and why we started.'),
      layout: [
        {
          blockType: 'splitContent',
          eyebrow: 'Our mission',
          image: ctx.image(0),
          imagePosition: 'right',
          text: 'Tell the founding story here. What problem did you set out to solve, and what do you believe that competitors do not?',
          title: 'Why we started',
        },
        {
          blockType: 'stats',
          items: [
            { label: 'Founded', value: '2019' },
            { label: 'Team members', value: '24' },
            { label: 'Products shipped', value: '1.2M' },
            { label: 'Average rating', value: '4.8' },
          ],
        },
        {
          blockType: 'team',
          members: [
            { name: 'Sam Carter', role: 'Founder & CEO', photo: ctx.image(1) },
            { name: 'Riley Chen', role: 'Head of Product', photo: ctx.image(2) },
            { name: 'Morgan Diaz', role: 'Design Lead', photo: ctx.image(3) },
            { name: 'Taylor Brooks', role: 'Customer Care', photo: ctx.image(4) },
          ],
          title: 'Meet the team',
        },
        cta('Want to work with us?', 'We love hearing from customers, retailers and creators.', 'Get in touch', '/contact'),
      ],
    }),
  },
  {
    id: 'contact',
    collection: 'pages',
    name: 'Contact',
    description: 'Contact page with a form wired to the Inbox, plus support details.',
    blocks: ['Hero', 'Form', 'Feature Grid'],
    build: (ctx) => ({
      title: 'Contact',
      hero: heroText('Get in touch', 'Questions about an order, wholesale or press? Send us a message.'),
      layout: [
        ...(ctx.formId
          ? [{ blockType: 'formBlock', enableIntro: false, form: ctx.formId }]
          : [
              {
                blockType: 'heading',
                align: 'center',
                subtitle: 'Create a form under Forms, then add a Form block here to collect messages.',
                title: 'No form yet',
              },
            ]),
        {
          blockType: 'featureGrid',
          columns: '3',
          items: [
            { icon: 'clock', title: 'Reply time', text: 'We answer within one business day.' },
            { icon: 'package', title: 'Order help', text: 'Include your order number for faster support.' },
            { icon: 'smile', title: 'Wholesale', text: 'Tell us about your store and expected volume.' },
          ],
        },
      ],
    }),
  },
  {
    id: 'faq',
    collection: 'pages',
    name: 'FAQ',
    description: 'Help page with an accordion of common questions and a contact prompt.',
    blocks: ['Hero', 'FAQ Accordion', 'Call to Action'],
    build: () => ({
      title: 'FAQ',
      hero: heroText('Frequently asked questions', 'Quick answers about shipping, returns and product care.'),
      layout: [
        { blockType: 'faq', items: faqItems },
        cta('Still have a question?', 'Our team replies within one business day.', 'Contact us', '/contact'),
      ],
    }),
  },
  {
    id: 'pricing',
    collection: 'pages',
    name: 'Pricing',
    description: 'Three-tier pricing table with a highlighted plan and FAQ.',
    blocks: ['Hero', 'Pricing Table', 'FAQ Accordion'],
    build: () => ({
      title: 'Pricing',
      hero: heroText('Simple pricing', 'Pick the plan that fits. Change or cancel any time.'),
      layout: [
        {
          blockType: 'pricing',
          plans: [
            {
              name: 'Starter',
              buttonLabel: 'Choose Starter',
              buttonUrl: '/contact',
              description: 'For trying things out.',
              features: [{ text: '1 product' }, { text: 'Standard shipping' }, { text: 'Email support' }],
              period: '/month',
              price: '$19',
            },
            {
              name: 'Plus',
              buttonLabel: 'Choose Plus',
              buttonUrl: '/contact',
              description: 'Our most popular option.',
              featured: true,
              features: [
                { text: '3 products' },
                { text: 'Free express shipping' },
                { text: 'Priority support' },
                { text: 'Early access to drops' },
              ],
              period: '/month',
              price: '$39',
            },
            {
              name: 'Team',
              buttonLabel: 'Talk to us',
              buttonUrl: '/contact',
              description: 'For offices and gyms.',
              features: [{ text: '10+ products' }, { text: 'Custom branding' }, { text: 'Dedicated manager' }],
              period: '/month',
              price: '$99',
            },
          ],
        },
        { blockType: 'faq', items: faqItems.slice(0, 3), title: 'Pricing questions' },
      ],
    }),
  },
  {
    id: 'lookbook',
    collection: 'pages',
    name: 'Lookbook / Gallery',
    description: 'Image-led page for a collection launch, with a six-image gallery and buttons.',
    blocks: ['Heading', 'Image Gallery', 'Buttons'],
    build: (ctx) => ({
      title: 'Lookbook',
      hero: { type: 'none' },
      layout: [
        {
          blockType: 'heading',
          align: 'center',
          eyebrow: 'Lookbook',
          subtitle: 'A closer look at the new collection.',
          title: 'Season highlights',
        },
        {
          blockType: 'gallery',
          columns: '3',
          images: [0, 1, 2, 3, 4, 5].map((i) => ({ image: ctx.image(i) })),
        },
        {
          blockType: 'buttonGroup',
          align: 'center',
          buttons: [
            { label: 'Shop the collection', style: 'primary', url: '/shop' },
            { label: 'Read the story', style: 'outline', url: '/posts' },
          ],
        },
      ],
    }),
  },
  {
    id: 'blank-page',
    collection: 'pages',
    name: 'Blank Page',
    description: 'An empty page with just a heading — start from scratch.',
    blocks: ['Heading'],
    build: () => ({
      title: 'New Page',
      hero: { type: 'none' },
      layout: [{ blockType: 'heading', align: 'center', title: 'New page' }],
    }),
  },

  // ── Blog post templates ──────────────────────────────────────────────
  {
    id: 'post-article',
    collection: 'posts',
    name: 'Standard Article',
    description: 'Intro, three sections and a conclusion. A good default for most posts.',
    blocks: ['Headings', 'Paragraphs', 'Quote'],
    build: (ctx) => ({
      title: 'Article title',
      heroImage: ctx.image(0),
      content: rich(
        p('Open with the one thing the reader will take away. Keep the intro to two or three sentences.'),
        h('h2', 'First main point'),
        p('Explain the point and back it up with an example, a number or a short story.'),
        h('h2', 'Second main point'),
        p('Build on the first section. Link to related pages where it helps the reader.'),
        quote('Pull out a memorable line or a customer quote here.'),
        h('h2', 'Third main point'),
        p('Finish the argument, then move to the wrap-up.'),
        h('h2', 'The takeaway'),
        p('Summarise in a sentence or two and tell the reader what to do next.'),
      ),
    }),
  },
  {
    id: 'post-announcement',
    collection: 'posts',
    name: 'Product Announcement',
    description: 'Launch post: what is new, key details and where to get it.',
    blocks: ['Headings', 'Bullet list'],
    build: (ctx) => ({
      title: 'Introducing: product name',
      heroImage: ctx.image(1),
      content: rich(
        p('Say what you are launching and when it is available, in the first sentence.'),
        h('h2', 'What is new'),
        ul(['Headline feature or design', 'Second detail customers asked for', 'Sizes, colours or variants']),
        h('h2', 'Why we made it'),
        p('Share the customer feedback or idea that led to this release.'),
        h('h2', 'Price and availability'),
        p('State the price, where to buy and any launch offer with its end date.'),
      ),
    }),
  },
  {
    id: 'post-how-to',
    collection: 'posts',
    name: 'How-To Guide',
    description: 'Step-by-step tutorial with what you need, numbered steps and tips.',
    blocks: ['Headings', 'Numbered list', 'Bullet list'],
    build: (ctx) => ({
      title: 'How to: task name',
      heroImage: ctx.image(2),
      content: rich(
        p('Describe the result the reader will get and roughly how long it takes.'),
        h('h2', 'What you will need'),
        ul(['Item one', 'Item two', 'Item three']),
        h('h2', 'Steps'),
        ol(['Start with the first action.', 'Describe the second action.', 'Finish with the final check.']),
        h('h2', 'Tips'),
        p('Add common mistakes to avoid and ways to get a better result.'),
      ),
    }),
  },
  {
    id: 'post-listicle',
    collection: 'posts',
    name: 'Listicle / Roundup',
    description: 'Numbered roundup such as "7 ways to…" with a short section per item.',
    blocks: ['Headings', 'Paragraphs'],
    build: (ctx) => ({
      title: '5 ways to: topic',
      heroImage: ctx.image(3),
      content: rich(
        p('Set up the list: who it is for and how you chose what made the cut.'),
        ...[1, 2, 3, 4, 5].flatMap((n) => [
          h('h2', `${n}. Item name`),
          p('Two or three sentences on why this item earns its place.'),
        ]),
        h('h2', 'Final thoughts'),
        p('Close with your top pick or a next step.'),
      ),
    }),
  },
]
