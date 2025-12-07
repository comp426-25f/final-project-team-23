"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import { api } from "@/utils/trpc/api";
import { useAuth } from "@/utils/use-auth";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, ArrowLeft } from "lucide-react";

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
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p>You must be logged in to view group chats.</p>
        <Button onClick={() => router.push("/")}>Back to home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Group Chats</h1>
          <Button variant="default" onClick={() => setIsCreating((v) => !v)}>
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* New group chat form */}
        {isCreating && (
          <Card>
            <CardContent className="space-y-4 py-4">
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Group chat name
                  </label>
                  <Input
                    value={chatName}
                    onChange={(e) => setChatName(e.target.value)}
                    placeholder="Trip planning, game night, etc."
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Add friends
                  </label>
                  {friendsLoading ? (
                    <p className="text-sm text-muted-foreground">
                      Loading friends...
                    </p>
                  ) : !friends || friends.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
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

        {/* List of group chats */}
        <Card>
          <CardContent className="space-y-3 py-4">
            <h2 className="text-lg font-semibold">Your group chats</h2>
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
                    <div className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-muted/60">
                      <span className="font-medium">{chat.name}</span>
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