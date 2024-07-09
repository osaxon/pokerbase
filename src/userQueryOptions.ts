/* eslint-disable @typescript-eslint/no-unused-vars */
import { queryOptions } from "@tanstack/react-query";
import { pb } from "./lib/pocketbase";
import { TypedPocketBase } from "./types/pocketbase-types";

export const userRecordQueryOptions = (userId: string, pb: TypedPocketBase) =>
    queryOptions({
        queryKey: ["user", "record", userId],
        queryFn: async () => {
            console.log("hello");
            try {
                pb.authStore.isValid &&
                    (await pb.collection("users").authRefresh());
            } catch (_) {
                console.log("not logged in");
                pb.authStore.clear();
            }
            return await fetchUserData(userId);
        },
    });

const fetchUserData = async (userId: string) => {
    const user = await pb.collection("users").getOne(userId);
    const avatar = pb.files.getUrl(user, user.avatar);

    return {
        ...user,
        avatar,
    };
};
