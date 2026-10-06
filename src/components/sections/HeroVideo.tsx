'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';

type HeroVideoProps = {
  mp4: string;
  webm: string | null;
  poster: string | null;
  label: string;
  playLabel: string;
  pauseLabel: string;
};

/**
 * Muted, looping background-style video. Playback starts from script only when
 * the visitor has not asked for reduced motion, so those visitors never see it
 * move; everyone else gets autoplay plus a pause button (WCAG 2.2.2).
 */
export function HeroVideo({ mp4, webm, poster, label, playLabel, pauseLabel }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function sync() {
      if (!video) return;
      if (reducedMotion.matches) {
        video.autoplay = false;
        video.pause();
      } else if (!userPaused.current) {
        video.autoplay = true;
        video.play().catch(() => {
          // Autoplay can be refused (e.g. data saver); the poster stays visible.
        });
      }
    }

    sync();
    reducedMotion.addEventListener('change', sync);
    return () => reducedMotion.removeEventListener('change', sync);
  }, []);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPaused.current = false;
      video.play().catch(() => {});
    } else {
      userPaused.current = true;
      video.pause();
    }
  }

  return (
    <div className="relative aspect-[3/2] overflow-hidden rounded-[1.75rem] bg-blush shadow-lift">
      <video
        ref={videoRef}
        className="absolute inset-0 size-full object-cover"
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster ?? undefined}
        aria-label={label}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        {webm ? <source src={webm} type="video/webm" /> : null}
        <source src={mp4} type="video/mp4" />
      </video>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? pauseLabel : playLabel}
        className="absolute end-3 bottom-3 grid size-10 place-items-center rounded-full bg-white/90 text-plum shadow-soft transition-colors hover:bg-white"
      >
        <Icon name={playing ? 'pause' : 'play'} className="size-4" />
      </button>
    </div>
  );
}
