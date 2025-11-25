"use client";

import { useState } from "react";
import { api } from "@/utils/trpc/api";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

import { Image as ImageIcon, Pencil } from "lucide-react";

export default function CreatePostDialog() {
  const supabase = createSupabaseComponentClient();
  const [open, setOpen] = useState(false);

  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const utils = api.useUtils();

  const { mutate: createPost, isPending } =
    api.posts.createPost.useMutation({
      onSuccess: () => {
        utils.posts.getFeed.invalidate();
        setOpen(false);
        setContent("");
        setFile(null);
      },
    });

  async function handleSubmit() {
    let attachmentUrl: string | null = null;

    if (file) {
      const filePath = `${crypto.randomUUID()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) {
        alert("Error uploading image: " + uploadError.message);
        return;
      }

      attachmentUrl = filePath;
    }

    createPost({ content, attachmentUrl });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-medium flex items-center gap-2">
          <Pencil className="h-4 w-4" />
          New Post
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Create a Post
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">

          <Textarea
            placeholder="Share your travel experience..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-primary cursor-pointer">
              <ImageIcon className="h-4 w-4" />
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) setFile(e.target.files[0]);
                }}
              />
              Add Image
            </label>

            {file && (
              <p className="text-sm text-muted-foreground">
                {file.name}
              </p>
            )}
          </div>

          <Button
            className="w-full"
            disabled={isPending || content.trim() === ""}
            onClick={handleSubmit}
          >
            {isPending ? "Posting..." : "Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
