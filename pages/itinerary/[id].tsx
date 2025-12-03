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

// export default function ItineraryPage({ user }: ItineraryPageProps) {
export default function ItineraryPage({ }: ItineraryPageProps) {
  const router = useRouter();
  const itineraryId = router.query.id as string;

  const { data: itinerary, isLoading } =
    api.itineraries.getItinerary.useQuery({ itineraryId });

  if (isLoading || !itinerary) {
    return (
      <div className="flex w-full justify-center pt-20">
        <p className="text-muted-foreground">Loading itinerary…</p>
      </div>
    );
  }

  const start = new Date(itinerary.startDate);
  const end = new Date(itinerary.endDate);

  return (
    <div className="flex w-full flex-row justify-center px-3">
      <div className="mt-4 mb-12 w-full md:w-[700px]">
        
        {/* Back Button */}
        <div className="pb-3">
          <Button variant="ghost" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-1" /> Back to Feed
          </Button>
        </div>

        {/* Itinerary Header */}
        <Card className="p-6 rounded-2xl shadow-sm mb-6">
          <h1 className="text-3xl font-bold text-primary mb-3">
            {itinerary.title}
          </h1>

          {/* Destination */}
          {itinerary.destination && (
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">
                {itinerary.destination.name}
              </span>
              , {itinerary.destination.country}
            </div>
          )}

          {/* Dates */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {format(start, "MMM d, yyyy")} → {format(end, "MMM d, yyyy")}
          </div>
        </Card>

        {/* Days + Activities */}
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
                        
                        {/* Time + Title */}
                        <div className="flex items-center gap-2 font-medium">
                          <Clock className="h-4 w-4 text-muted-foreground" />

                          <span className="text-primary font-semibold">
                            {format(new Date(activity.time), "h:mm a")}
                          </span>

                          <span>— {activity.name}</span>
                        </div>

                        {/* Description */}
                        {activity.description && (
                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                        )}

                        {/* Location */}
                        {activity.location && (
                          <p className="text-sm text-muted-foreground">
                            📍 {activity.location}
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
