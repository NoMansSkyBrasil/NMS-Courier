import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { bridgeReleases, bridgeVersion, compatibleBridgeVersions } from './bridge-version'

describe('bridge version', () => {
  it('matches the version compiled into the bridge and has a listed build', () => {
    const header = readFileSync(
      join(__dirname, '../../../../../runtime/native/asi/profile_180836/bridge_version.h'),
      'utf8'
    )
    expect(header).toContain(`#define BRIDGE_VERSION "${bridgeVersion}"`)
    expect(bridgeVersion).toMatch(/^\d+\.\d+\.\d+$/)
    expect(Object.values(bridgeReleases)).toContain(bridgeVersion)
    // The bridge the application is built with must be one it accepts as installed.
    expect(compatibleBridgeVersions).toContain(bridgeVersion)
  })

  it('is shipped by an application that has a version of its own', () => {
    const manifest = JSON.parse(readFileSync(join(__dirname, '../../../package.json'), 'utf8'))
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/)
  })
})
