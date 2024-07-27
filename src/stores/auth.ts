import { create } from "zustand";

type User = {
    id: string;
    name: string;
    avatar: string;
    squad: string;
};

type Action = {
    updateUser: (user: User) => void;
    updateSquad: (squad: User["squad"]) => void;
    clearUser: () => void;
};

const initState = {
    id: "",
    name: "",
    avatar: "",
    squad: "",
};

// Create your store, which includes both state and (optionally) actions
export const useAuthStore = create<User & Action>((set) => ({
    ...initState,
    updateSquad: (squad) => set(() => ({ squad })),
    updateUser: (user) => set(() => ({ ...user })),
    clearUser: () => set(() => ({ ...initState }))
}));
