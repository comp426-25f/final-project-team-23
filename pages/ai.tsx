"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/utils/trpc/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { BookOpen, Landmark, Music, Utensils, Map, Trees, PlaneTakeoff, Loader2Icon, Save } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/dates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { ParsedActivity, ParsedDay } from "@/server/api/routers/itineraries";

export default function TravelPlannerPage() {
  const [input, setInput] = useState("");
  const [stream, setStream] = useState("");
  const [enabled, setEnabled] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 11, 18),
    to: new Date(2025, 11, 29),});

  const [isSaving, setIsSaving] = useState(false);

  const [filters, setFilters] = useState<string[]>([]);
  const { data: destinations, isLoading: destinationsLoading } = api.destinations.getAll.useQuery();

  const [destinationId, setDestinationId] = useState<string>("");
  const router = useRouter();
  
  const { data: profile } = api.profiles.getAuthedUserProfile.useQuery();

  const { mutate: createItineraryMutation } =
    api.itineraries.createFullItinerary.useMutation({
      onSuccess: (data) => {
        toast.success("Itinerary saved!");
        router.push(`/itinerary/${data.itineraryId}`);
      },
      onError: () => toast.error("Could not save itinerary."),
      onSettled: () => {
        setIsSaving(false);
    },
    });

  const toggleFilter = (f: string) => {
    setFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const buildPrompt = () => {
    const dates = dateRange?.from && dateRange?.to
      ? `\nTrip dates: ${format(dateRange.from, "MMM d, yyyy")} to ${format(dateRange.to, "MMM d, yyyy")}.`
      : "";

    const interests = filters.length > 0
      ? `\nUser interests: ${filters.join(", ")}. Prioritize activities related to these interests.`
      : "";
    
    const dest = destinations?.find((d) => d.id === destinationId);
    const city = dest?.name ?? "Your Destination";

    const location = destinationId != ""
      ? `\nDestination: ${city}. Prioritize activities related to these interests.`
      : "";
    
    return input + location + dates + interests;
  };

  const { reset: resetSubscription } =
    api.itineraries.generateItinerary.useSubscription(
      { request: buildPrompt() },
      {
        enabled,
        onStarted: () => {
          setStream("");
        },
        onData: (chunk) => {
          try {
            const data = JSON.parse(chunk);

            if (data.done) {
              setEnabled(false);
              return;
            }

            if (data.delta) {
              setStream((prev) => prev + data.delta);
            }
          } catch {
            setStream((prev) => prev + chunk);
          }
        },
        onError: (err) => {
          toast.error(err.message || "Could not generate itinerary.");
        },
      },
    );

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [stream]);

  const handleGenerate = () => {
    if (!input.trim()) {
      toast.error("Please enter your trip details.");
      return;
    }
    setEnabled(true);
    resetSubscription();
  };

  function convertTime(timeStr: string) {
    const date = new Date();
    return new Date(`${date.toDateString()} ${timeStr}`).toISOString();
  };

function parseItinerary(text: string): ParsedDay[] {
  const days: ParsedDay[] = [];
  const lines = text.split("\n").map(l => l.trim());

  let currentDay: ParsedDay | null = null;
  let currentActivity: ParsedActivity | null = null;

  const dayRegex = /^Day\s+(\d+)(?:\s*\((.*?)\))?/i;
  const activityLineRegex = /^(\d{1,2}:\d{2}(?:\s?(AM|PM))?)\s*[—–-]\s*(.+)$/i;
  const categoryRegex = /^Category:\s*(.+)$/i;
  const locationRegex = /^Location:\s*(📍.+)$/i;

  for (const line of lines) {
    if (!line) continue;

    const dayMatch = line.match(dayRegex);
    if (dayMatch) {
      if (currentDay) days.push(currentDay);
      currentDay = {
        dayNumber: Number(dayMatch[1]),
        notes: dayMatch[2]?.trim() ?? "",
        activities: [],
      };
      currentActivity = null;
      continue;
    }

    const activityMatch = line.match(activityLineRegex);
    if (activityMatch && currentDay) {
      const time = activityMatch[1];
      const name = activityMatch[3];

      currentActivity = {
        time: convertTime(time),
        name,
        category: "",
        location: "",
        description: "",
      };

      currentDay.activities.push(currentActivity);
      continue;
    }

    const catMatch = line.match(categoryRegex);
    if (catMatch && currentActivity) {
      currentActivity.category = catMatch[1].trim();
      continue;
    }

    const locMatch = line.match(locationRegex);
    if (locMatch && currentActivity) {
      currentActivity.location = locMatch[1].trim();
      continue;
    }

    if ((line.startsWith("•") || line.startsWith("-")) && currentActivity) {
      currentActivity.description +=
        (currentActivity.description ? "\n" : "") +
        line.replace(/^[-•]\s*/, "");
      continue;
    }
  }

  if (currentDay) days.push(currentDay);
  return days;
}

function getTripLength(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

const handleSaveItinerary = () => {
    if (!profile) return toast.error("You must be logged in.");
    if (!stream.trim()) return toast.error("Generate an itinerary first.");
    if (!destinationId) return toast.error("Select a destination first.");

    const days = parseItinerary(stream);
    setIsSaving(true);

    let itineraryTitle = ""

    const dest = destinations?.find((d) => d.id === destinationId);
    const city = dest?.name ?? "Your Destination";

    if (!dateRange || !dateRange.from || !dateRange.to){
      itineraryTitle = `Trip to ${city}`
    } else {
      const numDays = getTripLength(dateRange.from, dateRange.to);
      if (numDays > 1) {
        itineraryTitle = `${numDays} Days in ${city}`
      } else {
        itineraryTitle = `1 Day in ${city}`
      }
    }

    createItineraryMutation({
      title: itineraryTitle,
      description: input,
      content: stream,
      destinationId,
      startDate: dateRange?.from ?? new Date(),
      endDate: dateRange?.to ?? new Date(),
      days,
    });
  };

  return (
  <div className="min-h-screen horizon-bg">
    <main className="mx-auto w-full max-w-7xl px-6 py-12">

      <div className="flex flex-col lg:flex-row gap-10 w-full items-start">

        <div className="
          w-full lg:w-[420px] shrink-0 flex flex-col gap-8 
          bg-white/70 backdrop-blur-xl p-6 rounded-3xl 
          border border-[#0A2A43]/10 shadow-lg
        ">

          <div className="flex items-center gap-3">
            <PlaneTakeoff className="h-8 w-8 text-[#ffb88c]" />
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0A2A43]">
              AI Travel Planner<span className="text-[#ffb88c]">.</span>
            </h1>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#0A2A43]">Trip Details</label>
            <Textarea
              placeholder="e.g. Backpacking Italy, love food + museums..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="
                rounded-xl border border-[#0A2A43]/20 bg-white/60 
                text-[#0A2A43] placeholder:text-[#0A2A43]/40 h-[90px] shadow-sm
              "
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-[#0A2A43]">Destination</label>

            <Select
              value={destinationId}
              onValueChange={setDestinationId}
              disabled={destinationsLoading}
            >
              <SelectTrigger className="rounded-xl bg-white/60 border border-[#0A2A43]/20 shadow-sm">
                <SelectValue placeholder="Choose destination" />
              </SelectTrigger>

              <SelectContent>
                {destinations?.map((dest) => (
                  <SelectItem value={dest.id} key={dest.id}>
                    {dest.name ? `${dest.name}, ${dest.country}` : dest.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#0A2A43]">Trip Dates</label>
            <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
            {dateRange?.from && dateRange?.to && (
              <p className="text-xs text-[#0A2A43]/70 font-medium">
                {format(dateRange.from, "MMM d, yyyy")} → {format(dateRange.to, "MMM d, yyyy")}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#0A2A43]">Interests</label>
            <div className="flex flex-wrap gap-2 bg-white/50 rounded-xl p-3 border border-[#0A2A43]/10">

              {[
                { key: "history", icon: <Landmark className="h-4 w-4" /> },
                { key: "culture", icon: <BookOpen className="h-4 w-4" /> },
                { key: "nightlife", icon: <Music className="h-4 w-4" /> },
                { key: "food", icon: <Utensils className="h-4 w-4" /> },
                { key: "nature", icon: <Trees className="h-4 w-4" /> },
                { key: "adventure", icon: <Map className="h-4 w-4" /> },
              ].map(({ key, icon }) => (
                <Button
                  key={key}
                  onClick={() => toggleFilter(key)}
                  variant={filters.includes(key) ? "default" : "outline"}
                  className={`
                    rounded-xl px-3 py-1 text-sm font-medium
                    ${filters.includes(key)
                      ? "bg-[#ffb88c] text-[#0A2A43] border-[#ffb88c]"
                      : "text-[#0A2A43] border-[#0A2A43]/20"
                    }
                  `}
                >
                  {icon} <span className="ml-1 capitalize">{key}</span>
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            className="
              mt-3 w-full px-6 py-4 rounded-xl text-lg font-bold shadow-md
              bg-[#0A2A43] text-white hover:bg-[#0A2A43]/80 transition
            "
          >
            Generate Itinerary
          </Button>
        </div>

        <div className="flex flex-col gap-6 flex-1">

          <Card
            ref={scrollRef}
            className="
              w-full max-w-3xl mx-auto rounded-3xl p-6 shadow-xl 
              border border-[#0A2A43]/10 bg-white/80 backdrop-blur-xl
              h-[330px] sm:h-[380px] md:h-[510px] lg:h-[80vh] overflow-y-auto
            "
          >
            {stream ? (
              <pre className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#0A2A43]">
                {stream}
              </pre>
            ) : (
              <p className="text-center text-[#0A2A43]/40 italic mt-12">
                Your personalized itinerary will appear here...
              </p>
            )}
          </Card>

          <Button
            disabled={isSaving || !stream}
            onClick={handleSaveItinerary}
            className="
              self-center w-fit px-6 py-4 rounded-xl text-lg font-bold
              bg-[#ffb88c] text-[#0A2A43] hover:bg-[#ff9f63] shadow-md transition
            "
          >
            {isSaving ? (
              <>
                <Loader2Icon className="animate-spin mr-2" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2" /> Save Itinerary
              </>
            )}
          </Button>
        </div>
      </div>
    </main>
  </div>
);
}