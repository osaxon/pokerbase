import {
    TypedPocketBase,
    VotesRecord,
    VotesResponse,
} from "@/types/pocketbase-types";
import { QueryClient, useMutation, queryOptions } from "@tanstack/react-query";

export const votesQueryOptions = (pb: TypedPocketBase, roomId: string) =>
    queryOptions({
        queryKey: ["votes", roomId],
        queryFn: async () =>
            await pb
                .collection("votes")
                .getFullList<VotesResponse<VotesRecord>>({
                    filter: pb.filter("room = {:roomId}", { roomId }),
                }),
    });

export const useAddVote = (userId: string, queryClient: QueryClient) => {
    return useMutation({
        mutationKey: ["add-vote", userId],
        mutationFn: ({ storyId, score, userId, pb, roomId }: AddVote) =>
            addVote({ storyId, score, userId, pb, roomId }),
        onSettled: async (_data, _error, variables) => {
            return Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["votes", variables.storyId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["rooms", variables.roomId],
                }),
            ]);
        },
    });
};

export const useUpdateVote = (userId: string, queryClient: QueryClient) => {
    return useMutation({
        mutationKey: ["update-vote", userId],
        mutationFn: ({ voteId, score, pb, storyId }: UpdateVote) =>
            updateVote({ voteId, score, pb, storyId }),
        onSettled: async (_data, _error, variables) => {
            return await queryClient.invalidateQueries({
                queryKey: ["votes", variables.storyId],
            });
        },
    });
};

export type AddVote = {
    storyId: string;
    userId: string;
    score: string;
    pb: TypedPocketBase;
    roomId: string;
    voteId?: string;
};

export type UpdateVote = {
    pb: TypedPocketBase;
    storyId: string;
    voteId: string;
    score: string;
};

const addVote = async ({ storyId, userId, score, pb, roomId }: AddVote) => {
    console.log(score.toString(), "vote score");
    await pb.collection("votes").create({
        user: userId,
        story: storyId,
        vote: score,
        room: roomId,
    });
};

const updateVote = async ({ score, pb, voteId }: UpdateVote) => {
    console.log(voteId, "updated score");

    await pb.collection("votes").update(voteId!, {
        vote: score,
    });
};
