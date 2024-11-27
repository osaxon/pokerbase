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
import { ServerCrash } from "lucide-react";
import { AuthRecord } from "pocketbase";
import React, { Suspense } from "react";

export type MyRouterContext = {
    queryClient: QueryClient;
    pb: TypedPocketBase;
    user: AuthRecord;
};

const TanStackRouterDevtools =
    process.env.NODE_ENV === "production"
        ? () => null // Render nothing in production
        : React.lazy(() =>
              // Lazy load in development
              import("@tanstack/router-devtools").then((res) => ({
                  default: res.TanStackRouterDevtools,
                  // For Embedded Mode
                  // default: res.TanStackRouterDevtoolsPanel
              }))
          );

export const Route = createRootRouteWithContext<MyRouterContext>()({
    pendingMs: 3000,
    component: RootComponent,
    beforeLoad: ({ context }) => {
        if (!context.pb) {
            throw new ApplicationError("error with pb");
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
            <div className="px-4 py-2 flex gap-2 text-lg">
                <div className="flex items-center justify-between w-full px-2">
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
            <Suspense>
                <TanStackRouterDevtools />
            </Suspense>
        </>
    );
}
