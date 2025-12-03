"use client";

import { Destination, Profile } from "@/server/models/responses";
import { Calendar, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";
import { z } from "zod";

export const ItineraryPreview = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  content: z.string().nullable().optional(),

  startDate: z.date({ coerce: true }),
  endDate: z.date({ coerce: true }),
  createdAt: z.date({ coerce: true }),

  destination: Destination.nullable(),
  author: Profile,
});

type ItineraryPreviewCardProps = {
  itinerary: z.infer<typeof ItineraryPreview>;
};

export default function ItineraryPreviewCard({ itinerary }: ItineraryPreviewCardProps) {
  const start = new Date(itinerary.startDate);
  const end = new Date(itinerary.endDate);

  const numDays = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <Link
      href={`/itinerary/${itinerary.id}`}
      className="group block w-full"
    >
      <div className="rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition p-5 flex flex-col gap-4">
        
        <h2 className="text-xl font-bold text-primary group-hover:underline">
          {itinerary.title}
        </h2>

        {itinerary.destination && (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin className="h-4 w-4" />
            <span className="font-medium">
              {itinerary.destination.name}
            </span>
            , {itinerary.destination.country}
          </div>
        )}

        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Calendar className="h-4 w-4" />
          {start.toLocaleDateString()} → {end.toLocaleDateString()}
        </div>

        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">{numDays}</span> {numDays === 1 ? "Day" : "Days"}
        </p>

        <div className="flex items-center gap-1 text-primary text-sm font-medium group-hover:underline mt-2">
          View itinerary
          <ExternalLink className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
