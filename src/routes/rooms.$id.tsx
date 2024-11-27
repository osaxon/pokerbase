/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    finaliseStory,
    joinRoom,
    roomQuery,
    setActiveStory,
    utils,
} from "@/api/rooms";
import { useAddVote, useUpdateVote, votesQueryOptions } from "@/api/votes";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { signUp } from "@/api/user";
import DrawerDialog from "@/components/DrawerDialog";
import { columns } from "@/components/tables/stories/columns";
import { StoriesTable } from "@/components/tables/stories/data.table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading";
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
} from "@/types/pocketbase-types";
import { LockClosedIcon, LockOpen1Icon } from "@radix-ui/react-icons";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
    createFileRoute,
    Link,
    redirect,
    useRouter,
} from "@tanstack/react-router";
import { RecordSubscription } from "pocketbase";
import { Suspense, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/rooms/$id")({
    beforeLoad: ({ context, params }) => {
        if (!context.pb.authStore.isValid) {
            throw redirect({
                to: "/rooms/$id/join",
                params: {
                    id: params.id,
                },
            });
        }
    },
    component: RoomComponent,
});

function RoomComponent() {
    const { id } = Route.useParams();
    const ctx = Route.useRouteContext();
    const userId = ctx.pb.authStore.record?.id ?? "";
    const { data: room, refetch: refetchRoom } = useSuspenseQuery(
        roomQuery(id, ctx.pb)
    );
    const { data: votes } = useSuspenseQuery(
        votesQueryOptions(ctx.pb, room.id)
    );
    const [showResults, setShowResults] = useState(
        utils.isReadyForResults(room.members, votes, room.activeStory)
    );
    const [nextStoryId, setNextStoryId] = useState(
        room.expand?.stories[1]?.id ?? ""
    );

    const [stragglers, setStragglers] = useState<
        ReturnType<typeof utils.getNotVoted>
    >(utils.getNotVoted(room, votes, room.activeStory));

    const [isJoined, setIsJoined] = useState(
        utils.isJoined(userId, room.members)
    );
    const { mutate: addVote } = useAddVote(userId, ctx.queryClient);
    const { mutate: updateVote } = useUpdateVote(userId, ctx.queryClient);

    const handleAddOrUpdate = (vote: number, story: string) => {
        console.log(vote);
        if (utils.hasVoted(userId, votes, story)) {
            console.log(vote);
            const voteId = utils.getUserVote(userId, votes, story)?.id;
            if (!voteId) throw new Error("invalid vote id");
            updateVote({
                voteId: voteId,
                pb: ctx.pb,
                score: vote,
                storyId: room.expand?.activeStory.id ?? "",
            });
        } else {
            console.log(vote);
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

        const isReady = utils.isReadyForResults(
            room.members,
            updatedVotes,
            room.activeStory
        );

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

        const prevStories = room?.stories;
        const prevMembers = room?.members;
        const newRoomMembers = d.record.members;
        const updatedStories = d.record.stories;

        console.log({ prev: prevStories, new: updatedStories });
        console.log({ prevMembers: prevMembers, new: newRoomMembers });
        refetchRoom();

        const isUserJoined = utils.isJoined(userId, newRoomMembers);

        setIsJoined(isUserJoined);
        ctx.queryClient.setQueryData<
            unknown,
            string[],
            RoomsResponse<RoomsRecord>
        >(
            ["rooms", room.id],
            (old) =>
                old && {
                    ...old,
                    members: newRoomMembers,
                    stories: updatedStories,
                    activeStory: d.record.activeStory,
                }
        );
    };

    useRealtime("votes", ctx.pb, votesUpdater);

    useRealtime("rooms", ctx.pb, roomsUpdater, "members");

    if (!isJoined) {
        return (
            <div className="flex flex-col gap-8 items-center justify-center min-h-screen">
                <p>You need to join to view the room</p>
                <JoinRoomDialog roomId={room.id} />
            </div>
        );
    }

    return (
        <Suspense fallback={<p>fallback</p>}>
            <div className="max-w-5xl mx-auto min-h-screen space-y-4 p-10">
                <div className="space-y-4">
                    <p className="text-2xl font-mono">
                        {room.expand?.activeStory?.title}
                    </p>
                    <p>{nextStoryId}</p>
                    <section className="grid grid-cols-1 md:grid-cols-4 md:gap-4 gap-y-4">
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
                            <TabsContent className="space-y-4" value="vote">
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
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>{room.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {votes && room.expand?.members && (
                                        <RoomMembers
                                            members={room.expand?.members}
                                            votes={votes}
                                            activeStory={
                                                room.expand?.activeStory?.id
                                            }
                                        />
                                    )}
                                    {stragglers ? (
                                        <ActiveStoryStatusMessage
                                            notVoted={stragglers}
                                        />
                                    ) : null}
                                </div>
                            </CardContent>
                            <CardFooter>
                                <div>
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
                                                            utils.getRoomUrl(
                                                                room.id
                                                            )
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
                                </div>
                            </CardFooter>
                        </Card>
                    </section>
                </div>
                <div className="flex gap-2">
                    <Button
                        onClick={() => finaliseStory(room.activeStory, ctx.pb)}
                    >
                        Finish
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() =>
                            setActiveStory(room.id, nextStoryId, ctx.pb)
                        }
                    >
                        Next
                    </Button>
                </div>

                {room.expand?.stories && (
                    <StoriesTable
                        columns={columns}
                        pb={ctx.pb}
                        roomId={room.id}
                        roomOwnerId={room.owner}
                        userId={userId}
                        queryClient={ctx.queryClient}
                        setNextStoryId={setNextStoryId}
                    />
                )}
            </div>
        </Suspense>
    );
}

function JoinRoomDialog({ roomId }: { roomId: string }) {
    const ctx = Route.useRouteContext();
    const router = useRouter();
    const userId = ctx.pb.authStore.model?.id;
    const [dialogOpen, setDialogOpen] = useState(true);
    const { mutate: join, isPending: isJoining } = useMutation({
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

    const { mutateAsync: signUpAsGuest, isPending: isSigningUp } = useMutation({
        mutationKey: ["user", userId],
        mutationFn: async (vars: { name: string; pb: TypedPocketBase }) =>
            await signUp(vars.pb, vars.name),
    });

    const [name, setName] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setName(e.target.value);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = await signUpAsGuest({ name, pb: ctx.pb });

        if (data.record) {
            ctx.user = { ...data.record };
        }
    };

    return (
        <DrawerDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            drawerCloseLabel="Close"
            title="Join Room"
            triggerLabel={
                isSigningUp || isJoining ? (
                    <div className="flex items-center gap-2">
                        <LoadingSpinner />
                        <p className="text-muted">Joining room...</p>
                    </div>
                ) : (
                    "Join"
                )
            }
        >
            {isSigningUp || isJoining ? (
                <div className="flex items-center gap-2">
                    <LoadingSpinner />
                    <p className="text-muted">Joining room...</p>
                </div>
            ) : !userId ? (
                <div className="flex flex-col gap-4">
                    <GuestForm
                        handleChange={handleChange}
                        handleSubmit={handleSubmit}
                        name={name}
                    />
                    <div>
                        <p className="text-muted">Already have an account?</p>
                        <Link
                            to="/sign-in"
                            search={{
                                redirect: router.buildLocation({
                                    to: "/rooms/$id",
                                    params: { id: roomId },
                                }).href,
                            }}
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    {ctx.user && ctx.user.name && (
                        <p className="text-xl font-mono">
                            Hey {ctx.user?.name}!
                        </p>
                    )}

                    <Button
                        className="w-full"
                        onClick={() =>
                            join({
                                userId: ctx.user?.id ?? "",
                                roomId: roomId,
                                pb: ctx.pb,
                            })
                        }
                    >
                        Join
                    </Button>
                </div>
            )}
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
        <p className="text-muted text-sm">
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
    handleAdd: (vote: number, story: string) => void;
    userId: string;
}) {
    const isDisabled = (v: number) => {
        if (!votes || !room.expand?.activeStory.id) return;
        return (
            !room.activeStory ||
            room.expand?.activeStory.voted ||
            utils.getUserVote(userId, votes, room.expand?.activeStory.id)
                ?.value === v
        );
    };

    const voteOpts = [0, 1, 2, 3, 5, 8];

    return (
        <Card>
            <CardContent className="pt-6">
                <ul className="flex gap-4 justify-center mx-auto flex-wrap max-w-sm">
                    {voteOpts.map((v, i) => (
                        <li key={v + i}>
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

// TODO move to separate file
type GuestFormProps = {
    name: string;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};
function GuestForm({ name, handleSubmit, handleChange }: GuestFormProps) {
    return (
        <form onSubmit={handleSubmit} noValidate className="group space-y-6">
            <div className="space-y-2">
                <Label className="space-y-1 relative" htmlFor="name">
                    <span>Name</span>

                    <Input
                        required
                        className="invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-500 peer"
                        minLength={2}
                        id="name"
                        name="name"
                        placeholder="Elvis Presley"
                        value={name}
                        onChange={handleChange}
                    />
                    <span className="hidden text-right text-sm text-red-500 peer-[&:not(:placeholder-shown):not(:focus):invalid]:block">
                        Please enter a valid name
                    </span>
                </Label>
            </div>

            <Button
                type="submit"
                className="w-full group-invalid:pointer-events-none group-invalid:opacity-50"
            >
                Join as Guest
            </Button>
        </form>
    );
}
