import type { AdminViewServerProps } from 'payload'

import React from 'react'

import pkg from '../../../package.json'

import { AdminShell } from '../AdminShell'
import { buildPrompt, officialPlugins } from './data'
import { PluginsClient } from './PluginsClient'

// Read at build time so it also works on serverless hosts, where package.json is not on disk.
const readDependencies = (): Record<string, string> => ({
  ...pkg.dependencies,
  ...pkg.devDependencies,
})

export default function PluginsView(props: AdminViewServerProps) {
  const deps = readDependencies()
  const payloadVersion = (deps.payload || 'latest').replace(/^[\^~]/, '')

  const plugins = officialPlugins.map((plugin) => {
    const installed = Boolean(deps[plugin.package])
    return {
      name: plugin.name,
      category: plugin.category,
      description: plugin.description,
      docs: plugin.docs,
      installed,
      package: plugin.package,
      prompt: buildPrompt(plugin, payloadVersion, installed),
    }
  })

  return (
    <AdminShell
      {...props}
      intro="Every official Payload plugin. Copy a prompt and paste it into Claude Code (or another coding agent) opened in this project to install and configure the plugin."
      title="Plugins"
    >
      <PluginsClient plugins={plugins} />
    </AdminShell>
  )
}
