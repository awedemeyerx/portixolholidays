'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

type Props = {
  title: string;
  images: string[];
  labels: {
    open: string;
    close: string;
    previous: string;
    next: string;
    imageCount: string;
  };
};

export function PropertyGallery({ title, images, labels }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setActiveIndex(null);
        return;
      }

      if (event.key === 'ArrowRight') {
        setActiveIndex((current) => (current === null ? current : (current + 1) % images.length));
        return;
      }

      if (event.key === 'ArrowLeft') {
        setActiveIndex((current) => (current === null ? current : (current - 1 + images.length) % images.length));
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeIndex, images.length]);

  if (images.length === 0) return null;

  function openLightbox(index: number) {
    setActiveIndex(index);
  }

  function closeLightbox() {
    setActiveIndex(null);
    setTouchStartX(null);
  }

  function showPrevious() {
    setActiveIndex((current) => (current === null ? current : (current - 1 + images.length) % images.length));
  }

  function showNext() {
    setActiveIndex((current) => (current === null ? current : (current + 1) % images.length));
  }

  function onTouchEnd(clientX: number) {
    if (touchStartX === null) return;

    const deltaX = clientX - touchStartX;
    setTouchStartX(null);

    if (Math.abs(deltaX) < 40) return;
    if (deltaX < 0) {
      showNext();
      return;
    }
    showPrevious();
  }

  return (
    <>
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="group relative block h-[420px] w-full overflow-hidden rounded-[2rem] text-left"
          aria-label={`${labels.open}: ${title}`}
        >
          <Image
            src={images[0]}
            alt={`${title} 1`}
            fill
            priority
            sizes="(max-width: 767px) 100vw, 66vw"
            className="object-cover transition duration-300 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/35 via-transparent to-transparent" />
        </button>

        {images.length > 1 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {images.slice(1).map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => openLightbox(index + 1)}
                className="group relative aspect-[4/3] overflow-hidden rounded-[1.5rem] text-left"
                aria-label={`${labels.open}: ${title} ${index + 2}`}
              >
                <Image
                  src={image}
                  alt={`${title} ${index + 2}`}
                  fill
                  sizes="(max-width: 767px) 100vw, 33vw"
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {activeIndex !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/92 px-3 py-6 md:px-8"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 rounded-full border border-white/18 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/18"
            aria-label={labels.close}
          >
            {labels.close}
          </button>

          {images.length > 1 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showPrevious();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/18 bg-white/10 p-3 text-white transition hover:bg-white/18 md:left-6"
              aria-label={labels.previous}
            >
              <span aria-hidden="true">←</span>
            </button>
          ) : null}

          <div
            className="relative flex h-full w-full max-w-6xl items-center justify-center"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={(event) => setTouchStartX(event.changedTouches[0]?.clientX ?? null)}
            onTouchEnd={(event) => onTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
          >
            <div className="relative h-full max-h-[85vh] w-full">
              <Image
                src={images[activeIndex]}
                alt={`${title} ${activeIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/12 bg-black/35 px-4 py-2 text-sm text-white/92 backdrop-blur">
              {activeIndex + 1} / {images.length} {labels.imageCount}
            </div>
          </div>

          {images.length > 1 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/18 bg-white/10 p-3 text-white transition hover:bg-white/18 md:right-6"
              aria-label={labels.next}
            >
              <span aria-hidden="true">→</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
