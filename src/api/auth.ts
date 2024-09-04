import { TypedPocketBase } from "@/types/pocketbase-types";
import { useMutation } from "@tanstack/react-query";

type Providers = "github";

export async function OAuth(provider: Providers, pb: TypedPocketBase) {
    const authData = await pb.collection("users").authWithOAuth2({ provider });

    const { meta } = authData;

    if (meta?.isNew) {
        const formData = new FormData();

        const res = await fetch(meta.avatarUrl);

        if (res.ok) {
            const imgBlob = await res.blob();
            formData.append("avatar", imgBlob);
        }

        formData.append("name", meta.name);

        await pb.collection("users").update(authData.record.id, formData);
    }

    return authData;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useOAuth = () =>
    useMutation({
        mutationKey: ["auth", "signin"],
        mutationFn: async (vars: {
            provider: Providers;
            pb: TypedPocketBase;
        }) => {
            const d = await OAuth(vars.provider, vars.pb);
            return d;
        },
    });
