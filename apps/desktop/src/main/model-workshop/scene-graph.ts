import { expectStructure, fileHeaderSize, fixedText, listAt, listText } from './binary-table'
import { ModelFileError } from './binary-table'

// Reads a scene graph (the game's ".scene.mbin"): named nodes with a type, a transform, text
// attributes and children.
//
// Layout read from the build 180836 files by comparison with their converted text (2026-10-08).
// A node is 0x80 bytes: attributes (list of 0x20: name 0x10, value text), children (list of
// nodes), instance transforms (list, not read), name (text), type (0x10), nine floats (rotation in
// degrees, scale, translation, each x y z), then the name hash at +0x74.

const structure = 'e40c0000477eb83dd8021f5963a896ad'
const nodeSize = 0x80
const maximumNodes = 65536
const maximumDepth = 64

export type SceneNode = {
  name: string
  nameHash: number
  type: string
  rotation: [number, number, number]
  scale: [number, number, number]
  translation: [number, number, number]
  attributes: Record<string, string>
  children: SceneNode[]
}

export function readSceneGraph(data: Buffer): SceneNode {
  expectStructure(data, structure)
  let budget = 0
  const triple = (position: number): [number, number, number] => [
    data.readFloatLE(position),
    data.readFloatLE(position + 4),
    data.readFloatLE(position + 8)
  ]
  const node = (position: number, depth: number): SceneNode => {
    budget += 1
    if (depth > maximumDepth || budget > maximumNodes) throw new ModelFileError('too_large')
    if (position + nodeSize > data.length) throw new ModelFileError('corrupt_file')
    const attributeList = listAt(data, position, 0x20, 1024)
    const attributes: Record<string, string> = {}
    for (let index = 0; index < attributeList.count; index += 1) {
      const entry = attributeList.start + index * 0x20
      attributes[fixedText(data, entry, 0x10)] = listText(data, entry + 0x10, 4096)
    }
    const childList = listAt(data, position + 0x10, nodeSize, maximumNodes)
    return {
      name: listText(data, position + 0x30, 1024),
      nameHash: data.readUInt32LE(position + 0x74),
      type: fixedText(data, position + 0x40, 0x10),
      rotation: triple(position + 0x50),
      scale: triple(position + 0x5c),
      translation: triple(position + 0x68),
      attributes,
      children: Array.from({ length: childList.count }, (_, index) =>
        node(childList.start + index * nodeSize, depth + 1)
      )
    }
  }
  return node(fileHeaderSize, 0)
}
