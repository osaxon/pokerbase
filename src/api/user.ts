import {
    TypedPocketBase,
    UsersRecord,
    UsersResponse,
} from "@/types/pocketbase-types";
import { queryOptions } from "@tanstack/react-query";

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
            .getOne<UsersResponse<UsersRecord>>(userId);
        const avatar = pb.files.getURL(user, user.avatar);
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
        username: `${name.replace(" ", "_")}_${new Date().valueOf()}`,
        email: `${name.replace(" ", "_")}_${new Date().valueOf()}@guestaccount.com`,
        password: tempPw,
        passwordConfirm: tempPw,
        name: name,
    };
    console.log(guestData);
    const user = await pb
        .collection("users")
        .create<UsersResponse<UsersRecord>>(guestData);
    if (!user) throw new Error("failed to create user");

    const authData = await pb
        .collection("users")
        .authWithPassword<
            UsersResponse<UsersRecord>
        >(guestData.email, guestData.password);

    return authData;
};
