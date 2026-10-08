// Areas whose page sends options about something the player owns or is offered.
export const equipmentAreas = [
  'exosuit',
  'starships',
  'multitools',
  'freighters',
  'corvettes'
] as const
export type EquipmentArea = (typeof equipmentAreas)[number]

export function isEquipmentArea(id: string): id is EquipmentArea {
  return (equipmentAreas as readonly string[]).includes(id)
}
