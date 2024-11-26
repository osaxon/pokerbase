import { joinRoom, roomExists } from "@/api/rooms";
import { signUp } from "@/api/user";
import DrawerDialog from "@/components/DrawerDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading";
import { TypedPocketBase } from "@/types/pocketbase-types";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
    createFileRoute,
    Link,
    notFound,
    redirect,
    useRouter,
} from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/rooms/$id/join")({
    beforeLoad: ({ context, params }) => {
        if (context.pb.authStore.isValid) {
            const usersRooms: string[] =
                context.pb.authStore.record?.rooms ?? [];
            console.log(context.pb.authStore.record);
            console.log(usersRooms);
            if (usersRooms.includes(params.id)) {
                throw redirect({
                    to: "/rooms/$id",
                    params: {
                        id: params.id,
                    },
                });
            }
        }
    },
    loader: async ({ context, params }) => {
        const room = await context.queryClient.ensureQueryData(
            roomExists(params.id, context.pb)
        );
        if (!room.items.length) {
            console.log("not found");
            throw notFound();
        }
    },
    notFoundComponent: RoomNotFoundError,
    component: JoinRoomComponent,
});

function JoinRoomComponent() {
    const { id } = Route.useParams();
    const ctx = Route.useRouteContext();
    const {
        data: { items },
    } = useSuspenseQuery(roomExists(id, ctx.pb));
    return (
        <div className="min-h-[70vh] mx-auto max-w-2xl flex flex-col items-center justify-center gap-4">
            <h1>{items[0].name}</h1>
            <p>Join your team in the room to begin</p>
            <JoinRoomDialog roomId={id} />
        </div>
    );
}

function RoomNotFoundError() {
    return (
        <div className="min-h-[70dvh] max-w-2xl mx-auto flex items-center justify-center flex-col">
            <h1>That room doesn't exist</h1>
            <p>Someone is having you on</p>
            <Link to="/">Go Home</Link>
        </div>
    );
}

function JoinRoomDialog({ roomId }: { roomId: string }) {
    const ctx = Route.useRouteContext();
    const router = useRouter();
    const userId = ctx.pb.authStore.model?.id;
    const [dialogOpen, setDialogOpen] = useState(true);
    const { mutate: join, isPending: isJoining } = useMutation({
        mutationKey: ["rooms", userId],
        mutationFn: async ({
            userId,
            roomId,
            pb,
        }: {
            userId: string;
            roomId: string;
            pb: TypedPocketBase;
        }) => await joinRoom(userId, pb, roomId),
        onSettled: () => {
            setDialogOpen(false);
            router.navigate({ to: "/rooms/$id", params: { id: roomId } });
        },
    });

    const { mutateAsync: signUpAsGuest, isPending: isSigningUp } = useMutation({
        mutationKey: ["user", userId],
        mutationFn: async (vars: { name: string; pb: TypedPocketBase }) =>
            await signUp(vars.pb, vars.name),
    });

    const [name, setName] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setName(e.target.value);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const record = await signUpAsGuest({ name, pb: ctx.pb });
        if (record) {
            ctx.user = { ...record.record };
        }
    };

    return (
        <DrawerDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            drawerCloseLabel="Close"
            title="Join Room"
            triggerLabel={
                isSigningUp || isJoining ? (
                    <div className="flex items-center gap-2">
                        <LoadingSpinner />
                        <p className="text-muted">Setting up your account...</p>
                    </div>
                ) : (
                    "Next"
                )
            }
        >
            {isSigningUp || isJoining ? (
                <div className="flex items-center gap-2">
                    <LoadingSpinner />
                    <p className="text-muted">Joining room...</p>
                </div>
            ) : !userId ? (
                <div className="flex flex-col gap-4">
                    <GuestForm
                        handleChange={handleChange}
                        handleSubmit={handleSubmit}
                        name={name}
                    />
                    <div>
                        <p>
                            Already have an account?{" "}
                            <span>
                                <Link
                                    className="hover:underline"
                                    to="/sign-in"
                                    search={{
                                        redirect: router.state.location.href,
                                    }}
                                >
                                    Sign In here
                                </Link>
                            </span>
                        </p>
                    </div>
                </div>
            ) : (
                <div className="space-y-2">
                    {ctx.user && ctx.user.name && (
                        <p className="text-xl font-mono">
                            Hey {ctx.user?.name}!
                        </p>
                    )}

                    <Button
                        className="w-full"
                        onClick={() =>
                            join({
                                userId: ctx.user?.id,
                                roomId: roomId,
                                pb: ctx.pb,
                            })
                        }
                    >
                        Join
                    </Button>
                </div>
            )}
        </DrawerDialog>
    );
}

// TODO move to separate file
type GuestFormProps = {
    name: string;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};
function GuestForm({ name, handleSubmit, handleChange }: GuestFormProps) {
    return (
        <form onSubmit={handleSubmit} noValidate className="group space-y-6">
            <div className="space-y-2">
                <Label className="space-y-1 relative" htmlFor="name">
                    <span>Name</span>

                    <Input
                        required
                        className="invalid:[&:not(:placeholder-shown):not(:focus)]:border-red-500 peer"
                        minLength={2}
                        id="name"
                        name="name"
                        placeholder="Elvis Presley"
                        value={name}
                        onChange={handleChange}
                    />
                    <span className="hidden text-right text-sm text-red-500 peer-[&:not(:placeholder-shown):not(:focus):invalid]:block">
                        Please enter a valid name
                    </span>
                </Label>
            </div>

            <Button
                type="submit"
                className="w-full group-invalid:pointer-events-none group-invalid:opacity-50"
            >
                Join as Guest
            </Button>
        </form>
    );
}
