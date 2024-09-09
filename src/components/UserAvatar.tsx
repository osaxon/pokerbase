import { signOut } from "@/api/auth";
import { userQuery } from "@/api/user";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MyRouterContext } from "@/routes/__root";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";

export default function UserAvatar({ ctx }: { ctx: MyRouterContext }) {
    const { data, isError } = useSuspenseQuery(
        userQuery(ctx.pb.authStore.model?.id, ctx.pb)
    );
    const router = useRouter();

    if (!ctx.pb.authStore.isValid || data === "no user id") return null;
    if (isError) return <>Error</>;

    const { avatar, username, role } = data;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Avatar>
                    <AvatarImage src={avatar} />
                    <AvatarFallback className="bg-green-300/25">
                        {username.slice(0, 2)}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {role === "guest" ? (
                    <DropdownMenuItem>Updgrade</DropdownMenuItem>
                ) : null}
                <DropdownMenuItem asChild>
                    <Link to="/account">Account</Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link to="/rooms">Rooms</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Feedback</DropdownMenuItem>
                <DropdownMenuItem>
                    <Button
                        onClick={() => signOut(router, ctx.pb, ctx.queryClient)}
                        className="w-full"
                        size="sm"
                        variant="outline"
                    >
                        Sign Out
                    </Button>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
