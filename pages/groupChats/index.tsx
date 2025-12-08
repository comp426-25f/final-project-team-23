"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import { api } from "@/utils/trpc/api";
import { useAuth } from "@/utils/use-auth";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, ArrowLeft } from "lucide-react";
import { createSupabaseServerClient } from "@/utils/supabase/clients/server-props";
import { GetServerSidePropsContext } from "next";

export default function GroupChatsIndexPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [isCreating, setIsCreating] = useState(false);
  const [chatName, setChatName] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const { data: friends, isLoading: friendsLoading } =
    api.groupChats.getFriends.useQuery(undefined, {
      enabled: !!user && !authLoading,
    });

  const {
    data: groupChats,
    isLoading: chatsLoading,
  } = api.groupChats.getUserGroupChats.useQuery(undefined, {
    enabled: !!user && !authLoading,
  });

  const apiUtils = api.useUtils();

  const { mutate: createGroupChat, isPending: creatingChat } =
    api.groupChats.createGroupChat.useMutation({
      onSuccess: async (server) => {
        setChatName("");
        setSelectedMemberIds([]);
        setIsCreating(false);
        await apiUtils.groupChats.getUserGroupChats.invalidate();
        router.push(`/groupChats/${server.id}`);
      },
    });

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!chatName.trim()) return;

    createGroupChat({
      name: chatName.trim(),
      memberIds: selectedMemberIds,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen relative horizon-bg">
        <main className="mx-auto flex max-w-6xl items-center justify-center px-6 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
  <div className="min-h-screen relative horizon-bg">
    <main className="mx-auto w-full max-w-6xl px-6 py-12 flex flex-col gap-8">

      <Card className="bg-white/80 dark:bg-slate-900/40 border border-white/40 dark:border-slate-700 rounded-2xl shadow-xl backdrop-blur-sm">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4">
          <Button
            variant="ghost"
            className="px-0 hover:bg-transparent text-muted-foreground dark:text-gray-200 hover:text-[#0A2A43] dark:hover:text-gray-100"
            onClick={() => router.push("/friends")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Friends
          </Button>

          <div>
            <CardTitle className="text-3xl md:text-4xl font-black text-[#0A2A43] tracking-tight">
              Group Chats
            </CardTitle>
            <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-200 max-w-xl">
              Start a new group or jump back into conversations with your travel crew.
            </p>
          </div>

          <Button
            variant="default"
            className="h-auto px-5 py-3 rounded-xl bg-[#0A2A43] text-white font-semibold shadow-md hover:bg-[#061829] transition"
            onClick={() => setIsCreating((v) => !v)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </CardHeader>
      </Card>

      {isCreating && (
        <Card className="bg-white/80 dark:bg-slate-900/40 border border-white/40 dark:border-slate-700 rounded-2xl shadow-xl backdrop-blur-sm">
          <CardContent className="space-y-4 py-4">
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#0A2A43] dark:text-gray-100">
                  Group chat name
                </label>
                <Input
                  value={chatName}
                  onChange={(e) => setChatName(e.target.value)}
                  placeholder="Trip planning, game night, etc."
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-[#0A2A43] dark:text-gray-100">
                  Add friends
                </label>
                {friendsLoading ? (
                  <p className="text-sm text-muted-foreground dark:text-gray-300">
                    Loading friends...
                  </p>
                ) : !friends || friends.length === 0 ? (
                  <p className="text-sm text-muted-foreground dark:text-gray-300">
                    You aren&apos;t following anyone yet.
                  </p>
                ) : (
                  <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2">
                    {friends.map((friend) => (
                      <label
                        key={friend.id}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMemberIds.includes(friend.id)}
                          onChange={() => toggleMember(friend.id)}
                        />
                        <span className="font-medium">
                          {friend.displayName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          @{friend.username}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsCreating(false);
                    setChatName("");
                    setSelectedMemberIds([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creatingChat || !chatName.trim()}
                >
                  {creatingChat && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white/80 dark:bg-slate-900/40 border border-white/40 dark:border-slate-700 rounded-2xl shadow-xl backdrop-blur-sm">
        <CardContent className="space-y-3 py-4">
          <h2 className="text-lg font-semibold text-[#0A2A43] dark:text-white">
            Your group chats
          </h2>
          {chatsLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : !groupChats || groupChats.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              You&apos;re not in any group chats yet. Create one above!
            </p>
          ) : (
            <div className="space-y-2">
              {groupChats.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/groupChats/${chat.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white/70 dark:bg-slate-900/70 hover:bg-[#0A2A43]/5 dark:hover:bg-slate-800/80 transition">
                    <span className="font-medium text-[#0A2A43] dark:text-white">
                      {chat.name}
                    </span>
                  </div>
                </Link>
              ))}
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
        destination: "/login",
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