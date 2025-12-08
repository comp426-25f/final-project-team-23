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
    <div className="min-h-screen relative horizon-bg">
      <main className="mx-auto w-full max-w-6xl px-6 py-12 flex flex-col gap-8">
        
        <Card className="bg-white/80 border border-white/40 rounded-2xl shadow-xl backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
            <div>
              <CardTitle className="text-4xl md:text-5xl font-black text-[#0A2A43] tracking-tight">
                Explore
              </CardTitle>
              <p className="mt-3 text-lg font-medium text-gray-700 leading-relaxed">
                Discover trips, itineraries, and travel moments from people
                around the world.
              </p>
            </div>

            {user && (
              <Button className="h-auto px-5 py-3 rounded-xl bg-[#0A2A43] text-white font-semibold shadow-md hover:bg-[#061829] transition">
                <Link href="/new_post">Create Journal</Link>
              </Button>
            )}
          </CardHeader>
        </Card>

      
        <Card className="bg-white/80 border border-white/40 rounded-2xl shadow-xl backdrop-blur-sm">
          <CardHeader className="pb-3">
           
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col">
                <CardTitle className="text-2xl font-extrabold text-[#0A2A43]">
                  Community Highlights
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Browse journals from travelers or explore curated itineraries.
                </p>
              </div>

              <div className="inline-flex rounded-full bg-slate-100 p-1">
                <button
                  onClick={() => setTab("journals")}
                  className={`px-4 py-2 text-sm md:text-base font-semibold rounded-full transition ${
                    tab === "journals"
                      ? "bg-white shadow-sm text-[#0A2A43]"
                      : "text-gray-500 hover:text-[#0A2A43]"
                  }`}
                >
                  Journals
                </button>
                <button
                  onClick={() => setTab("itineraries")}
                  className={`px-4 py-2 text-sm md:text-base font-semibold rounded-full transition ${
                    tab === "itineraries"
                      ? "bg-white shadow-sm text-[#0A2A43]"
                      : "text-gray-500 hover:text-[#0A2A43]"
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
                    <Loader2 className="animate-spin h-10 w-10 text-[#0A2A43]" />
                  </div>
                ) : !posts || posts.length === 0 ? (
                  <div className="text-center text-gray-500 py-16">
                    <p className="text-lg">
                      No travel posts yet. Be the first to share your
                      adventures!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {posts.map((post) => (
                        <PostCard key={post.id} user={user as Subject} post={post} />
                      
                    ))}
                  </div>
                )}
              </>
            )}

      
            {tab === "itineraries" && (
              <>
                {itinerariesLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin h-10 w-10 text-[#0A2A43]" />
                  </div>
                ) : !itineraries || itineraries.length === 0 ? (
                  <div className="text-center text-gray-500 py-16">
                    <p className="text-lg">
                      No itineraries have been shared yet. Start planning your
                      first one!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {itineraries.map((itinerary) => (
                      <div
                        key={itinerary.id}
                        className="bg-white/80 border border-slate-100 rounded-2xl shadow-md hover:shadow-lg transition"
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
