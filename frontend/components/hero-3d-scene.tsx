"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  Noise,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

const ACCENT = "#22d3ee";
const ACCENT_SOFT = "#67e8f9";
const ACCENT_GREEN = "#39ff7a";

function WireIcosahedron() {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);

  useFrame((state, dt) => {
    if (group.current) {
      group.current.rotation.x += dt * 0.18;
      group.current.rotation.y += dt * 0.12;
    }
    if (inner.current) {
      inner.current.rotation.x -= dt * 0.45;
      inner.current.rotation.y -= dt * 0.35;
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.04;
      inner.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={group}>
      {/* Outer wireframe shell */}
      <mesh>
        <icosahedronGeometry args={[1.45, 1]} />
        <meshBasicMaterial wireframe color={ACCENT} transparent opacity={0.55} />
      </mesh>

      {/* Inner solid (faintly lit) */}
      <mesh ref={inner}>
        <icosahedronGeometry args={[1.05, 0]} />
        <meshStandardMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={0.35}
          metalness={0.6}
          roughness={0.25}
          flatShading
          transparent
          opacity={0.18}
        />
      </mesh>

      {/* Vertex glow points */}
      <points>
        <icosahedronGeometry args={[1.45, 1]} />
        <pointsMaterial
          color={ACCENT_SOFT}
          size={0.05}
          sizeAttenuation
          transparent
          opacity={0.9}
        />
      </points>
    </group>
  );
}

function OrbitalShapes() {
  return (
    <>
      <Float speed={1.4} rotationIntensity={1.5} floatIntensity={1.3} position={[2.4, 0.8, -0.5]}>
        <mesh>
          <torusGeometry args={[0.45, 0.025, 16, 64]} />
          <meshBasicMaterial color={ACCENT_GREEN} transparent opacity={0.7} />
        </mesh>
      </Float>
      <Float speed={1.7} rotationIntensity={1.8} floatIntensity={1.2} position={[-2.5, -0.6, 0.4]}>
        <mesh>
          <octahedronGeometry args={[0.32, 0]} />
          <meshBasicMaterial wireframe color={ACCENT_SOFT} transparent opacity={0.85} />
        </mesh>
      </Float>
      <Float speed={1.1} rotationIntensity={1.0} floatIntensity={1.1} position={[1.6, -1.2, 0.6]}>
        <mesh>
          <tetrahedronGeometry args={[0.28, 0]} />
          <meshStandardMaterial
            color={ACCENT}
            emissive={ACCENT}
            emissiveIntensity={0.6}
            metalness={0.4}
            roughness={0.3}
            transparent
            opacity={0.85}
          />
        </mesh>
      </Float>
      <Float speed={1.3} rotationIntensity={1.2} floatIntensity={1.4} position={[-1.6, 1.4, -0.3]}>
        <mesh>
          <boxGeometry args={[0.34, 0.34, 0.34]} />
          <meshBasicMaterial wireframe color={ACCENT} transparent opacity={0.6} />
        </mesh>
      </Float>
    </>
  );
}

function ParticleField({ count = 240 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 0] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 9;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
    }
    return arr;
  }, [count]);

  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.04;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          itemSize={3}
          count={count}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color={ACCENT_SOFT}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

export function Hero3DScene() {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 5], fov: 55 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.35} />
      <pointLight position={[3, 3, 3]} intensity={1.6} color={ACCENT} />
      <pointLight position={[-3, -2, 2]} intensity={1.0} color={ACCENT_GREEN} />
      <Suspense fallback={null}>
        <WireIcosahedron />
        <OrbitalShapes />
        <ParticleField />
        <Stars
          radius={20}
          depth={30}
          count={1200}
          factor={2.5}
          fade
          speed={0.6}
        />
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom
            mipmapBlur
            intensity={0.85}
            luminanceThreshold={0.18}
            luminanceSmoothing={0.85}
            radius={0.7}
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={[0.0008, 0.0012] as unknown as THREE.Vector2}
            radialModulation={false}
            modulationOffset={0}
          />
          <Noise opacity={0.04} blendFunction={BlendFunction.OVERLAY} />
          <Vignette eskil={false} offset={0.2} darkness={0.85} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
