"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/router";

import { api } from "@/utils/trpc/api";
import { useAuth } from "@/utils/use-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, ArrowLeft } from "lucide-react";

export default function GroupChatPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { serverId } = router.query;

  const [content, setContent] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const {
    data: messages,
    isLoading: messagesLoading,
  } = api.groupChats.getGroupMessages.useQuery(
    { cursor: 0, serverId: String(serverId ?? "") },
    {
      enabled: !!user && !authLoading && !!serverId,
      refetchInterval: 4000,
    },
  );

  const apiUtils = api.useUtils();

  const { mutate: sendMessage, isPending: sending } =
    api.groupChats.sendGroupMessage.useMutation({
      onSuccess: async () => {
        setContent("");
        await apiUtils.groupChats.getGroupMessages.invalidate({
          cursor: 0,
          serverId: String(serverId),
        });
        scrollToBottom();
      },
    });

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !serverId) return;
    sendMessage({ serverId: String(serverId), content: content.trim() });
  };

  if (authLoading || !serverId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p>You must be logged in to view this group chat.</p>
        <Button onClick={() => router.push("/")}>Back to home</Button>
      </div>
    );
  }

  const messageList = (messages ?? []).slice().reverse();

  return (
    <div className="min-h-screen bg-muted/30">
      <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/groupChats")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Group Chat</h1>
          <div className="w-16" />
        </div>

        <Card className="flex h-[70vh] flex-col">
          <CardContent className="flex h-full flex-col p-0">
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {messagesLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : messageList.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No messages yet. Say hi!
                </p>
              ) : (
                messageList.map((m) => {
                  if (!m.author) return null;
                  const a = m.author;

                  return (
                    <div key={m.id} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={a.avatarUrl ?? undefined} />
                        <AvatarFallback>
                          {a.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold">
                            {a.displayName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            @{a.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            •{" "}
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{m.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t p-3"
            >
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type a message..."
                disabled={sending}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as unknown as FormEvent);
                  }
                }}
              />
              <Button type="submit" disabled={sending || !content.trim()}>
                {sending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}