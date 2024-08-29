import {
    SquadsRecord,
    SquadsResponse,
    TypedPocketBase,
    UsersRecord,
    UsersResponse,
    UsersRoleOptions,
} from "@/types/pocketbase-types";
import { queryOptions } from "@tanstack/react-query";

export type UserWithSquad = UsersResponse<
    UsersRecord & { squad: SquadsResponse<SquadsRecord> }
>;

export const userQuery = (userId: string, pb: TypedPocketBase) =>
    queryOptions({
        queryKey: ["user", userId],
        queryFn: async () => {
            return fetchUserById(userId, pb);
        },
        enabled: userId !== null,
    });

const fetchUserById = async (userId: string, pb: TypedPocketBase) => {
    try {
        const user = await pb
            .collection("users")
            .getOne<UserWithSquad>(userId, { expand: "squad" });
        const avatar = pb.files.getUrl(user, user.avatar);
        return {
            ...user,
            avatar,
        };
    } catch (error) {
        return "no user id";
    }
};

export const signUp = async (pb: TypedPocketBase, name: string) => {
    const tempPw = `${name}_${new Date().valueOf()}`;

    const guestData = {
        username: `${name}_${new Date().valueOf()}`,
        email: `${name}_${new Date().valueOf()}@guestaccount.com`,
        password: tempPw,
        passwordConfirm: tempPw,
        name: name,
        role: UsersRoleOptions.guest,
        verifed: true,
    };
    const user = await pb
        .collection("users")
        .create<UsersResponse<UsersRecord>>(guestData);
    if (!user) throw new Error("failed to create user");

    return pb
        .collection("users")
        .authWithPassword(guestData.username, guestData.password);
};
