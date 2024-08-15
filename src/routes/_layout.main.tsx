import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/main")({
    component: () => (
        <>
            <p>layout</p>
            <Outlet />
        </>
    ),
});
