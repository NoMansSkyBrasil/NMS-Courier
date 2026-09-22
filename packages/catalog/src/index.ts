export type CatalogDomain =
  | 'substance'
  | 'product'
  | 'technology'
  | 'recipe'
  | 'reward'
  | 'buildable_part'
  | 'ship_part'
  | 'multitool_part'
  | 'freighter_definition'
  | 'frigate_definition'
  | 'creature_definition'
  | 'corvette_definition'

export type CatalogEntry = {
  readonly domain: CatalogDomain
  readonly gameId: string
  readonly category: string | null
  readonly sourceTable: string
  readonly sourceHash: string
}

export type CatalogLocalization = {
  readonly entryKey: string
  readonly locale: string
  readonly displayName: string
  readonly subtitle: string | null
  readonly description: string | null
  readonly sourceLocator: string
  readonly isFallback: boolean
}

export type CatalogRelation = {
  readonly sourceEntryKey: string
  readonly relation: 'recipe_input' | 'recipe_output' | 'reward_outcome' | 'unlocks' | 'compatible_part'
  readonly targetEntryKey: string
  readonly ordinal: number
  readonly quantity: number | null
  readonly sourceLocator: string
}

export type CatalogGeneration = {
  readonly entries: readonly CatalogEntry[]
  readonly localizations: readonly CatalogLocalization[]
  readonly relations: readonly CatalogRelation[]
}

export type CatalogValidationIssue = {
  readonly path: string
  readonly message: string
}

const gameIdControlCharacter = /[\u0000-\u001F\u007F]/
const sha256Pattern = /^[a-f0-9]{64}$/
const localePattern = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/

function isSafeSourceLocator(locator: string): boolean {
  const normalized = locator.replaceAll('\\', '/')
  return Boolean(locator.trim())
    && !normalized.startsWith('/')
    && !/^[A-Za-z]:/.test(normalized)
    && !normalized.split('/').includes('..')
    && !gameIdControlCharacter.test(locator)
}

export function createCatalogEntryKey(domain: CatalogDomain, gameId: string): string {
  return `${domain}:${encodeURIComponent(gameId)}`
}

export function validateCatalogGeneration(generation: CatalogGeneration): readonly CatalogValidationIssue[] {
  const issues: CatalogValidationIssue[] = []
  const entryKeys = new Set<string>()
  const localizationKeys = new Set<string>()

  generation.entries.forEach((entry, index) => {
    const entryPath = `entries[${index}]`
    const entryKey = createCatalogEntryKey(entry.domain, entry.gameId)

    if (entry.gameId.trim().length === 0 || entry.gameId.length > 128 || gameIdControlCharacter.test(entry.gameId)) {
      issues.push({ path: `${entryPath}.gameId`, message: 'Game ID must be present, bounded, and free of control characters.' })
    }

    if (!isSafeSourceLocator(entry.sourceTable) || !sha256Pattern.test(entry.sourceHash)) {
      issues.push({ path: entryPath, message: 'Catalog entries require a source table and SHA-256 source hash.' })
    }

    if (entryKeys.has(entryKey)) {
      issues.push({ path: entryPath, message: `Duplicate catalog entry key: ${entryKey}.` })
    }
    entryKeys.add(entryKey)
  })

  generation.localizations.forEach((localization, index) => {
    const localizationPath = `localizations[${index}]`
    const localizationKey = `${localization.entryKey}:${localization.locale}`
    if (!entryKeys.has(localization.entryKey)) {
      issues.push({ path: `${localizationPath}.entryKey`, message: 'Localization references an unknown catalog entry.' })
    }
    if (!localePattern.test(localization.locale) || !localization.displayName.trim() || !isSafeSourceLocator(localization.sourceLocator)) {
      issues.push({ path: localizationPath, message: 'Localization requires a language tag, display name, and source locator.' })
    }
    if (localizationKeys.has(localizationKey)) {
      issues.push({ path: localizationPath, message: `Duplicate localization key: ${localizationKey}.` })
    }
    localizationKeys.add(localizationKey)
  })

  generation.relations.forEach((relation, index) => {
    const relationPath = `relations[${index}]`
    if (!entryKeys.has(relation.sourceEntryKey) || !entryKeys.has(relation.targetEntryKey)) {
      issues.push({ path: relationPath, message: 'Catalog relation references an unknown catalog entry.' })
    }
    if (!Number.isInteger(relation.ordinal) || relation.ordinal < 0 || (relation.quantity !== null && relation.quantity <= 0) || !isSafeSourceLocator(relation.sourceLocator)) {
      issues.push({ path: relationPath, message: 'Catalog relation has invalid order, quantity, or source locator.' })
    }
  })

  return issues
}
