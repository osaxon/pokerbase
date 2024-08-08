import { squadMetricsQuery, userMetricsQuery } from "@/api/metrics";
import {
    CollectionRecords,
    CollectionResponses,
    TypedPocketBase,
    UserMetricsResponse,
} from "@/types/pocketbase-types";
import { SquadMetricsResponse } from "../types/pocketbase-types";
import {
    useSuspenseQuery,
    UseSuspenseQueryOptions,
} from "@tanstack/react-query";
import { ClientResponseError } from "pocketbase";

export type Metric = keyof Pick<
    CollectionResponses,
    "squad_metrics" | "user_metrics"
>;

type Metrics<T = never> = {
    squad_metrics: SquadMetricsResponse<T>;
    user_metrics: UserMetricsResponse<T>;
};

export const useMetrics = <M extends keyof Metrics>(
    type: M,
    pb: TypedPocketBase,
    recordId: string
) => {
    let queryOptions;
    switch (type) {
        case "squad_metrics":
            queryOptions = squadMetricsQuery(pb, recordId);
            break;
        case "user_metrics":
            queryOptions = userMetricsQuery(pb, recordId);
            break;
        default:
            throw new Error("must provide a collection type");
    }
    return useSuspenseQuery(
        queryOptions as UseSuspenseQueryOptions<
            Metrics<CollectionRecords[M]>[M],
            ClientResponseError
        >
    );
};
