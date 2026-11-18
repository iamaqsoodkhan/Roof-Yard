import React, { useState } from 'react';
import { Utensils } from 'lucide-react';

interface LazyWebpImageProps {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  priority?: boolean;
}

export const LazyWebpImage: React.FC<LazyWebpImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  wrapperClassName = 'relative w-full h-full overflow-hidden',
  priority = false,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div className={wrapperClassName}>
      {!loaded && !errored && (
        <div
          aria-hidden="true"
          className="absolute inset-0 skeleton-shimmer"
        />
      )}

      {errored ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-red-100 to-rose-200 dark:from-red-950/60 dark:to-black text-red-700 dark:text-red-300 p-3 text-center">
          <Utensils className="w-6 h-6 opacity-75" />
          <span className="text-xs font-medium line-clamp-2">{alt}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={`${className} transition-opacity duration-500 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
};
