"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import {
  Calendar,
  Users,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Event } from "@/lib/events-data";

interface HorizontalGalleryProps {
  events: Event[];
  onSwitchToGrid?: () => void;
  getEventThumbnail: (event: Event) => string;
  getEventImageAlt: (event: Event) => string;
}

export function HorizontalGallery({
  events,
  onSwitchToGrid,
  getEventThumbnail,
  getEventImageAlt,
}: HorizontalGalleryProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLElement | null)[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);

  // Scroll physics state refs (to avoid re-renders inside 60fps ticker)
  const posRef = useRef({
    current: 0,
    target: 0,
    maxScroll: 0,
    dragStart: 0,
    startPos: 0,
    isPointerDown: false,
    dragDistance: 0,
    velocity: 0,
    lastTime: 0,
    skew: 0,
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [cursorState, setCursorState] = useState<"idle" | "drag" | "hover">("idle");
  const [cursorText, setCursorText] = useState("DRAG");

  // Calculate max scroll bounds
  const updateBounds = useCallback(() => {
    if (!trackRef.current || !containerRef.current) return;
    const trackWidth = trackRef.current.scrollWidth;
    const containerWidth = containerRef.current.clientWidth;
    posRef.current.maxScroll = Math.max(0, trackWidth - containerWidth);
    // Clamp current and target within bounds
    posRef.current.target = Math.max(
      -posRef.current.maxScroll,
      Math.min(0, posRef.current.target)
    );
  }, []);

  useEffect(() => {
    updateBounds();
    window.addEventListener("resize", updateBounds);
    return () => window.removeEventListener("resize", updateBounds);
  }, [events, updateBounds]);

  // Main GSAP Ticker for snappy inertia, fast-normalizing velocity skew, and parallax
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Fast transforms setters
    const setTrackX = gsap.quickSetter(track, "x", "px");
    const cardSkewSetters = cardsRef.current.map((card) =>
      card ? gsap.quickSetter(card, "skewX", "deg") : null
    );

    const tick = () => {
      const p = posRef.current;
      const prev = p.current;

      // Snappy lerp (0.18 factor) so scrolling settles quickly without sluggish drift
      p.current += (p.target - p.current) * 0.18;
      if (Math.abs(p.target - p.current) < 0.25) {
        p.current = p.target;
      }
      p.velocity = p.current - prev;

      setTrackX(p.current);

      // Skew responds immediately to real movement velocity and snaps back to 0 (normal) rapidly
      const targetSkew = Math.max(-5.5, Math.min(5.5, -p.velocity * 0.32));
      p.skew += (targetSkew - p.skew) * 0.35;
      if (Math.abs(p.skew) < 0.04) {
        p.skew = 0;
      }

      cardSkewSetters.forEach((setter) => {
        if (setter) setter(p.skew);
      });

      // Update progress & active index
      if (p.maxScroll > 0) {
        const prog = Math.abs(p.current) / p.maxScroll;
        setProgress(Math.max(0, Math.min(1, prog)));

        // Determine current visible card index
        if (cardsRef.current.length > 0) {
          const viewportCenter = window.innerWidth / 2;
          let closestIdx = 0;
          let minDistance = Infinity;

          cardsRef.current.forEach((card, idx) => {
            if (!card) return;
            const rect = card.getBoundingClientRect();
            const cardCenter = rect.left + rect.width / 2;
            const distance = Math.abs(cardCenter - viewportCenter);
            if (distance < minDistance) {
              minDistance = distance;
              closestIdx = idx;
            }

            // Image parallax inside card
            const imgContainer = card.querySelector(".card-image-inner") as HTMLElement;
            if (imgContainer) {
              const offset = ((cardCenter - viewportCenter) / window.innerWidth) * 45;
              imgContainer.style.transform = `translateX(${offset}px) scale(1.08)`;
            }
          });

          setActiveIndex(closestIdx);
        }
      }
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [events]);

  // Pointer & Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    posRef.current.isPointerDown = true;
    posRef.current.dragStart = e.clientX;
    posRef.current.startPos = posRef.current.target;
    posRef.current.dragDistance = 0;
    setCursorState("drag");
    setCursorText("DRAG");
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    // Custom cursor follower tracking
    if (cursorRef.current) {
      gsap.to(cursorRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.15,
        ease: "power2.out",
      });
    }

    if (!posRef.current.isPointerDown) return;
    const delta = e.clientX - posRef.current.dragStart;
    posRef.current.dragDistance = Math.abs(delta);

    // Apply drag with slight rubber-banding past edges
    let newTarget = posRef.current.startPos + delta * 1.35;
    if (newTarget > 0) {
      newTarget = newTarget * 0.3;
    } else if (newTarget < -posRef.current.maxScroll) {
      const over = newTarget + posRef.current.maxScroll;
      newTarget = -posRef.current.maxScroll + over * 0.3;
    }
    posRef.current.target = newTarget;
  };

  const handlePointerUp = () => {
    posRef.current.isPointerDown = false;
    setCursorState("idle");
    // Clamp back inside valid range with inertia rebound
    posRef.current.target = Math.max(
      -posRef.current.maxScroll,
      Math.min(0, posRef.current.target)
    );
  };

  // Mouse wheel & Trackpad horizontal scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Allow user to scroll horizontally or use vertical wheel to drive horizontal motion
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 2) return;

      e.preventDefault();
      const p = posRef.current;
      p.target = Math.max(
        -p.maxScroll,
        Math.min(0, p.target - delta * 1.5)
      );
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    const card = cardsRef.current[index];
    const container = containerRef.current;
    if (!card || !container) return;
    const cardRect = card.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const cardOffsetLeft = card.offsetLeft;
    const target = -(cardOffsetLeft - (containerRect.width / 2 - cardRect.width / 2));
    posRef.current.target = Math.max(-posRef.current.maxScroll, Math.min(0, target));
  }, []);

  const scrollNext = useCallback(() => {
    const nextIdx = Math.min(events.length - 1, activeIndex + 1);
    scrollToIndex(nextIdx);
  }, [activeIndex, events.length, scrollToIndex]);

  const scrollPrev = useCallback(() => {
    const prevIdx = Math.max(0, activeIndex - 1);
    scrollToIndex(prevIdx);
  }, [activeIndex, scrollToIndex]);

  // Keyboard navigation (Left / Right arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        scrollNext();
      } else if (e.key === "ArrowLeft") {
        scrollPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [scrollNext, scrollPrev]);

  const handleCardClick = (eventId: string) => {
    // Distinguish between drag and click: if dragged more than 8px, do not navigate
    if (posRef.current.dragDistance > 8) return;
    router.push(`/achievements/events/${eventId}`);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={() => {
        handlePointerUp();
        setCursorState("idle");
      }}
      className="relative w-full h-[100vh] min-h-[600px] overflow-hidden select-none cursor-grab active:cursor-grabbing  text-white flex flex-col justify-between pt-20"
    >
      {/* Dynamic Floating Cursor follower (Jesper Landberg aesthetic) */}
      <div
        ref={cursorRef}
        className={cn(
          "fixed top-0 left-0 pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center rounded-full transition-opacity duration-200 backdrop-blur-md shadow-2xl",
          cursorState === "idle" && "opacity-0 scale-75",
          cursorState === "drag" &&
            "opacity-100 scale-100 w-16 h-16 bg-white/15 border border-white/30 text-[10px] font-semibold tracking-widest text-white uppercase",
          cursorState === "hover" &&
            "opacity-100 scale-110 w-20 h-20 bg-blue-600 text-white font-bold text-xs tracking-wider shadow-blue-500/40"
        )}
      >
        <span className="flex items-center gap-1">
          {cursorText}
          {cursorState === "hover" && <ArrowUpRight className="w-3.5 h-3.5" />}
        </span>
      </div>

      {/* Background Ambience / Subtle Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/15 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Bar: Title & Mode Switcher */}
      <header className="relative z-20 container mx-auto px-4 sm:px-6 pt-6 pb-2 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-space-grotesk">
            Event Gallery
          </h1>
        </div>

        {/* View Mode Switcher (Featured Horizontal vs Classic Grid) */}
        <div className="flex items-center gap-3">
          <div className="bg-neutral-900/90 border border-neutral-800 rounded-full p-1 flex items-center shadow-lg backdrop-blur-md">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-white text-neutral-950 shadow-sm transition-all duration-300"
              title="Horizontal Slider Mode"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Featured</span>
            </button>
            <button
              type="button"
              onClick={onSwitchToGrid}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-all duration-300"
              title="Open Classic Grid Gallery"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center font-mono text-xs text-neutral-400 px-3 py-1.5 rounded-full border border-neutral-800/80 bg-neutral-900/50">
            <span className="text-white font-bold">
              {String(activeIndex + 1).padStart(2, "0")}
            </span>
            <span className="mx-1 text-neutral-600">/</span>
            <span>{String(events.length).padStart(2, "0")}</span>
          </div>
        </div>
      </header>

      {/* Main Horizontal Track */}
      <div className="relative z-10 w-full flex-1 flex items-center my-auto overflow-visible py-4">
        <div
          ref={trackRef}
          className="flex items-center gap-7 sm:gap-10 md:gap-12 px-6 sm:px-14 md:px-20 will-change-transform"
        >
          {events.map((event, index) => {
            const thumbnail = getEventThumbnail(event);
            const alt = getEventImageAlt(event);
            const isCenter = index === activeIndex;

            return (
              <article
                key={event.id || index}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                onClick={() => handleCardClick(event.id)}
                onMouseEnter={() => {
                  setCursorState("hover");
                  setCursorText("VIEW");
                }}
                onMouseLeave={() => {
                  setCursorState("idle");
                  setCursorText("DRAG");
                }}
                className={cn(
                  "relative flex-none w-[88vw] sm:w-[66vw] md:w-[52vw] lg:w-[45vw] xl:w-[50vw] h-[52vh] max-w-[720px]  sm:h-[58vh] lg:h-[62vh] max-h-[640px] min-h-[380px] rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer group will-change-transform border transition-all duration-300",
                  isCenter
                    ? "border-neutral-700/80  ring-1 ring-white/20"
                    : "border-neutral-800/60  hover:opacity-100 hover:border-neutral-700"
                )}
              >
                {/* Background Card Image with GSAP Parallax */}
                <div className="absolute inset-0 overflow-hidden bg-neutral-900">
                  <div className="card-image-inner absolute -inset-x-12 inset-y-0 w-[calc(100%+6rem)] h-full transition-transform duration-75 ease-out">
                    <Image
                      src={thumbnail}
                      alt={alt}
                      fill
                      sizes="(max-width: 768px) 90vw, (max-width: 1200px) 60vw, 45vw"
                      priority={index < 3}
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                  </div>
                  {/* Subtle darkened vignettes */}
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-black/20" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                </div>

                {/* Top Badge & Index */}
                <div className="absolute top-4 sm:top-6 inset-x-4 sm:inset-x-6 flex items-center justify-between z-10">
                  <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium tracking-wide bg-neutral-950/70 border border-white/10 backdrop-blur-md text-white/90 shadow-sm">
                    {event.category || "Event"}
                  </span>
                  <span className="font-mono text-xs sm:text-sm text-white/60 tracking-wider">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                {/* Bottom Content / Info */}
                <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8 z-10 flex flex-col justify-end">
                  <div className="flex items-end justify-between gap-4">
                    <div className="space-y-2 max-w-[82%]">
                      <h3 className="font-space-grotesk font-bold text-xl sm:text-2xl md:text-3xl text-white tracking-tight leading-snug group-hover:text-blue-400 transition-colors duration-300">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-xs sm:text-sm text-neutral-300/80 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs sm:text-sm text-neutral-400 pt-1">
                        {event.organizer && (
                          <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                            <Users className="w-3.5 h-3.5" />
                            {event.organizer}
                          </span>
                        )}
                        {event.date && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {event.date}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Circular Action Indicator (Jesper Landberg button motif) */}
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white text-neutral-950 flex items-center justify-center flex-shrink-0 shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white">
                      <ArrowUpRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Bottom Bar: Progress line & Navigation Controls */}
      <footer className="relative z-20 container mx-auto px-4 sm:px-6 pb-6 pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Drag / Scroll Indicator Hint */}
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 tracking-wider">
          <span className="hidden sm:inline">&larr;</span>
          <span className="text-neutral-500 uppercase">
            Scroll or Drag horizontally &bull; Click to open
          </span>
          <span className="hidden sm:inline">&rarr;</span>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full sm:w-64 h-1.5 bg-neutral-800/80 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-150"
            style={{ width: `${Math.max(8, progress * 100)}%` }}
          />
        </div>

        {/* Prev / Next Click Arrows */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={activeIndex === 0}
            aria-label="Previous event"
            className="w-9 h-9 rounded-full border border-neutral-800 bg-neutral-900/90 text-neutral-300 flex items-center justify-center hover:bg-neutral-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            disabled={activeIndex === events.length - 1}
            aria-label="Next event"
            className="w-9 h-9 rounded-full border border-neutral-800 bg-neutral-900/90 text-neutral-300 flex items-center justify-center hover:bg-neutral-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
