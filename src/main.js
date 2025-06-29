
//**************** */ Dev Version
// import * as THREE from "https://unpkg.com/three@v0.150.0/build/three.module.js";
// import SplineLoader from "https://unpkg.com/@splinetool/loader@1.9.98/build/SplineLoader.js";

/******* Webflow version */
import * as THREE from "three";
import SplineLoader from "@splinetool/loader";
console.log(THREE);
console.log(SplineLoader);



// Shared SplineLoader instance
const loader = new SplineLoader();

// const SPLINE_URL =
//   "https://prod.spline.design/6ZAqsfiqjVgQ-pUq/scene.splinecode";

const SPLINE_URL = "https://threejs-webflow.netlify.app/pipe-scene.splinecode";


console.log('test passed again');
const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);


// Reusable scene initializer
function initSplineScene(containerSelector, config = {}) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.warn(`Container not found: ${containerSelector}`);
    return;
  }

  const width = container.clientWidth ;
  const height = container.clientHeight ;

  const camera = new THREE.OrthographicCamera(
    width / -2,
    width / 2,
    height / 2,
    height / -2,
    -100000,
    100000
  );
  camera.position.set(577.35, 577.35, 577.35);
  camera.quaternion.setFromEuler(new THREE.Euler(-0.79, 0.62, 0.52));

  const scene = new THREE.Scene();

  const renderer = new THREE.WebGLRenderer({
    alpha:true,
    antialias: !isMobile, // disable antialiasing on mobile
  });
  

  const pixelRatio = isMobile ? 1 : window.devicePixelRatio;


 
renderer.setPixelRatio(pixelRatio);
renderer.setSize(width, height);
  renderer.setClearAlpha(0);
  // renderer.shadowMap.enabled = true;
  renderer.shadowMap.enabled = !isMobile;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  container.appendChild(renderer.domElement);

  let splineSceneRoot = null;

  loader.load(SPLINE_URL, (splineScene) => {
    splineSceneRoot = splineScene;
    scene.add(splineSceneRoot);

    // Fit and center logic
    const box = new THREE.Box3().setFromObject(splineSceneRoot);
    const size = new THREE.Vector3();
    box.getSize(size);

    const frustumWidth = camera.right - camera.left;
    const frustumHeight = camera.top - camera.bottom;
    const defaultScale = Math.min(
      (frustumWidth * 0.95) / size.x,
      (frustumHeight * 0.95) / size.y
    );

   const finalScale = config.scale
  ? defaultScale * config.scale  // scale is now a multiplier like 0.9
  : defaultScale;
    splineSceneRoot.scale.set(finalScale, finalScale, finalScale);

    const center = new THREE.Vector3();
    box.getCenter(center);
    splineSceneRoot.position.sub(center);

    // Save original position for animation
    splineSceneRoot.userData.originalPosition =
      splineSceneRoot.position.clone();
  });

  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;

    camera.left = w / -2;
    camera.right = w / 2;
    camera.top = h / 2;
    camera.bottom = h / -2;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  window.addEventListener("resize", onResize);

  let lastFrameTime = 0;
const maxFPS = isMobile ? 24 : 60;


function updateFrame(time) {
  if (splineSceneRoot) {
   if (config.rotateX) splineSceneRoot.rotation.x += config.rotateX;
    if (config.rotateY) splineSceneRoot.rotation.y += config.rotateY;
    if (config.rotateZ) splineSceneRoot.rotation.z += config.rotateZ;

if (config.oscillateY) {
  const amp = config.oscillateY.amplitude ?? 10;
  const freq = config.oscillateY.frequency ?? 1;
  const baseY = splineSceneRoot.userData.originalPosition.y;
  splineSceneRoot.position.y = baseY + Math.sin(time * 0.001 * freq) * amp;
}





    if (typeof config.onUpdate === "function") {
      config.onUpdate(splineSceneRoot, time);
    }
  }

  renderer.render(scene, camera);
}

const isMobileScreen = window.innerWidth <= 767;

if (!isMobileScreen) {
  function animate(time) {
    requestAnimationFrame(animate);
    updateFrame(time);
  }
  animate();
}



}


function shouldInitSpline() {
  return window.innerWidth >= 768 && !isMobile;
}



if (shouldInitSpline()) {
  initSplineScene("[spline='pipe']", {
    rotateX: 0.002,
    rotateY: 0.003,
    rotateZ: 0.0015,
  });

  //   initSplineScene(".home_intro_illustration-container-spline", {
  //   rotateX: 0.002,
  //   rotateY: 0.003,
  //   rotateZ: 0.0015,
  // });

  initSplineScene(".pipe-spline-testimony", {
    scale: 0.9,
    oscillateY: { amplitude: 50, frequency: 0.8 },
  });

  initSplineScene(".footer_spline-container", {
    rotateY: 0.003,
    rotateZ: 0.002,
    scale: 1,
  });

  initSplineScene(".navbar_mobile_spline", {
    scale: 1.2,
    onUpdate: (obj, t) => {
      obj.rotation.x = Math.sin(t * 0.001) * 0.2;
      obj.position.z = Math.cos(t * 0.001) * 20;
    },
  });
}

