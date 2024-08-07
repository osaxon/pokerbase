import { queryOptions } from "@tanstack/react-query";
import { TypedPocketBase } from "@/types/pocketbase-types";

export const squadMetricsQuery = (pb: TypedPocketBase, squad: string) =>
    queryOptions({
        queryKey: ["metrics", "squad", squad],
        queryFn: () => pb.collection("squad_metrics").getOne(squad),
    });

export const userMetricsQuery = (pb: TypedPocketBase, user: string) =>
    queryOptions({
        queryKey: ["metrics", "user", user],
        queryFn: () => pb.collection("user_metrics").getOne(user),
    });
