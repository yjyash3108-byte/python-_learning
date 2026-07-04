"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, Sphere } from "@react-three/drei";
import * as THREE from "three";

function latLngToVector3(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

const NODES = [
  { lat: 40, lng: -74 },
  { lat: 51, lng: -0.1 },
  { lat: 28, lng: 77 },
  { lat: 35, lng: 139 },
  { lat: -33, lng: 151 },
  { lat: -23, lng: -46 },
  { lat: 1, lng: 103 },
  { lat: 48, lng: 2 },
];

function ConnectionLines() {
  const pairs = useMemo(() => {
    const lines: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < NODES.length; i++) {
      for (let j = i + 1; j < NODES.length; j++) {
        if ((i + j) % 3 === 0) {
          lines.push([
            latLngToVector3(NODES[i].lat, NODES[i].lng, 2.02),
            latLngToVector3(NODES[j].lat, NODES[j].lng, 2.02),
          ]);
        }
      }
    }
    return lines;
  }, []);

  return (
    <>
      {pairs.map(([a, b], i) => (
        <Line key={i} points={[a, b]} color="#22d3ee" transparent opacity={0.35} lineWidth={1} />
      ))}
    </>
  );
}

function GlobeMesh() {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * 0.12;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      state.pointer.y * 0.15,
      0.05
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      state.pointer.x * 0.08,
      0.05
    );
  });

  return (
    <group ref={group}>
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial
          color="#1e1b4b"
          emissive="#312e81"
          emissiveIntensity={0.35}
          roughness={0.4}
          metalness={0.6}
          wireframe={false}
        />
      </Sphere>
      <Sphere args={[2.02, 32, 32]}>
        <meshBasicMaterial color="#6366f1" wireframe transparent opacity={0.12} />
      </Sphere>
      {NODES.map((node, i) => {
        const pos = latLngToVector3(node.lat, node.lng, 2.05);
        return (
          <mesh key={i} position={pos}>
            <sphereGeometry args={[0.04, 16, 16]} />
            <meshStandardMaterial color="#22d3ee" emissive="#06b6d4" emissiveIntensity={2} />
          </mesh>
        );
      })}
      <ConnectionLines />
    </group>
  );
}

function FloatingCards() {
  const cards = [
    { pos: [3.2, 0.8, 0] as [number, number, number], color: "#6366f1" },
    { pos: [-3, -0.5, 0.5] as [number, number, number], color: "#a855f7" },
    { pos: [0.5, 2.5, -1] as [number, number, number], color: "#22d3ee" },
  ];

  return cards.map((c, i) => (
    <Float key={i} speed={1.5} floatIntensity={1.2}>
      <mesh position={c.pos} rotation={[0.2, 0.4, 0.1]}>
        <boxGeometry args={[0.9, 0.55, 0.04]} />
        <meshStandardMaterial color={c.color} emissive={c.color} emissiveIntensity={0.4} metalness={0.8} roughness={0.2} />
      </mesh>
    </Float>
  ));
}

function Particles() {
  const count = 200;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 14;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#818cf8" transparent opacity={0.7} sizeAttenuation depthWrite={false} />
    </points>
  );
}

export function HeroGlobe() {
  return (
    <div className="absolute inset-0 h-full w-full">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#818cf8" />
        <pointLight position={[-8, -4, 6]} intensity={0.8} color="#22d3ee" />
        <GlobeMesh />
        <FloatingCards />
        <Particles />
      </Canvas>
    </div>
  );
}
