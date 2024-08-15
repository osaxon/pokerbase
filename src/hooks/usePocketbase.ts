import { useState, useMemo, useCallback, useEffect } from "react";
import { RecordAuthResponse } from "pocketbase";
import { UsersRecord, UsersResponse } from "@/types/pocketbase-types";
import { jwtDecode } from "jwt-decode";
import { useInterval } from "usehooks-ts";
import { createTypedPB } from "@/lib/pocketbase";

const fiveMinsInMs = 300000;
const twoMinsInMs = 120000;

export const usePocketbase = () => {
    const pb = useMemo(() => createTypedPB(), []);
    const [token, setToken] = useState(pb.authStore.token);

    useEffect(() => {
        const unsub = pb.authStore.onChange((token, model) => {
            console.log("[auth store change]", { token, model });
        });
        return () => {
            pb.authStore.clear();
            unsub();
        };
    }, []);

    const updateToken = useCallback(async () => {
        try {
            const response = await pb
                .collection("users")
                .authRefresh<RecordAuthResponse<UsersResponse<UsersRecord>>>();
            return response;
        } catch (error) {
            // Not authorized
            pb.authStore.clear();
            setToken("");
        }
    }, [pb]);

    const refreshSession = useCallback(async () => {
        if (!pb.authStore.isValid) return;
        const decoded: { exp: number } = jwtDecode(token);
        const tokenExpiration = decoded.exp;
        const expirationWithBuffer = (decoded.exp! + fiveMinsInMs) / 1000;
        if (tokenExpiration! < expirationWithBuffer) {
            console.log("refreshing token....");
            await updateToken();
        }
    }, [pb, token, updateToken]);

    useInterval(refreshSession, token ? twoMinsInMs : null);

    return {
        auth: {
            token,
            updateToken,
        },
        pb,
    };
};
