import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: Home,
});

function Home() {
    return (
        <div className="max-w-5xl mx-auto space-y-8 py-6 @container">
            <h1 className="text-4xl font-mono font-bold">Poker time</h1>
        </div>
    );
}
