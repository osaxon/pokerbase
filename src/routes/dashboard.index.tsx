import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
    beforeLoad: ({ location, context }) => {
        if (!context.pb.authStore.isValid) {
            throw redirect({
                to: "/sign-in",
                search: {
                    redirect: location.href,
                },
            });
        }
    },
    component: DashboardComponent,
});

function DashboardComponent() {
    return <div>Dashboard Home</div>;
}
