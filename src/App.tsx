import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Link, RouterProvider, createRouter } from "@tanstack/react-router";
import { Suspense } from "react";
import { useTypedPocketBase } from "./hooks/useTypedPocketBase";
import "./index.css";
import { createTypedPB } from "./lib/pocketbase";
import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient();
const pb = createTypedPB();

const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    context: {
        auth: {
            token: "",
            user: pb.authStore.model,
        },
        queryClient,
        pb: pb,
    },
    defaultNotFoundComponent: () => {
        return (
            <div>
                Not found
                <Link to="/">Home</Link>
            </div>
        );
    },
});

export type MyRouter = typeof router;

declare module "@tanstack/react-router" {
    interface Register {
        router: MyRouter;
    }
}

export default function App() {
    const { pb, auth } = useTypedPocketBase();
    const user = pb.authStore.model;

    return (
        <QueryClientProvider client={queryClient}>
            <Suspense fallback={<>loading</>}>
                <RouterProvider
                    router={router}
                    context={{
                        auth: {
                            ...auth,
                            user,
                        },
                        queryClient,
                        pb,
                    }}
                />
            </Suspense>
        </QueryClientProvider>
    );
}
