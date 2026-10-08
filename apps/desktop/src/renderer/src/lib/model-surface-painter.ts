// Paints the surfaces of a workshop model the way the game layers them: each material has up to
// eight texture layers, drawn from the bottom one up, each tinted toward a palette colour and
// laid over the ones below by its own alpha. The game's textures are block-compressed (DDS with
// BC1 or BC7); the graphics card decodes them, so nothing is decoded here: a layer is uploaded as
// it is and drawn by a small program on one hidden canvas, and the finished picture is handed
// back as a bitmap.
//
// The tint is the research rule (hue moved by the difference between the tint and the layer's
// average, saturation capped by the tint's, brightness moved toward the tint's). It follows the
// community's description of the game's recolouring; it was not read from the game's shaders.

const ddsMagic = 0x20534444
const fourCcDx10 = 0x30315844
const fourCcDxt1 = 0x31545844
const fourCcDxt5 = 0x35545844
const pictureSize = 512
const averageSize = 32

export type SurfaceLayer = { texture: string; tint: [number, number, number] | null }

type Picture = { width: number; height: number; format: number; blocks: Uint8Array }
type Formats = { bc1: number; bc3: number; bc7: number; bc7Srgb: number }

// The level of a DDS file that is closest to the wanted size without being smaller, when the
// file is one of the formats the painter can draw.
function readLevel(file: Uint8Array, wanted: number, formats: Formats): Picture | null {
  if (file.byteLength < 128) return null
  const view = new DataView(file.buffer, file.byteOffset, file.byteLength)
  if (view.getUint32(0, true) !== ddsMagic) return null
  let height = view.getUint32(12, true)
  let width = view.getUint32(16, true)
  const levels = Math.max(view.getUint32(28, true), 1)
  const fourCc = view.getUint32(84, true)
  let offset = 128
  let format: number
  let blockBytes = 16
  if (fourCc === fourCcDx10) {
    if (file.byteLength < 148) return null
    const dxgi = view.getUint32(128, true)
    offset = 148
    if (dxgi === 98) format = formats.bc7
    else if (dxgi === 99) format = formats.bc7Srgb
    else if (dxgi === 71 || dxgi === 72) {
      format = formats.bc1
      blockBytes = 8
    } else if (dxgi === 77 || dxgi === 78) format = formats.bc3
    else return null
  } else if (fourCc === fourCcDxt1) {
    format = formats.bc1
    blockBytes = 8
  } else if (fourCc === fourCcDxt5) {
    format = formats.bc3
  } else return null
  if (width < 4 || height < 4 || width > 8192 || height > 8192) return null
  for (let level = 0; level < levels; level += 1) {
    const size = Math.ceil(width / 4) * Math.ceil(height / 4) * blockBytes
    if (offset + size > file.byteLength) return null
    const last = level === levels - 1 || width / 2 < wanted || height / 2 < wanted || width <= 4
    if (last) return { width, height, format, blocks: file.subarray(offset, offset + size) }
    offset += size
    width = Math.max(width >> 1, 1)
    height = Math.max(height >> 1, 1)
  }
  return null
}

const vertexSource = `#version 300 es
out vec2 uv;
void main() {
  vec2 corner = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  uv = corner;
  gl_Position = vec4(corner * 2.0 - 1.0, 0.0, 1.0);
}`

// Draws one layer over what is already there. `mode` 0 copies the layer (for averaging), 1 lays
// it over the picture, tinted when `tinted` is set.
const fragmentSource = `#version 300 es
precision highp float;
uniform sampler2D layer;
uniform vec3 tint;
uniform vec3 average;
uniform bool tinted;
uniform bool opaque;
in vec2 uv;
out vec4 colour;
vec3 toHsv(vec3 c) {
  float high = max(c.r, max(c.g, c.b));
  float low = min(c.r, min(c.g, c.b));
  float spread = high - low;
  float hue = 0.0;
  if (spread > 0.0) {
    if (high == c.r) hue = mod((c.g - c.b) / spread, 6.0);
    else if (high == c.g) hue = (c.b - c.r) / spread + 2.0;
    else hue = (c.r - c.g) / spread + 4.0;
  }
  return vec3(hue / 6.0, high == 0.0 ? 0.0 : spread / high, high);
}
vec3 toRgb(vec3 c) {
  vec3 k = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z * mix(vec3(1.0), k, c.y);
}
void main() {
  vec4 texel = texture(layer, uv);
  vec3 rgb = texel.rgb;
  if (tinted) {
    vec3 hsv = toHsv(rgb);
    vec3 target = toHsv(tint);
    vec3 base = toHsv(average);
    hsv.x = fract(hsv.x - base.x + target.x);
    hsv.y = min(hsv.y, target.y);
    hsv.z = clamp(hsv.z + sin(3.14159265 * hsv.z) * (target.z - base.z), 0.0, 1.0);
    rgb = toRgb(hsv);
  }
  colour = vec4(rgb, opaque ? 1.0 : texel.a);
}`

type Painter = {
  paint: (
    layers: readonly SurfaceLayer[],
    files: ReadonlyMap<string, Uint8Array | null>,
    cutout: boolean
  ) => Promise<ImageBitmap | null>
}

function createPainter(): Painter | null {
  const canvas = document.createElement('canvas')
  canvas.width = pictureSize
  canvas.height = pictureSize
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: false, preserveDrawingBuffer: true })
  const bptc = gl?.getExtension('EXT_texture_compression_bptc')
  const s3tc = gl?.getExtension('WEBGL_compressed_texture_s3tc')
  if (!gl || !bptc || !s3tc) return null
  const formats: Formats = {
    bc1: s3tc.COMPRESSED_RGBA_S3TC_DXT1_EXT,
    bc3: s3tc.COMPRESSED_RGBA_S3TC_DXT5_EXT,
    bc7: bptc.COMPRESSED_RGBA_BPTC_UNORM_EXT,
    bc7Srgb: bptc.COMPRESSED_RGBA_BPTC_UNORM_EXT
  }
  const compile = (type: number, source: string): WebGLShader | null => {
    const shader = gl.createShader(type)
    if (!shader) return null
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null
  }
  const vertex = compile(gl.VERTEX_SHADER, vertexSource)
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()
  if (!vertex || !fragment || !program) return null
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)
  const uniform = (name: string): WebGLUniformLocation | null =>
    gl.getUniformLocation(program, name)
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

  const upload = (picture: Picture): boolean => {
    gl.compressedTexImage2D(
      gl.TEXTURE_2D,
      0,
      picture.format,
      picture.width,
      picture.height,
      0,
      picture.blocks
    )
    return gl.getError() === gl.NO_ERROR
  }
  // The layer's average colour, weighted by its alpha, from a small drawing of it.
  const averageOf = (): [number, number, number] => {
    gl.viewport(0, 0, averageSize, averageSize)
    gl.disable(gl.BLEND)
    gl.uniform1i(uniform('tinted'), 0)
    gl.uniform1i(uniform('opaque'), 0)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    const pixels = new Uint8Array(averageSize * averageSize * 4)
    gl.readPixels(0, 0, averageSize, averageSize, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
    let weight = 0
    const sum = [0, 0, 0]
    for (let index = 0; index < pixels.length; index += 4) {
      const alpha = pixels[index + 3] / 255
      weight += alpha
      for (let channel = 0; channel < 3; channel += 1) {
        sum[channel] += (pixels[index + channel] / 255) * alpha
      }
    }
    return weight > 0 ? [sum[0] / weight, sum[1] / weight, sum[2] / weight] : [0.5, 0.5, 0.5]
  }

  return {
    paint: async (layers, files, cutout) => {
      const pictures = layers.map((layer) => {
        const file = files.get(layer.texture)
        return file ? readLevel(file, pictureSize, formats) : null
      })
      const averages: ([number, number, number] | null)[] = []
      for (let index = 0; index < layers.length; index += 1) {
        const picture = pictures[index]
        averages.push(picture && layers[index].tint && upload(picture) ? averageOf() : null)
      }
      gl.viewport(0, 0, pictureSize, pictureSize)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      let drawn = false
      // From the bottom layer (the last of the list) to the top one.
      for (let index = layers.length - 1; index >= 0; index -= 1) {
        const picture = pictures[index]
        if (!picture || !upload(picture)) continue
        const tint = layers[index].tint
        const average = averages[index]
        gl.uniform1i(uniform('tinted'), tint && average ? 1 : 0)
        if (tint && average) {
          gl.uniform3f(uniform('tint'), tint[0], tint[1], tint[2])
          gl.uniform3f(uniform('average'), average[0], average[1], average[2])
        }
        // The bottom layer fills the picture; a decal keeps its own alpha instead.
        gl.uniform1i(uniform('opaque'), !drawn && !cutout ? 1 : 0)
        if (drawn) {
          gl.enable(gl.BLEND)
          gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
        } else gl.disable(gl.BLEND)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
        drawn = true
      }
      if (!drawn) return null
      // The canvas's first row is its bottom; the model's textures have their first row at v = 0.
      return createImageBitmap(canvas, { imageOrientation: 'flipY' })
    }
  }
}

let painter: Painter | null | undefined

// A painted picture per distinct stack of layers; `fetch` supplies a game texture's bytes.
export async function paintSurface(
  layers: readonly SurfaceLayer[],
  cutout: boolean,
  fetch: (texture: string) => Promise<Uint8Array | null>
): Promise<ImageBitmap | null> {
  if (painter === undefined) painter = createPainter()
  if (!painter || !layers.length) return null
  const files = new Map<string, Uint8Array | null>()
  for (const layer of layers) {
    if (!files.has(layer.texture)) files.set(layer.texture, await fetch(layer.texture))
  }
  return painter.paint(layers, files, cutout)
}
