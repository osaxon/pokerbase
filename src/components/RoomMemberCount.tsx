import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import { UsersRecord } from "@/types/pocketbase-types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function RoomMemberAvatar({
    member,
    voted = false,
}: {
    member: UsersRecord;
    voted?: boolean;
}) {
    return (
        <HoverCard>
            <HoverCardTrigger className="first:ml-0 -ml-3">
                <Avatar className="cursor-default">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback
                        className={cn(voted ? "bg-green-300/75" : "")}
                    >
                        {member.name?.slice(0, 2)}
                    </AvatarFallback>
                </Avatar>
            </HoverCardTrigger>
            <HoverCardContent>
                <div className="space-y-1 flex items-center gap-4">
                    <Avatar className=" border cursor-default">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="text-muted-foreground">
                            {member.name?.slice(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                    <h4 className="text-lg">{member.name}</h4>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
