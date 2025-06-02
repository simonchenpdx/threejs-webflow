
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
const SPLINE_URL =
  "https://prod.spline.design/6ZAqsfiqjVgQ-pUq/scene.splinecode";


const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
alert(isMobile);

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
  

  const pixelRatio = isMobile ? 0.5 : window.devicePixelRatio;


 
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

    const finalScale = config.scale ?? defaultScale;
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
    if (config.rotateY) splineSceneRoot.rotation.y += config.rotateY;
    if (config.rotateZ) splineSceneRoot.rotation.z += config.rotateZ;

    if (config.oscillateY) {
      const amp = config.oscillateY.amplitude ?? 10;
      const freq = config.oscillateY.frequency ?? 1;
      const baseY = splineSceneRoot.userData.originalPosition.y;
      splineSceneRoot.position.y =
        baseY + Math.sin(time * 0.001 * freq) * amp;
    }

    if (typeof config.onUpdate === "function") {
      config.onUpdate(splineSceneRoot, time);
    }
  }

  renderer.render(scene, camera);
}

if (isMobile && containerSelector === ".home_intro_illustration-container-spline") {
  // // Mobile-only throttled version for the intro scene
  // setInterval(() => {
  //   const now = performance.now();
  //   updateFrame(now);
  // }, 1000 / maxFPS);

    // Normal RAF loop
  function animate(time) {
    requestAnimationFrame(animate);
    updateFrame(time);
  }
  animate();
} else {
  // Normal RAF loop
  function animate(time) {
    requestAnimationFrame(animate);
    updateFrame(time);
  }
  animate();
}


}

// Only run this if IntersectionObserver is supported (almost all modern browsers)
window.addEventListener("load", () => {
  setTimeout(() => {
    const target = document.querySelector(".home_intro_illustration-container-spline");
    if (target) {
      const observer = new IntersectionObserver((entries, observer) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          initSplineScene(".home_intro_illustration-container-spline", {
            rotateY: 0.003,
            rotateZ: 0.002,
          });
          observer.disconnect();
        }
      }, { threshold: 0.1 });

      observer.observe(target);
    }
  }, 1000); // Delay observing by ~1 second after full page load
});





initSplineScene(".pipe-spline-testimony", {
  oscillateY: { amplitude: 20, frequency: 0.5 },
});

initSplineScene(".footer_spline-container", {
rotateY: 0.003,
  rotateZ: 0.002,

});

initSplineScene(".navbar_mobile_spline", {
  scale: 1.2,
  onUpdate: (obj, t) => {
    obj.rotation.x = Math.sin(t * 0.001) * 0.2;
    obj.position.z = Math.cos(t * 0.001) * 20;
  },
});

