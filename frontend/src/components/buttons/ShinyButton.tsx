"use client";
import { cn } from "@/lib/utils";
import React from "react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import { dropAnimation } from "@/motion/axis";

interface ShinyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  color?: string;
  roundness?: string;
  shineWidth?: string;
}

const ShinyButton: React.FC<ShinyButtonProps> = ({
  children,
  className,
  color = "red",
  roundness = "full",
  shineWidth = "200%",
  ...props
}) => {
  return (
  <motion.div 
  {...dropAnimation}
  transition={{duration: 1, delay: 1.5}}
  className={cn("h-12",className)}

  >
<Button
      size={"shiny"}
      className={`relative inline-flex h-12 overflow-hidden rounded-${roundness} w-full focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50`}
      {...props}
    >
      <span
        className={cn(
          `absolute inset-0 block rounded-${roundness} bg-red-700`,
        )}
      />
      <span
        className={cn(`inline-flex h-full w-full  cursor-pointer items-center justify-center rounded-${roundness} bg-[linear-gradient(to_right,transparent_42%,theme(colors.red.200)_50%,transparent_58%)]
 px-3 py-1 font-bold text-white backdrop-blur-3xl animate-[shine_8s_linear_infinite]`)}
        style={{
          backgroundSize: `${shineWidth} 100%`,
        }}
      >
        {children}
      </span>
    </Button>
  </motion.div>
  );
};

export default ShinyButton;
