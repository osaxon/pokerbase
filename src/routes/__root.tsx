import { ModeToggle } from "@/components/mode-toggle";
import SvgLogo from "@/components/svg-logo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import UserAvatar from "@/components/UserAvatar";
import { TypedPocketBase } from "@/types/pocketbase-types";
import { ApplicationError } from "@/utils/error";
import { QueryClient } from "@tanstack/react-query";
import {
    ErrorComponentProps,
    Link,
    NotFoundError,
    Outlet,
    createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ServerCrash } from "lucide-react";
import { AuthModel } from "pocketbase";
import { Suspense } from "react";

export type MyRouterContext = {
    queryClient: QueryClient;
    pb: TypedPocketBase;
    user: AuthModel;
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
    notFoundComponent: NotFound,
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

function NotFound(data: NotFoundError) {
    return (
        <div className="flex justify-center items-center min-h-[100dvh]">
            <div className="flex flex-col items-center gap-2">
                <p className="text-lg border font-mono p-2 rounded bg-blue-400 text-amber-950">
                    {data.data} not found
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
                        <Link to="/" className="flex items-center">
                            <SvgLogo />
                            <p className="font-mono tracking-tighter font-bold">
                                Scrum Poker
                            </p>
                        </Link>
                    </nav>
                    <div className="flex items-center gap-2">
                        {context.pb.authStore.isValid ? (
                            <Suspense
                                fallback={
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                }
                            >
                                <UserAvatar ctx={context} />
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
            <TanStackRouterDevtools position="bottom-left" />
        </>
    );
}
