import { Schema } from "@/types/database";
import { useMutation } from "@tanstack/react-query";
import { TypedPocketBase } from "typed-pocketbase";

type Providers = "github";

export async function OAuth(provider: Providers, pb: TypedPocketBase<Schema>) {
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

export const useOAuth = () =>
    useMutation({
        mutationKey: ["auth", "signin"],
        mutationFn: async (vars: {
            provider: Providers;
            pb: TypedPocketBase<Schema>;
        }) => {
            const d = await OAuth(vars.provider, vars.pb);
            return d;
        },
    });
