import { useSuspenseQuery } from "@tanstack/react-query";
import { jwtDecode } from "jwt-decode";
import ms from "ms";
import { RecordAuthResponse } from "pocketbase";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import { useInterval } from "usehooks-ts";
import { userQuery, UserWithSquad } from "../api/user";
import {
    TypedPocketBase,
    UsersRecord,
    UsersResponse,
} from "../types/pocketbase-types";

const fiveMinutesInMs = ms("5 minutes");
const twoMinutesInMs = ms("2 minutes");

type PocketBaseProps = {
    pb: TypedPocketBase;
    children: React.ReactNode;
};

const PocketBaseContext = createContext<UserWithSquad>({} as UserWithSquad);

export function PocketBaseProvider({ pb, children }: PocketBaseProps) {
    const { data } = useSuspenseQuery(
        userQuery(pb.authStore.model?.id, pb, pb.authStore?.isValid)
    );
    console.log(data, "data");
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

    return (
        <PocketBaseContext.Provider value={data}>
            {children}
        </PocketBaseContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(PocketBaseContext);
    console.log(context, "<<<<");

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider");

    return context;
};
