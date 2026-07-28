"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandMark({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/app-icon.png"
      alt="E-Hinga"
      width={size}
      height={size}
      className={cn("rounded-[22%] object-contain", className)}
      draggable={false}
    />
  );
}

export function BrandLogo({
  className,
  priority,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/ehinga-logo.png"
      alt="E-Hinga Smart Farms"
      width={814}
      height={370}
      priority={priority}
      className={cn("h-auto w-full object-contain", className)}
    />
  );
}
