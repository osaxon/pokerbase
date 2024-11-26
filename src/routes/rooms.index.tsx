/* eslint-disable @typescript-eslint/no-unused-vars */
import { RoomExpanded, roomsViewQuery, utils } from "@/api/rooms";
import DrawerDialog from "@/components/DrawerDialog";
import { RoomMemberAvatar } from "@/components/RoomMemberCount";
import { DataTable } from "@/components/tables/data.table";
import { columns } from "@/components/tables/rooms/columns";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { protectedRoute } from "@/utils/auth";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/rooms/")({
    beforeLoad: protectedRoute,
    // loader: ({ context }) =>
    //     context.queryClient.ensureQueryData(roomsViewQuery(context.pb)),
    component: RoomsComponent,
});

export function RoomsComponent() {
    const ctx = Route.useRouteContext();
    const { data: view } = useSuspenseQuery(roomsViewQuery(ctx.pb));
    return (
        <main className="max-w-5xl mx-auto space-y-8 py-6 px-4 @container">
            <h1 className="text-4xl font-mono font-bold">Poker time</h1>
            <DrawerDialog triggerLabel="New Room" title="New Room">
                new room form
            </DrawerDialog>
            {/* TODO: fix view in pb admin */}
            <section>
                <DataTable columns={columns} data={view} filterColumn="name" />
            </section>
        </main>
    );
}

export const RoomCard = ({
    userId,
    room,
}: {
    userId: string;
    room: RoomExpanded;
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
                        utils.isJoined(userId, room.members)
                            ? "outline"
                            : "default"
                    }
                >
                    <Link to="/rooms/$id" params={{ id: room.id }}>
                        {utils.isJoined(userId, room.members)
                            ? "Open"
                            : "Join Now"}
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
};
