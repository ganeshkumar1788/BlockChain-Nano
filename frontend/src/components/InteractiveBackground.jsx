import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { io } from 'socket.io-client';
import { useData } from '../context/DataContext';

const socket = io('http://localhost:5000');

export default function InteractiveBackground({ isDark }) {
  const mountRef = useRef(null);
  const { industryData, transportData } = useData();
  const dataRef = useRef({ industry: null, transport: null });

  useEffect(() => {
    dataRef.current = { industry: industryData, transport: transportData };
  }, [industryData, transportData]);

  useEffect(() => {
    let animationFrameId;
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

    // Threat state binding
    let threatState = 'LOW';
    socket.on('threat_level', (level) => { threatState = level; });
    socket.on('simulate_breach', () => {
        threatState = 'CRITICAL';
        setTimeout(() => { threatState = 'LOW'; }, 5000);
    });

    // --- Cinematic Materials ---
    const glowMaterial = (color) => new THREE.MeshBasicMaterial({ 
        color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending 
    });
    
    // Server Hub Node (The "Sun") - Cinematic Overhaul
    const hubColor = 0x3b82f6;
    const hubNode = new THREE.Mesh(new THREE.SphereGeometry(3, 64, 64), 
        new THREE.MeshStandardMaterial({ 
            color: hubColor, 
            emissive: hubColor, 
            emissiveIntensity: 3, 
            roughness: 0, 
            metalness: 1
        })
    );
    
    // Multi-layered cinematic glow
    const hubGlow1 = new THREE.Mesh(new THREE.SphereGeometry(4, 32, 32), glowMaterial(hubColor));
    hubGlow1.material.opacity = 0.4;
    hubNode.add(hubGlow1);
    
    const hubGlow2 = new THREE.Mesh(new THREE.SphereGeometry(5.5, 32, 32), glowMaterial(hubColor));
    hubGlow2.material.opacity = 0.15;
    hubNode.add(hubGlow2);

    // Plasma Core effect (Inner sphere)
    const plasmaCore = new THREE.Mesh(new THREE.SphereGeometry(2.2, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }));
    hubNode.add(plasmaCore);

    group.add(hubNode);

    // Orbital Rings
    const createRing = (radius, color, opacity) => {
        const ringGeo = new THREE.RingGeometry(radius, radius + 0.05, 128);
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
    industryNode.position.set(18, 0, 0); // initial orbit offset
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
    const pointLight = new THREE.PointLight(hubColor, 500, 100);
    hubNode.add(pointLight);

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
    const onMouseMove = (event) => {
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
        const delta = clock.getDelta();

        // Parallax Camera
        camera.position.x += (targetX - camera.position.x) * 0.02;
        camera.position.y += (15 + targetY - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);

        pMesh.rotation.y = time * 0.02;
        
        // Tilt the solar system slightly for dramatic effect
        group.rotation.x = Math.PI / 8;
        group.rotation.z = Math.PI / 16;

        // Orbit animation
        indPivot.rotation.y = time * 0.4;
        traPivot.rotation.y = time * 0.25;

        // Visual feedback for MQTT data
        const currentData = dataRef.current;
        if (currentData.industry) {
            industryNode.scale.setScalar(1.0 + Math.sin(time * 5) * 0.15);
            industryRing.material.opacity = 0.2 +  Math.sin(time * 2) * 0.3;
        }
        if (currentData.transport) {
            transportNode.scale.setScalar(1.0 + Math.cos(time * 4) * 0.1);
            transportRing.material.opacity = 0.2 +  Math.sin(time * 3) * 0.3;
        }

        // Threat Level Visual Mutations (DDoS/Breach scenario)
        if (threatState === 'CRITICAL' || threatState === 'HIGH') {
            const dangerColor = 0xf43f5e;
            pointLight.color.setHex(dangerColor);
            hubNode.material.color.setHex(dangerColor);
            hubNode.material.emissive.setHex(dangerColor);
            hubNode.scale.setScalar(1.0 + Math.random() * 0.2); // Jitter
            pMesh.material.color.setHex(dangerColor);
            // Red shockwave effect
            hubGlow1.scale.setScalar(1.5 + Math.sin(time * 15) * 0.5);
            hubGlow1.material.opacity = 0.8;
            scene.fog.color.setHex(isDark ? 0x200508 : 0xffeaea);
        } else if (threatState === 'ELEVATED') {
            const warnColor = 0xf59e0b;
            pointLight.color.setHex(warnColor);
            hubNode.material.color.setHex(warnColor);
            hubNode.material.emissive.setHex(warnColor);
            hubNode.scale.setScalar(1.0);
            hubGlow1.scale.setScalar(1.0 + Math.sin(time * 5) * 0.2);
            hubGlow1.material.opacity = 0.5;
            pMesh.material.color.setHex(0xf59e0b);
            scene.fog.color.setHex(isDark ? 0x100a00 : 0xfffcf0);
        } else {
            // Normal State
            pointLight.color.setHex(hubColor);
            hubNode.material.color.setHex(hubColor);
            hubNode.material.emissive.setHex(hubColor);
            hubNode.scale.setScalar(1.0);
            hubGlow1.scale.setScalar(1.0 + Math.sin(time * 2) * 0.1);
            hubGlow1.material.opacity = 0.3;
            pMesh.material.color.setHex(isDark ? 0x94a3b8 : 0x64748b);
            scene.fog.color.setHex(isDark ? 0x050510 : 0xf0f4f8);
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
    <div className="fixed top-0 left-0 w-screen h-screen -z-10 bg-slate-50 dark:bg-[#020617] pointer-events-none">
        <canvas ref={mountRef} className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020617]/40 to-[#020617]/90 mix-blend-multiply opacity-80" />
    </div>
  );
}
