/* eslint-disable @typescript-eslint/no-unused-vars */
import { CollectionRecords, TypedPocketBase } from "@/types/pocketbase-types";
import { RecordSubscription } from "pocketbase";
import {
    RoomsResponse,
    SquadsResponse,
    StoriesResponse,
    UsersResponse,
    VotesResponse,
} from "@/types/pocketbase-types";
import { useEffect } from "react";

type Responses<T = never> = {
    rooms: RoomsResponse<T>;
    squads: SquadsResponse<T>;
    stories: StoriesResponse<T>;
    users: UsersResponse<T>;
    votes: VotesResponse<T>;
};

export const useRealtime = <C extends keyof Responses>(
    collection: C,
    pb: TypedPocketBase,
    callback: (
        d: RecordSubscription<Responses<CollectionRecords[C]>[C]>
    ) => void
) => {
    const realTime = async () => {
        return await pb
            .collection(collection)
            .subscribe<Responses<CollectionRecords[C]>[C]>("*", callback);
    };

    useEffect(() => {
        realTime();
        return () => {
            pb.collection(collection).unsubscribe("*");
        };
    }, []);
};
