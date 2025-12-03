import { z } from "zod";
import { convertKeysToCamelCase } from "../api/helpers/camel-case";

export const Profile = z.object({
  id: z.string().uuid(),
  displayName: z.string(),
  username: z.string(),
  avatarUrl: z.string().nullable(),
});

export const Channel = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export const ServerMember = z.object({
  profileId: z.string().uuid(),
  profile: Profile.optional(),
});

export const Server = z.object({
  id: z.string().uuid(),
  name: z.string(),
  serverImageUrl: z.string().nullable(),
  channels: Channel.array().default([]),
  members: ServerMember.array().default([]),
  serverCreatorId: z.string().uuid(),
});

export const EditedServer = Server.omit({
  channels: true,
  serverCreatorId: true,
  members: true,
});

export const PostLikes = z.object({
  profileId: z.string().uuid(),
});

export const Destination = z.object({
  id: z.string().uuid(),
  name: z.string(),
  country: z.string(),
  continent: z.string(),
});

export const Post = z.object({
  id: z.string().uuid(),
  content: z.string(),
  postedAt: z.date({ coerce: true }),
  author: Profile,
  likes: PostLikes.array(),
  attachmentUrl: z.string().nullish(),
  destination: Destination.nullable(),
});

export const Following = z.object({
  following: Profile,
});

export const Follower = z.object({
  follower: Profile,
});

export const MessageReaction = z.object({
  id: z.string().uuid(),
  reaction: z.string(),
  profileId: z.string().uuid(),
});

export const Message = z.object({
  id: z.string().uuid(),
  content: z.string(),
  createdAt: z.date({ coerce: true }).nullable(),
  attachmentUrl: z.string().nullable(),
  author: Profile,
  reactions: MessageReaction.array().default([]),
});

export const DraftMessage = z.preprocess(
  (data) => convertKeysToCamelCase(data),
  z.object({
    id: z.string().uuid(),
    content: z.string(),
    authorId: z.string().uuid(),
    channelId: z.string().uuid(),
    attachmentUrl: z.string().nullable(),
    createdAt: z.coerce.date().nullable(),
  }),
);

export const Activity = z.object({
  id: z.string().uuid(),
  itineraryDayId: z.string().uuid(),
  time: z.date({ coerce: true }),
  name: z.string(),
  category: z.string().nullable(),
  description: z.string(),
  location: z.string().nullable(),
});

export const ItineraryDay = z.object({
  id: z.string().uuid(),
  dayNumber: z.number(),
  notes: z.string().nullable(),
  activities: Activity.array(),
});

export const ItineraryCollaborator = z.object({
  profileId: z.string().uuid(),
});

export const Itinerary = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  content: z.string().nullable(),
  startDate: z.date({ coerce: true }),
  endDate: z.date({ coerce: true }),
  createdAt: z.date({ coerce: true }),

  destination: Destination.nullable(),
  collaborators: ItineraryCollaborator.array(),
  days: ItineraryDay.array(),
  author: Profile,
});

export const EditedItinerary = Itinerary.omit({
  createdAt: true,
  author: true,
});

export const ItineraryPreview = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable(),
  createdAt: z.date({ coerce: true }),
  destination: Destination.nullable(),
  author: Profile,
  startDate: z.date({ coerce: true }),
  endDate: z.date({ coerce: true }),
});

export const placeholder = {};
