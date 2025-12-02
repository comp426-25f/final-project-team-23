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

export interface ParsedActivity {
  time: string; 
  name: string;
  category: string;
  description: string;
  location: string;
}

export interface ParsedDay {
  dayNumber: number;
  notes: string;
  activities: ParsedActivity[];
}

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
    
    return input + dates + interests;
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

  function extractDayNumber(line: string) {
    const match = line.match(/Day\s+(\d+)/);
    return match ? Number(match[1]) : 0;
  };

  function convertTime(timeStr: string) {
    const date = new Date();
    return new Date(`${date.toDateString()} ${timeStr}`).toISOString();
  };

function parseItinerary(text: string) {
    const days: ParsedDay[] = [];
    const lines = text.split("\n");
    let currentDay: ParsedDay | null = null;

    for (const line of lines) {
      if (line.startsWith("Day")) {
        if (currentDay) days.push(currentDay);
        currentDay = {
          dayNumber: extractDayNumber(line),
          notes: "",
          activities: [],
        };
      } else if (line.match(/^\d{1,2}:\d{2}/)) {
        const [time, name] = line.split("—");
        currentDay?.activities.push({
          time: convertTime(time),
          name: name?.trim() ?? "",
          category: "General",
          description: "",
          location: "",
        });
      }
    }
    if (currentDay) days.push(currentDay);
    return days;
  };

const handleSaveItinerary = () => {
    if (!profile) return toast.error("You must be logged in.");
    if (!stream.trim()) return toast.error("Generate an itinerary first.");
    if (!destinationId) return toast.error("Select a destination first.");

    const days = parseItinerary(stream);
    setIsSaving(true);

    createItineraryMutation({
      title: "My Trip Itinerary",
      description: input,
      content: stream,
      destinationId,
      startDate: dateRange?.from
        ? dateRange.from.toISOString()
        : new Date().toISOString(),

      endDate: dateRange?.to
        ? dateRange.to.toISOString()
        : new Date().toISOString(),
      days,
    });
  };

  return (
    <div className="min-h-screen relative horizon-bg">
      <main className="mx-auto w-full max-w-7xl px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-10 w-full items-start">

          <div className="w-fit lg:w-[420px] shrink-0 flex flex-col gap-6 bg-white/5 p-4 rounded-2xl">

            <div className="flex items-center gap-2 text-[#0A2A43]">
              <PlaneTakeoff className="h-7 w-7 text-[#ffb88c]" />
              <h1 className="text-3xl font-black tracking-tight">
                AI Travel Planner<span className="text-[#ffb88c]">.</span>
              </h1>
            </div>

            <div className="flex flex-col gap-1 w-fit">
              <label className="text-lg font-bold text-[#0A2A43]">Trip Details</label>
              <Textarea
                placeholder="Describe your trip..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white/70 shadow-sm h-[90px] w-[360px]"
              />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">Destination</label>

                <Select
                value={destinationId}
                onValueChange={(val: string) => setDestinationId(val)}
                disabled={destinationsLoading}
                >
                <SelectTrigger>
                    <SelectValue placeholder="Select a destination" />
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

            <div className="flex flex-col gap-2 w-fit">
              <label className="text-lg font-bold text-[#0A2A43]">Trip Dates</label>
              <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
              {dateRange?.from && dateRange?.to && (
                <p className="text-sm text-[#0A2A43] font-medium">
                  {format(dateRange.from, "MMM d, yyyy")} → {format(dateRange.to, "MMM d, yyyy")}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 w-fit">
            <label className="text-lg font-bold text-[#0A2A43]">Interests</label>
            <div className="flex flex-wrap gap-2 bg-white/30 rounded-xl p-2 border border-white/30 w-fit">
              <Button onClick={() => toggleFilter("history")}   variant={filters.includes("history") ? "default" : "outline"} className="rounded-xl"><Landmark className="h-4 w-4 mr-1" /> History</Button>
              <Button onClick={() => toggleFilter("culture")}   variant={filters.includes("culture") ? "default" : "outline"} className="rounded-xl"><BookOpen className="h-4 w-4 mr-1" /> Culture</Button>
              <Button onClick={() => toggleFilter("nightlife")} variant={filters.includes("nightlife") ? "default" : "outline"} className="rounded-xl"><Music className="h-4 w-4 mr-1" /> Nightlife</Button>
              <Button onClick={() => toggleFilter("food")}      variant={filters.includes("food") ? "default" : "outline"}      className="rounded-xl"><Utensils className="h-4 w-4 mr-1" /> Food</Button>
              <Button onClick={() => toggleFilter("nature")}    variant={filters.includes("nature") ? "default" : "outline"}    className="rounded-xl"><Trees className="h-4 w-4 mr-1" /> Nature</Button>
              <Button onClick={() => toggleFilter("adventure")} variant={filters.includes("adventure") ? "default" : "outline"} className="rounded-xl"><Map className="h-4 w-4 mr-1" /> Adventure</Button>
            </div>
            </div>

            <div className="flex flex-col gap-1 w-fit">
              <Button onClick={handleGenerate} className="mt-3 w-fit px-6 py-5 rounded-xl text-lg font-bold shadow-md bg-[#0A2A43] text-white hover:bg-blue-800">
                Generate Itinerary
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-5 flex-1">
          <Card
            className="w-full max-w-3xl mx-auto rounded-2xl shadow-xl p-6 border border-white/30 bg-white/90 h-[330px] sm:h-[380px] md:h-[510px] lg:h-[80vh] overflow-y-auto"
            ref={scrollRef}
          >
            {stream ? (
              <pre className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#0A2A43]">
                {stream}
              </pre>
            ) : (
              <p className="text-center text-gray-400 italic mt-12">
                Your personalized itinerary will appear here...
              </p>
            )}
          </Card>

            <Button
              disabled={isSaving || !stream}
              onClick={handleSaveItinerary}
              className="self-center w-fit px-6 py-5 rounded-xl text-lg font-bold bg-[#ffb88c] text-[#0A2A43] hover:bg-orange-300"
            >
              {isSaving ? (
                <>
                  <Loader2Icon className="animate-spin mr-2" />
                  Saving...
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