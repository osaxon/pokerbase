import type { TypedPocketBase } from "@/types/pocketbase-types";
import { QueryClient, queryOptions, useMutation } from "@tanstack/react-query";
import { createExtendedRoute } from "./utils";

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
        onSettled: (_data, _error, vars) => {
            queryClient.invalidateQueries({ queryKey: ["user", vars.userId] });
            cb();
        },
    });
