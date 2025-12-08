"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import { api } from "@/utils/trpc/api";
import { useAuth } from "@/utils/use-auth";
import PostCard from "@/components/post";
import ItineraryPreviewCard from "@/components/itinerary";
import { Subject } from "@/server/models/auth";
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props";
import { GetServerSidePropsContext } from "next";

export default function ExplorePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<"journals" | "itineraries">("journals");

  const { data: posts, isLoading: postsLoading } = api.posts.getFeed.useQuery({
    cursor: 0,
  });

  const { data: itineraries, isLoading: itinerariesLoading } =
    api.itineraries.getExploreItineraries.useQuery({ cursor: 0 });

  const loading = authLoading || postsLoading;

  return (
    <div className="horizon-bg relative min-h-screen">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <Card className="rounded-2xl border border-white/40 bg-white/80 shadow-xl backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <div>
              <CardTitle className="text-4xl font-black tracking-tight text-[#0A2A43] md:text-5xl">
                Explore
              </CardTitle>
              <p className="mt-3 text-lg leading-relaxed font-medium text-gray-700">
                Discover trips, itineraries, and travel moments from people
                around the world.
              </p>
            </div>

            {user && (
              <Button className="h-auto rounded-xl bg-[#0A2A43] px-5 py-3 font-semibold text-white shadow-md transition hover:bg-[#061829]">
                <Link href="/new_post">Create Journal</Link>
              </Button>
            )}
          </CardHeader>
        </Card>

        <Card className="rounded-2xl border border-white/40 bg-white/80 shadow-xl backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <CardTitle className="text-2xl font-extrabold text-[#0A2A43]">
                  Community Highlights
                </CardTitle>
                <p className="mt-1 text-sm text-gray-600">
                  Browse journals from travelers or explore curated itineraries.
                </p>
              </div>

              <div className="inline-flex rounded-full bg-slate-100 p-1 dark:border dark:border-slate-600 dark:bg-slate-800">
                <button
                  onClick={() => setTab("journals")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition md:text-base ${
                    tab === "journals"
                      ? "bg-white text-[#0A2A43] shadow-sm dark:bg-slate-900 dark:text-white"
                      : "text-gray-500 hover:text-[#0A2A43] dark:text-slate-300 dark:hover:text-white"
                  }`}
                >
                  Journals
                </button>
                <button
                  onClick={() => setTab("itineraries")}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition md:text-base ${
                    tab === "itineraries"
                      ? "bg-white text-[#0A2A43] shadow-sm dark:bg-slate-900 dark:text-white"
                      : "text-gray-500 hover:text-[#0A2A43] dark:text-slate-300 dark:hover:text-white"
                  }`}
                >
                  Itineraries
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {tab === "journals" && (
              <>
                {loading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-[#0A2A43]" />
                  </div>
                ) : !posts || posts.length === 0 ? (
                  <div className="py-16 text-center text-gray-500">
                    <p className="text-lg">
                      No travel posts yet. Be the first to share your
                      adventures!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        user={user as Subject}
                        post={post}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === "itineraries" && (
              <>
                {itinerariesLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-[#0A2A43]" />
                  </div>
                ) : !itineraries || itineraries.length === 0 ? (
                  <div className="py-16 text-center text-gray-500">
                    <p className="text-lg">
                      No itineraries have been shared yet. Start planning your
                      first one!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {itineraries.map((itinerary) => (
                      <div
                        key={itinerary.id}
                        className="rounded-2xl border border-slate-100 bg-white/80 shadow-md transition hover:shadow-lg"
                      >
                        <ItineraryPreviewCard itinerary={itinerary} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
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
