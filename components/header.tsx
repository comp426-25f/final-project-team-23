import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@radix-ui/react-navigation-menu";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { useRouter } from "next/router";
import { LogOut, UserRound, Sun, Moon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { api } from "@/utils/trpc/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect } from "react";

export default function Header() {
  const supabase = createSupabaseComponentClient();
  const router = useRouter();
  const apiUtils = api.useUtils();
  const { theme, setTheme } = useTheme();

  const {
    data: profile,
    isError,
  } = api.profiles.getAuthedUserProfile.useQuery(undefined, { retry: false });

  const isLoggedIn = !!profile && !isError;
  const PUBLIC_ROUTES = ["/login", "/register"];

useEffect(() => {
  if (PUBLIC_ROUTES.includes(router.pathname)) return;
  if (!isLoggedIn) router.replace("/login");
}, [isLoggedIn, router]);

  return (
    <header className="w-full border-b bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        <Link href="/" className="block w-fit text-4xl font-black text-[#0A2A43]">
          wandr<span className="text-[#ffb88c]">.</span>
        </Link>

        {isLoggedIn && (
          <NavigationMenu>
            <NavigationMenuList className="flex items-center gap-6">

              <NavigationMenuItem>
                <Link href="/explore" className="text-md font-medium hover:text-primary">
                  Explore
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/itineraries" className="text-md font-medium hover:text-primary">
                  Itineraries
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/friends" className="text-md font-medium hover:text-primary">
                  Friends
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/ai" className="text-md font-medium hover:text-primary">
                  AI Planner
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/groupChats" className="text-md font-medium hover:text-primary">
                  Connect
                </Link>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>
        )}

        {isLoggedIn && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="mt-1 cursor-pointer">
                <AvatarImage
                  src={
                    profile.avatarUrl
                      ? supabase.storage
                          .from("avatars")
                          .getPublicUrl(profile.avatarUrl).data.publicUrl
                      : undefined
                  }
                />
                <AvatarFallback>
                  {profile.displayName?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/profile/${profile.id}`)}>
                <UserRound className="mr-2" /> My Profile
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark Mode
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={async () => {
                  await supabase.auth.signOut();
                  apiUtils.profiles.getAuthedUserProfile.invalidate();
                  await apiUtils.invalidate();
                  router.push("/login");
                }}
              >
                <LogOut className="mr-2" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

      </div>
    </header>
  );
}