import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { openai } from "@/utils/openai/client";
import { TRPCError } from "@trpc/server";
import {
  itineraryTable,
  itineraryDaysTable,
  activitiesTable,
  destinationsTable,
  profilesTable,
  itineraryCollaboratorsTable,
} from "@/server/db/schema";
import { db } from "@/server/db";
import {
  CreateFullItineraryInput,
  ItineraryIdentity,
  PaginationParams,
} from "@/server/models/inputs";
import { Itinerary, ItineraryPreview } from "@/server/models/responses";
import { eq, desc, inArray, sql } from "drizzle-orm";

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

export const travelItineraryRouter = createTRPCRouter({
  generateItinerary: publicProcedure
    .input(z.object({ request: z.string() }))
    .subscription(async function* ({ input, signal }) {
      const { request } = input;

      const prompt = `
You are an AI travel itinerary generator.
Produce a complete day-by-day, hour-by-hour itinerary.

For EACH line-item activity (e.g., “Breakfast at ___”, “Visit ___”, “Explore ___”), 
add 2–4 short bullet points immediately beneath it with helpful details such as:
- What to expect
- Tips or recommendations
- Transit notes or time estimates
- Cost ranges (if relevant)
- Why it's worth visiting

Use THIS exact format:

Day 1 (Monday, July 14 — Tokyo)
8:00 AM — Breakfast at Tsukiji Outer Market
  • Famous for fresh sushi and street snacks
  • Try tamagoyaki at a local vendor
  • Arrive early to avoid crowds

9:30 AM — Visit Hamarikyu Gardens
  • Traditional Japanese landscape garden
  • Beautiful teahouse on the pond
  • Great photography spots

11:00 AM — Subway to Shibuya (20 min)
  • Take the Oedo Line
  • Shibuya Station is large — follow signs for Hachiko Exit

11:30 AM — Explore Shibuya Crossing
  • Iconic pedestrian scramble
  • Best overhead view from Starbucks 2F
  • Shops and cafes nearby

1:00 PM — Lunch
  • Suggest a local cuisine option
  • Include one recommended restaurant

2:00 PM — Activity
  • Provide specific landmark or experience
  • Include relevant tips

4:00 PM — Rest
  • Hotel or quiet café recommendation

6:00 PM — Dinner
  • Suggest cuisine + one recommended spot

8:00 PM — Optional activity
  • Relaxed evening idea (bar, walk, viewpoint)

Continue for all days.

Return ONLY the itinerary text — no commentary.
Add emojis as you see fit to make the text look more fun and visually appealing.

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

  createFullItinerary: protectedProcedure
    .input(CreateFullItineraryInput)
    .mutation(async ({ ctx, input }) => {
      const { subject } = ctx;

      const {
        title,
        description,
        content,
        destinationId,
        startDate,
        endDate,
        days,
      } = input;

      try {
        const [itinerary] = await db
          .insert(itineraryTable)
          .values({
            title,
            description,
            content,
            destinationId,
            startDate,
            endDate,
            authorId: subject.id,
          })
          .returning();

        if (!itinerary)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create itinerary.",
          });

        const dayRows = days.map((d) => ({
          itineraryId: itinerary.id,
          dayNumber: d.dayNumber,
          notes: d.notes ?? "",
        }));

        const insertedDays = await db
          .insert(itineraryDaysTable)
          .values(dayRows)
          .returning();

        const dayIdMap: Record<number, string> = {};
        insertedDays.forEach((day) => {
          dayIdMap[day.dayNumber] = day.id;
        });

        const activityRows = days.flatMap((d) =>
          d.activities.map((a) => ({
            itineraryDayId: dayIdMap[d.dayNumber],
            time: new Date(a.time),
            name: a.name,
            category: a.category ?? "General",
            description: a.description ?? "",
            location: a.location ?? "",
          })),
        );

        if (activityRows.length > 0) {
          console.log("🔥 ACTIVITY ROWS TO INSERT:", activityRows);
          await db.insert(activitiesTable).values(activityRows);
        }

        return { success: true, itineraryId: itinerary.id };
      } catch (err) {
        console.error("Error saving itinerary:", err);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error saving itinerary.",
        });
      }
    }),

  getExploreItineraries: protectedProcedure
    .input(PaginationParams.optional())
    .output(ItineraryPreview.array())
    .query(async ({ input }) => {
      const { cursor } = input ?? { cursor: 0 };

      console.log("→ HIT getExploreItineraries");

      const itineraries = await db
        .select({
          id: itineraryTable.id,
          title: itineraryTable.title,
          description: itineraryTable.description,
          content: itineraryTable.content,

          startDate: itineraryTable.startDate,
          endDate: itineraryTable.endDate,
          createdAt: itineraryTable.createdAt,

          destination: sql`
          CASE
          WHEN ${destinationsTable.id} IS NOT NULL THEN
          json_build_object(
            'id', ${destinationsTable.id},
            'name', ${destinationsTable.name},
            'country', ${destinationsTable.country}, 
            'continent', ${destinationsTable.continent}
          )::json
          ELSE NULL
          END
        `.as("destination"),

          author: {
            id: profilesTable.id,
            displayName: profilesTable.displayName,
            username: profilesTable.username,
            avatarUrl: profilesTable.avatarUrl,
          },
        })
        .from(itineraryTable)
        .leftJoin(
          destinationsTable,
          eq(itineraryTable.destinationId, destinationsTable.id),
        )
        .leftJoin(profilesTable, eq(itineraryTable.authorId, profilesTable.id))
        .orderBy(desc(itineraryTable.createdAt))
        .limit(25)
        .offset(cursor ?? 0)
        .execute();

      console.log("→ RETURNING", itineraries.length, "itineraries");

      return ItineraryPreview.array().parse(itineraries);
    }),

  getItinerary: publicProcedure
    .input(ItineraryIdentity)
    .output(Itinerary)
    .query(async ({ input }) => {
      const { itineraryId } = input;

      const [itinerary] = await db
        .select({
          id: itineraryTable.id,
          title: itineraryTable.title,
          description: itineraryTable.description,
          content: itineraryTable.content,
          startDate: itineraryTable.startDate,
          endDate: itineraryTable.endDate,
          createdAt: itineraryTable.createdAt,
          destination: {
            id: destinationsTable.id,
            name: destinationsTable.name,
            country: destinationsTable.country,
            continent: destinationsTable.continent,
          },
          author: {
            id: profilesTable.id,
            displayName: profilesTable.displayName,
            username: profilesTable.username,
            avatarUrl: profilesTable.avatarUrl,
          },
        })
        .from(itineraryTable)
        .leftJoin(
          destinationsTable,
          eq(itineraryTable.destinationId, destinationsTable.id),
        )
        .leftJoin(profilesTable, eq(itineraryTable.authorId, profilesTable.id))
        .where(eq(itineraryTable.id, itineraryId));

      if (!itinerary) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Itinerary not found",
        });
      }

      const collaborators = await db
        .select()
        .from(itineraryCollaboratorsTable)
        .where(eq(itineraryCollaboratorsTable.itineraryId, itineraryId));

      const days = await db
        .select()
        .from(itineraryDaysTable)
        .where(eq(itineraryDaysTable.itineraryId, itineraryId));

      const dayIds = days.map((d) => d.id);

      const activities =
        dayIds.length > 0
          ? await db
              .select()
              .from(activitiesTable)
              .where(inArray(activitiesTable.itineraryDayId, dayIds))
          : [];

      const dayMap = days.map((day) => ({
        ...day,
        activities: activities.filter((a) => a.itineraryDayId === day.id),
      }));

      return Itinerary.parse({
        ...itinerary,
        collaborators,
        days: dayMap,
      });
    }),

  getUserItineraries: protectedProcedure
    .input(PaginationParams.optional())
    .output(ItineraryPreview.array())
    .query(async ({ ctx, input }) => {
      const { subject } = ctx;
      const { cursor } = input ?? { cursor: 0 };

      console.log("→ HIT getUserItineraries");

      const itineraries = await db
        .select({
          id: itineraryTable.id,
          title: itineraryTable.title,
          description: itineraryTable.description,
          content: itineraryTable.content,

          startDate: itineraryTable.startDate,
          endDate: itineraryTable.endDate,
          createdAt: itineraryTable.createdAt,

          destination: sql`
          CASE
            WHEN ${destinationsTable.id} IS NOT NULL THEN
              json_build_object(
                'id', ${destinationsTable.id},
                'name', ${destinationsTable.name},
                'country', ${destinationsTable.country},
                'continent', ${destinationsTable.continent}
              )::json
            ELSE NULL
          END
        `.as("destination"),

          author: {
            id: profilesTable.id,
            displayName: profilesTable.displayName,
            username: profilesTable.username,
            avatarUrl: profilesTable.avatarUrl,
          },
        })
        .from(itineraryTable)
        .leftJoin(
          destinationsTable,
          eq(itineraryTable.destinationId, destinationsTable.id),
        )
        .leftJoin(profilesTable, eq(itineraryTable.authorId, profilesTable.id))
        .where(eq(itineraryTable.authorId, subject.id))
        .orderBy(desc(itineraryTable.createdAt))
        .limit(25)
        .offset(cursor ?? 0)
        .execute();

      return ItineraryPreview.array().parse(itineraries);
    }),
});

export type TravelItineraryRouter = typeof travelItineraryRouter;
