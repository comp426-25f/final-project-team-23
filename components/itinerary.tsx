"use client";

import { Destination, Profile } from "@/server/models/responses";
import { Calendar, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";

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

export default function ItineraryPreviewCard({
  itinerary,
}: ItineraryPreviewCardProps) {
  const supabase = createSupabaseComponentClient();

  const start = new Date(itinerary.startDate);
  const end = new Date(itinerary.endDate);

  const numDays = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  );

  const author = itinerary.author;
  const avatarUrl = author.avatarUrl
    ? supabase.storage.from("avatars").getPublicUrl(author.avatarUrl).data
        .publicUrl
    : undefined;

  return (
    <Link href={`/itinerary/${itinerary.id}`} className="group block w-full">
      <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
            <AvatarImage src={avatarUrl} className="object-cover" />
            <AvatarFallback className="text-primary bg-gray-200">
              {author.displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col leading-tight">
            <span className="text-primary font-medium">
              {author.displayName}
            </span>
            <span className="text-muted-foreground text-xs">
              @{author.username}
            </span>
          </div>
        </div>

        <h2 className="text-primary text-xl font-bold group-hover:underline">
          {itinerary.title}
        </h2>

        {itinerary.destination && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            {itinerary.destination.name}, {itinerary.destination.country}
          </div>
        )}

        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" />
          {start.toLocaleDateString()} → {end.toLocaleDateString()}
        </div>

        <p className="text-muted-foreground text-sm">
          <span className="font-semibold">{numDays}</span>{" "}
          {numDays === 1 ? "Day" : "Days"}
        </p>

        <div className="text-primary mt-2 flex items-center gap-1 text-sm font-medium group-hover:underline">
          View itinerary
          <ExternalLink className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}
