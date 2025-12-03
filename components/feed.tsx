import { Fragment } from "react";
import { InView } from "react-intersection-observer";
import { z } from "zod";
import { Post } from "@/server/models/responses";
import { InfiniteData } from "@tanstack/react-query";
import PostCard from "./post";
import { Separator } from "./ui/separator";
import { Subject } from "@/server/models/auth";
import Loading from "./loading";

type PostFeedProps = {
  user: Subject;
  posts: InfiniteData<z.infer<typeof Post>[]> | undefined;
  postsLoading: boolean;
  fetchNext: () => void;
};

export default function PostFeed({
  user,
  posts,
  postsLoading,
  fetchNext,
}: PostFeedProps) {
  return (
    <>
      {posts &&
        posts.pages.map((page) => {
          return page.map((post, postIndex) => (
            <Fragment key={`post_${post.id}`}>
              
              {postIndex === 20 && (
                <InView onChange={(inView) => inView && fetchNext()}></InView>
              )}
              <PostCard user={user} post={post} />
              <Separator />
            </Fragment>
          ));
        })}
      {postsLoading && <Loading />}
    </>
  );
}
