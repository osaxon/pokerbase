import { useQuery, UseSuspenseQueryResult } from "@tanstack/react-query";
import { userQuery } from "../api/user";
import { MyRouterContext } from "@/routes/__root";
import { UsersRecord, UsersResponse } from "@/types/pocketbase-types";

export const useUser = (ctx: MyRouterContext) => {
    const { data } = useQuery(
        userQuery(ctx.pb.authStore.record?.id ?? "", ctx.pb)
    ) as UseSuspenseQueryResult<UsersResponse<UsersRecord>>;
    return data;
};
