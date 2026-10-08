// Turns a game icon texture into an image the page can show. The game stores its interface icons
// as block-compressed textures (DDS, BC7); the graphics card decodes them, so there is no decoder
// here: the texture is uploaded as it is, drawn once, and the drawing is kept as an image address.
// One hidden canvas serves every icon. An icon that cannot be drawn yields null and the page shows
// its placeholder.

const ddsMagic = 0x20534444
const fourCcDx10 = 0x30315844
// DXGI_FORMAT_BC7_UNORM and its sRGB twin; both hold display-ready colours.
const bc7Formats = [98, 99]
const drawnSize = 96

type Painter = {
  draw: (width: number, height: number, blocks: Uint8Array) => Promise<string | null>
}

let painter: Painter | null | undefined
const images = new Map<string, Promise<string | null>>()

function createPainter(): Painter | null {
  const canvas = document.createElement('canvas')
  canvas.width = drawnSize
  canvas.height = drawnSize
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, preserveDrawingBuffer: true })
  const bptc = gl?.getExtension('EXT_texture_compression_bptc')
  if (!gl || !bptc) return null

  const compile = (type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type)
    if (!shader) return null
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
  }
  // One triangle that covers the canvas; the texture's first row is the top of the picture.
  const vertex = compile(
    gl.VERTEX_SHADER,
    `#version 300 es
    out vec2 uv;
    void main() {
      vec2 corner = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
      uv = vec2(corner.x, 1.0 - corner.y);
      gl_Position = vec4(corner * 2.0 - 1.0, 0.0, 1.0);
    }`
  )
  const fragment = compile(
    gl.FRAGMENT_SHADER,
    `#version 300 es
    precision mediump float;
    uniform sampler2D icon;
    in vec2 uv;
    out vec4 colour;
    void main() {
      vec4 texel = texture(icon, uv);
      colour = vec4(texel.rgb * texel.a, texel.a);
    }`
  )
  const program = gl.createProgram()
  if (!vertex || !fragment || !program) return null
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  return {
    draw: (width, height, blocks) => {
      gl.compressedTexImage2D(
        gl.TEXTURE_2D,
        0,
        bptc.COMPRESSED_RGBA_BPTC_UNORM_EXT,
        width,
        height,
        0,
        blocks
      )
      if (gl.getError() !== gl.NO_ERROR) return Promise.resolve(null)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      return new Promise((resolve) =>
        canvas.toBlob((blob) => resolve(blob ? URL.createObjectURL(blob) : null), 'image/png')
      )
    }
  }
}

// The largest picture of a DDS file when it is one the painter can draw.
export function readTexture(
  file: Uint8Array
): { width: number; height: number; blocks: Uint8Array } | null {
  if (file.byteLength < 148) return null
  const view = new DataView(file.buffer, file.byteOffset, file.byteLength)
  if (view.getUint32(0, true) !== ddsMagic || view.getUint32(84, true) !== fourCcDx10) return null
  const height = view.getUint32(12, true)
  const width = view.getUint32(16, true)
  if (!bc7Formats.includes(view.getUint32(128, true)) || width < 4 || height < 4) return null
  if (width > 2048 || height > 2048) return null
  const size = Math.ceil(width / 4) * Math.ceil(height / 4) * 16
  if (148 + size > file.byteLength) return null
  return { width, height, blocks: file.subarray(148, 148 + size) }
}

// Image address for a catalogue icon locator, or null. Each icon is read and drawn once.
export function gameIconImage(locator: string): Promise<string | null> {
  const key = locator.toLowerCase()
  let image = images.get(key)
  if (!image) {
    image = (async () => {
      if (painter === undefined) painter = createPainter()
      if (!painter) return null
      const file = await window.nms.getGameIcon(locator)
      const texture = file ? readTexture(file) : null
      return texture ? painter.draw(texture.width, texture.height, texture.blocks) : null
    })().catch(() => null)
    images.set(key, image)
  }
  return image
}
