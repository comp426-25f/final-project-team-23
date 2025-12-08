import { ExternalLink, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { z } from "zod";
import { Post } from "@/server/models/responses";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { api } from "@/utils/trpc/api";
import { Subject } from "@/server/models/auth";

type PostCardProps = {
  user: Subject;
  post: z.infer<typeof Post>;
};
export default function PostCard({ user, post }: PostCardProps) {
  // Create necessary hooks for clients and providers.
  const supabase = createSupabaseComponentClient();
  const router = useRouter();

  // Determine the initial value for the `isLiked` hook.
  const likedByUser = post.likes.some((like) => like.profileId === user?.id);

  // Store whether or not the post is liked by the user.
  // This should optimistically update when the user clicks the like button
  // to avoid needing to refetch the post.
  const [isLiked, setIsLiked] = useState(likedByUser);

  // Helper variable to determine the number of likes to display, which updates
  // when the user clicks the like button. We need to subtract 1 from the number
  // of likes if the user has already liked the post, since we are optimistically
  // updating the state to reflect the new number of likes.
  const numberOfLikes = likedByUser ? post.likes.length - 1 : post.likes.length;

  // Mutation for toggling the like.
  const { mutate: toggleLike } = api.posts.toggleLike.useMutation();

  return (
    <div className="flex h-fit w-fit flex-row gap-3 rounded-2xl border border-gray-100 bg-white p-6 shadow-md dark:border-slate-700 dark:bg-slate-900/80">
      <Avatar className="mt-1">
        <AvatarImage
          src={
            post.author.avatarUrl
              ? supabase.storage
                  .from("avatars")
                  .getPublicUrl(post.author.avatarUrl).data.publicUrl
              : undefined
          }
        />
        <AvatarFallback>
          {post.author.displayName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex w-full flex-col gap-3">
        <div className="flex flex-row items-center justify-between">
          <Link
            href={`/profile/${post.author.id}`}
            className="flex flex-row items-center"
          >
            <p className="text-primary font-bold hover:underline dark:text-slate-100">
              {post.author.displayName}
            </p>
            <p className="text-muted-foreground ml-3 hover:underline">
              @{post.author.username}
            </p>
          </Link>
          <div className="flex flex-row items-center">
            <Button
              variant="ghost"
              onClick={async () => {
                setIsLiked(!isLiked);
                toggleLike(
                  { postId: post.id.toString() },
                  {
                    onError: () => {
                      setIsLiked(!isLiked);
                    },
                  },
                );
              }}
            >
              <p
                className={`text-sm ${
                  isLiked ? "text-pink-600" : "text-muted-foreground"
                }`}
              >
                {numberOfLikes + (isLiked ? 1 : 0)}
              </p>
              <Heart className={`${isLiked ? "text-pink-600" : ""}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                router.push(`/post/${post.id}`);
              }}
            >
              <ExternalLink className="text-muted-foreground" />
            </Button>
          </div>
        </div>
        {post.destination && (
          <p className="text-muted-foreground text-sm">
            📍 <span className="font-medium">{post.destination.name}</span>,{" "}
            {post.destination.country}
          </p>
        )}
        <div className="my-2 flex min-w-full flex-col gap-4">
          {post.attachmentUrl && (
            <Image
              className="rounded-xl"
              src={
                supabase.storage
                  .from("post-images")
                  .getPublicUrl(post.attachmentUrl).data.publicUrl
              }
              alt="Image"
              width={600}
              height={600}
            />
          )}
          <p>{post.content}</p>
        </div>
      </div>
    </div>
  );
}
