"use client";
import Link from "next/link";
import Image from "next/image";
import {
  Trophy,
  Medal,
  Award,
  Calendar,
  Users,
  Camera,
  ArrowRight,
} from "lucide-react";
import { useEvents } from "@/lib/queries";

function getEventThumbnail(event: any): string {
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

function getEventImageAlt(event: any): string {
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

  const loading = eventsLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">
            Loading achievements...
          </p>
        </div>
      </div>
    );
  }
  return (
    <div>
      <section className="py-16">
        <div className="container px-4 md:px-6">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk">
                Event Gallery
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground">
                Explore our recent events, workshops, and conferences that
                showcase innovation and learning
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {eventGallery.length > 0 ? (
                eventGallery.map((event, index) => (
                  <Link
                    key={index}
                    href={`/achievements/events/${event.id}`}
                    className="group block">
                    <div className="glass rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl">
                      {/* Event Image */}
                      <div className="relative h-48 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                        <Image
                          src={getEventThumbnail(event)}
                          alt={getEventImageAlt(event)}
                          width={400}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                        <div className="absolute top-4 right-4">
                          <span className="inline-block rounded-full bg-white/90 dark:bg-gray-900/90 px-3 py-1 text-xs font-medium text-gray-900 dark:text-gray-100">
                            {event.category}
                          </span>
                        </div>
                        <div className="absolute bottom-4 right-4">
                          <Camera className="h-5 w-5 text-white/80" />
                        </div>
                      </div>

                      {/* Event Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors duration-300">
                            {event.title}
                          </h3>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                        </div>

                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {event.description}
                        </p>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-blue-600">
                            <Users className="h-3 w-3" />
                            {event.organizer}
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {event.date}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
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
