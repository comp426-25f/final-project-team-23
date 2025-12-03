import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Bell, BellOff, ImageOff, ImageUp } from "lucide-react";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { GetServerSidePropsContext } from "next";
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props";
import { useRouter } from "next/router";
import PostFeed from "@/components/feed";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/utils/trpc/api";
import { uploadAvatarFileToSupabase } from "@/utils/supabase/storage";
import { Subject } from "@/server/models/auth";
import Loading from "@/components/loading";
import ItineraryPreviewCard from "@/components/itinerary";

type PublicProfilePageProps = { user: Subject };

export default function PublicProfilePage({ user }: PublicProfilePageProps) {
  const router = useRouter();
  const profileId = router.query.id as string;
  const supabase = createSupabaseComponentClient();
  const apiUtils = api.useUtils();

  const [tab, setTab] = useState<"journals" | "itineraries">("journals");

  const { data: profile, isLoading: profileLoading } =
    api.profiles.getProfile.useQuery({ profileId });

  const { data: isFollowing } =
    api.profiles.getIsUserFollowingProfile.useQuery({ profileId });

  const {
    data: postsPages,
    isLoading: postsLoading,
    fetchNextPage,
  } = api.profiles.getPostsForProfile.useInfiniteQuery(
    { profileId },
    {
      initialCursor: 0,
      getNextPageParam: (lastPage, pages) =>
        pages.length * lastPage.length,
    },
  );

  // NEW — get user itineraries when tab = "itineraries"
  const { data: itineraries, isLoading: itinerariesLoading } =
    api.itineraries.getUserItineraries.useQuery(
      { cursor: 0 },
      { enabled: tab === "itineraries" }
    );

  const { mutate: toggleFollowing } =
    api.profiles.toggleFollowingProfile.useMutation({
      onSuccess: async () => {
        await apiUtils.posts.getFollowingFeed.invalidate();
      },
    });

  const followButtonPressed = async () => {
    toggleFollowing({ profileId });
    apiUtils.profiles.getIsUserFollowingProfile.setData(
      { profileId },
      (prev) => !prev,
    );
  };

  const isPersonalPage = user.id === profileId;

  // Avatar upload logic unchanged…
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { mutate: updateProfilePicture } =
    api.profiles.updateProfilePicture.useMutation();

  useEffect(() => {
    if (selectedFile) {
      uploadAvatarFileToSupabase(supabase, user, selectedFile, (avatarUrl) => {
        updateProfilePicture(
          { avatarUrl },
          {
            onSuccess: () => {
              setSelectedFile(null);
              apiUtils.invalidate();
            },
          }
        );
      });
    }
  }, [apiUtils, selectedFile, supabase, updateProfilePicture, user]);

  return (
    <div className="flex w-full flex-row justify-center px-3">
      <div className="mt-4 mb-12 w-full md:w-[600px]">
        
        {/* Back Button */}
        <div className="pb-3">
          <Button variant="ghost" onClick={() => router.push("/")}>
            <ArrowLeft /> Back to Feed
          </Button>
        </div>

        {/* Profile Card */}
        {profile && (
          <Card>
            <CardContent className="space-y-2 py-6">
              <div className="flex w-full items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="mt-1">
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
                      {profile.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="text-primary font-bold text-lg">
                      {profile.displayName}
                    </p>
                    <p className="text-muted-foreground">@{profile.username}</p>
                  </div>
                </div>

                {/* Follow / Unfollow */}
                {!isPersonalPage && isFollowing !== undefined && (
                  <Button
                    variant={isFollowing ? "secondary" : "default"}
                    onClick={followButtonPressed}
                  >
                    {isFollowing ? <BellOff /> : <Bell />}{" "}
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}

                {/* Avatar change controls */}
                {isPersonalPage &&
                  (profile.avatarUrl ? (
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => {
                        updateProfilePicture({});
                      }}
                    >
                      <ImageOff />
                    </Button>
                  ) : (
                    <>
                      <Input
                        className="hidden"
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={(e) =>
                          setSelectedFile(
                            (e.target.files ?? []).length > 0
                              ? e.target.files![0]
                              : null
                          )
                        }
                      />
                      <Button
                        onClick={() => {
                          fileInputRef.current?.click();
                        }}
                      >
                        <ImageUp /> Change Avatar
                      </Button>
                    </>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {profileLoading && (
          <Card>
            <CardContent className="py-6">
              <Loading />
            </CardContent>
          </Card>
        )}

        {/* ---------- NEW PROFILE TABS ---------- */}
        <div className="mt-6 w-full rounded-xl border bg-card shadow">
          
          <div className="flex border-b">
            <button
              onClick={() => setTab("journals")}
              className={`px-4 py-3 flex-1 text-center font-medium transition ${
                tab === "journals"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Journals
            </button>

            <button
              onClick={() => setTab("itineraries")}
              className={`px-4 py-3 flex-1 text-center font-medium transition ${
                tab === "itineraries"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              Itineraries
            </button>
          </div>

          {/* ---------- JOURNALS ---------- */}
          {tab === "journals" && (
            <div className="p-4">
              {postsLoading ? (
                <Loading />
              ) : postsPages && postsPages.pages.length > 0 ? (
                <PostFeed
                  user={user}
                  posts={postsPages}
                  postsLoading={postsLoading}
                  fetchNext={fetchNextPage}
                />
              ) : (
                <div className="text-center text-muted-foreground py-10">
                  No posts yet.
                </div>
              )}
            </div>
          )}

          {/* ---------- ITINERARIES ---------- */}
          {tab === "itineraries" && (
            <div className="p-4">
              {itinerariesLoading ? (
                <Loading />
              ) : !itineraries || itineraries.length === 0 ? (
                <div className="text-center text-muted-foreground py-10">
                  No itineraries yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {itineraries.map((it) => (
                    <ItineraryPreviewCard
                      key={it.id}
                      itinerary={it}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createSupabaseServerClient(context);
  const { data: userData, error: userError } = await supabase.auth.getClaims();

  if (userError || !userData) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: { id: userData.claims.sub },
    },
  };
}
