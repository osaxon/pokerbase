import { joinRoom, roomQuery, useSetActiveStory, utils } from "@/api/rooms";
import { useAddVote, useUpdateVote, votesQueryOptions } from "@/api/votes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
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
import {
    QueryClient,
    useMutation,
    useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/rooms/$id")({
    beforeLoad: async ({ context }) => {
        if (!context.pb.authStore.isValid) {
            throw redirect({
                to: "/sign-in",
                search: {
                    redirect: location.href,
                },
            });
        }
    },
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

    const { mutate: addVote } = useAddVote(userId, ctx.queryClient);
    const { mutate: updateVote } = useUpdateVote(userId, ctx.queryClient);

    const { setActive } = useSetActiveStory(room.id);
    const [stragglers, setStragglers] = useState<
        ReturnType<typeof utils.getNotVoted>
    >(utils.getNotVoted(room, votes, room.activeStory));

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
            toast.success("Vote updated", {
                cancel: {
                    label: "Close",
                    onClick: () => null,
                },
            });
        } else {
            addVote({
                pb: ctx.pb,
                score: vote,
                storyId: room.expand?.activeStory.id ?? "",
                userId: userId,
                roomId: room.id,
            });
            toast.success("Vote added");
        }
    };

    const realTimeVotes = async (
        pb: TypedPocketBase,
        queryClient: QueryClient,
        queryKey: string[]
    ) => {
        return await pb
            .collection("votes")
            .subscribe<VotesResponse<VotesRecord>>("*", (d) => {
                console.log("[REAL-TIME-CONNECTION][VOTES]", d.record);

                const { record } = d;

                const updatedVotes = [
                    ...votes.filter((v) => v.id !== record.id),
                    record,
                ];

                const isReady = utils.isReadyForResults(
                    room.members,
                    updatedVotes
                );

                const leftToVote = utils.getNotVoted(
                    room,
                    updatedVotes,
                    room.activeStory
                );
                setStragglers(leftToVote);

                setShowResults(isReady);

                queryClient.setQueryData<
                    unknown,
                    string[],
                    VotesResponse<VotesRecord>[]
                >(
                    queryKey,
                    (old) =>
                        old && [
                            ...old.filter((v) => v.id !== record.id),
                            { ...record },
                        ]
                );
            });
    };

    const realTimeRoom = async (
        pb: TypedPocketBase,
        queryClient: QueryClient,
        queryKey: string[]
    ) => {
        return await pb
            .collection("rooms")
            .subscribe<
                RoomsResponse<{ activeStory: StoriesResponse<StoriesRecord> }>
            >("*", (d) => {
                console.log("[REAL-TIME-CONNECTION][ROOMS]", d.record);

                const { record } = d;
                const newActiveStory = room.expand?.stories.find(
                    (s) => s.id === record.activeStory
                );

                if (!newActiveStory) throw new Error("error updating story");

                queryClient.setQueryData<
                    unknown,
                    string[],
                    RoomsResponse<{
                        activeStory: StoriesResponse<StoriesRecord>;
                    }>
                >(
                    queryKey,
                    (old) =>
                        old && {
                            ...old,
                            expand: {
                                ...old.expand,
                                activeStory: newActiveStory,
                            },
                        }
                );
            });
    };

    const unsub = async () => {
        await ctx.pb.collection("votes").unsubscribe("*");
        await ctx.pb.collection("rooms").unsubscribe("*");
    };

    useEffect(() => {
        realTimeVotes(ctx.pb, ctx.queryClient, ["votes", room.id]);
        realTimeRoom(ctx.pb, ctx.queryClient, ["rooms", room.id]);
        return () => {
            unsub();
        };
    }, []);

    if (!utils.isJoined(userId, room)) {
        return <JoinRoomDialog roomId={room.id} />;
    }

    if (room.squad !== ctx.pb.authStore.model?.squad) {
        return <>wrong squad</>;
    }

    return (
        <div className="max-w-5xl mx-auto min-h-screen space-y-8 p-10">
            <div className="space-y-4">
                <pre>{JSON.stringify({ story: room.activeStory })}</pre>
                <ul className="flex">
                    {votes && room.expand?.members && (
                        <RoomMembers
                            members={room.expand?.members}
                            votes={votes}
                            activeStory={room.expand?.activeStory.id}
                        />
                    )}
                </ul>
                {stragglers ? (
                    <ActiveStoryStatusMessage notVoted={stragglers} />
                ) : null}
                <Tabs defaultValue="vote">
                    <TabsList>
                        <TabsTrigger value="vote">Vote</TabsTrigger>
                        <TabsTrigger disabled={!showResults} value="results">
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
                        <div>
                            <h2 className="text-2xl font-semibold">
                                Reviewing
                            </h2>
                            <div className="flex items-center gap-4">
                                <p className="text-xl">
                                    {room.expand?.activeStory.title ?? ""}
                                </p>
                            </div>
                        </div>
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
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Up Next</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {room.expand?.stories.map((story) => (
                            <li
                                className="border p-2 rounded shadow-sm flex items-center justify-between"
                                key={story.id}
                            >
                                {story.title}
                                <Button
                                    onClick={() =>
                                        setActive({
                                            pb: ctx.pb,
                                            storyId: story.id,
                                        })
                                    }
                                    variant={
                                        story.voted ? "outline" : "default"
                                    }
                                >
                                    {!story.voted ? "Start" : "Results"}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">
                                        Story
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Score
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {room.expand?.stories
                                    .filter((s) => s.voted)
                                    .map((story) => (
                                        <TableRow key={story.id}>
                                            <TableCell className="font-medium w-full">
                                                {story.title}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge
                                                    variant="outline"
                                                    className="text-md"
                                                >
                                                    {story.points}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function JoinRoomDialog({ roomId }: { roomId: string }) {
    const ctx = Route.useRouteContext();
    const userId = ctx.pb.authStore.model?.id;
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
    });

    return (
        <Dialog defaultOpen={true}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Join Room</DialogTitle>
                    <DialogDescription>
                        {ctx.pb.authStore.model?.username}
                        <Button
                            onClick={() =>
                                join({
                                    userId: userId,
                                    pb: ctx.pb,
                                    roomId,
                                })
                            }
                        >
                            Join
                        </Button>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
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
    console.log(room.expand?.activeStory, "<---- active story in grid");

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
