import {
    RoomsResponse,
    RoomsViewRecord,
    RoomsViewResponse,
    StoriesRecord,
    StoriesResponse,
    TypedPocketBase,
    UsersRecord,
    UsersResponse,
    UsersRoleOptions,
    VotesRecord,
    VotesResponse,
} from "@/types/pocketbase-types";
import { queryOptions, useMutation } from "@tanstack/react-query";
import { createExtendedRoute } from "./utils";
import { UserWithSquad } from "./user";
import { MyRouter } from "@/App";

export const roomExists = (id: string, pb: TypedPocketBase) => {
    return queryOptions({
        queryKey: ["rooms", "list", id],
        queryFn: async () =>
            pb
                .collection("rooms")
                .getList(1, 1, { filter: pb.filter("id = {:id}", { id }) }),
    });
};

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

export const roomsViewQuery = (pb: TypedPocketBase) =>
    queryOptions({
        queryKey: ["rooms-view"],
        queryFn: () =>
            pb
                .collection("rooms_view")
                .getFullList<RoomsViewResponse<RoomsViewRecord>>(),
    });

export const fetchRooms = async (pb: TypedPocketBase) => {
    return pb
        .collection("rooms")
        .getList<
            RoomsResponse<{ members: UsersResponse<UsersRecord>[] }>
        >(1, 5, {
            expand: "members",
            filter: pb.filter("status = {:status}", { status: "open" }),
        });
};

export type RoomExpanded = RoomsResponse<{
    stories: StoriesResponse<StoriesRecord>[];
    votes_via_room: VotesResponse<{
        user: UsersResponse<UsersRecord>;
    }>[];
    members: UsersResponse<UsersRecord>[];
    activeStory: StoriesResponse<StoriesRecord>;
}>;

export const fetchSingleRoom = async (id: string, pb: TypedPocketBase) => {
    const res = await pb.collection("rooms").getOne<RoomExpanded>(id, {
        expand: "members, stories, activeStory, votes_via_room.user",
    });
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
) => {
    const url = createExtendedRoute("/api/ext/rooms/:room/join/:user", {
        user: userId,
        room: roomId,
    });
    await pb.send(url, {
        method: "POST",
    });
};

// TODO refactor this mess...
export const joinRoomAsGuest = async (
    name: string,
    pb: TypedPocketBase,
    roomId: string,
    router: MyRouter
) => {
    const tempPw = `${name}_${new Date().valueOf()}`;
    const guestData = {
        username: `${name}_${new Date().valueOf()}`,
        email: `${name}_${new Date().valueOf()}@guestaccount.com`,
        password: tempPw,
        passwordConfirm: tempPw,
        name: name,
        role: UsersRoleOptions.guest,
        verifed: true,
        "rooms+": roomId,
    };
    try {
        await pb
            .collection("users")
            .create<UsersResponse<UsersRecord>>(guestData);
    } catch (error) {
        console.log("error creating guest account");
        return error;
    }

    let userId;
    try {
        const user = await pb
            .collection("users")
            .authWithPassword(guestData.username, guestData.password);
        userId = user.record.id;
    } catch (error) {
        console.log("error logging in as guest");
        return error;
    }

    try {
        await pb.collection("rooms").update(roomId, {
            "members+": userId,
        });
    } catch (error) {
        console.log(error);
        return error;
    }
    router.invalidate();
    const loc = router.buildLocation({
        to: "/rooms/$id",
        params: { id: roomId },
    });
    router.commitLocation(loc);
};

export const setActiveStory = async (
    roomId: string,
    storyId: string,
    pb: TypedPocketBase
) => {
    await pb.collection("rooms").update(roomId, { activeStory: storyId });
};

export const utils = {
    isJoined: (userId: string, members: string[]) => members.includes(userId),
    isSquadMember: (user: UserWithSquad, room: RoomExpanded) =>
        room.squad === user.squad,
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
        if (!room.expand?.members) return undefined;

        if (!votes) return;

        if (
            room.members.length ===
            votes.filter((v) => v.story === activeStory).length
        )
            return undefined;

        const notVoted = [];
        for (const user of room.expand.members) {
            if (
                !votes
                    .filter((v) => v.story === activeStory)
                    .map((vote) => vote.user)
                    .includes(user.id)
            ) {
                notVoted.push({ user: user.name, id: user.id });
            }
        }

        return notVoted;
    },
    getVoteStatusMessage: (notVoted: { user: string; id: string }[]) => {
        if (!notVoted) return "Waiting for votes...";
        if (notVoted && notVoted.length >= 3)
            return `Still waiting for ${notVoted.length} votes`;
        if (notVoted.length === 0) return null;
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
    getRoomUrl: (id: string) => {
        return `${window.location.href.toString().slice(0, -3)}${id}`;
    },
};
