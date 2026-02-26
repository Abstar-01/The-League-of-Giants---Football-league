"use client";

import Image from "next/image";
import { useState } from "react";

interface LeagueImageProps {
  src: string;
  alt: string;
  leagueName: string;
  priority?: boolean;
}

export default function LeagueImage({ src, alt, leagueName, priority = false }: LeagueImageProps) {
  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  if (hasError) {
    return (
      <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
        <span className="text-4xl font-bold text-blue-600">
          {leagueName.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-32 h-32">
      <Image
        src={imgSrc}
        alt={alt}
        fill
        sizes="(max-width: 768px) 128px, 128px"
        className="object-contain"
        priority={priority}
        onError={() => setHasError(true)}
      />
    </div>
  );
}