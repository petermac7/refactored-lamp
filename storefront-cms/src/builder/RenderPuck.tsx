'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Render } from '@puckeditor/core'
import React from 'react'

import { pageConfig } from './config'

/** Renders a page saved by the visual builder, using the same config as the editor. */
export const RenderPuck: React.FC<{ data: any }> = ({ data }) => (
  <Render config={pageConfig} data={data} />
)
