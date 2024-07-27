import { joinRoom, roomQuery, useSetActiveStory, utils } from "@/api/rooms";
import { useAddVote, useUpdateVote, votesQueryOptions } from "@/api/votes";
import { RoomMemberAvatar } from "@/components/RoomMemberCount";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
import {
    RoomsResponse,
    StoriesRecord,
    StoriesResponse,
    TypedPocketBase,
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

export const Route = createFileRoute("/rooms/$id")({
    beforeLoad: async ({ context }) => {
        if (!context.token) {
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
    const [showResults, setShowResults] = useState(false);
    const { data: room } = useSuspenseQuery(roomQuery(id, ctx.pb));
    const { data: votes } = useSuspenseQuery(
        votesQueryOptions(ctx.pb, room.id)
    );

    const hasVoted = (userId: string) => {
        return votes.find((v) => v.user === userId) != undefined;
    };

    const getUserVote = (userId: string) =>
        votes.find((v) => v.user === userId);

    const { mutate: addVote } = useAddVote(ctx.user?.id, ctx.queryClient);
    const { mutate: updateVote } = useUpdateVote(ctx.user?.id, ctx.queryClient);
    const { setActive } = useSetActiveStory(room.id);

    const handleAddOrUpdate = (vote: string) => {
        if (hasVoted(ctx.user?.id)) {
            const voteId = getUserVote(ctx.user?.id)?.id;
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
                userId: ctx.user?.id,
                roomId: room.id,
            });
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

    useEffect(() => {
        const isReady = utils.isReadyForResults(room.members, votes);
        setShowResults(isReady);
    }, [votes]);

    if (!utils.isJoined(ctx.user?.id, room)) {
        return <JoinRoomDialog roomId={room.id} />;
    }

    if (room.squad !== ctx.user?.squad) {
        return <>wrong squad</>;
    }

    return (
        <div className="max-w-5xl mx-auto min-h-screen space-y-8 p-10">
            <div className="space-y-4">
                <Button onClick={() => ctx.updateToken()}>Update token</Button>
                <ul className="flex">
                    {votes &&
                        room.expand?.members &&
                        room.expand.members.map((mem) => (
                            <li
                                className="first:-ml-0 -ml-3 flex flex-col items-center"
                                key={mem.id}
                            >
                                <RoomMemberAvatar
                                    voted={hasVoted(mem.id)}
                                    member={mem}
                                />
                            </li>
                        ))}
                </ul>
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
                        <Card>
                            <CardContent className="pt-6">
                                <ul className="flex gap-4 justify-center mx-auto flex-wrap max-w-sm">
                                    {Object.entries(VotesVoteOptions).map(
                                        ([_k, v]) => (
                                            <li key={v + _k}>
                                                <Button
                                                    disabled={!room.activeStory}
                                                    onClick={() =>
                                                        handleAddOrUpdate(v)
                                                    }
                                                    className="text-3xl"
                                                    size="card"
                                                    variant="outline"
                                                >
                                                    {v}
                                                </Button>
                                            </li>
                                        )
                                    )}
                                </ul>
                            </CardContent>
                        </Card>

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
                                    variant="ghost"
                                >
                                    Start
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

    const { mutate: join } = useMutation({
        mutationKey: ["rooms", "join", ctx.user?.id],
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
                        {ctx.user?.username}
                        <Button
                            onClick={() =>
                                join({
                                    userId: ctx.user?.id,
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
