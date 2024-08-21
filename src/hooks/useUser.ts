import { useQuery, UseSuspenseQueryResult } from "@tanstack/react-query";
import { userQuery, UserWithSquad } from "../api/user";
import { MyRouterContext } from "@/routes/__root";

export const useUser = (ctx: MyRouterContext) => {
    const { data } = useQuery(
        userQuery(ctx.user?.id, ctx.pb)
    ) as UseSuspenseQueryResult<UserWithSquad>;
    return data;
};
