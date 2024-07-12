import { TypedPocketBase } from "@/types/pocketbase-types";
import { queryOptions } from "@tanstack/react-query";

export const squadQuery = (pb: TypedPocketBase) =>
    queryOptions({
        queryKey: ["squads"],
        queryFn: () => fetchSquads(pb),
    });

const fetchSquads = async (pb: TypedPocketBase) => {
    return await pb.collection("squads").getFullList({ expand: "members" });
};
