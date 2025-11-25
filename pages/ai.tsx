"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/utils/trpc/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function TravelPlannerPage() {
  const [input, setInput] = useState("");
  const [stream, setStream] = useState("");
  const [enabled, setEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { reset: resetSubscription } =
    api.travel.generateItinerary.useSubscription(
      { request: input },
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

  return (
    <div className="flex h-screen flex-col gap-4 p-6 bg-gradient-to-b from-[#F3F7FB] to-white">
      <h1 className="text-3xl font-semibold text-center text-[#0A3D62]">
        ✈️ AI Travel Itinerary Planner
      </h1>

      <Card className="flex-1 overflow-y-auto p-6 shadow-inner" ref={scrollRef}>
        {stream ? (
          <pre className="whitespace-pre-wrap text-[15px] leading-relaxed">
            {stream}
          </pre>
        ) : (
          <p className="text-center text-gray-400 italic mt-12">
            Your personalized itinerary will appear here...
          </p>
        )}
      </Card>

      <div className="flex flex-col gap-3">
        <Textarea
          placeholder="Describe your trip (e.g., 'Barcelona in June, 5 days, beaches, nightlife, photography')"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[120px]"
        />
        <Button
          className="bg-[#0A3D62] text-white hover:bg-[#0C4F85]"
          onClick={handleGenerate}
        >
          Generate Itinerary
        </Button>
      </div>
    </div>
  );
}
