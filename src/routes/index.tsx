import { Button } from "@/components/ui/button";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: Home,
});

function Home() {
    return (
        <main className="max-w-5xl mx-auto space-y-8 @container p-4">
            <section className="min-h-[70dvh] gap-8 flex flex-col items-center py-20">
                <header className="text-center space-y-2">
                    <h1 className="font-mono text-5xl">Scrum Poker</h1>
                    <p className="text-center font-mono">
                        Real time planning tool for story point estimation
                    </p>
                </header>

                <div className="flex gap-4">
                    <Button>Sign Up Now</Button>
                    <div className="flex flex-col">
                        <Button disabled variant="outline">
                            Quick Play
                        </Button>
                    </div>
                </div>
            </section>
            <section className="min-h-[70dvh] items-center py-20">
                <h2 className="font-mono">How it Works</h2>
                <p className="font-mono">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Pariatur nisi dolorem porro totam eveniet, fuga velit?
                    Libero maiores doloribus deserunt cum corporis, fugit
                    reiciendis a.
                </p>
            </section>
        </main>
    );
}
