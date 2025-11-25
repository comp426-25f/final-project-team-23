import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { openai } from "@/utils/openai/client";

export const travelItineraryRouter = createTRPCRouter({
  generateItinerary: publicProcedure
    .input(z.object({ request: z.string() }))
    .subscription(async function* ({ input, signal }) {
      const { request } = input;

      const prompt = `
You are an AI travel itinerary generator.
Produce a complete day-by-day, hour-by-hour itinerary.

Format the output EXACTLY like this example:

Day 1 (Monday, July 14 — Tokyo)
8:00 AM — Breakfast at Tsukiji Outer Market
9:30 AM — Visit Hamarikyu Gardens
11:00 AM — Subway to Shibuya (20 min)
11:30 AM — Explore Shibuya Crossing
1:00 PM — Lunch
2:00 PM — Activity
4:00 PM — Rest
6:00 PM — Dinner
8:00 PM — Optional activity

Continue for all days.

Return ONLY the itinerary text — no commentary.

User request:
${request}
`;

      const responseStream = await openai.chat.completions.create(
        {
          model: "chat",
          stream: true,
          messages: [
            {
              role: "system",
              content:
                "You produce structured travel itineraries. Return ONLY the itinerary text.",
            },
            { role: "user", content: prompt },
          ],
        },
        { signal },
      );

      for await (const chunk of responseStream) {
        const choice = chunk.choices?.[0];
        if (!choice) continue;

        if (choice.finish_reason) {
          yield JSON.stringify({ done: true });
          continue;
        }

        const delta = choice.delta?.content;
        if (delta) {
          yield JSON.stringify({ delta });
        }
      }
    }),
});

export type TravelItineraryRouter = typeof travelItineraryRouter;
