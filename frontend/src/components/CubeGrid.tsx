'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { CubeColor } from '@/types';

interface CubeGridProps {
  state: CubeColor[];
  cubeType: '2x2' | '3x3' | '4x4' | '5x5';
  selectedColor: CubeColor;
  rotationY?: number;
  onFaceletClick: (index: number) => void;
}

const FACES = [
  { label: 'Up', stateFace: 0 },
  { label: 'Right', stateFace: 1 },
  { label: 'Front', stateFace: 2 },
  { label: 'Down', stateFace: 3 },
  { label: 'Left', stateFace: 4 },
  { label: 'Back', stateFace: 5 },
] as const;

const colorHex: Record<CubeColor, string> = {
  W: '#f0f0f0',
  Y: '#ffd226',
  R: '#ef3f46',
  O: '#ff7a18',
  B: '#3b82f6',
  G: '#22c55e',
};

const colorEmissive: Record<CubeColor, string> = {
  W: '#cccccc',
  Y: '#cc9900',
  R: '#cc2222',
  O: '#cc5500',
  B: '#2255cc',
  G: '#119933',
};

type StickerSpec = {
  index: number;
  color: CubeColor;
  position: THREE.Vector3;
  rotation: THREE.Euler;
};

function stickerSpecs(state: CubeColor[], gridSize: number): StickerSpec[] {
  const specs: StickerSpec[] = [];
  const faceletsPerFace = gridSize * gridSize;
  const step = 1.08;
  const half = ((gridSize - 1) * step) / 2;
  const surface = half + 0.56;

  const add = (
    face: number,
    row: number,
    col: number,
    position: THREE.Vector3,
    rotation: THREE.Euler,
  ) => {
    const index = face * faceletsPerFace + row * gridSize + col;
    specs.push({ index, color: state[index], position, rotation });
  };

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const x = col * step - half;
      const y = half - row * step;
      const yFromBottom = row * step - half;

      add(0, row, col, new THREE.Vector3(x, surface, row * step - half), new THREE.Euler(-Math.PI / 2, 0, 0));
      add(1, row, col, new THREE.Vector3(surface, y, half - col * step), new THREE.Euler(0, Math.PI / 2, 0));
      add(2, row, col, new THREE.Vector3(x, y, surface), new THREE.Euler(0, 0, 0));
      add(3, row, col, new THREE.Vector3(x, -surface, yFromBottom), new THREE.Euler(Math.PI / 2, 0, 0));
      add(4, row, col, new THREE.Vector3(-surface, y, col * step - half), new THREE.Euler(0, -Math.PI / 2, 0));
      add(5, row, col, new THREE.Vector3(half - col * step, y, -surface), new THREE.Euler(0, Math.PI, 0));
    }
  }

  return specs;
}

export default function CubeGrid({
  state,
  cubeType,
  selectedColor,
  rotationY = 36,
  onFaceletClick,
}: CubeGridProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const clickRef = useRef(onFaceletClick);
  const isDragging = useRef(false);
  const prevMouse = useRef({ x: 0, y: 0 });
  const orbitAngles = useRef({ x: 22, y: rotationY });
  const targetAngles = useRef({ x: 22, y: rotationY });
  const velocityRef = useRef({ x: 0, y: 0 });
  const pointerDownPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    clickRef.current = onFaceletClick;
  }, [onFaceletClick]);
  useEffect(() => {
    targetAngles.current.y = rotationY;
  }, [rotationY]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const gridSize = parseInt(cubeType.charAt(0));
    const scene = new THREE.Scene();
    const camDist = 7 + gridSize * 1.8; // pull camera back for bigger cubes
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 0, camDist);
    camera.lookAt(0, 0, 0);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);
    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(5, 8, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xb4c6ff, 0.8);
    fillLight.position.set(-4, 2, 3);
    scene.add(fillLight);
    const rimLight = new THREE.PointLight(0x8b5cf6, 2.0, 15);
    rimLight.position.set(-3, -1, -5);
    scene.add(rimLight);
    const topAccent = new THREE.PointLight(0x60a5fa, 1.2, 12);
    topAccent.position.set(0, 6, 0);
    scene.add(topAccent);
    const floorGeo = new THREE.CircleGeometry(2.8, 64);
    const floorMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.12,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -2.8;
    scene.add(floor);
    const floorGlowGeo = new THREE.CircleGeometry(4, 64);
    const floorGlowMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.04,
    });
    const floorGlow = new THREE.Mesh(floorGlowGeo, floorGlowMat);
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.y = -2.85;
    scene.add(floorGlow);
    const cubieSize = 0.96;
    const step = 1.08;
    const half = ((gridSize - 1) * step) / 2;
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x080810,
      roughness: 0.35,
      metalness: 0.25,
    });
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        for (let z = 0; z < gridSize; z++) {
          if (
            x > 0 && x < gridSize - 1 &&
            y > 0 && y < gridSize - 1 &&
            z > 0 && z < gridSize - 1
          ) continue;
          const geo = new THREE.BoxGeometry(cubieSize, cubieSize, cubieSize);
          const cubie = new THREE.Mesh(geo, bodyMaterial);
          cubie.position.set(
            x * step - half,
            y * step - half,
            z * step - half,
          );
          cubie.castShadow = true;
          cubie.receiveShadow = true;
          cubeGroup.add(cubie);
        }
      }
    }
    const stickerW = 0.82;
    const stickerR = 0.06;
    const shape = new THREE.Shape();
    const hw = stickerW / 2;
    shape.moveTo(-hw + stickerR, -hw);
    shape.lineTo(hw - stickerR, -hw);
    shape.quadraticCurveTo(hw, -hw, hw, -hw + stickerR);
    shape.lineTo(hw, hw - stickerR);
    shape.quadraticCurveTo(hw, hw, hw - stickerR, hw);
    shape.lineTo(-hw + stickerR, hw);
    shape.quadraticCurveTo(-hw, hw, -hw, hw - stickerR);
    shape.lineTo(-hw, -hw + stickerR);
    shape.quadraticCurveTo(-hw, -hw, -hw + stickerR, -hw);

    const stickerGeometry = new THREE.ShapeGeometry(shape);
    const stickerMeshes: THREE.Mesh[] = [];
    stickerSpecs(state, gridSize).forEach((spec) => {
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex[spec.color]),
        roughness: 0.25,
        metalness: 0.05,
        side: THREE.DoubleSide,
        emissive: new THREE.Color(colorEmissive[spec.color]),
        emissiveIntensity: spec.color === 'W' ? 0.04 : 0.08,
      });
      const sticker = new THREE.Mesh(stickerGeometry, material);
      sticker.position.copy(spec.position);
      sticker.rotation.copy(spec.rotation);
      sticker.userData.index = spec.index;
      sticker.castShadow = true;
      cubeGroup.add(sticker);
      stickerMeshes.push(sticker);
      const borderGeo = new THREE.ShapeGeometry(shape);
      const borderMat = new THREE.MeshBasicMaterial({
        color: 0x0a0a12,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      });
      const border = new THREE.Mesh(borderGeo, borderMat);
      border.position.copy(spec.position);
      border.rotation.copy(spec.rotation);
      border.translateZ(-0.005);
      border.scale.set(1.06, 1.06, 1);
      cubeGroup.add(border);
    });
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const onPointerDown = (e: PointerEvent) => {
      isDragging.current = false;
      prevMouse.current = { x: e.clientX, y: e.clientY };
      pointerDownPos.current = { x: e.clientX, y: e.clientY };
      velocityRef.current = { x: 0, y: 0 };

      const onPointerMove = (ev: PointerEvent) => {
        const dx = ev.clientX - prevMouse.current.x;
        const dy = ev.clientY - prevMouse.current.y;
        const distFromStart = Math.hypot(
          ev.clientX - pointerDownPos.current.x,
          ev.clientY - pointerDownPos.current.y,
        );

        if (distFromStart > 4) isDragging.current = true;

        targetAngles.current.y += dx * 0.5;
        targetAngles.current.x += dy * 0.3;
        targetAngles.current.x = Math.max(-60, Math.min(60, targetAngles.current.x));
        velocityRef.current = { x: dy * 0.3, y: dx * 0.5 };

        prevMouse.current = { x: ev.clientX, y: ev.clientY };
      };

      const onPointerUp = (ev: PointerEvent) => {
        if (!isDragging.current) {
          const rect = renderer.domElement.getBoundingClientRect();
          pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(pointer, camera);
          const hit = raycaster.intersectObjects(stickerMeshes, false)[0];
          if (hit?.object.userData.index !== undefined) {
            clickRef.current(hit.object.userData.index);
          }
        }
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.style.touchAction = 'none';
    window.addEventListener('resize', resize);
    resize();
    let frame = 0;
    let animationId = 0;

    const animate = () => {
      frame += 0.016;
      orbitAngles.current.x += (targetAngles.current.x - orbitAngles.current.x) * 0.08;
      orbitAngles.current.y += (targetAngles.current.y - orbitAngles.current.y) * 0.08;
      velocityRef.current.x *= 0.92;
      velocityRef.current.y *= 0.92;

      cubeGroup.rotation.x = THREE.MathUtils.degToRad(orbitAngles.current.x);
      cubeGroup.rotation.y = THREE.MathUtils.degToRad(orbitAngles.current.y);
      cubeGroup.position.y = Math.sin(frame * 0.8) * 0.05;
      floor.material.opacity = 0.12 - Math.sin(frame * 0.8) * 0.02;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', resize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      stickerGeometry.dispose();
      bodyMaterial.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
    };
  }, [cubeType, state]);

  const gridSize = parseInt(cubeType.charAt(0));
  const faceletsPerFace = gridSize * gridSize;

  return (
    <div className="w-full">
      <div className="three-cube-stage group" ref={mountRef} aria-label="Interactive 3D Rubik's cube">
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <span className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-lg text-[10px] text-white/50 font-medium">
            Drag to orbit • Click stickers to paint
          </span>
        </div>
      </div>
      <div className="mx-auto mt-3 grid max-w-4xl grid-cols-3 gap-2 px-2 sm:grid-cols-6">
        {FACES.map((face) => {
          const startIdx = face.stateFace * faceletsPerFace;
          return (
            <div key={face.label} className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 backdrop-blur-sm transition-all hover:bg-white/[0.06] hover:border-white/[0.12]">
              <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-white/35">{face.label}</p>
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
                {Array.from({ length: faceletsPerFace }).map((_, i) => {
                  const idx = startIdx + i;
                  const color = state[idx];
                  return (
                    <button
                      key={idx}
                      onClick={() => onFaceletClick(idx)}
                      className="aspect-square rounded-md border border-black/20 shadow-inner transition-all duration-150 hover:scale-110 hover:shadow-md active:scale-95"
                      style={{
                        backgroundColor: colorHex[color],
                        boxShadow: `inset 0 2px 4px rgba(255,255,255,0.25), inset 0 -2px 4px rgba(0,0,0,0.15)`,
                      }}
                      aria-label={`${face.label} sticker ${i + 1}; color ${color}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
