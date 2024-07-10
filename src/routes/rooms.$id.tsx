import { roomQuery } from "@/api/rooms";
import { RoomMemberAvatar } from "@/components/RoomMemberCount";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    UsersRecord,
    UsersResponse,
    VotesVoteOptions,
} from "@/types/pocketbase-types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/rooms/$id")({
    component: RoomComponent,
});

function RoomComponent() {
    const { id } = Route.useParams();
    const ctx = Route.useRouteContext();
    const { data: room } = useSuspenseQuery(roomQuery(id, ctx.pb));

    const hasVoted = (mem: UsersResponse<UsersRecord>) => {
        return (
            room.expand?.votes_via_room.find((v) => v.user === mem.id) !=
            undefined
        );
    };

    return (
        <div className="max-w-5xl mx-auto min-h-screen space-y-8 p-10">
            <div className="space-y-6">
                <ul className="flex gap-4 justify-center flex-wrap max-w-sm mx-auto">
                    {Object.values(VotesVoteOptions).map((v) => (
                        <li>
                            <Button size="icon" variant="outline">
                                {v}
                            </Button>
                        </li>
                    ))}
                </ul>
                <div>
                    <h2 className="text-2xl font-semibold">Reviewing</h2>
                    <p className="text-xl">{room.expand?.activeStory.title}</p>
                </div>
                <ul className="flex">
                    {room.expand?.members.map((mem) => (
                        <RoomMemberAvatar voted={hasVoted(mem)} member={mem} />
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
                                <TableRow>
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
