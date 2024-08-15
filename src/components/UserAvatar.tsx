import { userQuery } from "@/api/user";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { MyRouterContext } from "@/routes/__root";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function UserAvatar({ ctx }: { ctx: MyRouterContext }) {
    const {
        data: { avatar, username },
        isError,
    } = useSuspenseQuery(
        userQuery(ctx.pb.authStore.model?.id, ctx.pb, ctx.pb.authStore.isValid)
    );

    if (!ctx.pb.authStore.isValid) return null;
    if (isError) return <>Error</>;

    return (
        <Popover>
            <PopoverTrigger>
                <Avatar>
                    <AvatarImage src={avatar} />
                    <AvatarFallback className="bg-green-300/25">
                        {username.slice(0, 2)}
                    </AvatarFallback>
                </Avatar>
            </PopoverTrigger>
            <PopoverContent>content</PopoverContent>
        </Popover>
    );
}
