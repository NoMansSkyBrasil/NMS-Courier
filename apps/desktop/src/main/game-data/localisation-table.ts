import { GameTableError, readReference, tableStructure, variableString } from './core-tables'

// Reads one of the game's language tables. Each entry is a 32-byte key followed by one text
// reference per game language; a language file fills only its own column, so the text of an entry
// is its one non-empty column. Verified against the converter's output for build 180836.

export const localisationStructure = 'e40c000064ebdbf8697b7ae105e895de'
const rootPosition = 0x20
const keySize = 0x20
const languageColumns = 17
const entrySize = keySize + languageColumns * 0x10

// The application's 14 interface languages and the game's name for each in its file names.
export const gameLanguages: Readonly<Record<string, string>> = {
  'pt-BR': 'brazilianportuguese',
  'pt-PT': 'portuguese',
  'ja-JP': 'japanese',
  'en-US': 'usenglish',
  'fr-FR': 'french',
  'it-IT': 'italian',
  'de-DE': 'german',
  'es-ES': 'spanish',
  'nl-NL': 'dutch',
  'ko-KR': 'korean',
  'pl-PL': 'polish',
  'ru-RU': 'russian',
  'zh-CN': 'simplifiedchinese',
  'zh-TW': 'traditionalchinese'
}

// Adds to `texts` the text of every wanted key this table holds; keys already present are kept,
// so the first table read wins.
export function readLocalisationTable(
  data: Buffer,
  wanted: ReadonlySet<string>,
  texts: Map<string, string>
): void {
  if (tableStructure(data) !== localisationStructure) throw new GameTableError('unknown_structure')
  const list = readReference(data, rootPosition)
  if (list.start + list.count * entrySize > data.length) throw new GameTableError('corrupt_table')
  for (let index = 0; index < list.count; index += 1) {
    const entry = list.start + index * entrySize
    const end = data.indexOf(0, entry)
    const key = data.toString(
      'utf8',
      entry,
      Math.min(end < 0 ? entry + keySize : end, entry + keySize)
    )
    if (!wanted.has(key) || texts.has(key)) continue
    for (let column = 0; column < languageColumns; column += 1) {
      const position = entry + keySize + column * 0x10
      if (data.readUInt32LE(position + 8) === 0) continue
      texts.set(key, variableString(data, position))
      break
    }
  }
}
