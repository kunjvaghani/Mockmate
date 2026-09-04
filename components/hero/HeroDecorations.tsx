"use client";

import React from "react";
import FloatingCube from "./FloatingCube";

export default function HeroDecorations() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none"
    >
      {/* 1. Subtle, lightweight ambient atmospheric gradients */}
      <div className="absolute top-0 left-1/4 w-[450px] h-[450px] bg-gradient-to-br from-indigo-100/35 via-purple-100/20 to-transparent rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-purple-100/25 via-indigo-50/15 to-transparent rounded-full blur-3xl" />

      {/* 2. Technical Precision Dot Grid with center radial fade mask */}
      <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.10] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_45%,#000_20%,transparent_100%)]" />

      {/* 3. Floating 3D Cubes Layer: Center headline background cube + 4 side cubes */}
      <div className="relative w-full h-full max-w-7xl mx-auto">
        {/* ================= CENTER HEADLINE BACKGROUND CUBE ================= */}
        {/* Larger 3D Cube (100px) floating directly behind the main headline */}
        <FloatingCube
          size={100}
          className="absolute top-[10%] sm:top-[9%] lg:top-[35%] left-1/2 -translate-x-1/2 opacity-55"
          initialRotation={{ x: 50, y: -35, z: 10 }}
          rotateDuration={22}
          floatDuration={9}
          floatOffset={12}
          delay={0.05}
          reverse={false}
        />

        {/* ================= LEFT SIDE CUBES ================= */}

        {/* Cube 1: Upper-Left (64px, visible from md up) */}
        <FloatingCube
          size={64}
          className="absolute top-[8%] left-[2%] md:left-[3%] lg:left-[5%] xl:left-[6%] hidden sm:block"
          initialRotation={{ x: 22, y: 35, z: 0 }}
          rotateDuration={18}
          floatDuration={6.5}
          floatOffset={10}
          delay={0.1}
          reverse={false}
        />

        {/* Cube 2: Mid-Lower Left (50px, visible from md up) */}
        <FloatingCube
          size={50}
          className="absolute top-[52%] left-[1%] md:left-[2%] lg:left-[4%] xl:left-[5%] hidden md:block"
          initialRotation={{ x: -18, y: 45, z: 12 }}
          rotateDuration={15}
          floatDuration={8}
          floatOffset={8}
          delay={0.3}
          reverse={true}
        />

        {/* ================= RIGHT SIDE CUBES ================= */}

        {/* Cube 3: Upper-Right (60px, visible from md up) */}
        <FloatingCube
          size={60}
          className="absolute top-[12%] right-[2%] md:right-[3%] lg:right-[5%] xl:right-[6%] hidden sm:block"
          initialRotation={{ x: -20, y: -30, z: 10 }}
          rotateDuration={17}
          floatDuration={7.5}
          floatOffset={11}
          delay={0.2}
          reverse={true}
        />

        {/* Cube 4: Mid-Lower Right (52px, visible from md up) */}
        <FloatingCube
          size={52}
          className="absolute top-[56%] right-[1%] md:right-[2%] lg:right-[4%] xl:right-[4%] hidden md:block"
          initialRotation={{ x: 28, y: -40, z: -10 }}
          rotateDuration={20}
          floatDuration={8.5}
          floatOffset={9}
          delay={0.4}
          reverse={false}
        />
      </div>
    </div>
  );
}
