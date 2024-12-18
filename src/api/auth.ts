import { MyRouter } from "@/App";
import {
    TypedPocketBase,
    UsersRecord,
    UsersResponse,
} from "@/types/pocketbase-types";
import { QueryClient, useMutation } from "@tanstack/react-query";

type Providers = "github";

export async function OAuth(provider: Providers, pb: TypedPocketBase) {
    try {
        const authData = await pb
            .collection("users")
            .authWithOAuth2<UsersResponse<UsersRecord>>({ provider });

        const { meta } = authData;

        if (meta?.isNew) {
            const formData = new FormData();

            const res = await fetch(meta.avatarUrl);

            if (res.ok) {
                const imgBlob = await res.blob();
                formData.append("avatar", imgBlob);
            }

            formData.append("name", meta.name);

            await pb
                .collection("users")
                .update<
                    UsersResponse<UsersRecord>
                >(authData.record.id, formData);
        }

        return authData;
    } catch (error) {
        // TODO: handle sign in error
    }
}

export async function signOut(
    router: MyRouter,
    pb: TypedPocketBase,
    queryClient: QueryClient
) {
    pb.authStore.clear();
    queryClient.clear();
    await queryClient.cancelQueries();
    router.navigate({ to: "/" });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useOAuth = (router: MyRouter) =>
    useMutation({
        mutationKey: ["auth", "signin"],
        mutationFn: async (vars: {
            provider: Providers;
            pb: TypedPocketBase;
        }) => {
            return OAuth(vars.provider, vars.pb);
        },
        onSuccess: () => {
            if (!router.state.location.search.redirect) {
                router.navigate({ to: "/rooms" });
            }
        },
    });
