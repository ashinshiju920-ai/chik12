import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Film } from 'lucide-react';

interface ProductVideoEmbedProps {
  youtubeUrl?: string;
  videoUrl?: string;
  productName: string;
  productId: string;
  className?: string;
  showTelemetryBadge?: boolean;
}

/**
 * Extracts standard 11-character YouTube video ID from various YouTube URL variants
 */
export function extractYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = cleanUrl.match(regExp);

  return match && match[2].length === 11 ? match[2] : null;
}

export function isDirectVideoUrl(url?: string): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return (
    clean.startsWith('data:video/') ||
    clean.startsWith('blob:') ||
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.ogg') ||
    clean.includes('/video/')
  );
}

export const ProductVideoEmbed: React.FC<ProductVideoEmbedProps> = ({
  youtubeUrl,
  videoUrl,
  productName,
  productId,
  className = ''
}) => {
  const activeUrl = useMemo(() => videoUrl || youtubeUrl || '', [videoUrl, youtubeUrl]);
  const videoId = useMemo(() => extractYouTubeVideoId(activeUrl), [activeUrl]);
  const isDirect = useMemo(() => isDirectVideoUrl(activeUrl), [activeUrl]);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const nativeVideoRef = useRef<HTMLVideoElement>(null);
  
  const [, setPlayerState] = useState<'idle' | 'playing' | 'paused' | 'completed'>('idle');

  useEffect(() => {
    if (!videoId) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        if (typeof event.data === 'string') {
          const data = JSON.parse(event.data);
          if (data.event === 'onStateChange') {
            const stateCode = data.info;
            
            if (stateCode === 1) {
              setPlayerState('playing');
              dispatchDomVideoEvent('haute:video:play', { productId, videoId, action: 'play' });
            } else if (stateCode === 2) {
              setPlayerState('paused');
              dispatchDomVideoEvent('haute:video:pause', { productId, videoId, action: 'pause' });
            } else if (stateCode === 0) {
              setPlayerState('completed');
              dispatchDomVideoEvent('haute:video:complete', { productId, videoId, action: 'complete' });
            }
          }
        }
      } catch {
        // Safely ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [productId, videoId]);

  const dispatchDomVideoEvent = (eventName: string, detail: Record<string, any>) => {
    const customEvent = new CustomEvent(eventName, {
      detail: {
        ...detail,
        productName,
        timestamp: Date.now()
      },
      bubbles: true
    });
    document.dispatchEvent(customEvent);
    window.dispatchEvent(customEvent);
  };

  if (!activeUrl) {
    return null;
  }

  // Render HTML5 Native Video Player (Direct MP4 / WebM / Data URL)
  if (isDirect) {
    return (
      <div className={`relative w-full h-full bg-black rounded-xs overflow-hidden shadow-xs border border-[#EAE6DE] ${className}`}>
        <video
          ref={nativeVideoRef}
          src={activeUrl}
          controls
          loop
          muted={false}
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
          playsInline
          onPlay={() => {
            setPlayerState('playing');
            dispatchDomVideoEvent('haute:video:play', { productId, action: 'play' });
          }}
          onPause={() => {
            setPlayerState('paused');
            dispatchDomVideoEvent('haute:video:pause', { productId, action: 'pause' });
          }}
          onEnded={() => {
            setPlayerState('completed');
            dispatchDomVideoEvent('haute:video:complete', { productId, action: 'complete' });
          }}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  if (!videoId) {
    return (
      <div className="bg-[#FAF9F6] border border-[#EAE6DE] p-6 text-center rounded-xs text-xs text-[#8C8477]">
        <Film className="w-6 h-6 mx-auto mb-2 text-[#C85A32]" />
        <p>Invalid video link</p>
      </div>
    );
  }

  // No-redirect embed src with auto-looping and minimal YouTube UI
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const embedSrc = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&origin=${encodeURIComponent(
    origin
  )}&rel=0&modestbranding=1&controls=1&showinfo=0&iv_load_policy=3&loop=1&playlist=${videoId}`;

  return (
    <div className={`relative w-full h-full bg-black rounded-xs overflow-hidden shadow-xs border border-[#EAE6DE] group ${className}`}>
      {/* Top transparent shield layer to block title bar redirects while allowing controls */}
      <div className="absolute top-0 left-0 right-0 h-14 z-10 bg-transparent pointer-events-auto" title={productName} />
      
      <iframe
        ref={iframeRef}
        src={embedSrc}
        title={`${productName} - Vertical Video Showcase`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full border-0 pointer-events-auto object-cover"
      />
    </div>
  );
};
