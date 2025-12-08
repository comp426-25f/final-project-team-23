"use client";

import { ArrowLeft, Calendar, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/utils/trpc/api";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { User } from "@supabase/supabase-js";


type ItineraryPageProps = {
  user: User;
};

export default function ItineraryPage({ }: ItineraryPageProps) {
  const router = useRouter();
  const itineraryId = router.query.id as string;

  const { data: itinerary, isLoading } =
    api.itineraries.getItinerary.useQuery({ itineraryId });

  if (isLoading || !itinerary) {
    return (
      <div className="min-h-screen relative horizon-bg">
        <main className="mx-auto w-full max-w-6xl px-6 py-12 flex items-center justify-center"></main>
          <p className="text-muted-foreground">Loading itinerary…</p>
      </div>
    );
  }

  const start = new Date(itinerary.startDate);
  const localStart = new Date(start.getTime() + start.getTimezoneOffset() * 60000);

  const end = new Date(itinerary.endDate);
  const localEnd = new Date(end.getTime() + end.getTimezoneOffset() * 60000);

  return (
    <div className="min-h-screen relative horizon-bg">
      <main className="mx-auto w-full max-w-6xl px-6 py-12 flex flex-col gap-8">

        <div className="pb-3">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-1" /> Back to Feed
          </Button>
        </div>

        <Card className="p-6 rounded-2xl shadow-sm mb-6">
          <h1 className="text-3xl font-bold text-primary mb-3">
            {itinerary.title}
          </h1>

          {itinerary.destination && (
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
                {itinerary.destination.name}
              , {itinerary.destination.country}
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {format(localStart, "MMM d, yyyy")} → {format(localEnd, "MMM d, yyyy")}
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          {itinerary.days
            .sort((a, b) => a.dayNumber - b.dayNumber)
            .map((day) => (
              <Card key={day.id} className="p-5 rounded-2xl bg-white shadow-sm">
                <h2 className="text-xl font-bold text-primary">
                  Day {day.dayNumber}
                </h2>

                {day.notes && (
                  <p className="mt-1 text-muted-foreground">{day.notes}</p>
                )}

                <Separator className="my-4" />

                <div className="flex flex-col gap-4">
                  {day.activities
                    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
                    .map((activity) => (
                      <div key={activity.id} className="flex flex-col gap-1">

                        <div className="flex items-center gap-2 font-medium">
                          <Clock className="h-4 w-4 text-muted-foreground" />

                          <span className="text-primary font-semibold">
                            {format(new Date(activity.time), "h:mm a")}
                          </span>

                          <span>— {activity.name}</span>
                        </div>

                        {activity.category && (
    <span
      className="
        px-2 py-0.5
        text-xs font-semibold
        rounded-full
        bg-[#ffb88c]/20
        text-[#ffb88c]
        border border-[#ffb88c]/40
        w-fit
      "
    >
      {activity.category}
    </span>
  )}

                        {activity.location && (
                          <p className="text-sm text-muted-foreground">
                            {activity.location}
                          </p>
                        )}

                        {activity.description && (
                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                        )}

                      </div>
                    ))}
                </div>
              </Card>
            ))}
        </div>
      </main>
    </div>
  );
}