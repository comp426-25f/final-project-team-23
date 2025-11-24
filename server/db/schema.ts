/**
 * This file defines the entire database schema - including all tables and relations.
 *
 * To configure the Supabase database using this schema as a guide, use the command:
 * ```
 * npx drizzle-kit push
 * ```
 *
 * @author Ajay Gandecha <agandecha@unc.edu>
 * @license MIT
 * @see https://comp426-25f.github.io/
 */

import {
  integer,
  index,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uuid,
  date,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const profilesTable = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  displayName: text("display_name").notNull(),
  username: text("username").notNull(),
  avatarUrl: text("avatar_url"),
});

export const serversTable = pgTable("servers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  serverImageUrl: text("server_image_url"),
  serverCreatorId: text("server_creator_id").references(() => profilesTable.id),
});

export const serverMembershipsTable = pgTable(
  "server_memberships",
  {
    serverId: uuid("server_id")
      .notNull()
      .references(() => serversTable.id),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profilesTable.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.serverId, t.profileId] }),
  }),
);

export const messagesTable = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    content: text("content"),
    authorId: uuid("author_id").references(() => profilesTable.id),
    serverId: uuid("server_id").references(() => serversTable.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    attachmentUrl: text("attachment_url"),
  },
  (table) => [
    index("content_search_index").using(
      "gin",
      sql`to_tsvector('english', ${table.content})`,
    ),
  ],
);

export const reactionsTable = pgTable("reactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  reaction: text("reaction").notNull(),
  messageId: uuid("message_id").references(() => messagesTable.id),
  profileId: uuid("profile_id").references(() => profilesTable.id),
  serverId: uuid("server_id").references(() => serversTable.id),
});

export const profilesRelations = relations(profilesTable, ({ many }) => ({
  createdServers: many(serversTable),
  messages: many(messagesTable),
  reactions: many(reactionsTable),
  serverMemberships: many(serverMembershipsTable),
  posts: many(postsTable),
  likedPosts: many(likesTable),
  following: many(profilesTable, { relationName: "following" }),
  followers: many(profilesTable, { relationName: "followers" }),
  itineraryCollaborator: many(itineraryCollaboratorsTable),
  itinerary: many(itineraryTable),
}));

export const serversRelations = relations(serversTable, ({ one, many }) => ({
  creator: one(profilesTable, {
    fields: [serversTable.serverCreatorId],
    references: [profilesTable.id],
  }),
  memberships: many(serverMembershipsTable),
  messages: many(messagesTable),
  reactions: many(reactionsTable),
}));

export const serverMembershipsRelations = relations(
  serverMembershipsTable,
  ({ one }) => ({
    server: one(serversTable, {
      fields: [serverMembershipsTable.serverId],
      references: [serversTable.id],
    }),
    profile: one(profilesTable, {
      fields: [serverMembershipsTable.profileId],
      references: [profilesTable.id],
    }),
  }),
);

export const messagesRelations = relations(messagesTable, ({ one, many }) => ({
  author: one(profilesTable, {
    fields: [messagesTable.authorId],
    references: [profilesTable.id],
  }),
  server: one(serversTable, {
    fields: [messagesTable.serverId],
    references: [serversTable.id],
  }),
  reactions: many(reactionsTable),
}));

export const reactionsRelations = relations(reactionsTable, ({ one }) => ({
  message: one(messagesTable, {
    fields: [reactionsTable.messageId],
    references: [messagesTable.id],
  }),
  profile: one(profilesTable, {
    fields: [reactionsTable.profileId],
    references: [profilesTable.id],
  }),
  server: one(serversTable, {
    fields: [reactionsTable.serverId],
    references: [serversTable.id],
  }),
}));

export const postsTable = pgTable("posts", {
  id: uuid("id").primaryKey(),
  content: text("content"),
  postedAt: timestamp("posted_at").defaultNow(),
  authorId: uuid("author_id").references(() => profilesTable.id, {
    onDelete: "cascade",
  }),
  attachmentUrl: text("attachment_url"),
  destinationId: uuid("destination_id").references(() => destinationsTable.id),
});

export const likesTable = pgTable(
  "likes",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => postsTable.id, { onDelete: "cascade" }),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profilesTable.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postId, t.profileId] }),
  }),
);

export const followsTable = pgTable(
  "follows",
  {
    followerId: uuid("follower_id")
      .notNull()
      .references(() => profilesTable.id, { onDelete: "cascade" }),
    followingId: uuid("following_id")
      .notNull()
      .references(() => profilesTable.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.followerId, t.followingId] }),
  }),
);

export const postsRelations = relations(postsTable, ({ one, many }) => ({
  author: one(profilesTable, {
    fields: [postsTable.authorId],
    references: [profilesTable.id],
  }),
  destination: one(destinationsTable, {
    fields: [postsTable.destinationId],
    references: [destinationsTable.id],
  }),
  likes: many(likesTable),
}));

export const likesRelations = relations(likesTable, ({ one }) => ({
  profile: one(profilesTable, {
    fields: [likesTable.profileId],
    references: [profilesTable.id],
  }),
  post: one(postsTable, {
    fields: [likesTable.postId],
    references: [postsTable.id],
  }),
}));

export const followsRelations = relations(followsTable, ({ one }) => ({
  follower: one(profilesTable, {
    fields: [followsTable.followerId],
    references: [profilesTable.id],
    relationName: "following",
  }),
  following: one(profilesTable, {
    fields: [followsTable.followingId],
    references: [profilesTable.id],
    relationName: "followers",
  }),
}));

export const itineraryCollaboratorsTable = pgTable(
  "itinerary_collaborators",
  {
    itineraryId: uuid("itinerary_id")
      .notNull()
      .references(() => itineraryTable.id),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profilesTable.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.itineraryId, t.profileId] }),
  }),
);

export const itineraryCollaboratorsRelations = relations(
  itineraryCollaboratorsTable,
  ({ one }) => ({
    itinerary: one(itineraryTable, {
      fields: [itineraryCollaboratorsTable.itineraryId],
      references: [itineraryTable.id],
    }),
    profile: one(profilesTable, {
      fields: [itineraryCollaboratorsTable.profileId],
      references: [profilesTable.id],
    }),
  }),
);

export const destinationsTable = pgTable("destinations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  continent: text("continent").notNull(),
});

export const itineraryTable = pgTable("itineraries", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content"),
  destinationId: uuid("destination_id").references(() => destinationsTable.id),
  title: text("title").notNull(),
  description: text("description"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  authorId: uuid("author_id").references(() => profilesTable.id),
});

export const itineraryDaysTable = pgTable("itinerary_days", {
  id: uuid("id").defaultRandom().primaryKey(),
  itineraryId: uuid("itinerary_id")
    .notNull()
    .references(() => itineraryTable.id),
  dayNumber: integer("day_number").notNull(),
  notes: text("notes"),
});

export const activitiesTable = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  itineraryDayId: uuid("itinerary_day_id")
    .notNull()
    .references(() => itineraryDaysTable.id),
  time: timestamp("time").notNull(),
  name: text("name").notNull(),
  category: text("category"),
  description: text("description").notNull(),
  location: text("location"),
});

export const destinationsRelations = relations(
  destinationsTable,
  ({ many }) => ({
    posts: many(postsTable),
    itineraries: many(itineraryTable),
  }),
);

export const itineraryRelations = relations(
  itineraryTable,
  ({ one, many }) => ({
    author: one(profilesTable, {
      fields: [itineraryTable.authorId],
      references: [profilesTable.id],
    }),
    destination: one(destinationsTable, {
      fields: [itineraryTable.destinationId],
      references: [destinationsTable.id],
    }),
    collaborators: many(itineraryCollaboratorsTable),
    days: many(itineraryDaysTable),
  }),
);

export const itineraryDaysRelations = relations(
  itineraryDaysTable,
  ({ one, many }) => ({
    itinerary: one(itineraryTable, {
      fields: [itineraryDaysTable.itineraryId],
      references: [itineraryTable.id],
    }),
    activities: many(activitiesTable),
  }),
);

export const activitiesRelations = relations(activitiesTable, ({ one }) => ({
  itineraryDay: one(itineraryDaysTable, {
    fields: [activitiesTable.itineraryDayId],
    references: [itineraryDaysTable.id],
  }),
}));
