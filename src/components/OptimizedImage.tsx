import React, { useEffect, useMemo, useState } from "react";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK_SRC = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=60";

function getImageCandidates(src?: string, fallbackSrc = DEFAULT_FALLBACK_SRC): string[] {
  const fallback = fallbackSrc || DEFAULT_FALLBACK_SRC;

  if (!src) {
    return [fallback];
  }

  const trimmed = src.trim();
  if (!trimmed) {
    return [fallback];
  }

  const lower = trimmed.toLowerCase();

  if (lower.startsWith("data:")) {
    return [trimmed, fallback];
  }

  if (/\.(png|jpe?g|webp|gif|svg|avif)(\?.*)?$/i.test(trimmed)) {
    return [trimmed, fallback];
  }

  const imgBbMatch = trimmed.match(/https?:\/\/(?:www\.)?(?:i\.)?(?:ibb\.co|imgbb\.com)\/([^/?#]+)/i);
  if (imgBbMatch?.[1]) {
    const id = imgBbMatch[1];
    const base = `https://i.ibb.co/${id}`;
    return [trimmed, `${base}.jpg`, `${base}.jpeg`, `${base}.png`, `${base}.webp`, fallback].filter((value, index, arr) => arr.indexOf(value) === index);
  }

  return [trimmed, fallback];
}

export default function OptimizedImage({ src, fallbackSrc, alt, onError, ...props }: OptimizedImageProps) {
  const candidates = useMemo(() => getImageCandidates(src, fallbackSrc), [src, fallbackSrc]);
  const [attemptIndex, setAttemptIndex] = useState(0);

  useEffect(() => {
    setAttemptIndex(0);
  }, [src, fallbackSrc]);

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (attemptIndex < candidates.length - 1) {
      setAttemptIndex((prev) => prev + 1);
      return;
    }

    onError?.(event);
  };

  return <img {...props} src={candidates[attemptIndex]} alt={alt} onError={handleError} />;
}
