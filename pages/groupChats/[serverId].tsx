"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/router";

import { api } from "@/utils/trpc/api";
import { useAuth } from "@/utils/use-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, ArrowLeft } from "lucide-react";

export default function GroupChatPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { serverId } = router.query;

  const [content, setContent] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { data: messages, isLoading: messagesLoading } =
    api.groupChats.getGroupMessages.useQuery(
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
      <div className="horizon-bg relative min-h-screen">
        <main className="mx-auto flex max-w-6xl items-center justify-center px-6 py-12">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </main>
      </div>
    );
  }

  const messageList = (messages ?? []).slice().reverse();

  return (
    <div className="horizon-bg relative min-h-screen">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <Card className="rounded-2xl border border-white/40 bg-white/80 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader className="flex flex-col items-start justify-between gap-4 pb-4 md:flex-row md:items-center">
            <Button
              variant="ghost"
              className="text-muted-foreground px-0 hover:bg-transparent hover:text-[#0A2A43] dark:text-gray-200 dark:hover:text-gray-100"
              onClick={() => router.push("/groupChats")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Group Chats
            </Button>

            <div className="text-center md:text-left">
              <CardTitle className="text-3xl font-black tracking-tight text-[#0A2A43] md:text-4xl dark:text-white">
                Group Chat
              </CardTitle>
              <p className="mt-2 max-w-xl text-sm text-gray-600 md:text-base dark:text-gray-200">
                Chat with your friends, plan trips, and share ideas in real
                time.
              </p>
            </div>

            <div className="w-0 md:w-24" />
          </CardHeader>
        </Card>

        <Card className="flex h-[70vh] flex-col rounded-2xl border border-white/40 bg-white/80 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80">
          <CardContent className="flex h-full flex-col p-0">
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messagesLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="text-primary h-6 w-6 animate-spin" />
                </div>
              ) : messageList.length === 0 ? (
                <p className="text-muted-foreground text-center dark:text-gray-300">
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
                      <div className="max-w-lg rounded-2xl bg-white/80 px-4 py-2 shadow-sm dark:bg-slate-900/80">
                        <div className="mb-1 flex flex-wrap items-baseline gap-2">
                          <span className="text-sm font-semibold text-[#0A2A43] dark:text-white">
                            {a.displayName}
                          </span>
                          <span className="text-muted-foreground text-xs dark:text-gray-300">
                            @{a.username}
                          </span>
                          <span className="text-muted-foreground text-xs dark:text-gray-300">
                            •{" "}
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-[#0A2A43] dark:text-gray-100">
                          {m.content}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 border-t border-slate-200 p-3 dark:border-slate-700"
            >
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type a message..."
                disabled={sending}
                className="placeholder:text-muted-foreground border-slate-200 bg-white/80 text-[#0A2A43] dark:border-slate-700 dark:bg-slate-900/80 dark:text-white dark:placeholder:text-gray-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as unknown as FormEvent);
                  }
                }}
              />
              <Button type="submit" disabled={sending || !content.trim()}>
                {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
