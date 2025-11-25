import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Bell, BellOff, ImageOff, ImageUp } from "lucide-react";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { GetServerSidePropsContext } from "next";
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props";
import { useRouter } from "next/router";
import PostFeed from "@/components/feed";
import { Separator } from "@/components/ui/separator";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { api } from "@/utils/trpc/api";
import { uploadAvatarFileToSupabase } from "@/utils/supabase/storage";
import { Subject } from "@/server/models/auth";
import Loading from "@/components/loading";

type PublicProfilePageProps = { user: Subject };

export default function PublicProfilePage({ user }: PublicProfilePageProps) {
  const router = useRouter();
  const profileId = router.query.id as string;
  const supabase = createSupabaseComponentClient();
  const apiUtils = api.useUtils();

  const { data: profile, isLoading: profileLoading } =
    api.profiles.getProfile.useQuery({ profileId });

  const { data: isFollowing } = api.profiles.getIsUserFollowingProfile.useQuery(
    { profileId },
  );

  const {
    data: posts,
    isLoading: postsLoading,
    fetchNextPage: fetchNextPage,
  } = api.profiles.getPostsForProfile.useInfiniteQuery(
    { profileId },
    {
      initialCursor: 0,
      getNextPageParam: (lastPage, pages) => pages.length * lastPage.length,
    },
  );

  const { mutate: toggleFollowing } =
    api.profiles.toggleFollowingProfile.useMutation();

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
          },
        );
      });
    }
  }, [apiUtils, selectedFile, supabase, updateProfilePicture, user]);

  return (
    <div className="flex w-full flex-row justify-center px-3">
      <div className="mt-4 mb-12 w-full md:w-[600px]">
        <div className="pb-3">
          <Button variant="ghost" onClick={() => router.push("/")}>
            <ArrowLeft /> Back to Feed
          </Button>
        </div>
        {profile && (
          <Card>
            <CardContent className="space-y-2 py-6">
              <div className="flex w-full flex-row items-center justify-between gap-3">
                <div className="flex flex-row items-center gap-3">
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

                  <p className="text-primary font-bold">{profile.displayName}</p>

                  <p className="text-muted-foreground ml-3">
                    @{profile.username}
                  </p>
                </div>
                {!isPersonalPage && isFollowing !== undefined && (
                  <Button
                    variant={isFollowing ? "secondary" : "default"}
                    onClick={followButtonPressed}
                  >
                    {isFollowing ? <BellOff /> : <Bell />}{" "}
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
                              : null,
                          )
                        }
                      />
                      <Button
                        onClick={() => {
                          if (fileInputRef && fileInputRef.current)
                            fileInputRef.current.click();
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
            <CardContent className="space-y-2 py-6">
              <Loading />
            </CardContent>
          </Card>
        )}
        <div className="bg-card text-card-foreground mt-4 w-full rounded-xl border shadow">
          <div className="flex flex-row items-center justify-between px-3 py-4">
            <p className="text-lg font-bold">
              {isPersonalPage ? "Your" : `${profile?.displayName}'s`} Recent Posts
            </p>
          </div>
          <Separator />
          <PostFeed
            user={user}
            posts={posts}
            postsLoading={postsLoading}
            fetchNext={fetchNextPage}
          />
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
