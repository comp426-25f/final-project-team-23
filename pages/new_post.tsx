import { useState, useRef, useEffect } from "react";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";

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

  const [destinationId, setDestinationId] = useState("");
  const [postText, setPostText] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const { mutate: createPost } = api.posts.createPost.useMutation();

  const publishPost = () => {
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
      uploadPostFileToSupabase(supabase, user, selectedFile, (attachmentUrl) =>
        createPost(
          { content: postText, attachmentUrl, destinationId },
          { onSuccess },
        ),
      );
    } else {
      createPost({ content: postText, destinationId }, { onSuccess });
    }
  };

  return (
    <div className="horizon-bg flex min-h-screen justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2" /> Back to Feed
        </Button>

        <Card className="animate-fadeIn relative rounded-2xl border-[3px] border-[#0A2A43]/20 p-6 shadow-xl dark:bg-slate-900/90">
          <div className="pointer-events-none absolute top-2 right-2 rotate-[-8deg] opacity-80 mix-blend-multiply select-none">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-[3px] border-[#ffb88c] font-serif text-[0.85rem] tracking-[0.15em] text-[#ffb88c]">
              <span className="absolute top-9 font-bold">WANDR</span>
              <span className="absolute bottom-9 text-[0.6rem] tracking-widest">
                EST. 2025
              </span>

              <div className="absolute inset-0 rounded-full border-[2px] border-[#ffb88c]/60" />

              <div className="absolute inset-2 rounded-full border-[2px] border-dashed border-[#ffb88c]/70" />
            </div>
          </div>

          <CardHeader className="pb-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold tracking-[0.3em] text-[#ffb88c]">
                JOURNAL ENTRY
              </span>
              <CardTitle className="text-4xl font-[var(--journal-font)] tracking-tight text-[#0A2A43]">
                {new Date().toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-row gap-4">
              <Avatar className="mt-1 border-[2px] border-[#0A2A43]/40 shadow-md">
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

              <div className="journal-margin flex-1 pl-3">
                <Textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="Dear journal... today I wandered through..."
                  className="journal-lines h-60 resize-none border-none bg-transparent text-[1.35rem] leading-relaxed font-[var(--journal-font)] text-[#0A2A43] shadow-none focus-visible:ring-0 dark:text-slate-800 dark:placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium tracking-widest text-[#0A2A43]/60 uppercase dark:text-slate-400">
                Destination
              </label>
              <Select
                value={destinationId}
                onValueChange={setDestinationId}
                disabled={destinationsLoading}
              >
                <SelectTrigger className="mt-1 rounded-md border border-[#0A2A43]/20 bg-white/70 text-[#0A2A43] shadow-sm">
                  <SelectValue placeholder="Where were you today?" />
                </SelectTrigger>

                <SelectContent>
                  {destinations?.map((dest) => (
                    <SelectItem key={dest.id} value={dest.id}>
                      {dest.name
                        ? `${dest.name}, ${dest.country}`
                        : dest.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />

            {previewUrl && (
              <div className="polaroid relative mt-4 inline-block rotate-1 rounded-md bg-white p-3 shadow-lg">
                <div className="tape absolute -top-4 left-10 h-7 w-28 rotate-6 shadow-sm" />

                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={350}
                  height={350}
                  unoptimized
                  className="rounded-md shadow-md"
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between pt-4">
            {selectedFile ? (
              <Button
                variant="secondary"
                onClick={() => setSelectedFile(null)}
                className="border border-stone-300 bg-white/70 shadow-sm"
              >
                <ImagePlus className="mr-2" /> {selectedFile.name}
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="border border-stone-300 bg-white/70 shadow-sm"
              >
                <ImagePlus className="mr-2" /> Add Photo
              </Button>
            )}

            <Button
              disabled={!postText || !destinationId || isPosting}
              onClick={publishPost}
              className="bg-[#ffb88c] px-7 text-xl font-[var(--journal-font)] tracking-wide text-[#0A2A43] shadow-md hover:bg-[#ff9f63]"
            >
              {isPosting ? (
                <>
                  <Loader2Icon className="mr-2 animate-spin" /> Writing...
                </>
              ) : (
                <>
                  <Send className="mr-2" /> Save Entry
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
    return { redirect: { destination: "/login", permanent: false } };
  }

  return { props: { user: { id: userData.claims.sub } } };
}
