"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/router";

import { api } from "@/utils/trpc/api";
import { useAuth } from "@/utils/use-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <div className="min-h-screen relative horizon-bg">
        <main className="mx-auto flex max-w-6xl items-center justify-center px-6 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  const messageList = (messages ?? []).slice().reverse();

  return (
    <div className="min-h-screen relative horizon-bg">
      <main className="mx-auto w-full max-w-6xl px-6 py-12 flex flex-col gap-8">
       
        <Card className="bg-white/80 dark:bg-slate-900/80 border border-white/40 dark:border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4">
            <Button
              variant="ghost"
              className="px-0 hover:bg-transparent text-muted-foreground dark:text-gray-200 hover:text-[#0A2A43] dark:hover:text-gray-100"
              onClick={() => router.push("/groupChats")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Group Chats
            </Button>

            <div className="text-center md:text-left">
              <CardTitle className="text-3xl md:text-4xl font-black text-[#0A2A43] dark:text-white tracking-tight">
                Group Chat
              </CardTitle>
              <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-200 max-w-xl">
                Chat with your friends, plan trips, and share ideas in real
                time.
              </p>
            </div>

            <div className="w-0 md:w-24" />
          </CardHeader>
        </Card>

    
        <Card className="flex h-[70vh] flex-col bg-white/80 dark:bg-slate-950/80 border border-white/40 dark:border-slate-800 rounded-2xl shadow-xl backdrop-blur-sm">
          <CardContent className="flex h-full flex-col p-0">
         
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messagesLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : messageList.length === 0 ? (
                <p className="text-center text-muted-foreground dark:text-gray-300">
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
                      <div className="rounded-2xl bg-white/80 dark:bg-slate-900/80 px-4 py-2 shadow-sm max-w-lg">
                        <div className="flex flex-wrap items-baseline gap-2 mb-1">
                          <span className="text-sm font-semibold text-[#0A2A43] dark:text-white">
                            {a.displayName}
                          </span>
                          <span className="text-xs text-muted-foreground dark:text-gray-300">
                            @{a.username}
                          </span>
                          <span className="text-xs text-muted-foreground dark:text-gray-300">
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
              className="flex items-center gap-2 border-t border-slate-200 dark:border-slate-700 p-3"
            >
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type a message..."
                disabled={sending}
                className="bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 text-[#0A2A43] dark:text-white placeholder:text-muted-foreground dark:placeholder:text-gray-400"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as unknown as FormEvent);
                  }
                }}
              />
              <Button type="submit" disabled={sending || !content.trim()}>
                {sending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Send
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
