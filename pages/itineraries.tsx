"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { api } from "@/utils/trpc/api";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useAuth } from "@/utils/use-auth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/dates";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  LogOut,
  PlusCircle,
  Share,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DialogDescription, DialogTrigger } from "@radix-ui/react-dialog";
import { Trash2, Ellipsis, EllipsisVertical, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createSupabaseComponentClient } from "@/utils/supabase/clients/component";
import { format } from "date-fns";

import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";

export default function ItineraryPage() {
  const { data: trips, isLoading: tripsLoading } = api.trips.getItineraries.useQuery();
  const [openAddTrip, setOpenAddTrip] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [openJoin, setOpenJoin] = useState(false);

  return (
    <div className="min-h-screen relative horizon-bg">
      <main className="mx-auto w-full max-w-6xl px-6 py-12 flex gap-6">

        <Card className="self-start w-72 bg-white/80 border border-white/40 rounded-2xl shadow-xl backdrop-blur-sm">
          <CardHeader className="font-semibold text-[#0A2A43] text-lg">
            Your Trips
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full rounded-xl"
              onClick={() => setOpenAddTrip(true)}
            >
              Add Trip
            </Button>
            <Button
              onClick={() => setOpenJoin(true)}
              variant="outline"
              className="w-full rounded-xl"
            >
              Join Trip
            </Button>

            {tripsLoading ? (
              <p className="text-sm text-muted-foreground mt-4">Loading trips...</p>
            ) : (
              trips?.map((trip) => (
                <Button
                  key={trip.id}
                  onClick={() => {
                    setSelectedTrip(trip.id);
                  }}
                  className="w-full mt-2 flex items-center justify-between rounded-xl bg-white/90 hover:bg-[#0A2A43]/5 text-sm"
                  variant="outline"
                >
                  <p className="truncate text-left">{trip.title}</p>
                  <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
                </Button>
              ))
            )}
          </CardContent>
        </Card>

        <AddItinerary openAddTrip={openAddTrip} setOpenAddTrip={setOpenAddTrip} />
        <JoinTrip openJoin={openJoin} setOpenJoin={setOpenJoin} />

        
        {selectedTrip ? (
          <Card className="flex-1 bg-white/80 border border-white/40 rounded-2xl shadow-xl backdrop-blur-sm">
            <CardContent className="p-8">
              <GetDays itineraryId={selectedTrip} onTripDeleted={() => setSelectedTrip(null)} />
            </CardContent>
          </Card>
        ) : (
          <Card className="flex-1 bg-white/80 border border-white/40 rounded-2xl shadow-xl backdrop-blur-sm flex items-center justify-center">
            <CardContent className="text-center max-w-md px-4 py-10">
              <ChevronLeftIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-semibold text-[#0A2A43] mb-2">
                No Trip Selected
              </h2>
              <p className="text-muted-foreground text-sm">
                Select a trip from the sidebar to view and manage your itinerary, or
                create a new trip to get started on your next adventure.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}

function JoinTrip({
  openJoin,
  setOpenJoin,
}: {
  openJoin: boolean;
  setOpenJoin: (open: boolean) => void;
}) {
  const [joinCode, setJoinCode] = useState<string>("");
  const utils = api.useUtils();
  const joinTrip = api.trips.joinItinerary.useMutation({
    onSuccess: async () => {
      await utils.trips.getItineraries.invalidate();
      setOpenJoin(false);
      setJoinCode("");
    },
    onError: (error) => {
      console.error("❌ failed to join trip", {
        message: error.message,
        data: error.data,
        shape: error.shape,
      });
    },
  });

  return (
    <Dialog open={openJoin} onOpenChange={setOpenJoin}>
      <DialogContent className="max-w-md">
        <DialogTitle className="text-center text-xl font-semibold text-[#0A2A43]">
          Join Trip
        </DialogTitle>
        <div className="flex flex-col gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="join-code">Trip Code</Label>
            <Input
              id="join-code"
              placeholder="Enter the trip code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpenJoin(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (joinCode) {
                joinTrip.mutate({ itineraryId: joinCode });
              }
            }}
            disabled={!joinCode}
          >
            Join Trip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddItinerary({
  openAddTrip,
  setOpenAddTrip,
}: {
  openAddTrip: boolean;
  setOpenAddTrip: (open: boolean) => void;
}) {
  const { data: destinations } = api.destinations.getAll.useQuery();
  const [dateOpen, setDateOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [destinationId, setDestinationId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const utils = api.useUtils();
  const [destinationOpen, setDestinationOpen] = useState(false);
  const createItinerary = api.trips.createItinerary.useMutation({
    onSuccess: async () => {
      await utils.trips.getItineraries.invalidate();
      setOpenAddTrip(false);
    },
    onError: (error) => {
      console.error("❌ failed to create trip", {
        message: error.message,
        data: error.data,
        shape: error.shape,
      });
    },
  });

  return (
    <Dialog open={openAddTrip} onOpenChange={setOpenAddTrip}>
      <DialogContent className="max-w-3xl">
        <DialogTitle className="text-center text-xl font-semibold text-[#0A2A43]">
          Create New Trip
        </DialogTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div>
            <Label className="py-2" htmlFor="title">
              Trip Name
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="Enter your trip name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label className="py-2" htmlFor="description">
              Trip Description
            </Label>
            <Input
              id="description"
              name="description"
              placeholder="Provide a quick description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="">
  <Label className="py-2" htmlFor="destination">
    Destination
  </Label>

  <Popover open={destinationOpen} onOpenChange={setDestinationOpen}>
    <PopoverTrigger asChild>
      <Button
        type="button"
        variant="outline"
        className="w-[220px] justify-between rounded-xl"
      >
        {destinationId
          ? (() => {
              const dest = destinations?.find((d) => d.id === destinationId);
              return dest ? `${dest.name}, ${dest.country}` : "Select a destination";
            })()
          : "Select a destination"}
        <ChevronsUpDown className="h-4 w-4 opacity-60" />
      </Button>
    </PopoverTrigger>

    <PopoverContent className="w-[300px] p-0">
      <Command>
        <CommandInput placeholder="Search destinations..." />
        <CommandEmpty>No destinations found.</CommandEmpty>
        <CommandGroup>
          {destinations?.map((destination) => (
            <CommandItem
              key={destination.id}
              value={`${destination.name}, ${destination.country}`}
              onSelect={() => {
                setDestinationId(destination.id);
                setDestinationOpen(false);
              }}
            >
              <Check
                className={`mr-2 h-4 w-4 ${
                  destination.id === destinationId ? "opacity-100" : "opacity-0"
                }`}
              />
              {destination.name}, {destination.country}
            </CommandItem>
            ))}
            </CommandGroup>
            </Command>
            </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label className="py-2" htmlFor="startDate">
              Select your Trip Dates
            </Label>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between rounded-xl">
                  {startDate && endDate
                    ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                    : "Select date range"}
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <DateRangePicker
                  dateRange={
                    startDate && endDate ? { from: startDate, to: endDate } : undefined
                  }
                  setDateRange={(range) => {
                    setStartDate(range?.from);
                    setEndDate(range?.to);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpenAddTrip(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (startDate && endDate && destinationId) {
                createItinerary.mutate({
                  startDate,
                  endDate,
                  destinationId,
                  title,
                  description,
                });
              }
            }}
            disabled={!startDate || !endDate || !destinationId || !title}
          >
            Create Trip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GetDays({
  itineraryId,
  onTripDeleted,
}: {
  itineraryId: string;
  onTripDeleted: () => void;
}) {
  const { data: itinerary } = api.trips.getItinerary.useQuery({ itineraryId });
  const { data: days, isLoading: daysLoading } = api.trips.getDays.useQuery({ itineraryId });
  const { user } = useAuth();

  const numDays = (() => {
    if (!itinerary?.startDate || !itinerary?.endDate) return undefined;
    const start = new Date(itinerary.startDate);
    const end = new Date(itinerary.endDate);
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffDays = Math.round((end.getTime() - start.getTime()) / msPerDay) + 1;
    return diffDays;
  })();

  const collaborators = (itinerary?.collaborators ?? []).filter((c) => !!c.profile);

  const [dayNumber, setDayNumber] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState<string>("");
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStartDate, setEditStartDate] = useState<Date | undefined>(undefined);
  const [editEndDate, setEditEndDate] = useState<Date | undefined>(undefined);
  const [editDestinationId, setEditDestinationId] = useState<string | undefined>(undefined);

  const [editDayOpen, setEditDayOpen] = useState(false);
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [editDayNumber, setEditDayNumber] = useState<number | undefined>(undefined);
  const [editDayNotes, setEditDayNotes] = useState<string>("");

  const utils = api.useUtils();
  const { data: destinations } = api.destinations.getAll.useQuery();

  const createDay = api.trips.createDay.useMutation({
    onSuccess: async () => {
      await utils.trips.getDays.invalidate({ itineraryId });
    },
    onError: (error) => {
      console.error("❌ failed to create day", error);
    },
  });

  const deleteDay = api.trips.deleteDay.useMutation({
    onSuccess: async () => {
      await utils.trips.getDays.invalidate({ itineraryId });
    },
    onError: (error) => {
      console.error("❌ failed to delete day", error);
    },
  });

  const editDayMutation = api.trips.editDay.useMutation({
    onSuccess: async () => {
      await utils.trips.getDays.invalidate({ itineraryId });
      setEditDayOpen(false);
      setEditingDayId(null);
    },
    onError: (error) => {
      console.error("❌ failed to edit day", error);
    },
  });

  const deleteTrip = api.trips.deleteItinerary.useMutation({
    onSuccess: async () => {
      await utils.trips.getItineraries.invalidate();
      onTripDeleted();
    },
    onError: (error) => {
      console.error("❌ failed to delete trip", error);
    },
  });

  const editItineraryMutation = api.trips.editItinerary.useMutation({
    onSuccess: async () => {
      await utils.trips.getItinerary.invalidate({ itineraryId });
      await utils.trips.getItineraries.invalidate();
      setEditOpen(false);
    },
    onError: (error) => {
      console.error("❌ failed to edit trip", error);
    },
  });

  const leaveTrip = api.trips.leaveItinerary.useMutation({
    onSuccess: async () => {
      await utils.trips.getItineraries.invalidate();
      onTripDeleted();
    },
    onError: (error) => {
      console.error("❌ failed to leave trip", error);
    },
  });

  const supabase = createSupabaseComponentClient();

  // Realtime updates for itinerary + days
  useEffect(() => {
    type Activity = {
      id: string;
      description: string;
      name: string;
      itineraryDayId: string;
      time: Date;
      category: string | null;
      location: string | null;
    };

    type Day = {
      id: string;
      dayNumber: number;
      notes: string | null;
      activities: Activity[];
    };

    const ch = supabase
      .channel(`update-db:${itineraryId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "itineraries",
          filter: `id=eq.${itineraryId}`,
        },
        (payload) => {
          const updatedItinerary = payload.new;
          utils.trips.getItinerary.setData({ itineraryId }, (old) => {
            if (!old) return old;
            return {
              ...old,
              title: updatedItinerary.title ?? old.title,
              description: updatedItinerary.description ?? old.description,
              content: updatedItinerary.content ?? old.content,
              startDate: updatedItinerary.startDate ?? old.startDate,
              endDate: updatedItinerary.endDate ?? old.endDate,
            };
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "itinerary_days",
          filter: `itinerary_id=eq.${itineraryId}`,
        },
        ({ new: d }: { new: Day }) => {
          utils.trips.getDays.setData({ itineraryId }, (old) => {
            if (!old) return [d];
            if (old.some((day) => day.id === d.id)) return old;
            return [...old, d].sort((a, b) => a.dayNumber - b.dayNumber);
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "itinerary_days",
          filter: `itinerary_id=eq.${itineraryId}`,
        },
        ({ new: d }: { new: Day }) => {
          utils.trips.getDays.setData({ itineraryId }, (old) => {
            if (!old) return [d];
            return old
              .map((day) => (day.id === d.id ? d : day))
              .sort((a, b) => a.dayNumber - b.dayNumber);
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "itinerary_days",
          filter: `itinerary_id=eq.${itineraryId}`,
        },
        (payload) => {
          const oldDay = payload.old as Day;
          if (oldDay?.id) {
            utils.trips.getDays.setData({ itineraryId }, (current) => {
              if (!current) return current;
              return current.filter((day) => day.id !== oldDay.id);
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [utils.trips.getDays, supabase, utils, itineraryId]);

  // Presence / online collaborators
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const onUserJoin = (joiningUserIds: string[]) => {
    setOnlineUsers((prevUsers) => [...prevUsers, ...joiningUserIds]);
  };

  const onUserLeave = (leavingUserIds: string[]) => {
    setOnlineUsers((prevUsers) =>
      prevUsers.filter((userId) => !leavingUserIds.includes(userId)),
    );
  };

  useEffect(() => {
    if (!user?.id) return;
    type PresenceEntry = { id?: string; userId?: string };

    const ch = supabase
      .channel("presence", { config: { presence: { key: user.id } } })
      .on("presence", { event: "join" }, (payload: { newPresences?: PresenceEntry[] }) => {
        const ids = (payload.newPresences ?? []).map((p) => p.userId ?? p.id);
        onUserJoin(ids.filter(Boolean) as string[]);
      })
      .on("presence", { event: "leave" }, (payload: { leftPresences?: PresenceEntry[] }) => {
        const ids = (payload.leftPresences ?? []).map((p) => p.userId ?? p.id);
        onUserLeave(ids.filter(Boolean) as string[]);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await ch.track({ userId: user.id });
        }
      });

    return () => {
      supabase.removeChannel(ch);
    };
  }, [supabase, user?.id]);

  return (
    <div className="flex flex-col items-center gap-6">
     
      <div className="text-center max-w-2xl">
        <div className="flex flex-row items-center justify-center gap-2">
          <h1 className="text-3xl md:text-4xl font-black text-[#0A2A43] flex-1">
            {itinerary?.title}
          </h1>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-full hover:bg-slate-100">
                <EllipsisVertical className="h-5 w-5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel className="text-center">
                Trip Actions
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => {
                    setEditTitle(itinerary?.title ?? "");
                    setEditDescription(itinerary?.description ?? "");
                    setEditDestinationId(itinerary?.destinationId ?? undefined);
                    setEditStartDate(
                      itinerary?.startDate
                        ? new Date(
                            itinerary.startDate.getTime() +
                              itinerary.startDate.getTimezoneOffset() * 60000,
                          )
                        : undefined,
                    );
                    setEditEndDate(
                      itinerary?.endDate
                        ? new Date(
                            itinerary.endDate.getTime() +
                              itinerary.endDate.getTimezoneOffset() * 60000,
                          )
                        : undefined,
                    );
                    setEditOpen(true);
                  }}
                >
                  Edit
                  <DropdownMenuShortcut>
                    <Pencil className="h-4 w-4" />
                  </DropdownMenuShortcut>
                </DropdownMenuItem>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      disabled={user?.id !== itinerary?.author.id}
                      className="text-destructive focus:text-destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      Delete Trip
                      <DropdownMenuShortcut>
                        <Trash2 className="h-4 w-4" />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this Trip?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          deleteTrip.mutate({ itineraryId });
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      disabled={user?.id === itinerary?.author.id}
                      className="text-destructive focus:text-destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      Leave Trip
                      <DropdownMenuShortcut>
                        <LogOut className="h-4 w-4" />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Leave this Trip?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          leaveTrip.mutate({ itineraryId });
                        }}
                      >
                        Leave
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="pt-3 text-muted-foreground text-sm md:text-base">
          {itinerary?.startDate &&
            format(
              new Date(
                itinerary.startDate.getTime() +
                  itinerary.startDate.getTimezoneOffset() * 60000,
              ),
              "MMM d, yyyy",
            )}
          {" – "}
          {itinerary?.endDate &&
            format(
              new Date(
                itinerary.endDate.getTime() +
                  itinerary.endDate.getTimezoneOffset() * 60000,
              ),
              "MMM d, yyyy",
            )}
        </p>

        <p className="pt-3 text-base text-gray-700">
          {itinerary?.description}
        </p>
      </div>

      
      <Card className="w-full max-w-3xl bg-white/90 border border-slate-100 rounded-2xl shadow-md">
        <CardContent className="py-4">
          <div className="flex flex-row items-center gap-3">
            <Users className="text-muted-foreground" size={28} />
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-xl">
                  Collaborators
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogTitle className="text-center">Collaborators</DialogTitle>
                <DialogDescription className="text-center mb-2">
                  People who have access to this trip
                </DialogDescription>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {collaborators.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground">
                      No collaborators yet
                    </p>
                  ) : (
                    collaborators.map((user) => {
                      const isOnline = onlineUsers.includes(user.profileId);
                      return (
                        <div
                          key={user.profileId}
                          className="flex items-center justify-between"
                        >
                          <p className="text-sm">{user.profile?.displayName}</p>
                          <Badge variant={isOnline ? "default" : "outline"}>
                            {isOnline ? "Online" : "Offline"}
                          </Badge>
                        </div>
                      );
                    })
                  )}
                </div>
              </DialogContent>
            </Dialog>

            <Badge variant="outline" className="rounded-full">
              {onlineUsers.length} Active
            </Badge>

            <div className="ml-auto">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="font-semibold rounded-xl">
                    <Share className="mr-1 h-4 w-4" />
                    Share
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogTitle className="text-center">Join Code</DialogTitle>
                  <DialogDescription className="text-center mb-2">
                    Share this code with your friends
                  </DialogDescription>
                  <p className="text-center font-mono font-bold text-lg">
                    {itineraryId}
                  </p>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-3xl">
          <DialogTitle className="text-center text-xl font-semibold text-[#0A2A43]">
            Edit Trip
          </DialogTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div>
              <Label className="py-2" htmlFor="edit-title">
                Trip Name
              </Label>
              <Input
                id="edit-title"
                name="edit-title"
                placeholder="Enter your trip name"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div>
              <Label className="py-2" htmlFor="edit-description">
                Trip Description
              </Label>
              <Input
                id="edit-description"
                name="edit-description"
                placeholder="Provide a quick description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div>
              <Label className="py-2" htmlFor="edit-destination">
                Destination
              </Label>
              <Select
                value={editDestinationId}
                onValueChange={(value) => setEditDestinationId(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Destinations</SelectLabel>
                    {destinations &&
                      destinations.map((destination) => (
                        <SelectItem key={destination.id} value={destination.id}>
                          {destination.name}, {destination.country}
                        </SelectItem>
                      ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="py-2" htmlFor="edit-dates">
                Select your Trip Dates
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {editStartDate && editEndDate
                      ? `${editStartDate.toLocaleDateString()} - ${editEndDate.toLocaleDateString()}`
                      : "Select date range"}
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <DateRangePicker
                    dateRange={
                      editStartDate && editEndDate
                        ? { from: editStartDate, to: editEndDate }
                        : undefined
                    }
                    setDateRange={(range) => {
                      setEditStartDate(range?.from);
                      setEditEndDate(range?.to);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!itinerary || !editStartDate || !editEndDate || !editDestinationId)
                  return;
                editItineraryMutation.mutate({
                  id: itinerary.id,
                  title: editTitle,
                  description: editDescription || null,
                  content: itinerary.content,
                  destinationId: editDestinationId,
                  startDate: editStartDate,
                  endDate: editEndDate,
                  collaborators: itinerary.collaborators ?? [],
                  days: itinerary.days ?? [],
                  destination: itinerary.destination,
                });
              }}
              disabled={
                !editTitle || !editStartDate || !editEndDate || !editDestinationId || !itinerary
              }
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      <div className="w-full max-w-3xl">
        {daysLoading ? (
          <p className="text-center text-sm text-muted-foreground py-4">
            Loading days...
          </p>
        ) : (
          days?.map((day) => (
            <Card
              className="mb-3 bg-white/90 border border-slate-100 rounded-2xl shadow-sm"
              key={day.id}
            >
              <CardHeader>
                <div className="flex flex-row justify-between items-center">
                  <h2 className="font-semibold text-[#0A2A43]">
                    Day {day.dayNumber}
                  </h2>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1 rounded-full hover:bg-slate-100">
                        <Ellipsis className="w-5 h-5 cursor-pointer text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingDayId(day.id);
                          setEditDayNumber(day.dayNumber);
                          setEditDayNotes(day.notes ?? "");
                          setEditDayOpen(true);
                        }}
                      >
                        Edit
                        <DropdownMenuShortcut>
                          <Pencil className="h-4 w-4" />
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={(e) => e.preventDefault()}
                          >
                            Delete
                            <DropdownMenuShortcut>
                              <Trash2 className="h-4 w-4" />
                            </DropdownMenuShortcut>
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this Day?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                deleteDay.mutate({ itineraryDayId: day.id });
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="text-sm font-medium text-gray-600 mt-1">
                  {day.notes}
                </p>
                <GetActivities dayId={day.id} />
              </CardHeader>
              <CardContent />
            </Card>
          ))
        )}

        
        <Dialog open={editDayOpen} onOpenChange={setEditDayOpen}>
          <DialogContent className="max-w-md">
            <DialogTitle className="text-center">Edit Day</DialogTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div className="flex flex-col">
                <Label className="mb-2" htmlFor="edit-day-number">
                  Day Number
                </Label>
                <Select
                  value={editDayNumber?.toString()}
                  onValueChange={(value) =>
                    setEditDayNumber(value ? parseInt(value) : undefined)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Day Number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Day Number</SelectLabel>
                      {numDays &&
                        Array.from({ length: numDays }, (_, i) => i + 1).map((dayNum) => (
                          <SelectItem key={dayNum} value={dayNum.toString()}>
                            {dayNum}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col">
                <Label className="mb-2" htmlFor="edit-notes">
                  Notes
                </Label>
                <Input
                  id="edit-notes"
                  name="edit-notes"
                  placeholder="Enter your notes"
                  value={editDayNotes}
                  onChange={(e) => setEditDayNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditDayOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="outline"
                disabled={!editDayNumber || !editingDayId}
                onClick={() => {
                  if (!editDayNumber || !editingDayId) return;
                  const originalDay = days?.find((d) => d.id === editingDayId);
                  if (!originalDay) return;
                  editDayMutation.mutate({
                    id: originalDay.id,
                    dayNumber: editDayNumber,
                    notes: editDayNotes,
                    activities: originalDay.activities ?? [],
                  });
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex justify-center mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full max-w-3xl rounded-xl">
                Add Day
                <PlusCircle className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogTitle className="text-center">Create Day</DialogTitle>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                <div className="flex flex-col">
                  <Label className="mb-2" htmlFor="Number">
                    Day Number
                  </Label>
                  <Select
                    value={dayNumber?.toString()}
                    onValueChange={(value) =>
                      setDayNumber(value ? parseInt(value) : undefined)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Day Number" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Day Number</SelectLabel>
                        {numDays &&
                          Array.from({ length: numDays }, (_, i) => i + 1).map((dayNum) => (
                            <SelectItem key={dayNum} value={dayNum.toString()}>
                              {dayNum}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col">
                  <Label className="mb-2" htmlFor="notes">
                    Notes
                  </Label>
                  <Input
                    id="notes"
                    name="notes"
                    placeholder="Enter your notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose>
                  <Button variant="secondary">Cancel</Button>
                </DialogClose>
                <DialogClose>
                  <Button
                    variant="outline"
                    disabled={!dayNumber}
                    onClick={() => {
                      if (dayNumber) {
                        createDay.mutate({ itineraryId, dayNumber, notes });
                      }
                    }}
                  >
                    Create
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

function GetActivities({ dayId }: { dayId: string }) {
  const { data: activities, isLoading: activitiesLoading } =
    api.trips.getActivities.useQuery({
      itineraryDayId: dayId,
    });

  const categories = [
    "Dining",
    "Accommodation",
    "Transportation",
    "Sightseeing",
    "Activities",
    "Shopping",
    "Entertainment",
    "Relaxation",
    "Cultural",
    "Sports",
    "Other",
  ];

  const utils = api.useUtils();

  const createActivity = api.trips.createActivity.useMutation({
    onSuccess: async () => {
      await utils.trips.getActivities.invalidate({ itineraryDayId: dayId });
      setName("");
      setDescription("");
      setLocation("");
      setTime("");
      setCategory("");
    },
    onError: (error) => {
      console.error("❌ failed to create activity", error);
    },
  });

  const deleteActivity = api.trips.deleteActivity.useMutation({
    onSuccess: async () => {
      await utils.trips.getActivities.invalidate({ itineraryDayId: dayId });
    },
    onError: (error) => {
      console.error("❌ failed to delete activity", error);
    },
  });

  const editActivityMutation = api.trips.editActivity.useMutation({
    onSuccess: async () => {
      await utils.trips.getActivities.invalidate({ itineraryDayId: dayId });
      setEditActivityOpen(false);
      setEditingActivityId(null);
    },
    onError: (error) => {
      console.error("❌ failed to edit activity", error);
    },
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState("");

  const [editActivityOpen, setEditActivityOpen] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const handleCreateActivity = () => {
    if (!name || !description || !time || !category) return;
    const [hours, minutes] = time.split(":");
    const activityTime = new Date();
    activityTime.setHours(parseInt(hours), parseInt(minutes));
    createActivity.mutate({
      itineraryDayId: dayId,
      name,
      location,
      time: activityTime.toISOString(),
      category,
      description,
    });
  };

  const supabase = createSupabaseComponentClient();

  useEffect(() => {
    type Activity = {
      id: string;
      description: string;
      name: string;
      itineraryDayId: string;
      time: Date;
      category: string | null;
      location: string | null;
    };

    const ch = supabase
      .channel(`update-db:${dayId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activities",
          filter: `itinerary_day_id=eq.${dayId}`,
        },
        ({ new: a }: { new: Activity }) => {
          utils.trips.getActivities.setData({ itineraryDayId: dayId }, (old) => {
            if (!old) return [a];
            if (old.some((activity) => activity.id === a.id)) return old;
            return [...old, a].sort(
              (a1, b1) =>
                new Date(a1.time).getTime() - new Date(b1.time).getTime(),
            );
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "activities",
          filter: `itinerary_day_id=eq.${dayId}`,
        },
        ({ new: a }: { new: Activity }) => {
          utils.trips.getActivities.setData({ itineraryDayId: dayId }, (old) => {
            if (!old) return [a];
            return old
              .map((activity) => (activity.id === a.id ? a : activity))
              .sort(
                (a1, b1) =>
                  new Date(a1.time).getTime() - new Date(b1.time).getTime(),
              );
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "activities",
          filter: `itinerary_day_id=eq.${dayId}`,
        },
        (payload) => {
          const oldActivity = payload.old as Activity;
          if (oldActivity?.id) {
            utils.trips.getActivities.setData({ itineraryDayId: dayId }, (current) => {
              if (!current) return current;
              return current.filter((activity) => activity.id !== oldActivity.id);
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ch);
    };
  }, [dayId, supabase, utils.trips.getActivities]);

  return (
    <div className="mt-3">
      {activitiesLoading ? (
        <p className="text-sm text-muted-foreground">Loading activities...</p>
      ) : activities && activities.length > 0 ? (
        activities.map((activity) => (
          <Card
            className="mb-2 bg-white/90 border border-slate-100 rounded-xl shadow-sm space-y-2"
            key={activity.id}
          >
            <CardHeader className="py-3">
              <div className="flex justify-between items-center">
                <div className="flex flex-row items-center gap-3">
                  <p className="text-sm font-medium text-gray-600">
                    {activity.time
                      ? new Date(activity.time).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </p>
                  <Badge className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#ffb88c]/20 text-[#ffb88c] border border-[#ffb88c]/40 w-fit">
                    {activity.category}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded-full hover:bg-slate-100">
                      <Ellipsis className="w-5 h-5 cursor-pointer text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingActivityId(activity.id);
                        setEditName(activity.name);
                        setEditDescription(activity.description);
                        setEditLocation(activity.location ?? "");
                        const t = new Date(activity.time);
                        const h = t.getHours().toString().padStart(2, "0");
                        const m = t.getMinutes().toString().padStart(2, "0");
                        setEditTime(`${h}:${m}`);
                        setEditCategory(activity.category ?? "");
                        setEditActivityOpen(true);
                      }}
                    >
                      Edit
                      <DropdownMenuShortcut>
                        <Pencil className="h-4 w-4" />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={(e) => e.preventDefault()}
                        >
                          Delete
                          <DropdownMenuShortcut>
                            <Trash2 className="h-4 w-4" />
                          </DropdownMenuShortcut>
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this Activity?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              deleteActivity.mutate({ activityId: activity.id });
                            }}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h2 className="font-medium text-[#0A2A43]">{activity.name}</h2>
            </CardHeader>
            <CardContent className="pt-0 pb-3 flex flex-col gap-3">
              <div className="flex flex-row items-center">
                <p className="text-sm text-gray-500">{activity.location}</p>
              </div>
              <p className="text-sm text-gray-700 mb-1">
                {activity.description}
              </p>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-center py-2 text-muted-foreground text-sm">
          No activities yet
        </p>
      )}

      
      <Dialog open={editActivityOpen} onOpenChange={setEditActivityOpen}>
        <DialogContent className="w-[500px] max-w-full">
          <DialogTitle className="text-center">Edit Activity</DialogTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div>
              <Label className="mb-2" htmlFor="edit-name">
                Activity Name
              </Label>
              <Input
                id="edit-name"
                name="edit-name"
                placeholder="Enter activity name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-2" htmlFor="edit-location">
                Activity Location
              </Label>
              <Input
                id="edit-location"
                name="edit-location"
                placeholder="Enter activity location"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-2" htmlFor="edit-time">
                Activity Time
              </Label>
              <Input
                id="edit-time"
                type="time"
                name="edit-time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-2" htmlFor="edit-category">
                Activity Category
              </Label>
              <Select value={editCategory} onValueChange={setEditCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-2">
            <Label className="mb-2" htmlFor="edit-description">
              Activity Description
            </Label>
            <Input
              id="edit-description"
              name="edit-description"
              placeholder="Enter activity description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <DialogClose>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditActivityOpen(false);
                }}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="outline"
              disabled={
                !editingActivityId ||
                !editName ||
                !editDescription ||
                !editTime ||
                !editCategory
              }
              onClick={() => {
                if (!editingActivityId) return;
                const original = activities?.find((a) => a.id === editingActivityId);
                if (!original) return;
                const [hours, minutes] = editTime.split(":");
                const updatedTime = new Date(original.time);
                updatedTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                editActivityMutation.mutate({
                  id: original.id,
                  itineraryDayId: original.itineraryDayId,
                  name: editName,
                  description: editDescription,
                  location: editLocation || null,
                  category: editCategory || null,
                  time: updatedTime,
                });
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      
      <div className="flex justify-center mt-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="rounded-xl">
              Add Activity
              <PlusCircle className="ml-2 h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[500px] max-w-full">
            <DialogTitle className="text-center">Create Activity</DialogTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div>
                <Label className="mb-2" htmlFor="name">
                  Activity Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter activity name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-2" htmlFor="location">
                  Activity Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Enter activity location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-2" htmlFor="time">
                  Activity Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  name="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
              <div>
                <Label className="mb-2" htmlFor="category">
                  Activity Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Categories</SelectLabel>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-2">
              <Label className="mb-2" htmlFor="description">
                Activity Description
              </Label>
              <Input
                id="description"
                name="description"
                placeholder="Enter activity description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <DialogFooter>
              <DialogClose>
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <DialogClose>
                <Button
                  variant="outline"
                  onClick={handleCreateActivity}
                  disabled={!name || !description || !time || !category}
                >
                  Create
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}


