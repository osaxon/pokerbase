import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/rooms/$id")({
    component: RoomComponent,
});

function RoomComponent() {
    const { id } = Route.useParams();
    return <div>room {id}</div>;
}
