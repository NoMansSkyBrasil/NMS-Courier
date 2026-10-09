// Paints the surfaces of a workshop model the way the game layers them: each material has up to
// eight texture layers, drawn from the bottom one up, each tinted toward a palette colour and
// laid over the ones below by its own alpha. The game's textures are block-compressed (DDS with
// BC1 or BC7); the graphics card decodes them, so nothing is decoded here: a layer is uploaded as
// it is and drawn by a small program on one hidden canvas, and the finished picture is handed
// back as a bitmap.
//
// The arithmetic of a layer is the game's own, read from its shader that combines the layers of
// a procedural texture (texture_frag_combine_diffuse of build 180836, decompiled; see
// docs/MODEL_WORKSHOP.md): hue, saturation and brightness are taken from the stored colour
// values; the hue is moved by the difference between the tint and the layer's average, the
// saturation is capped by the tint's, the brightness is moved toward the tint's with a weight
// that peaks at mid grey; the result is turned to linear light, laid over the layers below by
// the layer's alpha, and the finished picture is turned back at the end. A layer marked to
// multiply is multiplied by its tint instead. The layer's average colour is the one the game
// takes when it loads the texture (`averageOfTexture`).

const ddsMagic = 0x20534444
const fourCcDx10 = 0x30315844
const fourCcDxt1 = 0x31545844
const fourCcDxt5 = 0x35545844
const pictureSize = 512

export type SurfaceLayer = {
  texture: string
  tint: [number, number, number] | null
  multiply: boolean
  average: [number, number, number] | null
}

type Picture = { width: number; height: number; format: number; blocks: Uint8Array }
type Formats = { bc1: number; bc3: number; bc7: number; bc7Srgb: number }

// The smallest level of a DDS file: `wanted` 0.
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
    const size = Math.max(1, Math.ceil(width / 4)) * Math.max(1, Math.ceil(height / 4)) * blockBytes
    if (offset + size > file.byteLength) return null
    const last =
      level === levels - 1 ||
      (wanted > 0 && (width / 2 < wanted || height / 2 < wanted || width <= 4))
    if (last) return { width, height, format, blocks: file.subarray(offset, offset + size) }
    offset += size
    width = Math.max(width >> 1, 1)
    height = Math.max(height >> 1, 1)
  }
  return null
}

// The average colour the game keeps for a texture, as its loader takes it (routines at 1895ae0
// and 1897540 of build 180836; docs/MODEL_WORKSHOP.md):
// 1. The game's texture files carry it in their header: the four bytes at 0x38 are blue, green,
//    red and alpha. When they are not all zero, that is the average.
// 2. Without it, for the older block formats the game reads the one block at the end of the
//    file (the smallest level) as a BC1 colour block (for BC3 the colour half) and keeps its
//    first pixel.
// Null when neither applies; the painter then takes a plain mean, which the game does not do
// (it leaves the value to a later task whose arithmetic is not read).
export function averageOfTexture(file: Uint8Array): [number, number, number] | null {
  if (file.byteLength < 128) return null
  const view = new DataView(file.buffer, file.byteOffset, file.byteLength)
  if (view.getUint32(0, true) !== ddsMagic) return null
  if (view.getUint32(0x38, true) !== 0)
    return [file[0x3a] / 255, file[0x39] / 255, file[0x38] / 255]
  let height = view.getUint32(12, true)
  let width = view.getUint32(16, true)
  // The level count is used only when the header says it is given (flag 0x20000).
  const given = (view.getUint32(8, true) & 0x20000) !== 0 ? view.getUint32(28, true) : 1
  const levels = Math.max(given, 1)
  const fourCc = view.getUint32(84, true)
  let offset = 128
  let blockBytes = 16
  // BC3 keeps its colour block in the second half of a block and is read with four colours
  // always; every other format is read with the BC1 rule that allows three colours.
  let colourAt = 0
  let threeColour = true
  if (fourCc === fourCcDx10) {
    if (file.byteLength < 148) return null
    const dxgi = view.getUint32(128, true)
    offset = 148
    if (dxgi === 71 || dxgi === 72) blockBytes = 8
    else if (dxgi === 77 || dxgi === 78) {
      colourAt = 8
      threeColour = false
    } else return null
  } else if (fourCc === fourCcDxt1) blockBytes = 8
  else if (fourCc === fourCcDxt5) {
    colourAt = 8
    threeColour = false
  } else return null
  if (width < 1 || height < 1 || width > 16384 || height > 16384) return null
  const sizeOf = (w: number, h: number): number =>
    Math.max(1, (w + 3) >> 2) * Math.max(1, (h + 3) >> 2) * blockBytes
  let total = 0
  for (let level = 0; level < levels; level += 1) {
    total += sizeOf(width, height)
    width = Math.max(width >> 1, 1)
    height = Math.max(height >> 1, 1)
  }
  const block = offset + total - sizeOf(width, height) + colourAt
  if (block < offset || block + 8 > file.byteLength) return null
  const first = view.getUint16(block, true)
  const second = view.getUint16(block + 2, true)
  const expand = (colour: number): [number, number, number] => {
    const red = colour >> 11
    const green = (colour >> 5) & 63
    const blue = colour & 31
    return [(red << 3) | (red >> 2), (green << 2) | (green >> 4), (blue << 3) | (blue >> 2)]
  }
  const a = expand(first)
  const b = expand(second)
  const plain = threeColour && first <= second
  const code = file[block + 4] & 3
  const pixel =
    code === 0
      ? a
      : code === 1
        ? b
        : code === 2
          ? a.map((value, index) =>
              plain ? (value + b[index]) >> 1 : Math.floor((2 * value + b[index]) / 3)
            )
          : a.map((value, index) => (plain ? 0 : Math.floor((value + 2 * b[index]) / 3)))
  return [pixel[0] / 255, pixel[1] / 255, pixel[2] / 255]
}

const vertexSource = `#version 300 es
out vec2 uv;
void main() {
  vec2 corner = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  uv = corner;
  gl_Position = vec4(corner * 2.0 - 1.0, 0.0, 1.0);
}`

// Draws one layer over what is already there, tinted when `tinted` is set. `linear` is set when
// the target holds linear light (the normal case); without it the layer is written as stored,
// for averaging and for graphics cards that cannot draw to a half-float picture.
const fragmentSource = `#version 300 es
precision highp float;
uniform sampler2D layer;
uniform vec3 tint;
uniform vec3 average;
uniform bool tinted;
uniform bool multiply;
uniform bool opaque;
uniform bool linear;
in vec2 uv;
out vec4 colour;
float toLinear(float value) {
  float side = value < 0.0 ? -1.0 : 1.0;
  float size = value * side;
  return side * (size > 1.0 ? pow(size, 2.4) : (size > 0.0 ? pow(size, 2.2) : size));
}
vec3 toLinear(vec3 c) {
  return vec3(toLinear(c.r), toLinear(c.g), toLinear(c.b));
}
// Hue, saturation and brightness the way the game's shader takes them.
vec3 toHsv(vec3 c) {
  vec4 p = c.g < c.b ? vec4(c.b, c.g, -1.0, 2.0 / 3.0) : vec4(c.g, c.b, 0.0, -1.0 / 3.0);
  vec4 q = c.r < p.x ? vec4(p.xyw, c.r) : vec4(c.r, p.yzx);
  float spread = q.x - min(q.w, q.y);
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * spread + 1e-10)), spread / (q.x + 1e-10), q.x);
}
void main() {
  vec4 texel = texture(layer, uv);
  vec3 rgb = texel.rgb;
  if (tinted && multiply) {
    // Multiplied in linear light, as the game does; written back as a stored value when the
    // target is not linear.
    vec3 product = toLinear(rgb) * toLinear(tint);
    float alphaOnly = clamp(texel.a - 0.004, 0.0, 1.0) * 1.00401604;
    colour = vec4(linear ? product : pow(product, vec3(1.0 / 2.2)), opaque ? 1.0 : alphaOnly);
    return;
  }
  if (tinted) {
    vec3 own = toHsv(rgb);
    vec3 target = toHsv(tint);
    vec3 base = toHsv(average);
    float hue = fract(own.x - base.x + target.x);
    float saturation = min(own.y, target.y);
    float middle = own.z - 0.5;
    float value = own.z + pow(10.0, -10.0 * middle * middle) * 0.47662675 * (target.z - base.z);
    vec3 pure = clamp(abs(fract(vec3(hue) + vec3(1.0, 2.0 / 3.0, 1.0 / 3.0)) * 6.0 - 3.0) - 1.0, 0.0, 1.0);
    rgb = clamp(mix(vec3(1.0), pure, saturation) * value, 0.0, 1.0);
  }
  float alpha = clamp(texel.a - 0.004, 0.0, 1.0) * 1.00401604;
  colour = vec4(linear ? toLinear(rgb) : rgb, opaque ? 1.0 : alpha);
}`

// Turns the finished picture from linear light back to stored values.
const finishSource = `#version 300 es
precision highp float;
uniform sampler2D layer;
in vec2 uv;
out vec4 colour;
float toStored(float value) {
  float side = value < 0.0 ? -1.0 : 1.0;
  float size = value * side;
  return side * (size < 1.0 ? pow(size, 1.0 / 2.2) : pow(size, 1.0 / 2.4));
}
void main() {
  vec4 texel = texture(layer, uv);
  colour = vec4(toStored(texel.r), toStored(texel.g), toStored(texel.b), texel.a);
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
  const link = (source: string): WebGLProgram | null => {
    const vertex = compile(gl.VERTEX_SHADER, vertexSource)
    const fragment = compile(gl.FRAGMENT_SHADER, source)
    const linked = gl.createProgram()
    if (!vertex || !fragment || !linked) return null
    gl.attachShader(linked, vertex)
    gl.attachShader(linked, fragment)
    gl.linkProgram(linked)
    return gl.getProgramParameter(linked, gl.LINK_STATUS) ? linked : null
  }
  const program = link(fragmentSource)
  const finish = link(finishSource)
  if (!program || !finish) return null
  gl.useProgram(program)
  // The layers are laid over each other in linear light, in a half-float picture; a graphics
  // card that cannot draw to one gets the layers laid over each other as stored.
  let stage: { buffer: WebGLFramebuffer; picture: WebGLTexture } | null = null
  if (gl.getExtension('EXT_color_buffer_float') || gl.getExtension('EXT_color_buffer_half_float')) {
    const picture = gl.createTexture()
    const buffer = gl.createFramebuffer()
    gl.bindTexture(gl.TEXTURE_2D, picture)
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA16F, pictureSize, pictureSize)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.bindFramebuffer(gl.FRAMEBUFFER, buffer)
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, picture, 0)
    if (
      picture &&
      buffer &&
      gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE
    ) {
      stage = { buffer, picture }
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  }
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
  // The plain mean of a texture's colour values, from its smallest level drawn by the graphics
  // card. Transparent pixels count like any other, as their stored colour.
  const meanColour = (file: Uint8Array): [number, number, number] | null => {
    const picture = readLevel(file, 0, formats)
    if (!picture || !upload(picture)) return null
    const width = Math.min(picture.width, pictureSize)
    const height = Math.min(picture.height, pictureSize)
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    gl.viewport(0, 0, width, height)
    gl.disable(gl.BLEND)
    gl.uniform1i(uniform('tinted'), 0)
    gl.uniform1i(uniform('opaque'), 0)
    gl.uniform1i(uniform('linear'), 0)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
    const pixels = new Uint8Array(width * height * 4)
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
    const sum = [0, 0, 0]
    for (let index = 0; index < pixels.length; index += 4) {
      sum[0] += pixels[index]
      sum[1] += pixels[index + 1]
      sum[2] += pixels[index + 2]
    }
    const count = (pixels.length / 4) * 255
    return [sum[0] / count, sum[1] / count, sum[2] / count]
  }

  return {
    paint: async (layers, files, cutout) => {
      const pictures = layers.map((layer) => {
        const file = files.get(layer.texture)
        return file ? readLevel(file, pictureSize, formats) : null
      })
      gl.useProgram(program)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      // The file's own average when it gives one, else the one the game takes from the texture.
      const averages = layers.map((layer) => {
        const file = files.get(layer.texture)
        if (!layer.tint) return null
        if (layer.average) return layer.average
        return file ? (averageOfTexture(file) ?? meanColour(file)) : null
      })
      gl.bindFramebuffer(gl.FRAMEBUFFER, stage ? stage.buffer : null)
      gl.uniform1i(uniform('linear'), stage ? 1 : 0)
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
        gl.uniform1i(uniform('multiply'), layers[index].multiply ? 1 : 0)
        if (tint && average) {
          gl.uniform3f(uniform('tint'), tint[0], tint[1], tint[2])
          gl.uniform3f(uniform('average'), average[0], average[1], average[2])
        }
        // The bottom layer fills the picture; a decal keeps its own alpha instead.
        gl.uniform1i(uniform('opaque'), !drawn && !cutout ? 1 : 0)
        // A later layer is mixed in by its alpha and leaves the picture's own alpha as it is.
        if (drawn) {
          gl.enable(gl.BLEND)
          gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE)
        } else gl.disable(gl.BLEND)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
        drawn = true
      }
      if (!drawn) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        return null
      }
      if (stage) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.disable(gl.BLEND)
        gl.useProgram(finish)
        gl.bindTexture(gl.TEXTURE_2D, stage.picture)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
        gl.useProgram(program)
        gl.bindTexture(gl.TEXTURE_2D, texture)
      }
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
