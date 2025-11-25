import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props";
import { GetServerSidePropsContext } from "next";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { api } from "@/utils/trpc/api";
import { LogOut, UserRound } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { useRouter } from "next/router";

export default function HomePage() {
  const supabase = createSupabaseComponentClient();
  const router = useRouter();
  const apiUtils = api.useUtils();
  const { data } = api.profiles.getAuthedUserProfile.useQuery();

  return (
    <div className="min-h-screen bg-muted/30">


      <main className="mx-auto max-w-6xl p-8 flex flex-col gap-8">

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-4xl font-bold">Welcome to WANDR</CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-muted-foreground">
            Your all-in-one travel companion — plan trips, explore destinations,
            and connect with your travel friends.
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <Card className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>Explore Destinations</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Discover popular locations and curated itineraries.
              <Button className="mt-4 w-full" asChild>
                <a href="/explore">Explore</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>Your Iteneraries</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Create a new travel itinerary for your next adventure!
              <Button className="mt-4 w-full" asChild>
                <a href="/itineraries">Itineraries</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>AI Trip Planner</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Tell WANDR where you want to go — get instant itinerary suggestions.
              <Button className="mt-4 w-full" asChild>
                <a href="/ai">Plan a Trip</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>Friends Feed</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              See trips and adventures your friends are taking.
              <Button className="mt-4 w-full" asChild>
                <a href="/friends">View Feed</a>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition md:col-span-3">
            <CardHeader>
              <CardTitle>Travel Group Chats</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Collaborate on itineraries with your friends in real time.
              <Button className="mt-4" asChild>
                <a href="/groups">Open Chats</a>
              </Button>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  )
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