import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Link, RouterProvider, createRouter } from "@tanstack/react-router";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";
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
    defaultPreloadStaleTime: 0,
    context: {
        queryClient,
        pb: pb,
        user: pb.authStore.model,
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
    const { pb } = usePocketbase();
    const user = pb.authStore.record;

    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <QueryClientProvider client={queryClient}>
                <RouterProvider
                    router={router}
                    context={{
                        queryClient,
                        pb,
                        user,
                    }}
                />
                <Toaster position="top-center" />
                <ReactQueryDevtools position="right" />
            </QueryClientProvider>
        </ThemeProvider>
    );
}
