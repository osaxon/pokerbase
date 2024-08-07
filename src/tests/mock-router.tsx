import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { createTypedPB } from "../lib/pocketbase";
import { routeTree } from "../routeTree.gen";

const queryClient = new QueryClient();
const pb = createTypedPB();

export const mockRouter = createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultPreloadDelay: 100,
    context: {
        queryClient,
        pb: pb,
        user: pb.authStore.model,
    },
});
