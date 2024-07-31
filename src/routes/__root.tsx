import { ModeToggle } from "@/components/mode-toggle";
import SvgLogo from "@/components/svg-logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import UserAvatar from "@/components/UserAvatar";
import { TypedPocketBase } from "@/types/pocketbase-types";
import { ApplicationError } from "@/utils/error";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
    ErrorComponentProps,
    Link,
    Outlet,
    createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ServerCrash } from "lucide-react";
import { AuthModel } from "pocketbase";
import { Suspense } from "react";

export type MyRouterContext = {
    auth: {
        token: string;
        user: AuthModel;
    };
    queryClient: QueryClient;
    pb: TypedPocketBase;
};

export const Route = createRootRouteWithContext<MyRouterContext>()({
    pendingMs: 3000,
    component: RootComponent,
    beforeLoad: async ({ context }) => {
        try {
            await context.pb.health.check();
        } catch (error) {
            throw new ApplicationError("API health check failed");
        }
    },
    errorComponent: Error,
});

function Error(data: ErrorComponentProps) {
    return (
        <div className="flex justify-center items-center min-h-[100dvh]">
            <div className="flex flex-col items-center gap-2">
                <ServerCrash />
                <p className="text-lg border font-mono p-2 rounded bg-amber-400 text-amber-950">
                    {data.error.message}
                </p>
            </div>
        </div>
    );
}

function RootComponent() {
    const context = Route.useRouteContext();
    return (
        <>
            <div className="p-2 flex gap-2 text-lg">
                <div className="flex items-center justify-between w-full">
                    <nav className="flex items-center gap-6">
                        <Link
                            to="/"
                            activeProps={{
                                className: "font-bold underline",
                            }}
                        >
                            <SvgLogo />
                        </Link>
                    </nav>
                    <div className="flex items-center gap-2">
                        {context.pb.authStore.isValid ? (
                            <Suspense
                                fallback={
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                }
                            >
                                <UserAvatar />
                            </Suspense>
                        ) : (
                            <Button asChild>
                                <Link
                                    to="/sign-in"
                                    activeProps={{
                                        className: "font-bold underline",
                                    }}
                                >
                                    Sign In
                                </Link>
                            </Button>
                        )}
                        <ModeToggle />
                    </div>
                </div>
            </div>
            <hr />
            <Outlet />
            <Toaster />
            <ReactQueryDevtools position="right" />
            <TanStackRouterDevtools position="bottom-left" />
        </>
    );
}
