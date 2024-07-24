import { userQuery } from "@/api/user";
import { Route as rootRoot } from "@/routes/__root";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function UserAvatar() {
    const ctx = rootRoot.useRouteContext();
    const {
        data: { avatar, username },
        isError,
    } = useSuspenseQuery(userQuery(ctx.user?.id, ctx.pb));

    if (isError) return <>Error</>;

    console.log(ctx.user);

    return (
        <Avatar>
            <AvatarImage src={avatar} />
            <AvatarFallback className="bg-green-300/25">
                {username.slice(0, 2)}
            </AvatarFallback>
        </Avatar>
    );
}
