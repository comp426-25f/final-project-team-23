import z from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { Post, Profile } from "@/server/models/responses";
import {
  DraftProfileImage,
  NewUser,
  PaginationParams,
  ProfileIdentity,
} from "@/server/models/inputs";
import { db } from "@/server/db"; // your Drizzle db client
import { profilesTable, postsTable, followsTable } from "@/server/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const getProfile = publicProcedure
  .input(ProfileIdentity)
  .output(Profile)
  .query(async ({ input }) => {
    const { profileId } = input;

    const results = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, profileId))
      .execute();

    if (results.length === 0) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Profile not found",
      });
    }

    return Profile.parse(results[0]);
  });

const getAuthedUserProfile = protectedProcedure
  .output(Profile)
  .query(async ({ ctx }) => {
    const { subject } = ctx;

    const result = await db.query.profilesTable.findFirst({
      where: eq(profilesTable.id, subject.id),
    });

    if (!result) throw new Error("Profile not found");

    return Profile.parse(result);
  });

const toggleFollowingProfile = protectedProcedure
  .input(ProfileIdentity)
  .mutation(async ({ ctx, input }) => {
    const { subject } = ctx;
    const { profileId } = input;

    const existing = await db
      .select()
      .from(followsTable)
      .where(
        and(
          eq(followsTable.followerId, subject.id),
          eq(followsTable.followingId, profileId),
        ),
      )
      .execute();

    if (existing.length > 0) {
      await db
        .delete(followsTable)
        .where(
          and(
            eq(followsTable.followerId, subject.id),
            eq(followsTable.followingId, profileId),
          ),
        );
    } else {
      await db
        .insert(followsTable)
        .values({ followerId: ctx.subject.id, followingId: input.profileId })
        .execute();
    }
  });

const getFollowsForProfile = publicProcedure
  .input(ProfileIdentity)
  .output(Profile.array())
  .query(async ({ input }) => {
    const { profileId } = input;

    const results = await db
      .select()
      .from(followsTable)
      .innerJoin(profilesTable, eq(followsTable.followingId, profilesTable.id))
      .where(eq(followsTable.followerId, profileId));

    return Profile.array().parse(results);
  });

const getIsUserFollowingProfile = protectedProcedure
  .input(ProfileIdentity)
  .output(z.boolean())
  .query(async ({ ctx, input }) => {
    const { subject } = ctx;
    const { profileId } = input;

    const result = await db
      .select()
      .from(followsTable)
      .where(
        and(
          eq(followsTable.followerId, subject.id),
          eq(followsTable.followingId, profileId),
        ),
      )
      .execute();

    return result.length > 0;
  });

const getPostsForProfile = publicProcedure
  .input(ProfileIdentity.and(PaginationParams))
  .output(Post.array())
  .query(async ({ input }) => {
    const { profileId, cursor } = input;

    const posts = await db.query.postsTable.findMany({
      where: eq(postsTable.authorId, profileId),
      with: {
        author: true,
        likes: true,
        destination: true,
      },
      orderBy: desc(postsTable.postedAt),
      limit: 25,
      offset: cursor ?? 0,
    });

    return Post.array().parse(posts);
  });

const handleNewUser = protectedProcedure
  .input(NewUser)
  .mutation(async ({ ctx, input }) => {
    const { subject } = ctx;
    const { name, handle } = input;

    await db.insert(profilesTable).values({
      id: subject.id,
      displayName: input.name,
      username: input.handle,
      avatarUrl: null,
    });
  });

const updateProfilePicture = protectedProcedure
  .input(DraftProfileImage)
  .mutation(async ({ ctx, input }) => {
    const { subject } = ctx;
    const { avatarUrl } = input;

    await db
      .update(profilesTable)
      .set({ avatarUrl: avatarUrl })
      .where(eq(profilesTable.id, subject.id));
  });

export const profilesApiRouter = createTRPCRouter({
  getProfile: getProfile,
  getAuthedUserProfile: getAuthedUserProfile,
  toggleFollowingProfile: toggleFollowingProfile,
  getFollowsForProfile: getFollowsForProfile,
  getIsUserFollowingProfile: getIsUserFollowingProfile,
  getPostsForProfile: getPostsForProfile,
  handleNewUser: handleNewUser,
  updateProfilePicture: updateProfilePicture,
});
