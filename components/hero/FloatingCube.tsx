"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface FloatingCubeProps {
  size?: number; // Size in pixels
  className?: string; // Positioning & visibility
  initialRotation?: { x: number; y: number; z: number };
  rotateDuration?: number; // Duration of slow 3D rotation in seconds
  floatDuration?: number; // Duration of vertical float in seconds
  floatOffset?: number; // Float amplitude in px
  delay?: number; // Entrance delay
  reverse?: boolean; // Invert rotation direction
}

export default function FloatingCube({
  size = 64,
  className = "",
  initialRotation = { x: 22, y: 35, z: 0 },
  rotateDuration = 18,
  floatDuration = 7,
  floatOffset = 10,
  delay = 0.15,
  reverse = false,
}: FloatingCubeProps) {
  const shouldReduceMotion = useReducedMotion();
  const half = size / 2;

  // Keyframes for continuous 3D rotation (lightweight, GPU-friendly)
  const rotationVariants = {
    animate: {
      rotateX: reverse
        ? [initialRotation.x, initialRotation.x - 360]
        : [initialRotation.x, initialRotation.x + 360],
      rotateY: reverse
        ? [initialRotation.y, initialRotation.y - 360]
        : [initialRotation.y, initialRotation.y + 360],
      rotateZ: initialRotation.z,
      transition: {
        duration: rotateDuration,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  // Gentle floating animation
  const floatVariants = {
    animate: {
      y: [0, -floatOffset, 0],
      transition: {
        duration: floatDuration,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={{ perspective: "800px" }}
    >
      {/* 1. Entrance & Floating Wrapper */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay, ease: "easeOut" }}
        style={{
          width: size,
          height: size,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        <motion.div
          variants={shouldReduceMotion ? undefined : floatVariants}
          animate={shouldReduceMotion ? undefined : "animate"}
          style={{
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          {/* 2. Continuous 3D Rotation Container */}
          <motion.div
            variants={shouldReduceMotion ? undefined : rotationVariants}
            animate={shouldReduceMotion ? undefined : "animate"}
            initial={{
              rotateX: initialRotation.x,
              rotateY: initialRotation.y,
              rotateZ: initialRotation.z,
            }}
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            {/* Soft ground shadow (pure CSS, no blur filter) */}
            <div
              className="absolute rounded-full bg-indigo-950/10 pointer-events-none"
              style={{
                width: size * 0.85,
                height: size * 0.3,
                bottom: -size * 0.35,
                left: "7.5%",
                transform: "rotateX(90deg) translateZ(-15px)",
                filter: "blur(4px)",
              }}
            />

            {/* 
              CUBE FACES:
              Styled using a luminous, light version of the MockMate logo gradient
              (from-indigo-600 to-purple-600) -> (indigo-100 to purple-100)
              with crisp indigo-purple borders and zero backdrop-blur for 60fps performance!
            */}

            {/* FRONT FACE */}
            <div
              className="absolute inset-0 rounded-lg border border-indigo-300/80 bg-gradient-to-br from-indigo-100/95 via-white/90 to-purple-100/90 shadow-[inset_0_1px_2px_rgba(255,255,255,0.9)]"
              style={{
                transform: `translateZ(${half}px)`,
                backfaceVisibility: "visible",
              }}
            >
              {/* Logo-colored technical corner node */}
              <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 opacity-80" />
            </div>

            {/* BACK FACE */}
            <div
              className="absolute inset-0 rounded-lg border border-indigo-200/70 bg-gradient-to-br from-purple-100/90 to-indigo-100/85"
              style={{
                transform: `rotateY(180deg) translateZ(${half}px)`,
                backfaceVisibility: "visible",
              }}
            />

            {/* RIGHT FACE */}
            <div
              className="absolute inset-0 rounded-lg border border-purple-300/80 bg-gradient-to-br from-purple-100/95 via-indigo-50/90 to-purple-200/85 shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]"
              style={{
                transform: `rotateY(90deg) translateZ(${half}px)`,
                backfaceVisibility: "visible",
              }}
            />

            {/* LEFT FACE */}
            <div
              className="absolute inset-0 rounded-lg border border-indigo-300/75 bg-gradient-to-br from-indigo-100/90 to-indigo-200/80"
              style={{
                transform: `rotateY(-90deg) translateZ(${half}px)`,
                backfaceVisibility: "visible",
              }}
            />

            {/* TOP FACE (Highlights the cube with crisp light) */}
            <div
              className="absolute inset-0 rounded-lg border border-indigo-300/90 bg-gradient-to-br from-white via-indigo-50/95 to-purple-50/90 shadow-[inset_0_1px_3px_rgba(255,255,255,1)]"
              style={{
                transform: `rotateX(90deg) translateZ(${half}px)`,
                backfaceVisibility: "visible",
              }}
            >
              <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 opacity-80" />
            </div>

            {/* BOTTOM FACE */}
            <div
              className="absolute inset-0 rounded-lg border border-indigo-400/60 bg-gradient-to-br from-indigo-200/90 to-purple-200/85"
              style={{
                transform: `rotateX(-90deg) translateZ(${half}px)`,
                backfaceVisibility: "visible",
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
