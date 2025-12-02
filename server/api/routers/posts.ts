import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { Post } from "@/server/models/responses";
import {
  DraftPost,
  PaginationParams,
  PostIdentity,
} from "@/server/models/inputs";
import {
  postsTable,
  likesTable,
  followsTable,
  profilesTable,
  destinationsTable,
} from "@/server/db/schema";
import { db } from "@/server/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const getPost = publicProcedure
  .input(PostIdentity)
  .output(Post)
  .query(async ({ input }) => {
    const { postId } = input;

    const [post] = await db
      .select({
        id: postsTable.id,
        content: postsTable.content,
        postedAt: postsTable.postedAt,
        attachmentUrl: postsTable.attachmentUrl,
        author: {
          id: profilesTable.id,
          name: profilesTable.displayName,
          handle: profilesTable.username,
          avatarUrl: profilesTable.avatarUrl,
        },
      })
      .from(postsTable)
      .leftJoin(profilesTable, eq(postsTable.authorId, profilesTable.id))
      .where(eq(postsTable.id, postId))
      .execute();

    if (!post) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
    }

    const likes = await db
      .select({
        profileId: likesTable.profileId,
      })
      .from(likesTable)
      .where(eq(likesTable.postId, postId))
      .execute();

    const fullPost = {
      ...post,
      likes,
    };

    return Post.parse(fullPost);
  });

const toggleLike = protectedProcedure
  .input(PostIdentity)
  .mutation(async ({ ctx, input }) => {
    const { postId } = input;
    const { subject } = ctx;

    const existingLikes = await db
      .select()
      .from(likesTable)
      .where(
        and(
          eq(likesTable.postId, postId),
          eq(likesTable.profileId, subject.id),
        ),
      )
      .execute();

    if (existingLikes.length > 0) {
      await db
        .delete(likesTable)
        .where(
          and(
            eq(likesTable.postId, postId),
            eq(likesTable.profileId, subject.id),
          ),
        );
    } else {
      await db.insert(likesTable).values({
        postId,
        profileId: subject.id,
      });
    }
  });

const getFeed = protectedProcedure
  .input(PaginationParams)
  .output(Post.array())
  .query(async ({ input }) => {
    const { cursor } = input;

    const posts = await db
      .select({
        id: postsTable.id,
        content: postsTable.content,
        postedAt: postsTable.postedAt,
        attachmentUrl: postsTable.attachmentUrl,

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

        likes: sql`
          COALESCE(
            json_agg(
              json_build_object('profileId', ${likesTable.profileId})
            ) FILTER (WHERE ${likesTable.profileId} IS NOT NULL),
            '[]'
          )
        `.as("likes"),
      })
      .from(postsTable)
      .leftJoin(profilesTable, eq(postsTable.authorId, profilesTable.id))
      .leftJoin(likesTable, eq(postsTable.id, likesTable.postId))
      .leftJoin(
        destinationsTable,
        eq(postsTable.destinationId, destinationsTable.id),
      )
      .groupBy(
        postsTable.id,
        profilesTable.id,
        profilesTable.displayName,
        profilesTable.username,
        profilesTable.avatarUrl,

        destinationsTable.id,
        destinationsTable.name,
        destinationsTable.country,
      )
      .orderBy(desc(postsTable.postedAt))
      .limit(25)
      .offset(cursor ?? 0);

    return Post.array().parse(posts);
  });

const getFollowingFeed = protectedProcedure
  .input(PaginationParams)
  .output(Post.array())
  .query(async ({ ctx, input }) => {
    const { subject } = ctx;
    const { cursor } = input;

    const following = await db
      .select({ followingId: followsTable.followingId })
      .from(followsTable)
      .where(eq(followsTable.followerId, subject.id));

    const followedIds = following.map((f) => f.followingId);
    console.log("Following IDs:", followedIds);

    if (followedIds.length === 0) {
      return [];
    }

    const posts = await db.query.postsTable.findMany({
      where: (posts, { inArray }) => inArray(posts.authorId, followedIds),
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

const createPost = protectedProcedure
  .input(DraftPost)
  .mutation(async ({ ctx, input }) => {
    const { subject } = ctx;
    const { content, attachmentUrl } = input;

    await db
      .insert(postsTable)
      .values({
        id: crypto.randomUUID(),
        content,
        attachmentUrl,
        authorId: subject.id,
        destinationId: input.destinationId,
      })
      .execute();
  });

export const postsApiRouter = createTRPCRouter({
  getPost: getPost,
  toggleLike: toggleLike,
  getFeed: getFeed,
  getFollowingFeed: getFollowingFeed,
  createPost: createPost,
});
