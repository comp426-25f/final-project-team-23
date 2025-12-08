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
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function FriendsFeedPage() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: posts, isLoading: postsLoading, } = api.posts.getFollowingFeed.useQuery({ cursor: 0 });

  return (
    <div className="min-h-screen relative horizon-bg">
      <main className="mx-auto w-full max-w-6xl px-6 py-12 flex flex-col gap-8">


        <Card className="bg-white rounded-2xl shadow-md border border-gray-100">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <div>
              <CardTitle className="text-4xl md:text-5xl font-black text-[#0A2A43] tracking-tight">
                Friends Feed
              </CardTitle>

              <p className="mt-3 text-lg font-medium text-gray-700 leading-relaxed">
                See what incredible trips your friends have been on!
              </p>
            </div>

            {user && (
              <Button className="h-auto px-5 py-3 rounded-xl bg-[#0A2A43] text-white font-semibold shadow-md hover:bg-[#061829] transition">
                <Link href="/new_post">Create Journal</Link>
              </Button>
            )}
          </CardHeader>
        </Card>

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
