import type { RecordSubscription } from "pocketbase";
import type {
    RoomsResponse,
    SquadsResponse,
    StoriesResponse,
    UsersResponse,
    VotesResponse,
    TypedPocketBase,
    CollectionRecords,
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
            .subscribe<
                Responses<CollectionRecords[C]>[C]
            >("*", (d) => callback(d));
    };

    useEffect(() => {
        realTime();
        return () => {
            pb.collection(collection).unsubscribe("*");
        };
    }, []);
};
