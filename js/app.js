import * as THREE from 'three'

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js'
import { VignetteShader } from 'three/addons/shaders/VignetteShader.js'

const devMode = false

const config = {
  lighting: { 
    ambientIntensity: .55
  },
  camera: {
    fov: 60,
    near: .1,
    far: 8
  }
}

const scene = new THREE.Scene()
const loader = new GLTFLoader()

const processModel = (gltf) => {
    gltf.scene.traverse((child) => {
        if(child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({
                map: child.material.map,
                color: child.material.color,
                transparent: child.material.transparent,
                opacity: child.material.opacity,
                alphaMap: child.material.alphaMap,
                roughness: 1,
                metalness: 0
            })
            child.cashShadow = true
            child.receiveShadow = true
        }
    })
    scene.add(gltf.scene)
    hiderPreloader()
} 


const customPreloader = document.getElementById('preloader')

function hiderPreloader() {
    if (!customPreloader) return
    let opacity = 1
    const fadeInterval = setInterval(() => {
        opacity -= .05
        customPreloader.style.opacity = opacity
        if (opacity <= 0) {
            clearInterval(fadeInterval)
            customPreloader.style.display = 'none'
        }
    }, 30)
}

loader.load(
    'models/scene.glb',
    processModel,
    (progress) => {
         customPreloader.textContent =  `Progress: ${Math.round((progress.loaded / progress.total) * 100)}%`
    },
    (error) => {
        console.error("Ошибка загрузки модел:", error)
    }
)

scene.add(new THREE.AmbientLight('#fff', config.lighting.ambientIntensity))

const pointLightFire = new THREE.PointLight('orange', 2.75)
pointLightFire.position.set(-.75, .75, -1)

const pointLightSide = new THREE.PointLight('red', .25)
pointLightSide.position.set(.1, .4, -.35)

const pointLightSide2 = new THREE.PointLight('white', .4)
pointLightSide2.position.set(-.15, .4, -.35)

scene.add(pointLightFire, pointLightSide, pointLightSide2)

const fogColor = '#181818'
scene.background = new THREE.Color(fogColor)
scene.fog = new THREE.Fog(fogColor, 1, 5.75)

const camera = new THREE.PerspectiveCamera(
  config.camera.fov,
  window.innerWidth / window.innerHeight,
  config.camera.near,
  config.camera.far
)

const renderer = new THREE.WebGLRenderer({
  powerPreference: 'high-performance'
})
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.55
renderer.physicallyCorrectLight = true
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.setSize(window.innerWidth, window.innerHeight)

const header = document.getElementById('mainHeader')
header.appendChild(renderer.domElement)

const composer = new EffectComposer(renderer)

const renderPass = new RenderPass(scene, camera)
composer.addPass(renderPass)

const vignetteShader = VignetteShader
const vignettePass = new ShaderPass(vignetteShader)
vignettePass.uniforms['offset'].value = 1
vignettePass.uniforms['darkness'].value = 1.009
composer.addPass(vignettePass)

const fxaaPass = new ShaderPass(FXAAShader)
fxaaPass.material.uniforms['resolution'].value.set(
    1 / (window.innerWidth * renderer.getPixelRatio()),
    1 / (window.innerHeight * renderer.getPixelRatio())
)
composer.addPass(fxaaPass)

const outputPass = new OutputPass()
composer.addPass(outputPass)


const mouse = { x: 0, y: 0 }
const targetCamera = {
    x: 0, y: 0, z: 0,
    offsetX: -3.15, offsetY: -2, offsetZ: .1
}

const initialScrollYValue = 2
const initialScrollXZValue = 5

let scrollYvalue = initialScrollYValue
let scrollXZValue = initialScrollXZValue

const animate = () => {
  requestAnimationFrame(animate)

    targetCamera.x = targetCamera.offsetX + scrollXZValue * Math.cos(mouse.x * Math.PI * .035)
    targetCamera.y = targetCamera.offsetY + scrollYvalue + mouse.y * .15
    targetCamera.z = targetCamera.offsetZ + scrollXZValue * Math.sin(mouse.x * Math.PI * .035)

    camera.position.lerp(
        new THREE.Vector3(targetCamera.x, targetCamera.y, targetCamera.z), .05
    )

    camera.lookAt(0, 0, 0)
    composer.render()
}
animate()

document.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
})

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
    composer.setSize(window.innerHeight, window.innerHeight)
})

if (devMode) {
    const pointLightHelper = new THREE.PointLightHelper(pointLightFire, .1)
    const pointLightSideHelper = new THREE.PointLightHelper(pointLightSide, .1)
    const pointLightSide2Helper = new THREE.PointLightHelper(pointLightSide2, .1)

    scene.add(pointLightHelper, pointLightSideHelper, pointLightSide2Helper)
}