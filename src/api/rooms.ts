import {
    RoomsRecord,
    RoomsResponse,
    RoomsStatusOptions,
    StoriesRecord,
    StoriesResponse,
    TypedPocketBase,
    UsersRecord,
    UsersResponse,
    VotesRecord,
    VotesResponse,
} from "@/types/pocketbase-types";
import { queryOptions } from "@tanstack/react-query";

export const roomQuery = (id: string, pb: TypedPocketBase) =>
    queryOptions({
        queryKey: ["rooms", id],
        queryFn: () => fetchSingleRoom(id, pb),
    });

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

export const fetchSingleRoom = async (id: string, pb: TypedPocketBase) => {
    const res = await pb.collection("rooms").getOne<
        RoomsResponse<{
            stories: StoriesResponse<StoriesRecord>[];
            votes_via_room: VotesResponse<{
                user: UsersResponse<UsersRecord>;
            }>[];
            members: UsersResponse<UsersRecord>[];
            activeStory: StoriesResponse<StoriesRecord>;
        }>
    >(id, { expand: "members, stories, activeStory, votes_via_room.user" });
    console.log(res, "res....");
    return res;
};

export type RoomWithVotesDTO = RoomDTO & {
    votes: VotesRecord[];
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
