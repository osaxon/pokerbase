import UserAvatar from "@/components/UserAvatar";
import SvgLogo from "@/components/svg-logo";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import type { TypedPocketBase } from "@/types/pocketbase-types";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
    ErrorComponentProps,
    Link,
    Outlet,
    createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { AuthModel } from "pocketbase";
import { Suspense } from "react";

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient;
    token: string;
    user: AuthModel | undefined;
    pb: TypedPocketBase;
}>()({
    pendingMs: 3000,
    component: RootComponent,
    errorComponent: Error,
});

function Error(data: ErrorComponentProps) {
    console.log(data);
    return <>{data.error.message}</>;
}

function RootComponent() {
    const context = Route.useRouteContext();

    return (
        <>
            <div className="p-2 flex gap-2 text-lg">
                {/* Show a global spinner when the router is transitioning */}
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
                    <div>
                        {context.pb.authStore.isValid ? (
                            <div className="flex items-center gap-8 w-full">
                                <Suspense fallback={<>...</>}>
                                    <UserAvatar />
                                </Suspense>
                                <Button asChild>Rooms</Button>
                            </div>
                        ) : (
                            <Link
                                to="/sign-in"
                                activeProps={{
                                    className: "font-bold underline",
                                }}
                            >
                                Sign In
                            </Link>
                        )}
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
