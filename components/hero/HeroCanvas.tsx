"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { buildHeightMap, LOGO_H, TEX_H } from "./heightMap";
import { vertexShader, fragmentShader } from "./surfaceShader";
import type { LightState } from "./lightState";

type HeightMap = Awaited<ReturnType<typeof buildHeightMap>>;

function Surface({ light, map }: { light: RefObject<LightState>; map: HeightMap }) {
  const size = useThree((s) => s.size);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uPixel: { value: 0.001 },
      uLight: { value: new THREE.Vector2(0.5, 0.5) },
      uIntensity: { value: 0 },
      uLogo: { value: map.texture },
      uTexAspect: { value: map.aspect },
      uTexScale: { value: TEX_H / LOGO_H },
    }),
    [map]
  );

  const material = useRef<THREE.ShaderMaterial>(null);

  useFrame((_, delta) => {
    // Write through the live material: R3F may not keep our `uniforms` object identity.
    const u = material.current?.uniforms;
    if (!u) return;
    const L = light.current;
    u.uTime.value += delta * L.speed;
    u.uAspect.value = size.width / size.height;
    u.uPixel.value = 1 / size.height;
    u.uLight.value.set(L.x, L.y);
    u.uIntensity.value = L.intensity;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

export default function HeroCanvas({ light }: { light: RefObject<LightState> }) {
  const [map, setMap] = useState<HeightMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    buildHeightMap("/letter-b.svg").then((m) => {
      if (cancelled) m.texture.dispose();
      else setMap(m);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => () => map?.texture.dispose(), [map]);

  return (
    <div className="hero__canvas" aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
        flat
        linear
        onCreated={(state) => {
          (window as unknown as { __r3f: unknown }).__r3f = state; // TEMP debug
        }}
      >
        <color attach="background" args={["#000"]} />
        {map && <Surface light={light} map={map} />}
      </Canvas>
    </div>
  );
}
