'use client';

import { useEffect, useRef } from 'react';

export default function InteractiveBackground() {
    const blobsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!blobsRef.current) return;
            const { clientX, clientY } = e;
            const x = clientX / window.innerWidth;
            const y = clientY / window.innerHeight;

            // Move blobs subtly opposite to mouse for depth
            const blobs = blobsRef.current.children;

            // Blob 1 (Emerald)
            (blobs[0] as HTMLElement).style.transform = `translate(${x * -40}px, ${y * -40}px)`;

            // Blob 2 (Indigo)
            (blobs[1] as HTMLElement).style.transform = `translate(${x * 40}px, ${y * 40}px)`;

            // Blob 3 (Cyan)
            (blobs[2] as HTMLElement).style.transform = `translate(${x * -20}px, ${y * 60}px)`;
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
            {/* Ambient Lighting Layer */}
            <div className="absolute inset-0 bg-[#050505] opacity-90" />

            {/* Liquid Blob Container */}
            <div ref={blobsRef} className="absolute inset-0 opacity-40 transition-transform duration-[2000ms] ease-out will-change-transform">
                {/* Blob 1: Emerald/Green (Top Left) */}
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-r from-emerald-600 to-green-500 rounded-full blur-[100px] animate-pulse mix-blend-screen"
                    style={{ animationDuration: '8s' }} />

                {/* Blob 2: Indigo/Purple (Bottom Right) */}
                <div className="absolute bottom-[-10%] right-[-5%] w-[700px] h-[700px] bg-gradient-to-l from-indigo-600 to-purple-800 rounded-full blur-[120px] animate-pulse mix-blend-screen"
                    style={{ animationDuration: '10s' }} />

                {/* Blob 3: Cyan/Teal (Center-ish, floating) */}
                <div className="absolute top-[30%] left-[30%] w-[500px] h-[500px] bg-gradient-to-tr from-cyan-600 to-teal-800 rounded-full blur-[90px] animate-float opacity-70 mix-blend-screen" />
            </div>

            {/* Noise/Grain Overlay for texture */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
        </div>
    );
}
