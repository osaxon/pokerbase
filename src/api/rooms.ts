import {
    RoomsResponse,
    StoriesRecord,
    StoriesResponse,
    TypedPocketBase,
    UsersRecord,
    UsersResponse,
    VotesRecord,
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
        mutationFn: ({
            pb,
            storyId,
        }: {
            pb: TypedPocketBase;
            storyId: string;
        }) => setActiveStory(roomId, storyId, pb),
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

export const utils = {
    isJoined: (userId: string, room: RoomsResponse) =>
        room.members.includes(userId),
    isReadyForResults: (
        roomMembers: string[],
        votes: VotesResponse<VotesRecord>[]
    ) => {
        const voterIds = new Set(votes.map((v) => v.user));
        if (roomMembers.length !== voterIds.size) {
            return false;
        }

        for (const mem of roomMembers) {
            if (!voterIds.has(mem)) return false;
        }

        return true;
    },
    getNotVoted: (
        room: RoomsResponse<{
            members: UsersResponse<UsersRecord>[];
        }>,
        votes: VotesResponse<VotesRecord>[],
        activeStory: string
    ) => {
        if (!activeStory) return undefined;
        if (!room.expand?.members) throw new Error("no members");

        if (!votes) return;

        if (room.members.length === votes.length) return undefined;

        const notVoted = [];

        for (const user of room.expand.members) {
            console.log(votes.map((vote) => vote.id));
            console.log(user.id);
            if (
                !votes
                    .filter((v) => v.story === activeStory)
                    .map((vote) => vote.user)
                    .includes(user.id)
            ) {
                console.log("not in list");
                notVoted.push({ user: user.name, id: user.id });
            }
        }

        return notVoted;
    },
    getVoteStatusMessage: (notVoted: { user: string; id: string }[]) => {
        if (notVoted === undefined) return "Waiting for votes...";
        if (notVoted && notVoted.length >= 3)
            return `Still waiting for ${notVoted.length} votes`;
        if (notVoted && notVoted.length === 2)
            return `Waiting for ${notVoted[0].user} and
                        ${notVoted[1].user} to vote`;
        return `Waiting for ${notVoted[0].user} to vote`;
    },
    getUserVote: (
        userId: string,
        votes: VotesResponse<VotesRecord>[],
        activeStory: string
    ) => votes.find((v) => v.user === userId && v.story === activeStory),
    hasVoted: (
        userId: string,
        votes: VotesResponse<VotesRecord>[],
        activeStory: string
    ) =>
        votes.find((v) => v.user === userId && v.story === activeStory) !=
        undefined,
};
