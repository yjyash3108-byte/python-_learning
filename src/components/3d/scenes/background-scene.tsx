"use client";

import { useRef } from "react";
import { Float, MeshDistortMaterial, Stars, Text } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import type { Group, Mesh } from "three";
import * as THREE from "three";

export type SceneVariant = "hero" | "auth" | "dashboard";

interface BackgroundSceneProps {
  variant: SceneVariant;
}

function CameraRig() {
  const { camera, pointer } = useThree();
  const target = useRef(new THREE.Vector3());

  useFrame(() => {
    target.current.set(pointer.x * 1.2, pointer.y * 0.8 + 0.3, 0);
    camera.position.x += (target.current.x - camera.position.x) * 0.04;
    camera.position.y += (target.current.y - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function FloatingShape({
  position,
  color,
  geometry,
  speed = 1,
  distort = 0.25,
}: {
  position: [number, number, number];
  color: string;
  geometry: "icosa" | "torus" | "box" | "octa";
  speed?: number;
  distort?: number;
}) {
  const mesh = useRef<Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.x = state.clock.elapsedTime * 0.15 * speed;
    mesh.current.rotation.y = state.clock.elapsedTime * 0.22 * speed;
  });

  const geo =
    geometry === "icosa" ? (
      <icosahedronGeometry args={[0.55, 1]} />
    ) : geometry === "torus" ? (
      <torusGeometry args={[0.45, 0.16, 16, 48]} />
    ) : geometry === "box" ? (
      <boxGeometry args={[0.7, 0.45, 0.15]} />
    ) : (
      <octahedronGeometry args={[0.5, 0]} />
    );

  return (
    <Float speed={1.4 * speed} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh ref={mesh} position={position} castShadow>
        {geo}
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          roughness={0.25}
          metalness={0.65}
          distort={distort}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

function HeroCore() {
  const group = useRef<Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.35;
  });

  return (
    <group ref={group}>
      <Float speed={1.2} floatIntensity={0.8}>
        <mesh>
          <torusKnotGeometry args={[1.1, 0.28, 180, 24]} />
          <MeshDistortMaterial
            color="#6366f1"
            emissive="#4338ca"
            emissiveIntensity={0.5}
            roughness={0.15}
            metalness={0.85}
            distort={0.35}
            speed={2.5}
          />
        </mesh>
      </Float>
      <Text
        position={[0, -2.1, 0]}
        fontSize={0.42}
        color="#e0e7ff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.08}
      >
        SCHOLARNET
      </Text>
    </group>
  );
}

function ParticleRing() {
  const points = useRef<THREE.Points>(null);
  const count = 420;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = 4 + Math.random() * 3;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }

  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.y = state.clock.elapsedTime * 0.04;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#a5b4fc"
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export function BackgroundScene({ variant }: BackgroundSceneProps) {
  const density = variant === "dashboard" ? 1200 : 2200;
  const fogNear = variant === "hero" ? 8 : 10;

  return (
    <>
      <color attach="background" args={["#020617"]} />
      <fog attach="fog" args={["#020617", fogNear, 22]} />
      <ambientLight intensity={0.45} />
      <pointLight position={[6, 6, 6]} intensity={1.4} color="#818cf8" />
      <pointLight position={[-5, -3, 4]} intensity={0.9} color="#22d3ee" />
      <spotLight
        position={[0, 8, 2]}
        angle={0.45}
        penumbra={0.8}
        intensity={1.2}
        color="#c4b5fd"
      />

      <Stars
        radius={80}
        depth={40}
        count={density}
        factor={3.5}
        saturation={0.25}
        fade
        speed={0.6}
      />
      <ParticleRing />
      <CameraRig />

      {variant === "hero" && <HeroCore />}

      <FloatingShape
        position={[-3.8, 1.4, -2]}
        color="#38bdf8"
        geometry="icosa"
      />
      <FloatingShape
        position={[3.6, -0.8, -1.5]}
        color="#a78bfa"
        geometry="octa"
        speed={1.2}
      />
      <FloatingShape
        position={[-2.2, -1.8, 1]}
        color="#34d399"
        geometry="box"
        distort={0.1}
      />
      <FloatingShape
        position={[2.8, 2.1, -3]}
        color="#f472b6"
        geometry="torus"
      />
      {variant !== "dashboard" && (
        <>
          <FloatingShape
            position={[-4.5, -0.5, -4]}
            color="#fbbf24"
            geometry="icosa"
            speed={0.8}
          />
          <FloatingShape
            position={[4.2, 0.6, -3.5]}
            color="#60a5fa"
            geometry="box"
          />
        </>
      )}
    </>
  );
}
