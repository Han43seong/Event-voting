import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Stars } from '@react-three/drei';

function TorusKnot() {
    const meshRef = useRef(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.2;
            meshRef.current.rotation.y += delta * 0.3;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef} scale={1.5}>
                <torusKnotGeometry args={[1, 0.3, 128, 32]} />
                <meshStandardMaterial
                    color="#F0F0F0"
                    wireframe
                    emissive="#F0F0F0"
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.3}
                />
            </mesh>
        </Float>
    );
}

export default function Background3D() {
    return (
        <div className="fixed inset-0 -z-10 bg-ol-base">
            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <TorusKnot />
                <Environment preset="city" />
            </Canvas>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ol-base/50 to-ol-base pointer-events-none" />
        </div>
    );
}
