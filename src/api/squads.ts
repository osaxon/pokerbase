import type { TypedPocketBase } from "@/types/pocketbase-types";
import { QueryClient, queryOptions, useMutation } from "@tanstack/react-query";
import { createExtendedRoute } from "./utils";
import { MyRouter } from "@/App";

export const squadQuery = (pb: TypedPocketBase) =>
    queryOptions({
        queryKey: ["squads"],
        queryFn: () => fetchSquads(pb),
    });

const fetchSquads = async (pb: TypedPocketBase) => {
    return await pb.collection("squads").getFullList({ expand: "members" });
};

export const useSetSquad = (
    pb: TypedPocketBase,
    router: MyRouter,
    queryClient: QueryClient,
    cb: () => void
) =>
    useMutation({
        mutationKey: ["squads"],
        mutationFn: ({
            userId,
            squadId,
        }: {
            userId: string;
            squadId: string;
        }) => {
            const url = createExtendedRoute(
                "/api/ext/squads/:squad/join/:user",
                {
                    user: userId,
                    squad: squadId,
                }
            );
            return pb.send(url, {
                method: "POST",
            });
        },
        onSettled: (data, error, vars) => {
            queryClient.invalidateQueries({ queryKey: ["user", vars.userId] });
            cb();
        },
    });
