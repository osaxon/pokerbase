import { roomsQuery, utils } from "@/api/rooms";
import { RoomMemberAvatar } from "@/components/RoomMemberCount";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    RoomsResponse,
    UsersRecord,
    UsersResponse,
} from "@/types/pocketbase-types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: Home,
});

function Home() {
    const ctx = Route.useRouteContext();
    const { data: rooms } = useSuspenseQuery(roomsQuery(ctx.pb));
    return (
        <div className="max-w-5xl mx-auto space-y-8 py-6 @container">
            <h1 className="text-4xl font-mono font-bold">Poker time</h1>
            <Button asChild>
                <Link to="/rooms/new">New Room</Link>
            </Button>
            <div className="grid @2xl:grid-cols-3 gap-4">
                {rooms.items.map((room) => (
                    <RoomCard key={room.id} room={room} userId={ctx.user?.id} />
                ))}
            </div>
        </div>
    );
}

export const RoomCard = ({
    userId,
    room,
}: {
    userId: string;
    room: RoomsResponse<{ members: UsersResponse<UsersRecord>[] }>;
}) => {
    const noStories = room.stories.length;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{room.name}</CardTitle>
                <CardDescription>{room.status}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!room.expand?.members.length && (
                    <p className="text-muted-foreground italic">
                        No members yet
                    </p>
                )}
                <ul className="flex">
                    {room.expand?.members.map((mem) => (
                        <RoomMemberAvatar key={mem.name} member={mem} />
                    ))}
                    {/* {room.members.length > 3 && (
                        <Avatar className="-ml-4 border">
                            <AvatarFallback className="text-muted-foreground">
                                +{room.members.length - 2}
                            </AvatarFallback>
                        </Avatar>
                    )} */}
                </ul>
                <p className="font-semibold">
                    {noStories} {noStories > 1 ? "stories" : "story"}
                </p>
            </CardContent>
            <CardFooter>
                <Button
                    asChild
                    variant={
                        utils.isJoined(userId, room) ? "outline" : "default"
                    }
                >
                    <Link to="/rooms/$id" params={{ id: room.id }}>
                        {utils.isJoined(userId, room) ? "Open" : "Join Now"}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
};
