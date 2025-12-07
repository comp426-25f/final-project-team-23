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
      uploadPostFileToSupabase(
        supabase,
        user,
        selectedFile,
        (attachmentUrl) =>
          createPost({ content: postText, attachmentUrl, destinationId }, { onSuccess })
      );
    } else {
      createPost({ content: postText, destinationId }, { onSuccess });
    }
  };

  return (
    <div className="flex justify-center px-4 py-10">
      <div className="w-full max-w-xl">

        <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
          <ArrowLeft className="mr-2" /> Back to Feed
        </Button>

        <Card className="
          bg-[#faf7f2]
          border-[3px] border-[#0A2A43]/20
          rounded-2xl shadow-xl p-6 relative 
          animate-fadeIn
        ">
          
<div className="
  absolute top-2 right-2 
  rotate-[-8deg] 
  pointer-events-none select-none
  mix-blend-multiply 
  opacity-80
">
  <div className="
    w-28 h-28 
    rounded-full 
    border-[3px] border-[#ffb88c]
  text-[#ffb88c]
    flex items-center justify-center
    font-serif 
    text-[0.85rem] 
    tracking-[0.15em]
    relative
  ">
    <span className="absolute top-9 font-bold">WANDR</span>
    <span className="absolute bottom-9 text-[0.6rem] tracking-widest">
      EST. 2025
    </span>

    <div className="
      absolute inset-0 rounded-full 
      border-[2px] border-[#ffb88c]/60
    " />

    <div className="
      absolute inset-2 rounded-full 
      border-[2px] border-dashed border-[#ffb88c]/70
    " />
  </div>
</div>


          <CardHeader className="pb-2">
  <div className="flex flex-col gap-1">
    <span className="text-xs tracking-[0.3em] text-[#ffb88c] font-semibold">
      JOURNAL ENTRY
    </span>
    <CardTitle className="font-[var(--journal-font)] text-4xl text-[#0A2A43]
 tracking-tight">
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
                <AvatarFallback>{profile?.displayName?.slice(0,2).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1 journal-margin pl-3">
                <Textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  placeholder="Dear journal... today I wandered through..."
                  className="
                    h-60 bg-transparent border-none shadow-none
                    focus-visible:ring-0 resize-none 
                    journal-lines text-[#0A2A43] text-[1.35rem] leading-relaxed 
                    font-[var(--journal-font)]
                  "
                />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-[#0A2A43]/60 font-medium">
                Destination
              </label>
              <Select
                value={destinationId}
                onValueChange={setDestinationId}
                disabled={destinationsLoading}
              >
                <SelectTrigger className="bg-white/70 border border-[#0A2A43]/20 mt-1 shadow-sm rounded-md text-[#0A2A43]">
                  <SelectValue placeholder="Where were you today?" />
                </SelectTrigger>

                <SelectContent>
                  {destinations?.map((dest) => (
                    <SelectItem key={dest.id} value={dest.id}>
                      {dest.name ? `${dest.name}, ${dest.country}` : dest.country}
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
  <div className="relative inline-block mt-4 shadow-lg bg-white p-3 rounded-md rotate-1 polaroid">
    <div className="absolute -top-4 left-10 w-28 h-7 tape rotate-6 shadow-sm" />
    
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
                className="bg-white/70 border border-stone-300 shadow-sm"
              >
                <ImagePlus className="mr-2" /> {selectedFile.name}
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/70 border border-stone-300 shadow-sm"
              >
                <ImagePlus className="mr-2" /> Add Photo
              </Button>
            )}

            <Button
              disabled={!postText || !destinationId || isPosting}
              onClick={publishPost}
              className="font-[var(--journal-font)]
  tracking-wide text-xl px-7 shadow-md
  bg-[#ffb88c] text-[#0A2A43]
  hover:bg-[#ff9f63]"
            >
              {isPosting ? (
                <>
                  <Loader2Icon className="animate-spin mr-2" /> Writing...
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

