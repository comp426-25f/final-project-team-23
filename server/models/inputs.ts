import { z } from "zod";

export const ServerIdentity = z.object({ serverId: z.string().uuid() });

export const ProfileIdentity = z.object({ profileId: z.string().uuid() });

export const NewChannel = z.object({
  serverId: z.string(),
  channelName: z.string(),
});

export const PaginatedMessagesRequest = z.object({
  channelId: z.string(),
  cursor: z.number().default(0),
  textSearch: z.string().optional(),
});

export const NewReaction = z.object({
  channelId: z.string().uuid(),
  messageId: z.string().uuid(),
  emoji: z.string(),
});

export const RemoveReactionRequest = NewReaction;

export const NewProfileImage = z.object({ avatarUrl: z.string().optional() });

export const NewDisplayName = z.object({ newDisplayName: z.string() });

export const NewProfile = z.object({
  displayName: z.string(),
  username: z.string(),
});

export const PostIdentity = z.object({
  postId: z.string().uuid(),
  limit: z.number().min(1).max(50).default(10),
});

export const PaginationParams = z.object({
  cursor: z.number().default(0),
});

export const DraftPost = z.object({
  content: z.string(),
  attachmentUrl: z.string().nullish(),
  destinationId: z.string().uuid(),
});

export const DraftProfileImage = z.object({ avatarUrl: z.string().nullish() });

export const NewUser = z.object({ name: z.string(), handle: z.string() });

export const MessageIdentity = z.object({
  messageId: z.string().uuid(),
});

export const ReactionIdentity = z.object({
  reactionId: z.string().uuid(),
});

export const DestinationIdentity = z.object({
  destinationId: z.string().uuid(),
});

export const ItineraryIdentity = z.object({
  itineraryId: z.string().uuid(),
});

export const ItineraryDayIdentity = z.object({
  itineraryDayId: z.string().uuid(),
});

export const ActivityIdentity = z.object({
  activityId: z.string().uuid(),
});

export const NewItinerary = z.object({
  title: z.string(),
  description: z.string().optional(),
  content: z.string().optional(),
  destinationId: z.string().uuid(),
  startDate: z.string(),
  endDate: z.string(),
});

export const AddItineraryCollaborator = z.object({
  itineraryId: z.string().uuid(),
  profileId: z.string().uuid(),
});

export const NewItineraryDay = z.object({
  itineraryId: z.string().uuid(),
  dayNumber: z.number().int().min(1),
  notes: z.string().optional(),
});

export const NewActivity = z.object({
  itineraryDayId: z.string().uuid(),
  time: z.string(),
  name: z.string(),
  category: z.string().optional(),
  description: z.string(),
  location: z.string().optional(),
});

export const NewDestination = z.object({
  name: z.string(),
  country: z.string(),
  continent: z.string(),
});

export const LikePostRequest = z.object({
  postId: z.number(),
  profileId: z.string().uuid(),
});

export const FollowUser = z.object({
  followerId: z.string().uuid(),
  followingId: z.string().uuid(),
});

export const NewPost = z.object({
  content: z.string(),
  attachmentUrl: z.string().nullish(),
  destinationId: z.string().uuid().nullish(),
});

export const CreateFullItineraryInput = z.object({
  title: z.string(),
  description: z.string().optional(),
  content: z.string().optional(),
  destinationId: z.string().uuid(),
  startDate: z.string(),
  endDate: z.string(),

  days: z.array(
    z.object({
      dayNumber: z.number().int().min(1),
      notes: z.string().optional(),
      activities: z.array(
        z.object({
          time: z.string(),
          name: z.string(),
          category: z.string().optional(),
          description: z.string(),
          location: z.string().optional(),
        }),
      ),
    }),
  ),
});
