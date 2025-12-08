"use client";

import { ArrowLeft, Calendar, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/utils/trpc/api";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";

type ItineraryPageProps = {
  user: User;
};

export default function ItineraryPage({}: ItineraryPageProps) {
  const router = useRouter();
  const itineraryId = router.query.id as string;

  const supabase = createSupabaseComponentClient();

  const { data: itinerary, isLoading } = api.itineraries.getItinerary.useQuery({
    itineraryId,
  });

  if (isLoading || !itinerary) {
    return (
      <div className="flex w-full justify-center pt-20">
        <p className="text-muted-foreground">Loading itinerary…</p>
      </div>
    );
  }

  const start = new Date(itinerary.startDate);
  const localStart = new Date(
    start.getTime() + start.getTimezoneOffset() * 60000,
  );

  const end = new Date(itinerary.endDate);
  const localEnd = new Date(end.getTime() + end.getTimezoneOffset() * 60000);
  const author = itinerary.author;

  const avatarUrl = author.avatarUrl
    ? supabase.storage.from("avatars").getPublicUrl(author.avatarUrl).data
        .publicUrl
    : undefined;

  return (
    <div className="flex w-full flex-row justify-center px-3">
      <div className="mt-4 mb-12 w-full md:w-[700px]">
        <div className="pb-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-1" /> Back to Feed
          </Button>
        </div>

        <Card className="mb-6 rounded-2xl p-6 shadow-sm">
          <h1 className="text-primary mb-3 text-3xl font-bold">
            {itinerary.title}
          </h1>

          {author && (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 overflow-hidden rounded-full">
                <AvatarImage
                  src={avatarUrl}
                  className="h-full w-full object-cover"
                />

                <AvatarFallback className="text-primary flex h-full w-full items-center justify-center rounded-full bg-gray-200">
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
                <span className="text-muted-foreground text-xs">
                  Creator of this itinerary
                </span>
              </div>
            </div>
          )}

          {itinerary.destination && (
            <div className="text-muted-foreground mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {itinerary.destination.name}, {itinerary.destination.country}
            </div>
          )}

          <div className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {format(localStart, "MMM d, yyyy")} →{" "}
            {format(localEnd, "MMM d, yyyy")}
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          {itinerary.days
            .sort((a, b) => a.dayNumber - b.dayNumber)
            .map((day) => (
              <Card key={day.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold text-[#0A2A43] dark:text-white">
                  Day {day.dayNumber}
                </h2>

                {day.notes && (
                  <p className="text-muted-foreground mt-1">{day.notes}</p>
                )}

                <Separator className="my-4" />

                <div className="flex flex-col gap-4">
                  {day.activities
                    .sort(
                      (a, b) =>
                        new Date(a.time).getTime() - new Date(b.time).getTime(),
                    )
                    .map((activity) => (
                      <div key={activity.id} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 font-medium">
                          <Clock className="text-muted-foreground h-4 w-4" />

                          <span className="text-primary font-semibold">
                            {format(new Date(activity.time), "h:mm a")}
                          </span>

                          <span>— {activity.name}</span>
                        </div>

                        {activity.category && (
                          <span className="w-fit rounded-full border border-[#ffb88c]/40 bg-[#ffb88c]/20 px-2 py-0.5 text-xs font-semibold text-[#ffb88c]">
                            {activity.category}
                          </span>
                        )}

                        {activity.location && (
                          <p className="text-muted-foreground text-sm">
                            {activity.location}
                          </p>
                        )}

                        {activity.description && (
                          <p className="text-muted-foreground text-sm">
                            {activity.description}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
