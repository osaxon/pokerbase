import { useState, useMemo, useCallback, useEffect } from "react";
import { RecordAuthResponse } from "pocketbase";
import { UsersRecord, UsersResponse } from "@/types/pocketbase-types";
import { jwtDecode } from "jwt-decode";
import { useInterval } from "usehooks-ts";
import ms from "ms";
import { createTypedPB } from "@/lib/pocketbase";

const fiveMinutesInMs = ms("5 minutes");
const twoMinutesInMs = ms("2 minutes");

export const usePocketbase = () => {
    const pb = useMemo(() => createTypedPB(), []);
    const [token, setToken] = useState(pb.authStore.token);

    useEffect(() => {
        const unsub = pb.authStore.onChange((token, model) => {
            console.log("[auth store change]", { token, model });
        });
        return () => unsub();
    }, []);

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
