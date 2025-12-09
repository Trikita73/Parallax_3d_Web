import * as THREE from 'three'

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { FXAAShader } from 'three/addons/postprocessing/FXAAShader.js'
import { VignetteShader } from 'three/addons/shaders/VignetteShader.js'

devMode = true

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
renderer.setSize(window.innerWidth, window.innerHeight)

const header = document.getElementById('mainHeader')
header.appendChild(renderer.domElement)

const composer = new EffectComposer(renderer)

const RenderPass = new RenderPass(scene, camera)
composer.addPass(RenderPass)

if (devMode) {

}