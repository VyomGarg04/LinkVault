'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    opacity: number;
}

export default function DataFlowBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const nodesRef = useRef<Node[]>([]);
    const animationFrameRef = useRef<number>(0);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    const NODE_COUNT = 50;
    const CONNECTION_DISTANCE = 150;
    const MOUSE_INFLUENCE_DISTANCE = 200;

    const initNodes = useCallback((width: number, height: number) => {
        const nodes: Node[] = [];
        for (let i = 0; i < NODE_COUNT; i++) {
            nodes.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.3, // Slow, calm motion
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 2 + 1,
                opacity: Math.random() * 0.4 + 0.2,
            });
        }
        nodesRef.current = nodes;
    }, []);

    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const nodes = nodesRef.current;

        // Clear with gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(0.5, '#021a0f');
        gradient.addColorStop(1, '#041f14');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Update nodes
        nodes.forEach(node => {
            // Mouse influence - subtle attraction
            const dx = mouseRef.current.x - node.x;
            const dy = mouseRef.current.y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MOUSE_INFLUENCE_DISTANCE && dist > 0) {
                const force = (MOUSE_INFLUENCE_DISTANCE - dist) / MOUSE_INFLUENCE_DISTANCE * 0.01;
                node.vx += (dx / dist) * force;
                node.vy += (dy / dist) * force;
            }

            // Apply velocity with damping
            node.x += node.vx;
            node.y += node.vy;
            node.vx *= 0.99;
            node.vy *= 0.99;

            // Bounce off edges softly
            if (node.x < 0) { node.x = 0; node.vx *= -0.5; }
            if (node.x > width) { node.x = width; node.vx *= -0.5; }
            if (node.y < 0) { node.y = 0; node.vy *= -0.5; }
            if (node.y > height) { node.y = height; node.vy *= -0.5; }

            // Add slight random drift
            node.vx += (Math.random() - 0.5) * 0.02;
            node.vy += (Math.random() - 0.5) * 0.02;
        });

        // Draw connections
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONNECTION_DISTANCE) {
                    const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);

                    // Gradient line from node to node
                    const lineGradient = ctx.createLinearGradient(
                        nodes[i].x, nodes[i].y,
                        nodes[j].x, nodes[j].y
                    );
                    lineGradient.addColorStop(0, `rgba(74, 222, 128, ${opacity})`); // green-400
                    lineGradient.addColorStop(0.5, `rgba(148, 163, 184, ${opacity * 0.5})`); // slate-400
                    lineGradient.addColorStop(1, `rgba(74, 222, 128, ${opacity})`);

                    ctx.strokeStyle = lineGradient;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        // Draw nodes
        nodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

            // Soft glow effect
            const nodeGradient = ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, node.radius * 3
            );
            nodeGradient.addColorStop(0, `rgba(74, 222, 128, ${node.opacity})`);
            nodeGradient.addColorStop(0.5, `rgba(74, 222, 128, ${node.opacity * 0.3})`);
            nodeGradient.addColorStop(1, 'rgba(74, 222, 128, 0)');

            ctx.fillStyle = nodeGradient;
            ctx.fill();

            // Core of the node
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${node.opacity * 0.8})`;
            ctx.fill();
        });

        animationFrameRef.current = requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initNodes(canvas.width, canvas.height);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000 };
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseleave', handleMouseLeave);

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, [initNodes, animate]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to bottom, #000000, #021a0f, #041f14)' }}
        />
    );
}
