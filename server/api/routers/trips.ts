import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  Itinerary,
  ItineraryDay,
  Activity,
  Profile,
  EditedItinerary,
} from "@/server/models/responses";
import { db } from "@/server/db";

import {
  itineraryCollaboratorsTable,
  itineraryDaysTable,
  itineraryTable,
  activitiesTable,
} from "@/server/db/schema";
import { eq, and, inArray, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  ItineraryDayIdentity,
  NewActivity,
  NewItinerary,
  NewItineraryDay,
} from "@/server/models/inputs";

// Gets a list of trips that the user is a member of
const getItineraries = protectedProcedure
  .output(Itinerary.array())
  .query(async ({ ctx }) => {
    const { subject } = ctx;

    const memberTrips = await db.query.itineraryCollaboratorsTable.findMany({
      where: eq(itineraryCollaboratorsTable.profileId, subject.id),
      columns: {
        itineraryId: true,
      },
    });

    const memberTripIds = memberTrips.map((member) => member.itineraryId);

    const itineraries = await db.query.itineraryTable.findMany({
      where: inArray(itineraryTable.id, memberTripIds),
      orderBy: [itineraryTable.createdAt],
      columns: {
        id: true,
        authorId: true,
        description: true,
        content: true,
        createdAt: true,
        title: true,
        destinationId: true,
        startDate: true,
        endDate: true,
      },
      with: {
        days: {
          orderBy: [itineraryDaysTable.dayNumber],
          columns: {
            id: true,
            itineraryId: true,
            dayNumber: true,
            notes: true,
          },
        },
      },
    });

    return Itinerary.array().parse(itineraries);
  });

// Gets the collaborators of the itinerary given Itinerary ID
const getCollaborators = protectedProcedure
  .input(z.object({ itineraryId: z.string() }))
  .output(Profile.array())
  .query(async ({ input }) => {
    const { itineraryId } = input;

    const collaborators = await db.query.itineraryCollaboratorsTable.findMany({
      where: eq(itineraryCollaboratorsTable.itineraryId, itineraryId),
      with: {
        profile: {
          columns: {
            id: true,
            username: true,
            avatarUrl: true,
            displayName: true,
          },
        },
      },
    });

    const collabs = collaborators.map((collab) => collab.profile);

    return Profile.array().parse(collabs);
  });

// Gets one itinerary by its ID
const getItinerary = protectedProcedure
  .input(z.object({ itineraryId: z.string() }))
  .output(Itinerary.nullable())
  .query(async ({ input }) => {
    const { itineraryId } = input;

    const itinerary = await db.query.itineraryTable.findFirst({
      where: eq(itineraryTable.id, itineraryId),
      columns: {
        id: true,
        title: true,
        createdAt: true,
        description: true,
        content: true,
        destinationId: true,
        authorId: true,
        endDate: true,
        startDate: true,
      },
      with: {
        days: {
          columns: {
            id: true,
            itineraryId: true,
            dayNumber: true,
            notes: true,
          },
        },
      },
    });
    return Itinerary.nullable().parse(itinerary);
  });

// Edits an itinerary
const editItinerary = protectedProcedure
  .input(EditedItinerary)
  .mutation(async ({ input: editedItinerary }) => {
    const { ...rest } = editedItinerary;
    await db
      .update(itineraryTable)
      .set({
        // date needed to be converted to ISO String
        ...rest,
        startDate: editedItinerary.startDate.toISOString(),
        endDate: editedItinerary.endDate.toISOString(),
      })
      .where(eq(itineraryTable.id, editedItinerary.id));
  });

// Deletes an itinerary
const deleteItinerary = protectedProcedure
  .input(z.object({ itineraryId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const { subject } = ctx;
    const { itineraryId } = input;

    await db
      .delete(itineraryTable)
      .where(
        and(
          eq(itineraryTable.id, itineraryId),
          eq(itineraryTable.authorId, subject.id),
        ),
      );
  });

const createItinerary = protectedProcedure
  .input(NewItinerary)
  .output(Itinerary)
  .mutation(async ({ ctx, input }) => {
    const { subject } = ctx;

    const [createdItinerary] = await db
      .insert(itineraryTable)
      .values({
        title: input.title,
        authorId: subject.id,
        createdAt: new Date(),
        startDate: input.startDate,
        endDate: input.endDate,
        description: input.description,
        content: input.content,
        destinationId: input.destinationId,
      })
      .returning({ id: itineraryTable.id });

    await db.insert(itineraryCollaboratorsTable).values({
      itineraryId: createdItinerary.id,
      profileId: subject.id,
    });

    const finalItin = await db.query.itineraryTable.findFirst({
      where: eq(itineraryTable.id, createdItinerary.id),
      columns: {
        title: true,
        id: true,
        authorId: true,
        createdAt: true,
        startDate: true,
        endDate: true,
        description: true,
        content: true,
        destinationId: true,
      },
      with: {
        days: {
          columns: {
            id: true,
            itineraryId: true,
            dayNumber: true,
            notes: true,
          },
        },
      },
    });

    if (!finalItin) throw new TRPCError({ code: "NOT_FOUND" });
    return Itinerary.parse(finalItin);
  });

const joinItinerary = protectedProcedure
  .input(z.object({ itineraryId: z.string() }))
  .output(Itinerary)
  .mutation(async ({ ctx, input }) => {
    const { subject } = ctx;
    const { itineraryId } = input;

    await db
      .insert(itineraryCollaboratorsTable)
      .values({ itineraryId: itineraryId, profileId: subject.id });

    const itinerary = await db.query.itineraryTable.findFirst({
      where: eq(itineraryTable.id, itineraryId),
      columns: {
        id: true,
        createdAt: true,
        description: true,
        content: true,
        destinationId: true,
        authorId: true,
        endDate: true,
        title: true,
        startDate: true,
      },
      with: {
        days: {
          columns: {
            id: true,
            dayNumber: true,
            itineraryId: true,
            notes: true,
          },
        },
      },
    });

    if (!itinerary) throw new TRPCError({ code: "NOT_FOUND" });

    return Itinerary.parse(itinerary);
  });

const leaveItinerary = protectedProcedure
  .input(z.object({ itineraryId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const { subject } = ctx;
    const { itineraryId } = input;

    const itinerary = await db.query.itineraryTable.findFirst({
      where: eq(itineraryTable.id, itineraryId),
      columns: {
        authorId: true,
      },
    });

    if (!itinerary) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }
    if (itinerary.authorId == subject.id) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Author cannot leave their own itinerary.",
      });
    }
    await db
      .delete(itineraryCollaboratorsTable)
      .where(
        and(
          eq(itineraryCollaboratorsTable.itineraryId, itineraryId),
          eq(itineraryCollaboratorsTable.profileId, subject.id),
        ),
      );
  });

const getDays = protectedProcedure
  .input(z.object({ itineraryId: z.string() }))
  .output(ItineraryDay.array())
  .query(async ({ input }) => {
    const { itineraryId } = input;

    const days = await db.query.itineraryDaysTable.findMany({
      where: eq(itineraryDaysTable.itineraryId, itineraryId),
      orderBy: [itineraryDaysTable.dayNumber],
      columns: {
        id: true,
        itineraryId: true,
        notes: true,
        dayNumber: true,
      },
      with: {
        activities: {
          columns: {
            id: true,
            itineraryDayId: true,
            name: true,
            time: true,
            description: true,
            category: true,
            location: true,
          },
        },
      },
    });

    return ItineraryDay.array().parse(days);
  });

const createDay = protectedProcedure
  .input(NewItineraryDay)
  .mutation(async ({ input }) => {
    await db.update(itineraryDaysTable).set({
      notes: input.notes,
      dayNumber: input.dayNumber,
    });
  });

const editDay = protectedProcedure
  .input(ItineraryDay)
  .mutation(async ({ input }) => {
    await db
      .update(itineraryDaysTable)
      .set({ id: input.id, dayNumber: input.dayNumber, notes: input.notes })
      .where(eq(itineraryDaysTable.id, input.id));
  });

const deleteDay = protectedProcedure
  .input(ItineraryDayIdentity)
  .mutation(async ({ input }) => {
    await db
      .delete(itineraryDaysTable)
      .where(eq(itineraryDaysTable.id, input.itineraryDayId));
  });

const getActivities = protectedProcedure
  .input(ItineraryDayIdentity)
  .output(Activity.array())
  .query(async ({ input }) => {
    const activities = await db.query.activitiesTable.findMany({
      where: eq(itineraryDaysTable.id, input.itineraryDayId),
      orderBy: [desc(activitiesTable.time)],
      columns: {
        id: true,
        itineraryDayId: true,
        category: true,
        name: true,
        time: true,
        location: true,
        description: true,
      },
    });

    return Activity.array().parse(activities);
  });

const createActivity = protectedProcedure
  .input(NewActivity)
  .mutation(async ({ input }) => {
    await db.insert(activitiesTable).values({
      itineraryDayId: input.itineraryDayId,
      description: input.description,
      name: input.name,
      time: new Date(input.time),
      category: input.category,
      location: input.location,
    });
  });

const editActivity = protectedProcedure
  .input(Activity)
  .mutation(async ({ input }) => {
    const { description, name, time, category, location } = input;
    await db.update(activitiesTable).set({
      description: description,
      name: name,
      time: time,
      category: category,
      location: location,
    });
  });

export const itinerariesApiRouter = createTRPCRouter({
  getItineraries: getItineraries,
  getCollaborators: getCollaborators,
  getItinerary: getItinerary,
  editItinerary: editItinerary,
  deleteItinerary: deleteItinerary,
  createItinerary: createItinerary,
  joinItinerary: joinItinerary,
  leaveItinerary: leaveItinerary,
  getDays: getDays,
  createDay: createDay,
  editDay: editDay,
  deleteDay: deleteDay,
  getActivities: getActivities,
  createActivity: createActivity,
  editActivity: editActivity,
});
