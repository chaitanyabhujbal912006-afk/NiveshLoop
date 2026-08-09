"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface PageTurnWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps a page/section with the page-turn animation on mount.
 * Diagonal 3D fold/curl — see docs/DESIGN_SYSTEM.md "THE PAGE TURN".
 */
export function PageTurnWrapper({ children, className = "" }: PageTurnWrapperProps) {
  return (
    <motion.div
      className={className}
      initial={{ rotateY: 20, opacity: 0, skewY: 2 }}
      animate={{ rotateY: 0, opacity: 1, skewY: 0 }}
      exit={{ rotateY: -20, opacity: 0, skewY: -2 }}
      transition={{
        duration: 0.28,
        ease: [0.4, 0, 0.2, 1],
      }}
      style={{ transformStyle: "preserve-3d", perspective: 1200 }}
    >
      {children}
    </motion.div>
  );
}
