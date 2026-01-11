'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type OverflowTooltipProps = {
  text: string;
  className?: string;

  /** larghezza max del testo troncato (stesso comportamento del tuo max-w) */
  maxWidthClassName?: string;

  /** opzionale: distanza tooltip dal testo (px) */
  offsetPx?: number;
};

export function OverflowTooltip({
  text,
  className = '',
  maxWidthClassName = 'max-w-[260px]',
  offsetPx = 8,
}: OverflowTooltipProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const [isOverflow, setIsOverflow] = useState(false);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const canUseDOM = useMemo(() => typeof document !== 'undefined', []);

  const measureOverflow = () => {
    const el = ref.current;
    if (!el) return;
    // overflow quando la larghezza contenuto supera la larghezza visibile
    setIsOverflow(el.scrollWidth > el.clientWidth);
  };

  const updatePosition = () => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({
      top: Math.max(8, r.top), // evita top negativo
      left: r.left + r.width / 2,
    });
  };

  useLayoutEffect(() => {
    measureOverflow();
  }, [text]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      measureOverflow();
      if (open) updatePosition();
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [text, open]);

  useEffect(() => {
    if (!open) return;

    const onScrollOrResize = () => updatePosition();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open]);

  const onEnter = () => {
    const el = ref.current;
    if (!el) return;

    const overflowNow = el.scrollWidth > el.clientWidth;
    setIsOverflow(overflowNow);
    if (!overflowNow) return;

    updatePosition();
    setOpen(true);
  };

  const onLeave = () => setOpen(false);

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className={`block min-w-0 ${maxWidthClassName} truncate ${className}`}
      >
        {text}
      </span>

      {open && isOverflow && pos && canUseDOM
        ? createPortal(
            <div
              className="fixed z-[9999] pointer-events-none"
              style={{ top: pos.top, left: pos.left }}
            >
              <div
                className={[
                  'rounded-md bg-gray-900/95 px-2 py-1 text-xs text-white shadow-lg',
                  'opacity-0',
                  'animate-[overflowTooltipIn_120ms_ease-out_forwards]',
                  'whitespace-pre-wrap',
                  'max-w-[min(520px,calc(100vw-24px))]',
                ].join(' ')}
                style={{
                  transform: `translate(-50%, -${offsetPx}px)`,
                }}
              >
                {text}
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
