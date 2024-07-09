import {
    RoomsRecord,
    RoomsResponse,
    RoomsStatusOptions,
    TypedPocketBase,
    UsersRecord,
} from "@/types/pocketbase-types";
import { queryOptions } from "@tanstack/react-query";

export const roomsQuery = (pb: TypedPocketBase) =>
    queryOptions({
        queryKey: ["rooms", "all"],
        queryFn: () => fetchRooms(pb),
    });

export const fetchRooms = async (pb: TypedPocketBase) => {
    const res = await pb
        .collection("rooms")
        .getList<RoomsResponse<RoomsRecord>>(1, 5, {
            expand: "members",
            filter: pb.filter("status = {:status}", { status: "open" }),
        });
    const rooms: RoomDTO[] = [];

    for (const r of res.items) {
        rooms.push(toRoomDTO(r));
    }

    return rooms;
};
export type RoomDTO = {
    id: string;
    name: string;
    status: RoomsStatusOptions;
    members: UsersRecord[];
    stories: string[];
};

function toRoomDTO(room: RoomsResponse<RoomsRecord>): RoomDTO {
    const {
        expand: { members },
    } = room as {
        expand: { members: UsersRecord[] };
    };
    return {
        id: room.id,
        name: room.name,
        status: room.status,
        members,
        stories: room.stories,
    };
}
