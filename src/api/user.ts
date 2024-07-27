import {
    SquadsRecord,
    SquadsResponse,
    TypedPocketBase,
    UsersRecord,
    UsersResponse,
} from "@/types/pocketbase-types";
import { queryOptions } from "@tanstack/react-query";

export type UserWithSquad = UsersResponse<
    UsersRecord & { squad: SquadsResponse<SquadsRecord> }
>;

export const userQuery = (
    userId: string,
    pb: TypedPocketBase,
    enabled: boolean
) =>
    queryOptions({
        queryKey: ["user", userId],
        queryFn: () => fetchUserById(userId, pb),
        enabled: enabled,
    });

const fetchUserById = async (userId: string, pb: TypedPocketBase) => {
    const user = await pb
        .collection("users")
        .getOne<UserWithSquad>(userId, { expand: "squad" });
    const avatar = pb.files.getUrl(user, user.avatar);
    return {
        ...user,
        avatar,
    };
};
