import UserAvatar from "@/components/UserAvatar";
import SvgLogo from "@/components/svg-logo";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/stores/auth";
import { Schema } from "@/types/database";
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
import { TypedPocketBase } from "typed-pocketbase";

export type MyRouterContext = {
    auth: {
        token: string;
        user: AuthModel;
    };
    queryClient: QueryClient;
    pb: TypedPocketBase<Schema>;
};

export const Route = createRootRouteWithContext<MyRouterContext>()({
    pendingMs: 3000,
    component: RootComponent,
    errorComponent: Error,
});

function Error(data: ErrorComponentProps) {
    return <>{data.error.message}</>;
}

function RootComponent() {
    const context = Route.useRouteContext();
    const user = useAuthStore((state) => state);

    console.log(user, "zustand state");

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
                    <div>
                        {context.pb.authStore.isValid ? (
                            <div className="flex items-center gap-6 w-full">
                                <Button variant="outline">Dashboard</Button>

                                <Suspense fallback={<>...</>}>
                                    <UserAvatar />
                                </Suspense>
                            </div>
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
