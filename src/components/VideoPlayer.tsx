import React, { useState, useEffect } from 'react';
import { resolveMediaUrl } from '../utils/mediaStorage';
import { Play, Film } from 'lucide-react';

interface VideoPlayerProps {
  src?: string;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  poster?: string;
  onEnded?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  className = '',
  autoPlay = false,
  controls = true,
  muted = false,
  loop = false,
  poster,
  onEnded,
}) => {
  const [resolvedSrc, setResolvedSrc] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (!src) {
      setResolvedSrc('');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    resolveMediaUrl(src)
      .then((url) => {
        if (isMounted) {
          setResolvedSrc(url);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error resolving video URL:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [src]);

  if (!src) return null;

  // Check if it's an external embed (YouTube / Vimeo)
  const isYouTube = src.includes('youtube.com') || src.includes('youtu.be');
  const isVimeo = src.includes('vimeo.com');

  if (isYouTube) {
    let embedUrl = src;
    if (src.includes('watch?v=')) {
      const vidId = src.split('watch?v=')[1]?.split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${vidId}?autoplay=${autoPlay ? 1 : 0}&mute=${muted ? 1 : 0}`;
    } else if (src.includes('youtu.be/')) {
      const vidId = src.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${vidId}?autoplay=${autoPlay ? 1 : 0}&mute=${muted ? 1 : 0}`;
    }
    return (
      <div className={`relative aspect-video rounded-2xl overflow-hidden bg-black ${className}`}>
        <iframe
          src={embedUrl}
          title="Video del producto"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  if (isVimeo) {
    const vimeoId = src.split('vimeo.com/')[1]?.split('?')[0];
    const embedUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=${autoPlay ? 1 : 0}&muted=${muted ? 1 : 0}`;
    return (
      <div className={`relative aspect-video rounded-2xl overflow-hidden bg-black ${className}`}>
        <iframe
          src={embedUrl}
          title="Video del producto"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`aspect-video rounded-2xl bg-slate-900 flex items-center justify-center text-slate-400 ${className}`}>
        <div className="flex items-center gap-2 text-xs">
          <Film className="w-4 h-4 animate-spin text-blue-500" />
          <span>Cargando video...</span>
        </div>
      </div>
    );
  }

  if (error || !resolvedSrc) {
    return (
      <div className={`aspect-video rounded-2xl bg-slate-900 flex items-center justify-center text-slate-400 ${className}`}>
        <div className="text-xs text-center p-4">
          <p className="text-red-400 font-semibold mb-1">No se pudo reproducir el video</p>
          <p className="text-slate-500 text-[11px]">Verificá el formato del archivo o enlace.</p>
        </div>
      </div>
    );
  }

  return (
    <video
      src={resolvedSrc}
      controls={controls}
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      poster={poster}
      onEnded={onEnded}
      playsInline
      className={`w-full h-full object-contain bg-black rounded-2xl ${className}`}
    >
      Tu navegador no soporta la reproducción de video HTML5.
    </video>
  );
};
