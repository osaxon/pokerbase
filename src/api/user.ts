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

export const userQuery = (userId: string, pb: TypedPocketBase) =>
    queryOptions({
        queryKey: ["user", userId],
        queryFn: async () => {
            try {
                return await fetchUserById(userId, pb);
            } catch (error) {
                return error;
            }
        },
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
