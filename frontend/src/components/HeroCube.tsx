'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const faceColors = {
  right: 0x2563eb,
  left: 0x22c55e,
  top: 0xf8fafc,
  bottom: 0xfacc15,
  front: 0xef4444,
  back: 0xf97316,
};

const faceLayout = [
  ['front', 'top', 'right'],
  ['left', 'bottom', 'back'],
  ['top', 'front', 'left'],
] as const;

export default function HeroCube() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0.35, 9);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    const cubeGroup = new THREE.Group();
    cubeGroup.rotation.set(THREE.MathUtils.degToRad(-18), THREE.MathUtils.degToRad(36), 0);
    scene.add(cubeGroup);

    scene.add(new THREE.AmbientLight(0xffffff, 0.72));

    const keyLight = new THREE.DirectionalLight(0xffffff, 3);
    keyLight.position.set(4, 6, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x9fb7ff, 1.2);
    fillLight.position.set(-5, 1, 4);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0x8b5cf6, 4.5, 18);
    rimLight.position.set(-3, 0, -5);
    scene.add(rimLight);

    const cyanLight = new THREE.PointLight(0x22d3ee, 1.4, 12);
    cyanLight.position.set(3, -2, 2);
    scene.add(cyanLight);

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x080912,
      roughness: 0.42,
      metalness: 0.18,
    });

    const cubieGeometry = new THREE.BoxGeometry(0.94, 0.94, 0.94);
    const stickerGeometry = new THREE.PlaneGeometry(0.72, 0.72);
    const step = 1.02;
    const offset = step;
    const stickerOffset = 0.475;

    const stickerMaterials = new Map<number, THREE.MeshStandardMaterial>();
    const getStickerMaterial = (color: number) => {
      const existing = stickerMaterials.get(color);
      if (existing) return existing;

      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.2,
        metalness: 0.04,
        emissive: new THREE.Color(color).multiplyScalar(0.18),
        emissiveIntensity: 0.16,
        side: THREE.DoubleSide,
      });
      stickerMaterials.set(color, material);
      return material;
    };

    const addSticker = (
      parent: THREE.Group,
      color: number,
      position: THREE.Vector3,
      rotation: THREE.Euler,
    ) => {
      const sticker = new THREE.Mesh(stickerGeometry, getStickerMaterial(color));
      sticker.position.copy(position);
      sticker.rotation.copy(rotation);
      sticker.castShadow = true;
      parent.add(sticker);
    };

    for (let x = -1; x <= 1; x += 1) {
      for (let y = -1; y <= 1; y += 1) {
        for (let z = -1; z <= 1; z += 1) {
          if (x === 0 && y === 0 && z === 0) continue;

          const cubie = new THREE.Group();
          cubie.position.set(x * step, y * step, z * step);

          const body = new THREE.Mesh(cubieGeometry, bodyMaterial);
          body.castShadow = true;
          body.receiveShadow = true;
          cubie.add(body);

          const row = 1 - y;
          const col = x + 1;
          const frontColor = faceColors[faceLayout[row][col]];

          if (z === 1) {
            addSticker(cubie, frontColor, new THREE.Vector3(0, 0, stickerOffset), new THREE.Euler(0, 0, 0));
          }
          if (x === 1) {
            addSticker(cubie, faceColors.right, new THREE.Vector3(stickerOffset, 0, 0), new THREE.Euler(0, Math.PI / 2, 0));
          }
          if (y === 1) {
            addSticker(cubie, faceColors.top, new THREE.Vector3(0, stickerOffset, 0), new THREE.Euler(-Math.PI / 2, 0, 0));
          }
          if (z === -1) {
            addSticker(cubie, faceColors.back, new THREE.Vector3(0, 0, -stickerOffset), new THREE.Euler(0, Math.PI, 0));
          }
          if (x === -1) {
            addSticker(cubie, faceColors.left, new THREE.Vector3(-stickerOffset, 0, 0), new THREE.Euler(0, -Math.PI / 2, 0));
          }
          if (y === -1) {
            addSticker(cubie, faceColors.bottom, new THREE.Vector3(0, -stickerOffset, 0), new THREE.Euler(Math.PI / 2, 0, 0));
          }

          cubeGroup.add(cubie);
        }
      }
    }

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(2.6, 64),
      new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.18 }),
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -2.05;
    scene.add(shadow);

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    let frameId = 0;
    const animate = () => {
      const time = performance.now() * 0.001;
      cubeGroup.rotation.y += 0.006;
      cubeGroup.rotation.x = THREE.MathUtils.degToRad(-18) + Math.sin(time * 0.7) * 0.05;
      cubeGroup.position.y = Math.sin(time * 1.2) * 0.16;
      shadow.scale.setScalar(1 + Math.sin(time * 1.2) * 0.05);
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      cubieGeometry.dispose();
      stickerGeometry.dispose();
      bodyMaterial.dispose();
      stickerMaterials.forEach((material) => material.dispose());
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="hero-cube-stage"
      aria-label="Animated 3D Rubik's cube"
    />
  );
}
