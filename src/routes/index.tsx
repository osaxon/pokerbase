import { RoomDTO, roomsQuery } from "@/api/rooms";
import { RoomMemberAvatar } from "@/components/RoomMemberCount";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
            <div className="grid @2xl:grid-cols-3 gap-4">
                {[...rooms, ...rooms, ...rooms].map((room) => (
                    <RoomCard key={room.id} room={room} />
                ))}
            </div>
        </div>
    );
}

export const RoomCard = ({ room }: { room: RoomDTO }) => {
    const noStories = room.stories.length;
    return (
        <Card>
            <CardHeader>
                <CardTitle>{room.name}</CardTitle>
                <CardDescription>{room.status}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <ul className="flex">
                    {room.members.slice(0, 2).map((mem) => (
                        <RoomMemberAvatar key={mem.name} member={mem} />
                    ))}
                    {room.members.length > 2 && (
                        <Avatar className="-ml-4 border">
                            <AvatarFallback className="text-muted-foreground">
                                +{room.members.length - 2}
                            </AvatarFallback>
                        </Avatar>
                    )}
                </ul>
                <p className="font-semibold">
                    {noStories} {noStories > 1 ? "stories" : "story"}
                </p>
            </CardContent>
            <CardFooter>
                <Button asChild variant="outline">
                    <Link to="/rooms/$id" params={{ id: room.id }}>
                        Join
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
};
