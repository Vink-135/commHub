import React, { useRef, useId, useEffect } from 'react';
import { animate, useMotionValue } from 'framer-motion';

export default function AnimatedBackground() {
    const id = useId().replace(/:/g, "");
    const instanceId = `shadow-${id}`;
    const feColorMatrixRef = useRef(null);
    const hueRotateMotionValue = useMotionValue(180);
    const hueRotateAnimation = useRef(null);

    useEffect(() => {
        if (feColorMatrixRef.current) {
            if (hueRotateAnimation.current) {
                hueRotateAnimation.current.stop();
            }
            hueRotateMotionValue.set(0);
            hueRotateAnimation.current = animate(hueRotateMotionValue, 360, {
                duration: 40,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear",
                onUpdate: (value) => {
                    if (feColorMatrixRef.current) {
                        feColorMatrixRef.current.setAttribute("values", String(value));
                    }
                }
            });

            return () => {
                if (hueRotateAnimation.current) {
                    hueRotateAnimation.current.stop();
                }
            };
        }
    }, [hueRotateMotionValue]);

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            zIndex: -1,
            overflow: "hidden",
            pointerEvents: "none"
        }}>
            <div style={{
                position: "absolute",
                inset: -100,
                filter: `url(#${instanceId}) blur(4px)`
            }}>
                <svg style={{ position: "absolute" }}>
                    <defs>
                        <filter id={instanceId}>
                            <feTurbulence
                                result="undulation"
                                numOctaves="2"
                                baseFrequency="0.0005,0.002"
                                seed="0"
                                type="turbulence"
                            />
                            <feColorMatrix
                                ref={feColorMatrixRef}
                                in="undulation"
                                type="hueRotate"
                                values="180"
                            />
                            <feColorMatrix
                                in="dist"
                                result="circulation"
                                type="matrix"
                                values="4 0 0 0 1  4 0 0 0 1  4 0 0 0 1  1 0 0 0 0"
                            />
                            <feDisplacementMap
                                in="SourceGraphic"
                                in2="circulation"
                                scale="100"
                                result="dist"
                            />
                            <feDisplacementMap
                                in="dist"
                                in2="undulation"
                                scale="100"
                                result="output"
                            />
                        </filter>
                    </defs>
                </svg>
                <div style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
                    maskImage: `url('https://framerusercontent.com/images/ceBGguIpUU8luwByxuQz79t7To.png')`,
                    maskSize: 'cover',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center',
                    width: '100%',
                    height: '100%',
                    opacity: 0.15
                }} />
            </div>

            {/* Noise overlay */}
            <div style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url("https://framerusercontent.com/images/g0QcWrxr87K0ufOxIUFBakwYA8.png")`,
                backgroundSize: 240,
                backgroundRepeat: "repeat",
                opacity: 0.5
            }} />
        </div>
    );
}
