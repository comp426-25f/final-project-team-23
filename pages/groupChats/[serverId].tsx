"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/router";

import { api } from "@/utils/trpc/api";
import { useAuth } from "@/utils/use-auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, ArrowLeft, Send } from "lucide-react";

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
        <Card className="bg-white/80 border border-white/40 rounded-2xl shadow-xl backdrop-blur-sm">
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4">
            <Button
              variant="ghost"
              className="px-0 hover:bg-transparent text-muted-foreground hover:text-[#0A2A43]"
              onClick={() => router.push("/groupChats")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Group Chats
            </Button>

            <div className="flex-1 md:text-center">
              <CardTitle className="text-3xl md:text-4xl font-black text-[#0A2A43] tracking-tight">
                Group Chat
              </CardTitle>
              <p className="mt-3 text-sm md:text-base font-medium text-gray-700 leading-relaxed">
                Chat with your friends, plan trips, and share ideas in real time.
              </p>
            </div>

            <div className="w-10 md:w-24" />
          </CardHeader>
        </Card>

        <Card className="bg-white/90 border border-slate-100 rounded-2xl shadow-md flex h-[70vh] flex-col">
          <CardContent className="flex h-full flex-col p-0">
            <div className="flex-1 space-y-3 overflow-y-auto p-4 pr-3">
              {messagesLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : messageList.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  No messages yet. Say hi! 👋
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
                      <div className="max-w-md rounded-2xl bg-slate-100 px-3 py-2 shadow-sm">
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-[#0A2A43]">
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
                        <p className="text-sm text-slate-900">{m.content}</p>
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
                className="rounded-xl"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as unknown as FormEvent);
                  }
                }}
              />
              <Button
                type="submit"
                disabled={sending || !content.trim()}
                className="rounded-xl"
              >
                {sending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
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