"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
  once?: boolean;
}

const hiddenVariants = {
  up: { opacity: 0, y: 24 },
  down: { opacity: 0, y: -24 },
  left: { opacity: 0, x: -24 },
  right: { opacity: 0, x: 24 },
};

const visibleVariant = { opacity: 1, y: 0, x: 0 };

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  duration = 0.55,
  once = true,
}: ScrollRevealProps) {
  return (
    <motion.div
      initial={hiddenVariants[direction]}
      whileInView={visibleVariant}
      viewport={{ once, margin: "-50px 0px" }}
      transition={{ duration, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
