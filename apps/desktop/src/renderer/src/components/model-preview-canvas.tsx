import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import type { PreviewModel, PreviewColor } from '../../../shared/model-preview'
import type { WorkshopSurface } from '../../../shared/model-workshop'
import { paintSurface } from '@renderer/lib/model-surface-painter'

export type PreviewPart = { id: string; name: string }
type Props = {
  model: PreviewModel
  hidden: Set<string>
  tint: string | null
  partColors: ReadonlyMap<string, PreviewColor>
  reset: number
  // How the model's materials are painted, and where a game texture's bytes come from. Both are
  // read once, when the model is loaded.
  surfaces?: readonly WorkshopSurface[]
  fetchTexture?: (texture: string) => Promise<Uint8Array | null>
  // A taller view, for the workshop's own models.
  tall?: boolean
  onLoaded: (parts: PreviewPart[]) => void
  onError: () => void
}
type Controller = {
  meshes: THREE.Mesh[]
  colors: Map<THREE.Material, THREE.Color>
  fit: () => void
}

export function ModelPreviewCanvas({
  model,
  hidden,
  tint,
  partColors,
  reset,
  surfaces,
  fetchTexture,
  tall,
  onLoaded,
  onError
}: Props): React.JSX.Element {
  const host = useRef<HTMLDivElement>(null)
  const controller = useRef<Controller | null>(null)
  const painting = useRef({ surfaces, fetchTexture })
  useEffect(() => {
    painting.current = { surfaces, fetchTexture }
  })
  useEffect(() => {
    const container = host.current!
    let active = true
    let frame = 0
    let renderer: THREE.WebGLRenderer | undefined
    let observer: ResizeObserver | undefined
    let controls: OrbitControls | undefined
    let root: THREE.Group | undefined
    const painted = new Set<THREE.Texture>()
    const disposeModel = (group: THREE.Group): void => {
      const geometries = new Set<THREE.BufferGeometry>()
      const materials = new Set<THREE.Material>()
      group.traverse((node) => {
        if (!(node instanceof THREE.Mesh)) return
        geometries.add(node.geometry)
        for (const material of Array.isArray(node.material) ? node.material : [node.material])
          materials.add(material)
      })
      geometries.forEach((geometry) => geometry.dispose())
      materials.forEach((material) => material.dispose())
      painted.forEach((texture) => {
        ;(texture.image as ImageBitmap | undefined)?.close?.()
        texture.dispose()
      })
      painted.clear()
    }
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.domElement.setAttribute('aria-label', 'Interactive model preview')
      container.appendChild(renderer.domElement)
      const scene = new THREE.Scene()
      scene.add(new THREE.HemisphereLight(0xffffff, 0x475569, 1.1))
      const light = new THREE.DirectionalLight(0xffffff, 2)
      light.position.set(4, 6, 4)
      scene.add(light)
      const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 10000)
      controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      const resize = (): void => {
        const width = Math.max(container.clientWidth, 1)
        const height = Math.max(container.clientHeight, 1)
        renderer!.setSize(width, height)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
      }
      observer = new ResizeObserver(resize)
      observer.observe(container)
      resize()
      const manager = new THREE.LoadingManager()
      manager.setURLModifier((url) => {
        // Embedded images reach the loader as object URLs it creates itself; nothing else may resolve.
        if (url.startsWith('blob:')) return url
        throw new Error('External preview resources are disabled.')
      })
      const bytes = new Uint8Array(model.bytes).buffer
      void new GLTFLoader(manager)
        .parseAsync(bytes, '')
        .then((gltf) => {
          if (!active) {
            disposeModel(gltf.scene)
            return
          }
          root = gltf.scene
          const meshes: THREE.Mesh[] = []
          const colors = new Map<THREE.Material, THREE.Color>()
          const sourceMaterials = new Set<THREE.Material>()
          root.traverse((node) => {
            if (!(node instanceof THREE.Mesh)) return
            meshes.push(node)
            for (const material of Array.isArray(node.material) ? node.material : [node.material])
              sourceMaterials.add(material)
            // Isolate materials shared by mesh instances before per-part recoloring.
            node.material = Array.isArray(node.material)
              ? node.material.map((material) => material.clone())
              : node.material.clone()
            if (!node.geometry.getAttribute('normal')) node.geometry.computeVertexNormals()
            for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
              if ('color' in material && material.color instanceof THREE.Color)
                colors.set(material, material.color.clone())
            }
          })
          // GLTFLoader source materials are no longer used after the independent clones.
          sourceMaterials.forEach((material) => material.dispose())
          const bounds = new THREE.Box3().setFromObject(root)
          const size = bounds.getSize(new THREE.Vector3()).length()
          if (!meshes.length || bounds.isEmpty() || !Number.isFinite(size) || size <= 0)
            throw new Error('Empty or invalid scene bounds.')
          const center = bounds.getCenter(new THREE.Vector3())
          root.position.sub(center).multiplyScalar(4 / size)
          root.scale.multiplyScalar(4 / size)
          scene.add(root)
          const fit = (): void => {
            root!.updateMatrixWorld(true)
            const visibleBounds = new THREE.Box3()
            for (const mesh of meshes) {
              if (!mesh.visible) continue
              mesh.geometry.computeBoundingBox()
              visibleBounds.union(mesh.geometry.boundingBox!.clone().applyMatrix4(mesh.matrixWorld))
            }
            if (visibleBounds.isEmpty()) return
            const sphere = visibleBounds.getBoundingSphere(new THREE.Sphere())
            const distance =
              (sphere.radius * 1.0) /
              Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) /
              Math.min(camera.aspect, 1)
            camera.position
              .copy(sphere.center)
              .add(new THREE.Vector3(1, 0.6, 1).normalize().multiplyScalar(distance))
            controls!.target.copy(sphere.center)
            controls!.update()
          }
          controller.current = { meshes, colors, fit }
          fit()
          // Paint the materials one after another; the model is already on screen in plain colours.
          const { surfaces: plans, fetchTexture: fetch } = painting.current
          if (plans?.length && fetch) {
            const byNumber = new Map<number, THREE.MeshStandardMaterial[]>()
            for (const material of colors.keys()) {
              const number = Number.parseInt(material.name, 10)
              if (!(material instanceof THREE.MeshStandardMaterial) || Number.isNaN(number))
                continue
              byNumber.set(number, [...(byNumber.get(number) ?? []), material])
            }
            void (async () => {
              const pictures = new Map<string, THREE.Texture | null>()
              for (const plan of plans) {
                const targets = byNumber.get(plan.material)
                if (!targets?.length) continue
                const key = JSON.stringify([plan.layers, plan.cutout])
                if (!pictures.has(key)) {
                  const bitmap = await paintSurface(plan.layers, plan.cutout, fetch).catch(
                    () => null
                  )
                  if (!active) {
                    bitmap?.close()
                    return
                  }
                  let texture: THREE.Texture | null = null
                  if (bitmap) {
                    texture = new THREE.Texture(bitmap)
                    texture.colorSpace = THREE.SRGBColorSpace
                    texture.wrapS = THREE.RepeatWrapping
                    texture.wrapT = THREE.RepeatWrapping
                    texture.flipY = false
                    texture.needsUpdate = true
                    painted.add(texture)
                  }
                  pictures.set(key, texture)
                }
                const texture = pictures.get(key)
                if (!texture) continue
                for (const material of targets) {
                  material.map = texture
                  material.color.setRGB(1, 1, 1)
                  colors.set(material, material.color.clone())
                  if (plan.cutout) {
                    material.alphaTest = 0.5
                    material.polygonOffset = true
                    material.polygonOffsetFactor = -1
                  }
                  material.needsUpdate = true
                }
              }
            })()
          }
          onLoaded(
            meshes.map((mesh, index) => ({ id: mesh.uuid, name: mesh.name || `Mesh ${index + 1}` }))
          )
        })
        .catch(() => {
          if (active) onError()
        })
      const render = (): void => {
        if (!active) return
        controls!.update()
        renderer!.render(scene, camera)
        frame = window.requestAnimationFrame(render)
      }
      render()
    } catch {
      onError()
    }
    return () => {
      active = false
      window.cancelAnimationFrame(frame)
      observer?.disconnect()
      controls?.dispose()
      if (root) disposeModel(root)
      controller.current = null
      renderer?.dispose()
      renderer?.forceContextLoss()
      renderer?.domElement.remove()
    }
  }, [model, onLoaded, onError])

  useEffect(() => {
    const current = controller.current
    if (!current) return
    current.meshes.forEach((mesh) => {
      mesh.visible = !hidden.has(mesh.uuid)
    })
    current.colors.forEach((original, material) => {
      if ('color' in material && material.color instanceof THREE.Color)
        material.color.copy(tint ? new THREE.Color(tint) : original)
    })
    current.meshes.forEach((mesh) => {
      const color = partColors.get(mesh.uuid)
      if (!color) return
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material])
        if ('color' in material && material.color instanceof THREE.Color)
          // Explicit preview interpretation; native palette/shader color space remains unverified.
          material.color.setRGB(color[0], color[1], color[2], THREE.LinearSRGBColorSpace)
    })
  }, [hidden, tint, partColors])
  useEffect(() => {
    controller.current?.fit()
  }, [reset])
  return (
    <div
      ref={host}
      className={`${tall ? 'h-[600px]' : 'h-[440px]'} w-full overflow-hidden rounded-md border`}
    />
  )
}
