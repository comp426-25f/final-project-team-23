import { useState, useRef } from "react";
import { GetServerSidePropsContext } from "next";

import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props";
import { uploadPostFileToSupabase } from "@/utils/supabase/storage";

import { api } from "@/utils/trpc/api";
import { Subject } from "@/server/models/auth";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { ImagePlus, Send, Loader2Icon, ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type Props = { user: Subject };

export default function CreatePostPage({ user }: Props) {
  const router = useRouter();
  const supabase = createSupabaseComponentClient();
  const apiUtils = api.useUtils();

  const { data: profile } = api.profiles.getAuthedUserProfile.useQuery();
  const { data: destinations, isLoading: destinationsLoading } =
  api.destinations.getAll.useQuery();

  const [destinationId, setDestinationId] = useState<string>("");

  const [postText, setPostText] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { mutate: createPost } = api.posts.createPost.useMutation();

  const publishPost = async () => {
    if (!postText.trim() || !destinationId) return;

    setIsPosting(true);

    const onSuccess = () => {
      setPostText("");
      setSelectedFile(null);
      apiUtils.invalidate().then(() => {
        setIsPosting(false);
        router.push("/");
      });
    };

    if (selectedFile) {
      uploadPostFileToSupabase(
        supabase,
        user,
        selectedFile,
        (attachmentUrl) => {
          createPost(
            { content: postText, attachmentUrl, destinationId },
            { onSuccess }
          );
        },
      );
    } else {
      createPost(
        { content: postText, destinationId },
        { onSuccess }
      );
    }
  };

  return (
    <div className="flex justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="mr-2" /> Back to Feed
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Create a New Post</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex flex-row gap-3">
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
                  {profile?.displayName?.slice(0, 2).toUpperCase() ?? ""}
                </AvatarFallback>
              </Avatar>

              <Textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="What's on your mind?"
                className="h-36"
              />
            </div>

            <div className="space-y-1">
                <label className="text-sm font-medium">Destination</label>

                <Select
                value={destinationId}
                onValueChange={(val: string) => setDestinationId(val)}
                disabled={destinationsLoading}
                >
                <SelectTrigger>
                    <SelectValue placeholder="Select a destination" />
                </SelectTrigger>

                <SelectContent>
                    {destinations?.map((dest) => (
                    <SelectItem value={dest.id} key={dest.id}>
                        {dest.name ? `${dest.name}, ${dest.country}` : dest.country}
                    </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

            <Input
              className="hidden"
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={(e) => {
                setSelectedFile(
                  e.target.files && e.target.files.length > 0
                    ? e.target.files[0]
                    : null
                );
              }}
            />
          </CardContent>

          <CardFooter className="flex justify-between">
            {selectedFile ? (
              <Button variant="secondary" onClick={() => setSelectedFile(null)}>
                <ImagePlus className="mr-2" />
                {selectedFile.name}
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="mr-2" />
                Add Image
              </Button>
            )}

            <Button
              disabled={postText.length === 0 || isPosting || !destinationId}
              onClick={publishPost}
            >
              {isPosting ? (
                <>
                  <Loader2Icon className="animate-spin mr-2" /> Posting...
                </>
              ) : (
                <>
                  <Send className="mr-2" /> Post
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const supabase = createSupabaseServerClient(context);
  const { data: userData, error } = await supabase.auth.getClaims();

  if (error || !userData) {
    return {
      redirect: { destination: "/login", permanent: false },
    };
  }

  return {
    props: {
      user: { id: userData.claims.sub },
    },
  };
}