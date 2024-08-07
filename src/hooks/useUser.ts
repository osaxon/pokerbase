import { useSuspenseQuery } from "@tanstack/react-query";
import { userQuery } from "../api/user";
import { MyRouterContext } from "@/routes/__root";

export const useUser = (ctx: MyRouterContext) => {
    const { data } = useSuspenseQuery(
        userQuery(ctx.user?.id, ctx.pb, ctx.pb.authStore?.isValid)
    );
    return data;
};
