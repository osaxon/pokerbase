/* eslint-disable @typescript-eslint/no-unused-vars */
import { joinRoom, joinRoomAsGuest, roomQuery, utils } from "@/api/rooms";
import { useAddVote, useUpdateVote, votesQueryOptions } from "@/api/votes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import DrawerDialog from "@/components/DrawerDialog";
import { columns } from "@/components/tables/stories/columns";
import { StoriesTable } from "@/components/tables/stories/data.table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRealtime } from "@/hooks/useRealtime";
import { cn } from "@/lib/utils";
import {
    RoomsRecord,
    RoomsResponse,
    StoriesRecord,
    StoriesResponse,
    TypedPocketBase,
    UsersRecord,
    UsersResponse,
    VotesRecord,
    VotesResponse,
    VotesVoteOptions,
} from "@/types/pocketbase-types";
import { LockClosedIcon, LockOpen1Icon } from "@radix-ui/react-icons";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
    createFileRoute,
    useLocation,
    useRouter,
} from "@tanstack/react-router";
import { RecordSubscription } from "pocketbase";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/rooms/$id")({
    loader: async ({ context, params }) =>
        context.queryClient.ensureQueryData(roomQuery(params.id, context.pb)),
    component: RoomComponent,
});

function RoomComponent() {
    const { id } = Route.useParams();
    const ctx = Route.useRouteContext();
    const userId = ctx.pb.authStore.model?.id;
    const { data: room } = useSuspenseQuery(roomQuery(id, ctx.pb));
    const { data: votes } = useSuspenseQuery(
        votesQueryOptions(ctx.pb, room.id)
    );
    const [showResults, setShowResults] = useState(
        utils.isReadyForResults(room.members, votes)
    );

    const [stragglers, setStragglers] = useState<
        ReturnType<typeof utils.getNotVoted>
    >(utils.getNotVoted(room, votes, room.activeStory));

    const { mutate: addVote } = useAddVote(userId, ctx.queryClient);
    const { mutate: updateVote } = useUpdateVote(userId, ctx.queryClient);

    const handleAddOrUpdate = (vote: string, story: string) => {
        if (utils.hasVoted(userId, votes, story)) {
            const voteId = utils.getUserVote(userId, votes, story)?.id;
            if (!voteId) throw new Error("invalid vote id");

            updateVote({
                voteId: voteId,
                pb: ctx.pb,
                score: vote,
                storyId: room.expand?.activeStory.id ?? "",
            });
        } else {
            addVote({
                pb: ctx.pb,
                score: vote,
                storyId: room.expand?.activeStory.id ?? "",
                userId: userId,
                roomId: room.id,
            });
        }
    };

    const votesUpdater = (
        d: RecordSubscription<VotesResponse<VotesRecord>>
    ) => {
        console.log("[REAL-TIME-CONNECTION][VOTES]", d.record);

        const { record } = d;

        const updatedVotes = [
            ...votes.filter((v) => v.id !== record.id),
            record,
        ];

        const isReady = utils.isReadyForResults(room.members, updatedVotes);

        const leftToVote = utils.getNotVoted(
            room,
            updatedVotes,
            room.activeStory
        );
        setStragglers(leftToVote);

        setShowResults(isReady);

        ctx.queryClient.setQueryData<
            unknown,
            string[],
            VotesResponse<VotesRecord>[]
        >(
            ["votes", room.id],
            (old) =>
                old && [...old.filter((v) => v.id !== record.id), { ...record }]
        );
    };

    const roomsUpdater = (
        d: RecordSubscription<RoomsResponse<RoomsRecord>>
    ) => {
        console.log("[REAL-TIME-CONNECTION][ROOMS]", d.record);

        const { record } = d;
        console.log(d, "the updated rooms");
        const newActiveStory = room.expand?.stories.find(
            (s) => s.id === record.activeStory
        );

        if (!newActiveStory) throw new Error("error updating story");

        ctx.queryClient.setQueryData<
            unknown,
            string[],
            RoomsResponse<{
                activeStory: StoriesResponse<StoriesRecord>;
            }>
        >(
            ["rooms", room.id],
            (old) =>
                old && {
                    ...old,
                    expand: {
                        ...d.record.expand,
                        activeStory: newActiveStory,
                    },
                }
        );
    };

    useRealtime("votes", ctx.pb, votesUpdater);

    useRealtime("rooms", ctx.pb, roomsUpdater);

    if (!utils.isJoined(userId, room)) {
        return (
            <div className="flex flex-col gap-8 items-center justify-center min-h-screen">
                <p>You need to join to view the room</p>
                <JoinRoomDialog roomId={room.id} />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto min-h-screen space-y-8 p-10">
            <div className="space-y-4">
                <p className="text-2xl font-mono">
                    {JSON.stringify({
                        story: room.expand?.activeStory.title,
                    })}
                </p>
                <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Tabs className="col-span-3" defaultValue="vote">
                        <TabsList>
                            <TabsTrigger value="vote">Vote</TabsTrigger>
                            <TabsTrigger
                                disabled={!showResults}
                                value="results"
                            >
                                {showResults ? (
                                    <LockOpen1Icon />
                                ) : (
                                    <LockClosedIcon />
                                )}
                                <span className="ml-1">Results</span>
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent className="space-y-6" value="vote">
                            <VoteButtonGrid
                                room={room}
                                handleAdd={handleAddOrUpdate}
                                userId={userId}
                                votes={votes}
                            />
                        </TabsContent>
                        <TabsContent value="results">
                            <Card>
                                <CardContent>
                                    <pre>
                                        <code>
                                            {JSON.stringify(
                                                room.expand?.votes_via_room,
                                                null,
                                                2
                                            )}
                                        </code>
                                    </pre>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                    <Card className="col-span-1 flex flex-col border">
                        <CardHeader>
                            <CardTitle>{room.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="flex col-span-1">
                                {votes && room.expand?.members && (
                                    <RoomMembers
                                        members={room.expand?.members}
                                        votes={votes}
                                        activeStory={
                                            room.expand?.activeStory?.id
                                        }
                                    />
                                )}
                            </ul>
                            {stragglers ? (
                                <ActiveStoryStatusMessage
                                    notVoted={stragglers}
                                />
                            ) : null}
                            <Label>Share Room</Label>
                            <Input
                                readOnly
                                role="button"
                                onSelect={() => {
                                    // copy to clipboard
                                    navigator.clipboard
                                        .writeText(room.id)
                                        .then(() => {
                                            toast.info(
                                                "Copied to clipboard: " +
                                                    utils.getRoomUrl(room.id)
                                            );
                                        })
                                        .catch((err) => {
                                            toast.error(
                                                "Failed to copy: " + err
                                            );
                                        });
                                }}
                                value={utils.getRoomUrl(room.id)}
                            />
                        </CardContent>
                    </Card>
                </section>
            </div>

            {room.expand?.stories && (
                <StoriesTable data={room.expand?.stories} columns={columns} />
            )}
        </div>
    );
}

function JoinRoomDialog({ roomId }: { roomId: string }) {
    const ctx = Route.useRouteContext();
    const router = useRouter();
    const loc = useLocation();
    const userId = ctx.pb.authStore.model?.id;
    const [dialogOpen, setDialogOpen] = useState(true);
    const { mutate: join } = useMutation({
        mutationKey: ["rooms", userId],
        mutationFn: async ({
            userId,
            roomId,
            pb,
        }: {
            userId: string;
            roomId: string;
            pb: TypedPocketBase;
        }) => await joinRoom(userId, pb, roomId),
        onSettled: () => {
            setDialogOpen(false);
        },
    });
    const { mutate: joinAsGuest, isPending: joiningAsGuest } = useMutation({
        mutationKey: ["rooms", "guest"],
        mutationFn: async ({
            name,
            roomId,
            pb,
        }: {
            name: string;
            roomId: string;
            pb: TypedPocketBase;
        }) => await joinRoomAsGuest(name, pb, roomId, router),
        onSettled: async () => {
            setDialogOpen(false);
            router.invalidate();
        },
    });

    const [name, setName] = useState("");

    console.log(ctx.user, "the user from context in rooms page");

    return (
        <DrawerDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title="Join Room"
            triggerLabel="Join room"
        >
            {!userId && !joiningAsGuest ? (
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        joinAsGuest({ name: name, roomId, pb: ctx.pb });
                    }}
                    noValidate
                    className="group space-y-6"
                >
                    <div className="space-y-2">
                        <Label className="space-y-1 relative" htmlFor="name">
                            <span>Name</span>

                            <Input
                                required
                                className="invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-500 peer"
                                minLength={2}
                                id="name"
                                name="name"
                                placeholder="enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <span className="hidden text-right text-sm text-red-500 peer-[&:not(:placeholder-shown):not(:focus):invalid]:block">
                                Please enter a valid name
                            </span>
                        </Label>
                    </div>

                    <Button
                        type="submit"
                        className="group-invalid:pointer-events-none group-invalid:opacity-50"
                    >
                        Join as Guest
                    </Button>
                </form>
            ) : (
                <div className="space-y-2">
                    {ctx.user && ctx.user.name && (
                        <p className="text-xl font-mono">
                            Welcome back {ctx.user?.name}
                        </p>
                    )}

                    <Button
                        onClick={() =>
                            join({
                                userId: ctx.user?.id,
                                roomId: roomId,
                                pb: ctx.pb,
                            })
                        }
                    >
                        Join
                    </Button>
                </div>
            )}
            {joiningAsGuest && <>Loading...</>}
        </DrawerDialog>
    );
}

function RoomMembers({
    members,
    votes,
    activeStory,
}: {
    members: UsersResponse<UsersRecord>[];
    votes: VotesResponse<VotesRecord>[];
    activeStory: string;
}) {
    return (
        <div className="flex">
            {members &&
                members.map((member) => (
                    <Avatar
                        key={member.id}
                        className="cursor-default first:-ml-0 -ml-3"
                    >
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback
                            className={cn(
                                "",
                                utils.hasVoted(member.id, votes, activeStory)
                                    ? "bg-green-300"
                                    : ""
                            )}
                        >
                            {member.name?.slice(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                ))}
        </div>
    );
}

function ActiveStoryStatusMessage({
    notVoted,
}: {
    notVoted: { user: string; id: string }[];
}) {
    return (
        <p>
            {notVoted
                ? utils.getVoteStatusMessage(notVoted)
                : "Waiting for votes"}
        </p>
    );
}

function VoteButtonGrid({
    room,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    votes,
    handleAdd,
    userId,
}: {
    room: RoomsResponse<{
        activeStory: StoriesResponse<StoriesRecord>;
    }>;
    votes: VotesResponse<VotesRecord>[] | undefined;
    handleAdd: (vote: VotesVoteOptions, story: string) => void;
    userId: string;
}) {
    const isDisabled = (v: VotesVoteOptions) => {
        if (!votes || !room.expand?.activeStory.id) return;
        return (
            !room.activeStory ||
            room.expand?.activeStory.voted ||
            utils.getUserVote(userId, votes, room.expand?.activeStory.id)
                ?.vote === v
        );
    };

    return (
        <Card>
            <CardContent className="pt-6">
                <ul className="flex gap-4 justify-center mx-auto flex-wrap max-w-sm">
                    {Object.entries(VotesVoteOptions).map(([_k, v]) => (
                        <li key={v + _k}>
                            <Button
                                disabled={isDisabled(v)}
                                onClick={() => handleAdd(v, room.activeStory)}
                                className="text-3xl"
                                size="card"
                                variant={isDisabled(v) ? "outline" : "ghost"}
                            >
                                {v}
                            </Button>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
