import { joinRoom, roomQuery } from "@/api/rooms";
import { useAddVote, useUpdateVote, votesQueryOptions } from "@/api/votes";
import { RoomMemberAvatar } from "@/components/RoomMemberCount";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    TypedPocketBase,
    VotesRecord,
    VotesResponse,
    VotesVoteOptions,
} from "@/types/pocketbase-types";
import {
    QueryClient,
    useMutation,
    useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/rooms/$id")({
    component: RoomComponent,
});

function RoomComponent() {
    const { id } = Route.useParams();
    const ctx = Route.useRouteContext();
    const { data: room } = useSuspenseQuery(roomQuery(id, ctx.pb));
    const { data: votes } = useSuspenseQuery(
        votesQueryOptions(ctx.pb, room.id)
    );

    const hasVoted = (userId: string) => {
        return votes.find((v) => v.user === userId) != undefined;
    };

    const isJoined = (userId: string) => {
        return room.members.includes(userId);
    };

    console.log(votes, "votes");

    const getUserVote = (userId: string) =>
        votes.find((v) => v.user === userId);

    const { mutate: addVote } = useAddVote(ctx.user?.id, ctx.queryClient);
    const { mutate: updateVote } = useUpdateVote(ctx.user?.id, ctx.queryClient);

    const handleAddOrUpdate = (vote: string) => {
        if (hasVoted(ctx.user?.id)) {
            const voteId = getUserVote(ctx.user?.id)?.id;
            if (!voteId) throw new Error("invalid vote id");
            console.log(voteId, "the vote id");
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

    const realTime = async (
        pb: TypedPocketBase,
        queryClient: QueryClient,
        queryKey: string[]
    ) => {
        return await pb
            .collection("votes")
            .subscribe<VotesResponse<VotesRecord>>("*", (d) => {
                console.log(d.record, "realtime");
                const { record } = d;
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

    const unsub = async () => await ctx.pb.collection("votes").unsubscribe("*");

    useEffect(() => {
        realTime(ctx.pb, ctx.queryClient, ["votes", room.id]);
        return () => {
            unsub();
        };
    }, []);

    if (!isJoined(ctx.user?.id)) {
        return <JoinRoomDialog roomId={room.id} />;
    }

    return (
        <div className="max-w-5xl mx-auto min-h-screen space-y-8 p-10">
            <div className="space-y-6">
                <ul className="flex gap-4 justify-center flex-wrap max-w-sm mx-auto">
                    {Object.entries(VotesVoteOptions).map(([_k, v]) => (
                        <li key={v + _k}>
                            <Button
                                onClick={() => handleAddOrUpdate(v)}
                                className="text-3xl"
                                size="card"
                                variant="outline"
                            >
                                {v}
                            </Button>
                        </li>
                    ))}
                </ul>
                <div>
                    <h2 className="text-2xl font-semibold">Reviewing</h2>
                    <p className="text-xl">
                        {room.expand?.activeStory?.title ?? ""}
                    </p>
                </div>
                <ul className="flex">
                    {votes &&
                        room.expand?.members.map((mem) => (
                            <li
                                className="first:-ml-0 -ml-3 flex flex-col items-center"
                                key={mem.id}
                            >
                                <RoomMemberAvatar
                                    voted={hasVoted(mem.id)}
                                    member={mem}
                                />
                                {votes.find((v) => v.user === mem.id)?.vote}
                            </li>
                        ))}
                </ul>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Up Next</h2>
                <ul className="space-y-2">
                    {room.expand?.stories.map((story) => (
                        <li
                            className="border p-2 rounded shadow-sm flex items-center justify-between"
                            key={story.id}
                        >
                            {story.title}
                            <Button variant="ghost">Start</Button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Estimated</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Story</TableHead>
                            <TableHead className="text-right">Score</TableHead>
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
