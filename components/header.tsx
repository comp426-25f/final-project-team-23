import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@radix-ui/react-navigation-menu";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { useRouter } from "next/router";
import { LogOut, UserRound, Sun, Moon, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { api } from "@/utils/trpc/api";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";

import { useTheme } from "next-themes";
import Link from "next/link";

export default function Header() {
  const supabase = createSupabaseComponentClient();
  const router = useRouter();
  const apiUtils = api.useUtils();
  const { theme, setTheme } = useTheme();

  const { data: profile, isError } = api.profiles.getAuthedUserProfile.useQuery(undefined, { retry: false });
  const isLoggedIn = !!profile && !isError;

  return (
    <header className="w-full border-b bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        <Link href="/" className="block w-fit text-4xl font-black text-[#0A2A43] dark:text-white">
          wandr<span className="text-[#ffb88c]">.</span>
        </Link>

        {isLoggedIn && (
          <div className="hidden md:block">
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
          </div>
        )}

        {isLoggedIn && (
          <div className="md:hidden flex items-center gap-3">

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="mt-[2px] cursor-pointer">
                  <AvatarImage
                    src={
                      profile?.avatarUrl
                        ? supabase.storage
                            .from("avatars")
                            .getPublicUrl(profile.avatarUrl).data.publicUrl
                        : undefined
                    }
                  />
                  <AvatarFallback>
                    {profile?.displayName?.slice(0, 2).toUpperCase()}
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
                      <Sun className="h-4 w-4 mr-2" /> Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4 mr-2" /> Dark Mode
                    </>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={async () => {
                    await supabase.auth.signOut();
                    apiUtils.profiles.getAuthedUserProfile.invalidate();
                    router.push("/login");
                  }}
                >
                  <LogOut className="mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="p-2">
                  <Menu className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="
                  w-[260px]
                  p-6
                  bg-white/90
                  dark:bg-zinc-900/90
                  backdrop-blur-lg
                  border-l
                  border-gray-200
                  dark:border-zinc-700
                  shadow-xl
                "
              >
                <nav className="flex flex-col space-y-6 mt-6">

                  <span className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Navigation
                  </span>

                  <Link href="/explore" className="text-lg font-medium hover:text-primary dark:hover:text-primary">
                    Explore
                  </Link>

                  <Link href="/itineraries" className="text-lg font-medium hover:text-primary dark:hover:text-primary">
                    Itineraries
                  </Link>

                  <Link href="/friends" className="text-lg font-medium hover:text-primary dark:hover:text-primary">
                    Friends
                  </Link>

                  <Link href="/ai" className="text-lg font-medium hover:text-primary dark:hover:text-primary">
                    AI Planner
                  </Link>

                  <Link href="/groupChats" className="text-lg font-medium hover:text-primary dark:hover:text-primary">
                    Connect
                  </Link>

                  <div className="pt-6 border-t border-gray-200 dark:border-zinc-700" />

                  <span className="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Display
                  </span>

                  <Button
                    variant="outline"
                    className="
                      justify-start
                      border-gray-300
                      dark:border-zinc-700
                      text-gray-700
                      dark:text-gray-200
                    "
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="mr-2 h-4 w-4" /> Switch to Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="mr-2 h-4 w-4" /> Switch to Dark Mode
                      </>
                    )}
                  </Button>

                </nav>
              </SheetContent>
            </Sheet>

          </div>
        )}

        {isLoggedIn && (
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="cursor-pointer">
                  <AvatarImage
                    src={
                      profile?.avatarUrl
                        ? supabase.storage
                            .from("avatars")
                            .getPublicUrl(profile.avatarUrl).data.publicUrl
                        : undefined
                    }
                  />
                  <AvatarFallback>
                    {profile?.displayName?.slice(0, 2).toUpperCase()}
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
                    router.push("/login");
                  }}
                >
                  <LogOut className="mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

      </div>
    </header>
  );
}
