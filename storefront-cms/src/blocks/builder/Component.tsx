import {
  Award,
  Check,
  ChevronDown,
  Clock,
  Droplet,
  Heart,
  Leaf,
  Package,
  RefreshCw,
  Shield,
  Smile,
  Star,
  Truck,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import type {
  ButtonGroupBlock as ButtonGroupProps,
  FAQBlock as FAQProps,
  FeatureGridBlock as FeatureGridProps,
  GalleryBlock as GalleryProps,
  HeadingBlock as HeadingProps,
  LogoCloudBlock as LogoCloudProps,
  Media as MediaType,
  PricingBlock as PricingProps,
  ProductGridBlock as ProductGridProps,
  PromoTilesBlock as PromoTilesProps,
  SpacerBlock as SpacerProps,
  SplitContentBlock as SplitContentProps,
  StatsBlock as StatsProps,
  TeamBlock as TeamProps,
  TestimonialsBlock as TestimonialsProps,
  VideoEmbedBlock as VideoEmbedProps,
} from '@/payload-types'

import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

const icons = {
  award: Award,
  clock: Clock,
  droplet: Droplet,
  heart: Heart,
  leaf: Leaf,
  package: Package,
  refresh: RefreshCw,
  shield: Shield,
  smile: Smile,
  star: Star,
  truck: Truck,
  zap: Zap,
}

const gridCols: Record<string, string> = {
  '2': 'sm:grid-cols-2',
  '3': 'sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-2 lg:grid-cols-4',
}

type MaybeMedia = MediaType | number | string | null | undefined

/** Renders an uploaded image, or a neutral dotted placeholder until one is chosen. */
const Img: React.FC<{ className?: string; resource: MaybeMedia }> = ({ className, resource }) => (
  <div className={cn('relative overflow-hidden bg-muted', className)}>
    {resource && typeof resource === 'object' ? (
      <Media fill imgClassName="object-cover" pictureClassName="absolute inset-0" resource={resource} />
    ) : (
      <div aria-hidden className="sf-placeholder absolute inset-0" />
    )}
  </div>
)

const SectionHead: React.FC<{ subtitle?: string | null; title?: string | null }> = ({
  subtitle,
  title,
}) => {
  if (!title && !subtitle) return null
  return (
    <div className="mb-10 max-w-2xl mx-auto text-center">
      {title && <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h2>}
      {subtitle && <p className="mt-3 text-muted-foreground text-lg">{subtitle}</p>}
    </div>
  )
}

const Btn: React.FC<{
  children: React.ReactNode
  href?: string | null
  newTab?: boolean | null
  variant?: 'outline' | 'primary' | null
}> = ({ children, href, newTab, variant = 'primary' }) => {
  if (!href) return null
  return (
    <Link
      className={cn('sf-btn', variant === 'outline' ? 'sf-btn-outline' : 'sf-btn-primary')}
      href={href}
      {...(newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
    >
      {children}
    </Link>
  )
}

const Stars: React.FC<{ rating?: number | null }> = ({ rating }) => {
  if (!rating) return null
  return (
    <div aria-label={`${rating} out of 5 stars`} className="flex gap-0.5" role="img">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          className={cn('size-4', n <= Math.round(rating) ? 'sf-star-on' : 'sf-star-off')}
          key={n}
        />
      ))}
    </div>
  )
}

export const HeadingBlock: React.FC<HeadingProps> = ({ align, eyebrow, subtitle, title }) => (
  <div className={cn('container', align === 'left' ? 'text-left' : 'text-center')}>
    <div className={cn('max-w-3xl', align !== 'left' && 'mx-auto')}>
      {eyebrow && <p className="sf-eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>}
    </div>
  </div>
)

export const FeatureGridBlock: React.FC<FeatureGridProps> = ({
  columns,
  items,
  subtitle,
  title,
}) => (
  <div className="container">
    <SectionHead subtitle={subtitle} title={title} />
    <div className={cn('grid gap-6', gridCols[columns || '3'])}>
      {(items || []).map((item, i) => {
        const Icon = icons[item.icon || 'star'] || Star
        return (
          <div className="rounded-lg border border-border bg-card p-6" key={i}>
            <div className="sf-icon mb-4">
              <Icon className="size-5" />
            </div>
            <h3 className="text-lg font-semibold">{item.title}</h3>
            {item.text && <p className="mt-2 text-muted-foreground">{item.text}</p>}
          </div>
        )
      })}
    </div>
  </div>
)

export const ProductGridBlock: React.FC<ProductGridProps> = ({
  columns,
  items,
  subtitle,
  title,
}) => (
  <div className="container">
    <SectionHead subtitle={subtitle} title={title} />
    <div className={cn('grid gap-x-5 gap-y-8', gridCols[columns || '4'])}>
      {(items || []).map((item, i) => {
        const card = (
          <>
            <div className="relative">
              <Img className="aspect-square rounded-lg" resource={item.image} />
              {item.badge && <span className="sf-badge absolute left-2 top-2">{item.badge}</span>}
            </div>
            <h3 className="mt-3 font-medium leading-snug">{item.name}</h3>
            <div className="mt-1">
              <Stars rating={item.rating} />
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              {item.price && <span className="text-lg font-semibold">{item.price}</span>}
              {item.compareAtPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {item.compareAtPrice}
                </span>
              )}
            </div>
            {item.buttonLabel && item.url && (
              <span className="sf-btn sf-btn-primary mt-3 w-full">{item.buttonLabel}</span>
            )}
          </>
        )
        return item.url ? (
          <Link className="group block" href={item.url} key={i}>
            {card}
          </Link>
        ) : (
          <div key={i}>{card}</div>
        )
      })}
    </div>
  </div>
)

export const PromoTilesBlock: React.FC<PromoTilesProps> = ({
  columns,
  subtitle,
  tiles,
  title,
}) => (
  <div className="sf-wide">
    <SectionHead subtitle={subtitle} title={title} />
    <div className={cn('grid gap-4', gridCols[columns || '3'])}>
      {(tiles || []).map((tile, i) => {
        const inner = (
          <div className="relative overflow-hidden">
            <Img
              className="aspect-[4/5] transition-transform duration-500 group-hover:scale-[1.03]"
              resource={tile.image}
            />
            <div className="sf-tile-shade absolute inset-0" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <p className="sf-nav-text text-lg">{tile.label}</p>
              {tile.caption && <p className="mt-1 text-sm opacity-90">{tile.caption}</p>}
            </div>
          </div>
        )
        return tile.url ? (
          <Link className="group block" href={tile.url} key={i}>
            {inner}
          </Link>
        ) : (
          <div className="group" key={i}>
            {inner}
          </div>
        )
      })}
    </div>
  </div>
)

export const SplitContentBlock: React.FC<SplitContentProps> = ({
  buttonLabel,
  buttonUrl,
  eyebrow,
  image,
  imagePosition,
  text,
  title,
}) => (
  <div className="container">
    <div className="grid items-center gap-10 md:grid-cols-2">
      <Img
        className={cn('aspect-[4/3] rounded-lg', imagePosition === 'right' && 'md:order-2')}
        resource={image}
      />
      <div>
        {eyebrow && <p className="sf-eyebrow mb-3">{eyebrow}</p>}
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{title}</h2>
        {text && <p className="mt-4 whitespace-pre-line text-lg text-muted-foreground">{text}</p>}
        {buttonLabel && (
          <div className="mt-6">
            <Btn href={buttonUrl}>{buttonLabel}</Btn>
          </div>
        )}
      </div>
    </div>
  </div>
)

export const GalleryBlock: React.FC<GalleryProps> = ({ columns, images, subtitle, title }) => (
  <div className="container">
    <SectionHead subtitle={subtitle} title={title} />
    <div className={cn('grid gap-4', gridCols[columns || '3'])}>
      {(images || []).map((item, i) => (
        <figure key={i}>
          <Img className="aspect-square rounded-lg" resource={item.image} />
          {item.caption && (
            <figcaption className="mt-2 text-sm text-muted-foreground">{item.caption}</figcaption>
          )}
        </figure>
      ))}
    </div>
  </div>
)

export const TestimonialsBlock: React.FC<TestimonialsProps> = ({ items, subtitle, title }) => (
  <div className="container">
    <SectionHead subtitle={subtitle} title={title} />
    <div className="grid gap-6 md:grid-cols-3">
      {(items || []).map((item, i) => (
        <figure className="flex flex-col rounded-lg border border-border bg-card p-6" key={i}>
          <Stars rating={item.rating} />
          <blockquote className="mt-4 grow text-lg leading-relaxed">“{item.quote}”</blockquote>
          <figcaption className="mt-5 text-sm">
            <span className="font-semibold">{item.name}</span>
            {item.role && <span className="text-muted-foreground"> · {item.role}</span>}
          </figcaption>
        </figure>
      ))}
    </div>
  </div>
)

export const FAQBlock: React.FC<FAQProps> = ({ items, subtitle, title }) => (
  <div className="container">
    <SectionHead subtitle={subtitle} title={title} />
    <div className="mx-auto max-w-3xl divide-y divide-border border-y border-border">
      {(items || []).map((item, i) => (
        <details className="group" key={i}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-lg font-medium">
            {item.question}
            <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <p className="whitespace-pre-line pb-5 text-muted-foreground">{item.answer}</p>
        </details>
      ))}
    </div>
  </div>
)

export const PricingBlock: React.FC<PricingProps> = ({ plans, subtitle, title }) => (
  <div className="container">
    <SectionHead subtitle={subtitle} title={title} />
    <div
      className={cn(
        'mx-auto grid gap-6',
        (plans?.length || 0) >= 3 ? 'lg:grid-cols-3' : 'max-w-3xl md:grid-cols-2',
      )}
    >
      {(plans || []).map((plan, i) => (
        <div
          className={cn(
            'flex flex-col rounded-lg border bg-card p-7',
            plan.featured ? 'sf-featured' : 'border-border',
          )}
          key={i}
        >
          <h3 className="sf-nav-text text-sm">{plan.name}</h3>
          <p className="mt-3">
            <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
            {plan.period && <span className="text-muted-foreground"> {plan.period}</span>}
          </p>
          {plan.description && <p className="mt-2 text-muted-foreground">{plan.description}</p>}
          <ul className="mt-6 grow space-y-2">
            {(plan.features || []).map((feature, j) => (
              <li className="flex gap-2" key={j}>
                <Check className="sf-check mt-1 size-4 shrink-0" />
                <span>{feature.text}</span>
              </li>
            ))}
          </ul>
          {plan.buttonLabel && (
            <div className="mt-7">
              <Btn href={plan.buttonUrl} variant={plan.featured ? 'primary' : 'outline'}>
                {plan.buttonLabel}
              </Btn>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)

export const StatsBlock: React.FC<StatsProps> = ({ items }) => (
  <div className="container">
    <dl className="grid grid-cols-2 gap-8 rounded-lg border border-border bg-card p-8 text-center md:grid-flow-col md:auto-cols-fr md:grid-cols-none">
      {(items || []).map((item, i) => (
        <div key={i}>
          <dd className="text-4xl font-semibold tracking-tight">{item.value}</dd>
          <dt className="mt-1 text-sm text-muted-foreground">{item.label}</dt>
        </div>
      ))}
    </dl>
  </div>
)

export const LogoCloudBlock: React.FC<LogoCloudProps> = ({ logos, title }) => (
  <div className="container text-center">
    {title && <p className="sf-eyebrow mb-6">{title}</p>}
    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
      {(logos || []).map((logo, i) =>
        logo.image && typeof logo.image === 'object' ? (
          <div className="relative h-10 w-32" key={i}>
            <Media fill imgClassName="object-contain" pictureClassName="absolute inset-0" resource={logo.image} />
          </div>
        ) : (
          <span className="text-xl font-semibold text-muted-foreground" key={i}>
            {logo.name}
          </span>
        ),
      )}
    </div>
  </div>
)

export const TeamBlock: React.FC<TeamProps> = ({ members, subtitle, title }) => (
  <div className="container">
    <SectionHead subtitle={subtitle} title={title} />
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {(members || []).map((member, i) => (
        <div key={i}>
          <Img className="aspect-square rounded-lg" resource={member.photo} />
          <h3 className="mt-4 font-semibold">{member.name}</h3>
          {member.role && <p className="text-sm text-muted-foreground">{member.role}</p>}
          {member.bio && <p className="mt-2 text-sm">{member.bio}</p>}
        </div>
      ))}
    </div>
  </div>
)

const toEmbedUrl = (url: string): null | string => {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return `https://www.youtube.com/embed${u.pathname}`
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname.startsWith('/embed/')) return url
      const id = u.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).pop()
      return id ? `https://player.vimeo.com/video/${id}` : null
    }
    return null
  } catch {
    return null
  }
}

export const VideoEmbedBlock: React.FC<VideoEmbedProps> = ({ caption, title, url }) => {
  const embed = toEmbedUrl(url)
  return (
    <div className="container">
      <SectionHead title={title} />
      <div className="mx-auto max-w-4xl">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
          {embed ? (
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 size-full"
              loading="lazy"
              src={embed}
              title={title || 'Video'}
            />
          ) : (
            <p className="absolute inset-0 grid place-items-center text-muted-foreground">
              Add a YouTube or Vimeo URL
            </p>
          )}
        </div>
        {caption && <p className="mt-3 text-center text-sm text-muted-foreground">{caption}</p>}
      </div>
    </div>
  )
}

export const ButtonGroupBlock: React.FC<ButtonGroupProps> = ({ align, buttons }) => (
  <div className={cn('container flex flex-wrap gap-3', align !== 'left' && 'justify-center')}>
    {(buttons || []).map((button, i) => (
      <Btn href={button.url} key={i} newTab={button.newTab} variant={button.style}>
        {button.label}
      </Btn>
    ))}
  </div>
)

export const SpacerBlock: React.FC<SpacerProps> = ({ showLine, size }) => (
  <div
    aria-hidden
    className={cn('container', size === 'sm' ? 'py-2' : size === 'lg' ? 'py-16' : 'py-8')}
  >
    {showLine && <hr className="border-border" />}
  </div>
)
