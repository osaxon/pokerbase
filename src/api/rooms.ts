import {
    RoomsResponse,
    StoriesRecord,
    StoriesResponse,
    TypedPocketBase,
    UsersRecord,
    UsersResponse,
    VotesResponse,
} from "@/types/pocketbase-types";
import { queryOptions, useMutation } from "@tanstack/react-query";
import { createExtendedRoute } from "./utils";

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
        .getList<
            RoomsResponse<{ members: UsersResponse<UsersRecord>[] }>
        >(1, 5, {
            expand: "members",
            filter: pb.filter("status = {:status}", { status: "open" }),
        });

    return res;
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
    return res;
};

export const useSetActiveStory = (roomId: string) => {
    const { mutate: setActive, ...rest } = useMutation({
        mutationKey: ["rooms", "set-active-story", roomId],
        mutationFn: ({pb, storyId}:{pb: TypedPocketBase, storyId: string}) =>
            setActiveStory(roomId, storyId, pb),
    });
    return {
        setActive,
        ...rest,
    };
};

export const joinRoom = async (
    userId: string,
    pb: TypedPocketBase,
    roomId: string
) => {
    const url = createExtendedRoute("/api/ext/rooms/:room/join/:user", {
        user: userId,
        room: roomId,
    });
    return await pb.send(url, {
        method: "POST",
    });
};

export const setActiveStory = async (
    roomId: string,
    storyId: string,
    pb: TypedPocketBase
) => {
    await pb.collection("rooms").update(roomId, { activeStory: storyId });
};

export const isJoined = (userId: string, room: RoomsResponse) => {
    return room.members.includes(userId);
};
