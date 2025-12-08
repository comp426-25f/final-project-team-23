import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { Map, BookOpen, Landmark, Music, Trees } from "lucide-react";

export default function HomePage() {
  return (
    <div className="horizon-bg relative min-h-screen">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <Card className="rounded-2xl border border-white/40 bg-white/80 shadow-xl backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-5xl font-black tracking-tight text-[#0A2A43]">
              Welcome to{" "}
              <strong>
                wandr<span className="text-[#ffb88c]">.</span>
              </strong>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg leading-relaxed font-medium text-gray-700">
            Your all-in-one travel companion — plan trips, explore destinations,
            and connect with travel friends around the globe.
          </CardContent>
        </Card>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="rounded-2xl border border-white/40 bg-white/70 shadow-lg">
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-2xl font-extrabold text-[#0A2A43]">
                <Map className="h-6 w-6 text-[#ffb88c]" /> Explore Destinations
              </CardTitle>
            </CardHeader>
            <CardContent className="font-medium text-gray-700">
              Discover popular cities, landmarks, and curated itineraries.
              <Button className="mt-4 w-full rounded-xl bg-[#0A2A43] py-6 text-lg font-bold text-white">
                <Link href="/explore">Explore</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-white/40 bg-white/70 shadow-lg">
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-2xl font-extrabold text-[#0A2A43]">
                <BookOpen className="h-6 w-6 text-[#ffb88c]" /> Your Itineraries
              </CardTitle>
            </CardHeader>
            <CardContent className="font-medium text-gray-700">
              Save, view, and build out your travel plans.
              <Button className="mt-4 w-full rounded-xl bg-[#0A2A43] py-6 text-lg font-bold text-white">
                <Link href="/itineraries">View Itineraries</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-white/40 bg-white/70 shadow-lg">
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-2xl font-extrabold text-[#0A2A43]">
                <Landmark className="h-6 w-6 text-[#ffb88c]" /> AI Trip Planner
              </CardTitle>
            </CardHeader>
            <CardContent className="font-medium text-gray-700">
              Tell WANDR where you want to go — get instant itinerary
              suggestions.
              <Button className="mt-4 w-full rounded-xl bg-[#0A2A43] py-6 text-lg font-bold text-white">
                <Link href="/ai">Plan a Trip</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-white/40 bg-white/70 shadow-lg">
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-2xl font-extrabold text-[#0A2A43]">
                <Trees className="h-6 w-6 text-[#ffb88c]" /> Friends Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="font-medium text-gray-700">
              See trips and adventures your friends are taking.
              <Button className="mt-4 w-full rounded-xl bg-[#0A2A43] py-6 text-lg font-bold text-white">
                <Link href="/friends">View Feed</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-white/40 bg-white/70 shadow-lg">
            <CardHeader className="pb-1">
              <CardTitle className="flex items-center gap-2 text-2xl font-extrabold text-[#0A2A43]">
                <Music className="h-6 w-6 text-[#ffb88c]" /> Travel Group Chats
              </CardTitle>
            </CardHeader>
            <CardContent className="font-medium text-gray-700">
              Collaborate on itineraries with your friends in real time.
              <Button className="mt-4 w-full rounded-xl bg-[#0A2A43] py-6 text-lg font-bold text-white">
                <Link href="/groupChats">Open Chats</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

// The `getServerSideProps` function is used to fetch the user data and on
// the server side before rendering the page to both pre-load the Supabase
// user and profile data. If the user is not logged in, we can catch this
// here and redirect the user to the login page.
export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Create the supabase context that works specifically on the server and
  // pass in the context.
  const supabase = createSupabaseServerClient(context);

  // Attempt to load the user data
  const { data: userData, error: userError } = await supabase.auth.getClaims();

  // If the user is not logged in, redirect them to the login page.
  if (userError || !userData) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  // Return the user and profile as props.
  return {
    props: {
      user: { id: userData.claims.sub },
    },
  };
}
