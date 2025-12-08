"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { api } from "@/utils/trpc/api";
import PostCard from "@/components/post";
import { Subject } from "@/server/models/auth";
import { useAuth } from "@/utils/use-auth";
import Link from "next/link";
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props";
import { GetServerSidePropsContext } from "next";

export default function FriendsFeedPage() {
  const { user, isLoading: authLoading } = useAuth();

  const {data: posts, isLoading: postsLoading, } = api.posts.getFollowingFeed.useQuery({ cursor: 0 });

  return (
    <div className="min-h-screen bg-muted/30">

      <main className="mx-auto max-w-6xl p-10">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Friends Feed</h1>

          {user && (
            <Link href="/new_post">
                <Button>
                    Create Journal
                </Button>
            </Link>
          )}
        </div>

        <p className="mt-2 text-lg text-muted-foreground mb-6">
          See what incredible trips your friends have been on!
        </p>

        {authLoading || postsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin h-10 w-10 text-primary" />
          </div>
        ) : !posts || posts.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            <p>No travel posts yet. Be the first to tell your friends about your adventures!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
            {posts.map((post) => (
              <PostCard key={post.id} user={user as Subject} post={post} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Create the supabase context that works specifically on the server and
  // pass in the context.
  const supabase = createSupabaseServerClient(context);

  // Attempt to load the user data
  const { data: userData, error: userError } = await supabase.auth.getUser();

  // If the user is not logged in, redirect them to the login page.
  if (userError || !userData) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
