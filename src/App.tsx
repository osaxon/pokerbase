import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Link, RouterProvider, createRouter } from "@tanstack/react-router";
import { Suspense } from "react";
import { ThemeProvider } from "./components/theme-provider";
import { usePocketbase } from "./hooks/usePocketbase";
import "./index.css";
import { createTypedPB } from "./lib/pocketbase";
import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient();
const pb = createTypedPB();

const router = createRouter({
    routeTree,
    defaultPreload: "intent",
    defaultPreloadDelay: 100,
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
    const { pb, auth } = usePocketbase();
    const user = pb.authStore.model;

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
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
        </ThemeProvider>
    );
}
