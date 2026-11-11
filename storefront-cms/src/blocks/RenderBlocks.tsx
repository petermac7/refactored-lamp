import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import {
  ButtonGroupBlock,
  FAQBlock,
  FeatureGridBlock,
  GalleryBlock,
  HeadingBlock,
  LogoCloudBlock,
  PricingBlock,
  ProductGridBlock,
  PromoTilesBlock,
  SpacerBlock,
  SplitContentBlock,
  StatsBlock,
  TeamBlock,
  TestimonialsBlock,
  VideoEmbedBlock,
} from '@/blocks/builder/Component'

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  buttonGroup: ButtonGroupBlock,
  faq: FAQBlock,
  featureGrid: FeatureGridBlock,
  gallery: GalleryBlock,
  heading: HeadingBlock,
  logoCloud: LogoCloudBlock,
  pricing: PricingBlock,
  productGrid: ProductGridBlock,
  promoTiles: PromoTilesBlock,
  spacer: SpacerBlock,
  splitContent: SplitContentBlock,
  stats: StatsBlock,
  team: TeamBlock,
  testimonials: TestimonialsBlock,
  videoEmbed: VideoEmbedBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div className={blockType === 'spacer' ? '' : 'my-16'} key={index}>
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
                </div>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
