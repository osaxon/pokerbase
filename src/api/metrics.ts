/* eslint-disable @typescript-eslint/no-unused-vars */
import { queryOptions } from "@tanstack/react-query";
import { TypedPocketBase } from "@/types/pocketbase-types";
import { ClientResponseError } from "pocketbase";

export const squadMetricsQuery = (pb: TypedPocketBase, squad: string) =>
    queryOptions({
        queryKey: ["metrics", "squad", squad],
        queryFn: async () => {
            try {
                return await pb.collection("squad_metrics").getOne(squad);
            } catch (error) {
                if (error instanceof ClientResponseError) {
                    if (error.status === 404) {
                        return "Metrics data not available yet.";
                    }
                }
                return error;
            }
        },
        retry: false,
    });

export const userMetricsQuery = (pb: TypedPocketBase, user: string) =>
    queryOptions({
        queryKey: ["metrics", "user", user],
        queryFn: async () => {
            try {
                return await pb.collection("user_metrics").getOne(user);
            } catch (error) {
                if (error instanceof ClientResponseError) {
                    if (error.status === 404) {
                        return "Metrics data not available yet.";
                    }
                }
                return error;
            }
        },
        retry: false,
    });
