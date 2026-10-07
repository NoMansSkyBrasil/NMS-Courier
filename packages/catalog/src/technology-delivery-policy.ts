// Which technology entries may ever be taught to a player. The same rules are enforced by the
// runtime on the running game's own definitions; this copy lets the application refuse a request
// before it is sent. Reasons and evidence: docs/TECHNOLOGY_DELIVERY_NOTES.md.

export type TechnologyDeliveryClass =
  | 'deliverable'
  | 'blocked_damaged'
  | 'blocked_maintenance'
  | 'blocked_template'
  | 'blocked_repair'
  | 'blocked_id'
  | 'blocked_layout'

// Fields of one technology table entry, as read from the selected game installation.
export type TechnologyDefinitionFlags = {
  readonly id: string
  readonly category: string | null
  readonly brokenSlotTech: boolean | null
  readonly isTemplate: boolean | null
  readonly procedural: boolean | null
  readonly repairTech: boolean | null
  readonly teach: boolean | null
  readonly wikiEnabled: boolean | null
}

// Permanent ID rules: they hold whatever a later game table says about the entry. Entries the game
// hides from its catalogue are not refused (owner decision, 2026-10-07); only OBSOLETE is.
const blockedPrefixes = [
  'MAINT_',
  'EXOPOD_TECH',
  'SHIPSLOT_DMG',
  'SHIPEASY_DMG',
  'WEAPSLOT_DMG',
  'WEAPSENT_DMG',
  'WEAPEASY_DMG'
] as const
const blockedFragments = ['_DMG', 'DAMAGE', 'BROKEN', 'OBSOLETE'] as const
const blockedExact: ReadonlySet<string> = new Set(['SPIDERBRAIN'])

export function isPermanentlyBlockedTechnologyId(id: string): boolean {
  return (
    blockedPrefixes.some((prefix) => id.startsWith(prefix)) ||
    blockedFragments.some((fragment) => id.includes(fragment)) ||
    blockedExact.has(id)
  )
}

// Structural rules first, so an entry added by a later game version is refused by what it is.
// Anything unreadable is refused until reviewed.
export function classifyTechnologyForDelivery(
  definition: TechnologyDefinitionFlags
): TechnologyDeliveryClass {
  const { brokenSlotTech, isTemplate, procedural, repairTech, teach, wikiEnabled } = definition
  // teach and wikiEnabled must be readable but do not decide the class.
  if (
    !/^[A-Z0-9_]{1,15}$/.test(definition.id) ||
    definition.category === null ||
    brokenSlotTech === null ||
    isTemplate === null ||
    procedural === null ||
    repairTech === null ||
    teach === null ||
    wikiEnabled === null
  ) {
    return 'blocked_layout'
  }
  if (brokenSlotTech) return 'blocked_damaged'
  if (definition.category === 'Maintenance') return 'blocked_maintenance'
  if (isTemplate || procedural) return 'blocked_template'
  if (repairTech) return 'blocked_repair'
  if (isPermanentlyBlockedTechnologyId(definition.id)) return 'blocked_id'
  return 'deliverable'
}

export type TechnologyDeliveryRequest =
  | { readonly mode: 'one'; readonly id: string }
  | { readonly mode: 'several'; readonly ids: readonly string[] }
  | { readonly mode: 'all' }

// Silent by default (owner decision, 2026-10-07). When showAlerts is on, the game shows its own
// new-technology alert for each entry, in every mode.
export type TechnologyDeliveryOptions = { readonly showAlerts: boolean }
export const defaultTechnologyDeliveryOptions: TechnologyDeliveryOptions = { showAlerts: false }

export type TechnologyDeliverySelection = {
  readonly ids: readonly string[]
  readonly refused: readonly { readonly id: string; readonly reason: TechnologyDeliveryClass | 'unknown_id' }[]
}

// Resolve one of the three delivery modes against the table of the selected installation.
// "all" means every deliverable entry; a blocked or unknown ID is reported, never sent.
export function selectTechnologiesForDelivery(
  request: TechnologyDeliveryRequest,
  table: readonly TechnologyDefinitionFlags[]
): TechnologyDeliverySelection {
  const classes = new Map(table.map((entry) => [entry.id, classifyTechnologyForDelivery(entry)]))
  const wanted =
    request.mode === 'all'
      ? [...classes].filter(([, value]) => value === 'deliverable').map(([id]) => id)
      : request.mode === 'one'
        ? [request.id]
        : [...new Set(request.ids)]
  const ids: string[] = []
  const refused: { id: string; reason: TechnologyDeliveryClass | 'unknown_id' }[] = []
  for (const id of wanted) {
    const value = classes.get(id)
    if (value === 'deliverable') ids.push(id)
    else refused.push({ id, reason: value ?? 'unknown_id' })
  }
  return { ids, refused }
}
