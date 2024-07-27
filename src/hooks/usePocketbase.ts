import { useState, useMemo, useCallback } from "react";
import PocketBase, { RecordAuthResponse } from "pocketbase";
import {
    TypedPocketBase,
    UsersRecord,
    UsersResponse,
} from "@/types/pocketbase-types";
import { jwtDecode } from "jwt-decode";
import { useInterval } from "usehooks-ts";
import ms from "ms";

const fiveMinutesInMs = ms("5 minutes");
const twoMinutesInMs = ms("2 minutes");

export const usePocketbase = () => {
    const pb = useMemo(
        () =>
            new PocketBase(
                import.meta.env.VITE_POCKET_BASE_URL
            ) as TypedPocketBase,
        []
    );
    const [token, setToken] = useState(pb.authStore.token);

    async function updateToken() {
        try {
            const response = await pb
                .collection("users")
                .authRefresh<RecordAuthResponse<UsersResponse<UsersRecord>>>();
            return response;
        } catch (error) {
            // Not authorized
            pb.authStore.clear();
            setToken("");
            // clearUser();
        }
    }

    const refreshSession = useCallback(async () => {
        if (!pb.authStore.isValid) return;
        const decoded: { exp: number } = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const expirationWithBuffer = (decoded.exp! + fiveMinutesInMs) / 1000;
        if (tokenExpiration! < expirationWithBuffer) {
            console.log("refreshing token....");
            await updateToken();
        }
    }, [pb, token]);

    useInterval(refreshSession, token ? twoMinutesInMs : null);

    return {
        auth: {
            token,
            updateToken,
        },
        pb,
    };
};
