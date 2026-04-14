import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { io } from 'socket.io-client';
import { useData } from '../context/DataContext';
import RotatingEarth from './ui/wireframe-dotted-globe';

const socket = io('http://localhost:5000');

export default function InteractiveBackground({ isDark }: { isDark: boolean }) {
  const mountRef = useRef<HTMLCanvasElement>(null);
  const { industryData, transportData } = useData();
  const dataRef = useRef({ industry: null, transport: null });
  const [threatState, setThreatState] = useState('LOW');

  useEffect(() => {
    dataRef.current = { industry: industryData, transport: transportData };
  }, [industryData, transportData]);

  useEffect(() => {
    socket.on('threat_level', (level: string) => setThreatState(level));
    socket.on('simulate_breach', () => {
        setThreatState('CRITICAL');
        setTimeout(() => { setThreatState('LOW'); }, 5000);
    });
    return () => {
        socket.off('threat_level');
        socket.off('simulate_breach');
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const canvas = mountRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(isDark ? 0x050510 : 0xf0f4f8, 0.015);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 60);
    camera.lookAt(0, 0, 0);

    const group = new THREE.Group();
    scene.add(group);

    // Orbital Rings
    const createRing = (radius: number, color: number, opacity: number) => {
        const ringGeo = new THREE.RingGeometry(radius, radius + 0.1, 128);
        const ringMat = new THREE.MeshBasicMaterial({ 
            color, transparent: true, opacity, side: THREE.DoubleSide, blending: THREE.AdditiveBlending 
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        return ring;
    };
    const industryRing = createRing(18, 0x10b981, 0.2);
    const transportRing = createRing(28, 0xf59e0b, 0.2);
    group.add(industryRing);
    group.add(transportRing);

    // Industry Node (Inner Planet)
    const industryGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const industryNode = new THREE.Mesh(industryGeo, new THREE.MeshStandardMaterial({
        color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 1, roughness: 0.4
    }));
    const indPivot = new THREE.Group();
    industryNode.position.set(18, 0, 0);
    indPivot.add(industryNode);
    group.add(indPivot);

    // Transport Node (Outer Planet)
    const transportGeo = new THREE.SphereGeometry(1.5, 32, 32);
    const transportNode = new THREE.Mesh(transportGeo, new THREE.MeshStandardMaterial({
        color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 1.2, roughness: 0.3
    }));
    const traPivot = new THREE.Group();
    transportNode.position.set(-28, 0, 0);
    traPivot.add(transportNode);
    group.add(traPivot);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x3b82f6, 500, 100);
    scene.add(pointLight);

    // Cinematic Particle Field (Stardust)
    const partGeo = new THREE.BufferGeometry();
    const pCount = 3000;
    const pArr = new Float32Array(pCount * 3);
    const sizeArr = new Float32Array(pCount);
    for(let i=0; i<pCount; i++) { 
        pArr[i*3] = (Math.random() - 0.5) * 200; 
        pArr[i*3+1] = (Math.random() - 0.5) * 100; 
        pArr[i*3+2] = (Math.random() - 0.5) * 200;
        sizeArr[i] = Math.random() * 2;
    }
    partGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
    partGeo.setAttribute('size', new THREE.BufferAttribute(sizeArr, 1));
    const pMat = new THREE.PointsMaterial({
        size: 0.4,
        color: isDark ? 0x94a3b8 : 0x64748b,
        transparent: true,
        opacity: isDark ? 0.6 : 0.3,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    const pMesh = new THREE.Points(partGeo, pMat);
    scene.add(pMesh);

    // Interactive Camera movement
    let targetX = 0; let targetY = 0;
    const onMouseMove = (event: MouseEvent) => {
        targetX = (event.clientX - window.innerWidth / 2) * 0.05;
        targetY = (event.clientY - window.innerHeight / 2) * 0.05;
    };
    document.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    const animate = () => {
        const time = clock.getElapsedTime();

        // Parallax Camera
        camera.position.x += (targetX - camera.position.x) * 0.02;
        camera.position.y += (15 + targetY - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);

        pMesh.rotation.y = time * 0.02;
        
        group.rotation.x = Math.PI / 8;
        group.rotation.z = Math.PI / 16;

        indPivot.rotation.y = time * 0.4;
        traPivot.rotation.y = time * 0.25;

        // Visual feedback
        const currentData = dataRef.current;
        if (currentData.industry) {
            industryNode.scale.setScalar(1.0 + Math.sin(time * 5) * 0.15);
            industryRing.material.opacity = 0.2 +  Math.sin(time * 2) * 0.3;
        }
        if (currentData.transport) {
            transportNode.scale.setScalar(1.0 + Math.cos(time * 4) * 0.1);
            transportRing.material.opacity = 0.2 +  Math.sin(time * 3) * 0.3;
        }

        renderer.render(scene, camera);
        animationFrameId = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
        window.cancelAnimationFrame(animationFrameId);
        document.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
    };
  }, [isDark]);

  return (
    <div className="fixed top-0 left-0 w-screen h-screen -z-10 bg-slate-50 dark:bg-[#020617] pointer-events-none overflow-hidden flex items-center justify-center">
        {/* The New Rotating Globe as the "KING" Hub */}
        <div className={`absolute transition-all duration-1000 ${threatState === 'CRITICAL' ? 'scale-125' : 'scale-100'}`}>
            <RotatingEarth 
                width={700} 
                height={700} 
                className={`opacity-80 transition-filter duration-500 ${threatState === 'CRITICAL' ? 'blur-[2px] brightness-150' : ''}`} 
            />
            {/* Energy Hub Glow Overlay */}
            <div className={`absolute inset-0 rounded-full blur-[100px] transition-colors duration-500 ${threatState === 'CRITICAL' ? 'bg-rose-500/40' : 'bg-blue-500/20'}`} />
        </div>

        <canvas ref={mountRef} className="absolute inset-0 w-full h-full" />
        
        {/* Global Cinematic Overlay */}
        <div className={`absolute inset-0 transition-colors duration-1000 bg-gradient-to-b from-transparent via-transparent to-[#020617]/90 ${threatState === 'CRITICAL' ? 'bg-rose-950/20' : ''}`} />
        
        {/* Vignette */}
        <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.5)] pointer-events-none" />
    </div>
  );
}
