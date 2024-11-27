import type { RecordSubscription } from "pocketbase";
import type {
    RoomsResponse,
    StoriesResponse,
    UsersResponse,
    VotesResponse,
    TypedPocketBase,
    CollectionRecords,
} from "@/types/pocketbase-types";
import { useEffect, useCallback } from "react";

type Responses<T = never> = {
    rooms: RoomsResponse<T>;
    stories: StoriesResponse<T>;
    users: UsersResponse<T>;
    votes: VotesResponse<T>;
};

export const useRealtime = <C extends keyof Responses>(
    collection: C,
    pb: TypedPocketBase,
    callback: (
        d: RecordSubscription<Responses<CollectionRecords[C]>[C]>
    ) => void,
    expand?: string
) => {
    const realTime = useCallback(async () => {
        return await pb
            .collection(collection)
            .subscribe<
                Responses<CollectionRecords[C]>[C]
            >("*", (d) => callback(d), { expand: expand });
    }, []);

    useEffect(() => {
        console.log("[REAL-TIME]" + collection);
        realTime();
        return () => {
            pb.collection(collection).unsubscribe("*");
        };
    }, [collection, pb, realTime]);
};
