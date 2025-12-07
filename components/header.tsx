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

export default function Header() {
  const supabase = createSupabaseComponentClient();
  const router = useRouter();
  const apiUtils = api.useUtils();
  const { theme, setTheme } = useTheme();

  const { data: profile, isLoading } = api.profiles.getAuthedUserProfile.useQuery();

  if (isLoading) return null;
  if (!profile) return null;


  return (
    <header className="w-full border-b bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        <div className="flex flex-row text-3xl font-extrabold tracking-tight">
          <Link href="/" className="block w-fit text-4xl font-black text-[#0A2A43]">
            wandr<span className="text-[#ffb88c]">.</span>
          </Link>
        </div>

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
              <Link href="/groups" className="text-md font-medium hover:text-primary">
                Connect
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="mt-1">
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
            <DropdownMenuItem onClick={() => router.push(`/profile/${profile?.id}`)}>
              <UserRound /> My Profile
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? (
                <>
                  <Sun className="h-4 w-4" />
                  <p>Light Mode</p>
                </>
              ) : (<>
                <Moon className="h-4 w-4" />
                <p>Dark Mode</p>
              </>
              )}

            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={async () => {
                await supabase.auth.signOut();
                apiUtils.profiles.getAuthedUserProfile.invalidate();
                router.push("/");
              }}
            >
              <LogOut /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header >
  );
}
