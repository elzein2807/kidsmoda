import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

/*  HeroScene — very subtle 3D floating shapes behind the hero text.
    Rules:
    • Shapes are soft, translucent, slow — almost invisible
    • Reacts to mouse with gentle parallax (desktop only)
    • Completely disabled on mobile (<768px) and reduced-motion
    • Canvas is positioned absolutely so it never shifts layout
    • Cleans up fully on unmount                                    */

export default function HeroScene() {
  const mountRef = useRef(null);
  const frameRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  const onMouseMove = useCallback((e) => {
    mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    /* Skip on mobile */
    if (window.innerWidth < 768) return;

    /* Check WebGL availability */
    const testCanvas = document.createElement('canvas');
    const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
    if (!gl) return;

    /* If user prefers reduced motion, render shapes but skip animation */
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    /* ---- RENDERER ---- */
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
      });
    } catch (e) {
      return; /* WebGL not supported — degrade gracefully */
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    /* ---- SCENE + CAMERA ---- */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50, container.clientWidth / container.clientHeight, 0.1, 100
    );
    camera.position.z = 18;

    /* ---- MATERIAL helper ---- */
    const makeMat = (color, opacity) =>
      new THREE.MeshStandardMaterial({
        color,
        transparent: true,
        opacity,
        roughness: 0.65,
        metalness: 0.05,
        depthWrite: false,
      });

    /* ---- LIGHTS (very soft) ---- */
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dir = new THREE.DirectionalLight(0xfff0e6, 0.6);
    dir.position.set(5, 8, 10);
    scene.add(dir);

    /* ---- SHAPES ---- */
    const shapes = [];

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(2.2, 24, 24),
      makeMat(0xf2d0d8, 0.18)
    );
    sphere.position.set(-6, 3.5, -3);
    scene.add(sphere);
    shapes.push({ mesh: sphere, base: sphere.position.clone(), speed: 0.15, amp: 0.8, phase: 0 });

    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(1.6, 0.55, 12, 32),
      makeMat(0xfdf4e0, 0.15)
    );
    torus.position.set(5.5, -1.5, -4);
    torus.rotation.x = Math.PI * 0.3;
    scene.add(torus);
    shapes.push({ mesh: torus, base: torus.position.clone(), speed: 0.12, amp: 0.6, phase: 1.5 });

    const dodeca = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.4, 0),
      makeMat(0xf2d0d8, 0.12)
    );
    dodeca.position.set(1.5, -3.5, -5);
    scene.add(dodeca);
    shapes.push({ mesh: dodeca, base: dodeca.position.clone(), speed: 0.1, amp: 0.5, phase: 3.0 });

    const smallSphere = new THREE.Mesh(
      new THREE.SphereGeometry(1.0, 16, 16),
      makeMat(0xfdf4e0, 0.13)
    );
    smallSphere.position.set(4, 4, -6);
    scene.add(smallSphere);
    shapes.push({ mesh: smallSphere, base: smallSphere.position.clone(), speed: 0.18, amp: 0.4, phase: 4.5 });

    /* ---- ANIMATION LOOP ---- */
    let time = 0;
    const smooth = { x: 0, y: 0 };

    if (reducedMotion) {
      /* Still render the static shapes once — just no movement */
      renderer.render(scene, camera);
    } else {
      const animate = () => {
        frameRef.current = requestAnimationFrame(animate);
        time += 0.004;

        smooth.x += (mouseRef.current.x - smooth.x) * 0.02;
        smooth.y += (mouseRef.current.y - smooth.y) * 0.02;

        for (const s of shapes) {
          const t = time * s.speed + s.phase;
          s.mesh.position.x = s.base.x + Math.sin(t * 1.1) * s.amp + smooth.x * 0.4;
          s.mesh.position.y = s.base.y + Math.cos(t * 0.9) * s.amp * 0.7 + smooth.y * 0.25;
          s.mesh.rotation.x += 0.001;
          s.mesh.rotation.y += 0.0015;
        }

        renderer.render(scene, camera);
      };
      animate();
    }

    /* ---- RESIZE ---- */
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);

    /* ---- CLEANUP ---- */
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
      shapes.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onMouseMove]);

  /* Always render the container — useEffect decides if WebGL starts */
  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    />
  );
}
