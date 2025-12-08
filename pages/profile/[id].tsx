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

  const { data: itineraries, isLoading: itinerariesLoading } =
    api.itineraries.getUserItineraries.useQuery(
  { userId: profileId },
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
    <div className="min-h-screen relative horizon-bg">
      <main className="mx-auto w-full max-w-6xl px-6 py-12 flex flex-col gap-8">
        <div className="pb-3">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Feed
          </Button>
        </div>

        {profile && (
          <Card className="bg-white rounded-2xl shadow-md border border-gray-100">
            <CardContent className="py-6 px-6">
              <div className="flex w-full items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
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
                    <h1 className="text-4xl md:text-5xl font-black text-[#0A2A43] tracking-tight">
                      {profile.displayName}
                    </h1>
                    <p className="mt-1 text-base font-medium text-gray-700">
                      @{profile.username}
                    </p>
                  </div>
                </div>

                {!isPersonalPage && isFollowing !== undefined && (
                  <Button
                    variant={isFollowing ? "secondary" : "default"}
                    onClick={followButtonPressed}
                    className="h-auto px-5 py-3 rounded-xl font-semibold flex items-center gap-2"
                  >
                    {isFollowing ? <BellOff /> : <Bell />}
                    {isFollowing ? "Unfollow" : "Follow"}
                  </Button>
                )}

                {isPersonalPage &&
                  (profile.avatarUrl ? (
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => {
                        updateProfilePicture({});
                      }}
                      className="rounded-xl"
                    >
                      <ImageOff className="h-5 w-5" />
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
                              : null,
                          )
                        }
                      />
                      <Button
                        onClick={() => {
                          fileInputRef.current?.click();
                        }}
                        className="h-auto px-5 py-3 rounded-xl font-semibold flex items-center gap-2"
                      >
                        <ImageUp className="h-5 w-5" /> Change Avatar
                      </Button>
                    </>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {profileLoading && (
          <Card className="bg-white rounded-2xl shadow-md border border-gray-100">
            <CardContent className="py-6">
              <Loading />
            </CardContent>
          </Card>
        )}

        <Card className="mt-2 w-full bg-white rounded-2xl shadow-md border border-gray-100">
          <CardContent className="p-0">
            <div className="flex border-b rounded-t-2xl overflow-hidden">
              <button
                onClick={() => setTab("journals")}
                className={`px-4 py-3 flex-1 text-center font-medium transition ${
                  tab === "journals"
                    ? "text-[#0A2A43] border-b-2 border-[#0A2A43] bg-slate-50"
                    : "text-muted-foreground hover:text-[#0A2A43] hover:bg-slate-50/60"
                }`}
              >
                Journals
              </button>

              <button
                onClick={() => setTab("itineraries")}
                className={`px-4 py-3 flex-1 text-center font-medium transition ${
                  tab === "itineraries"
                    ? "text-[#0A2A43] border-b-2 border-[#0A2A43] bg-slate-50"
                    : "text-muted-foreground hover:text-[#0A2A43] hover:bg-slate-50/60"
                }`}
              >
                Itineraries
              </button>
            </div>

            {tab === "journals" && (
              <div className="p-6">
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

            {tab === "itineraries" && (
              <div className="p-6">
                {itinerariesLoading ? (
                  <Loading />
                ) : !itineraries || itineraries.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10">
                    No itineraries yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {itineraries.map((it) => (
                      <ItineraryPreviewCard key={it.id} itinerary={it} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
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
