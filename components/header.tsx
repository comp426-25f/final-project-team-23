import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@radix-ui/react-navigation-menu";
import { Globe2 } from "lucide-react";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { useRouter } from "next/router";
import { LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { api } from "@/utils/trpc/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function Header() {
  const supabase = createSupabaseComponentClient();
  const router = useRouter();
  const apiUtils = api.useUtils();

  const { data } = api.profiles.getAuthedUserProfile.useQuery();

  return (
    <header className="w-full border-b bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        <div className="flex flex-row text-3xl font-extrabold tracking-tight">
          {/* <Globe2 /> */}
          WANDR<span className="text-primary">.</span>
        </div>

        <NavigationMenu>
          <NavigationMenuList className="flex items-center gap-6">
            <NavigationMenuItem>
              <NavigationMenuLink href="/explore" className="text-md font-medium hover:text-primary">
                Explore
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink href="/itineraries" className="text-md font-medium hover:text-primary">
                Itineraries
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink href="/friends" className="text-md font-medium hover:text-primary">
                Friends Feed
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink href="/ai" className="text-md font-medium hover:text-primary">
                AI Trip Planner
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink href="/groups" className="text-md font-medium hover:text-primary">
                Group Chats
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="mt-1">
              <AvatarImage
                src={
                  data?.avatarUrl
                    ? supabase.storage
                      .from("avatars")
                      .getPublicUrl(data.avatarUrl).data.publicUrl
                    : undefined
                }
              />
              <AvatarFallback>
                {data?.displayName!.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push(`/profile/${data?.id}`)}
            >
              <UserRound /> My Profile
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
    </header>
  )
};