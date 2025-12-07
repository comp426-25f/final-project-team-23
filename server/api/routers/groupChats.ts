import { createTRPCRouter, protectedProcedure } from "../trpc";
import { db } from "@/server/db";
import {
  profilesTable,
  followsTable,
  serversTable,
  serverMembershipsTable,
  messagesTable,
} from "@/server/db/schema";
import { eq, and, desc } from "drizzle-orm";
import z from "zod";
import { PaginationParams } from "@/server/models/inputs";

export const groupChatsApiRouter = createTRPCRouter({
  getFriends: protectedProcedure.query(async ({ ctx }) => {
    const { subject } = ctx;

    const rows = await db
      .select({
        id: profilesTable.id,
        displayName: profilesTable.displayName,
        username: profilesTable.username,
        avatarUrl: profilesTable.avatarUrl,
      })
      .from(followsTable)
      .innerJoin(profilesTable, eq(followsTable.followingId, profilesTable.id))
      .where(eq(followsTable.followerId, subject.id));

    return rows;
  }),

  getUserGroupChats: protectedProcedure.query(async ({ ctx }) => {
    const { subject } = ctx;

    const rows = await db
      .select({
        id: serversTable.id,
        name: serversTable.name,
        serverImageUrl: serversTable.serverImageUrl,
      })
      .from(serverMembershipsTable)
      .innerJoin(
        serversTable,
        eq(serverMembershipsTable.serverId, serversTable.id),
      )
      .where(eq(serverMembershipsTable.profileId, subject.id));

    return rows;
  }),

  createGroupChat: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        memberIds: z.array(z.string().uuid()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { subject } = ctx;
      const { name, memberIds } = input;

      const uniqueMemberIds = Array.from(new Set([...memberIds, subject.id]));

      const [server] = await db
        .insert(serversTable)
        .values({
          id: crypto.randomUUID(),
          name,
          serverCreatorId: subject.id,
        })
        .returning({ id: serversTable.id });

      const values = uniqueMemberIds.map((profileId) => ({
        serverId: server.id,
        profileId,
      }));

      await db.insert(serverMembershipsTable).values(values);

      return server;
    }),

  getGroupMessages: protectedProcedure
    .input(
      PaginationParams.extend({
        serverId: z.string().uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { subject } = ctx;
      const { serverId, cursor } = input;

      const membership = await db
        .select()
        .from(serverMembershipsTable)
        .where(
          and(
            eq(serverMembershipsTable.serverId, serverId),
            eq(serverMembershipsTable.profileId, subject.id),
          ),
        );

      if (membership.length === 0) {
        return [];
      }

      const rows = await db
        .select({
          id: messagesTable.id,
          content: messagesTable.content,
          createdAt: messagesTable.createdAt,
          author: {
            id: profilesTable.id,
            displayName: profilesTable.displayName,
            username: profilesTable.username,
            avatarUrl: profilesTable.avatarUrl,
          },
        })
        .from(messagesTable)
        .innerJoin(profilesTable, eq(messagesTable.authorId, profilesTable.id))
        .where(eq(messagesTable.serverId, serverId))
        .orderBy(desc(messagesTable.createdAt))
        .limit(50)
        .offset(cursor ?? 0);

      return rows;
    }),

  sendGroupMessage: protectedProcedure
    .input(
      z.object({
        serverId: z.string().uuid(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { subject } = ctx;
      const { serverId, content } = input;

      const membership = await db
        .select()
        .from(serverMembershipsTable)
        .where(
          and(
            eq(serverMembershipsTable.serverId, serverId),
            eq(serverMembershipsTable.profileId, subject.id),
          ),
        );

      if (membership.length === 0) {
        throw new Error("You are not a member of this group chat.");
      }

      await db.insert(messagesTable).values({
        id: crypto.randomUUID(),
        content,
        authorId: subject.id,
        serverId,
        attachmentUrl: null,
      });
    }),
});
