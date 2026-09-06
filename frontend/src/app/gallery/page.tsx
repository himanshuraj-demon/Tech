"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Users,
  Camera,
  ArrowRight,
  SlidersHorizontal,
  LayoutGrid,
} from "lucide-react";
import { useEvents } from "@/lib/queries";
import { HorizontalGallery } from "@/components/gallery/horizontal-gallery";
import { Event } from "@/lib/events-data";

function getEventThumbnail(event: Event | any): string {
  if (!event || !event.gallery) return "/events/placeholder-1.svg";
  let gallery = event.gallery;
  if (typeof gallery === "string") {
    try {
      gallery = JSON.parse(gallery);
    } catch {
      return gallery.startsWith("/") || gallery.startsWith("http")
        ? gallery
        : "/events/placeholder-1.svg";
    }
  }

  if (Array.isArray(gallery) && gallery.length > 0) {
    const first = gallery[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && first.url) return first.url;
  }

  return "/events/placeholder-1.svg";
}

function getEventImageAlt(event: Event | any): string {
  if (!event || !event.gallery) return event?.title || "Event Image";
  let gallery = event.gallery;
  if (typeof gallery === "string") {
    try {
      gallery = JSON.parse(gallery);
    } catch {
      return event.title || "Event Image";
    }
  }

  if (Array.isArray(gallery) && gallery.length > 0) {
    const first = gallery[0];
    if (typeof first === "object" && first?.alt) return first.alt;
  }

  return event?.title || "Event Image";
}

const Gallery = () => {
  const { data: eventGallery = [], isLoading: eventsLoading } = useEvents();
  const [viewMode, setViewMode] = useState<"slider" | "grid">("slider");

  if (eventsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-6 text-sm font-mono tracking-widest uppercase text-neutral-400">
            Loading Event Gallery...
          </p>
        </div>
      </div>
    );
  }

  // If in slider view and there are events, render the Jesper Landberg-style GSAP horizontal gallery
  if (viewMode === "slider" && eventGallery.length > 0) {
    return (
      <HorizontalGallery
        events={eventGallery}
        onSwitchToGrid={() => setViewMode("grid")}
        getEventThumbnail={getEventThumbnail}
        getEventImageAlt={getEventImageAlt}
      />
    );
  }

  // Classic Grid View (previously shown gallery page)
  return (
    <div className="min-h-screen bg-background">
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="space-y-8">
            {/* Header with Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-space-grotesk">
                  Event Gallery
                </h1>
              </div>

              {/* Toggle to return to Jesper Landberg Horizontal Slider */}
              <div className="flex items-center gap-2 self-start sm:self-center bg-muted/60 p-1 rounded-full border border-border">
                <button
                  type="button"
                  onClick={() => setViewMode("slider")}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background/80 transition-all duration-200"
                  title="Switch to Horizontal Slider View"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Featured Slider</span>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-background text-foreground shadow-sm transition-all duration-200"
                  title="Grid View Active"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid View</span>
                </button>
              </div>
            </div>

            {/* Grid of Event Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {eventGallery.length > 0 ? (
                eventGallery.map((event, index) => (
                  <Link
                    key={event.id || index}
                    href={`/achievements/events/${event.id}`}
                    className="group block"
                  >
                    <div className="glass rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border border-border/50 flex flex-col h-full">
                      {/* Event Image */}
                      <div className="relative h-52 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center overflow-hidden">
                        <Image
                          src={getEventThumbnail(event)}
                          alt={getEventImageAlt(event)}
                          width={400}
                          height={240}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                        <div className="absolute top-3 right-3">
                          <span className="inline-block rounded-full bg-background/90 backdrop-blur-md px-3 py-1 text-xs font-medium text-foreground shadow-sm">
                            {event.category}
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <Camera className="h-4 w-4 text-white/90" />
                        </div>
                      </div>

                      {/* Event Content */}
                      <div className="p-5 flex flex-col flex-1 justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors duration-300">
                              {event.title}
                            </h3>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 mt-1 ml-2" />
                          </div>

                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {event.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-3 border-t border-border/40">
                          <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                            <Users className="h-3 w-3" />
                            {event.organizer}
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {event.date}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-40" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-1">
                    No Events Yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Stay tuned for upcoming events and activities.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
