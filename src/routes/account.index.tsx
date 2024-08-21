import { squadQuery, useSetSquad } from "@/api/squads";
import { UserWithSquad, userQuery } from "@/api/user";
import DrawerDialog from "@/components/DrawerDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Metric, useMetrics } from "@/hooks/useMetrics";
import { useRealtime } from "@/hooks/useRealtime";
import { useUser } from "@/hooks/useUser";
import { TypedPocketBase, UsersResponse } from "@/types/pocketbase-types";
import { UserSchemaWithSquad, userSchemaWithSquad } from "@/types/schemas";
import { protectedRoute } from "@/utils/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const Route = createFileRoute("/account/")({
    beforeLoad: protectedRoute,
    loader: async ({ context }) => {
        Promise.all([
            context.queryClient.ensureQueryData(
                userQuery(context.pb.authStore.model?.id, context.pb)
            ),
            context.queryClient.ensureQueryData(squadQuery(context.pb)),
        ]);
    },
    component: AccountComponent,
});

function AccountComponent() {
    const ctx = Route.useRouteContext();
    const user = useUser(ctx);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newSquad, setNewSquad] = useState("");
    const { data: squads } = useSuspenseQuery(squadQuery(ctx.pb));

    useRealtime("users", ctx.pb, (d) => {
        const { record } = d;
        if (!record) return;
        return ctx.queryClient.setQueryData<unknown, string[], UsersResponse>(
            ["users"],
            (old) => old && { ...record }
        );
    });

    const squadChangeCallback = () => {
        ctx.user = {
            ...ctx.user,
            squad: newSquad,
        };
        setDialogOpen(false);
    };

    const { mutate: setSquad } = useSetSquad(
        ctx.pb,
        ctx.queryClient,
        squadChangeCallback
    );

    return (
        <div className="max-w-5xl mx-auto py-10 px-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{user.name}'s Profile</CardTitle>
                    <CardDescription
                        onClick={() => toast.success("Copied to clipboard")}
                        className="cursor-pointer hover:underline"
                    >
                        ID: {user.id}
                    </CardDescription>
                </CardHeader>
                <CardContent className="@container">
                    <div className="grid grid-cols-1 @3xl:grid-cols-5 gap-4">
                        <Avatar className="w-24 h-24 mx-auto">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                                {user.username.slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>

                        <UserAccountForm data={user} />

                        <div className="p-6">
                            <p>Squad</p>
                            <p>{user.expand?.squad.name}</p>
                            <p>{user.squad}</p>
                            <div className="border">
                                <p>Router ctx model</p>
                                <p>{ctx.user?.squad}</p>
                            </div>
                            <DrawerDialog
                                open={dialogOpen}
                                onOpenChange={setDialogOpen}
                                title="Change squad"
                                triggerLabel="Change squad"
                            >
                                <div>
                                    <Select
                                        onValueChange={(value) =>
                                            setNewSquad(value)
                                        }
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select a squad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {squads.map((s) => (
                                                <SelectItem
                                                    key={s.id}
                                                    disabled={user.squad.includes(
                                                        s.id
                                                    )}
                                                    value={s.id}
                                                >
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        onClick={() =>
                                            setSquad({
                                                userId: ctx.user?.id,
                                                squadId: newSquad,
                                            })
                                        }
                                    >
                                        Submit
                                    </Button>
                                </div>
                            </DrawerDialog>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <MetricsCard
                metricType="user_metrics"
                pb={ctx.pb}
                recordId={user.id}
            />
            <MetricsCard
                metricType="squad_metrics"
                pb={ctx.pb}
                recordId={user.squad}
            />
        </div>
    );
}

const UserAccountForm = ({ data }: { data: UserWithSquad }) => {
    const form = useForm<UserSchemaWithSquad>({
        resolver: zodResolver(userSchemaWithSquad),
        defaultValues: {
            ...data,
            squad: {
                name: data.expand?.squad.name,
            },
        },
    });
    const [editMode, setEditMode] = useState(false);
    return (
        <div className="col-span-2">
            <Form {...form}>
                <form
                    className="space-y-4 w-full"
                    onSubmit={form.handleSubmit((data) =>
                        toast.success(
                            <pre>{JSON.stringify(data, null, 2)}</pre>
                        )
                    )}
                >
                    <div className="flex items-center justify-end space-x-2">
                        <Switch
                            checked={editMode}
                            onCheckedChange={() => setEditMode(!editMode)}
                            id="edit-mode"
                        />
                        <Label
                            className="text-sm text-muted-foreground"
                            htmlFor="edit-mode"
                        >
                            Edit
                        </Label>
                    </div>
                    <FormField
                        control={form.control}
                        name="email"
                        disabled={!editMode}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="username"
                        disabled={!editMode}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input placeholder="" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button disabled={!editMode}>Save</Button>
                </form>
            </Form>
        </div>
    );
};

const MetricsCard = ({
    metricType,
    pb,
    recordId,
}: {
    metricType: Metric;
    pb: TypedPocketBase;
    recordId: string;
}) => {
    const { data, error } = useMetrics(metricType, pb, recordId);
    return (
        <Card>
            <CardHeader>
                <CardTitle>Metrics</CardTitle>
            </CardHeader>
            <CardContent>
                {error ? (
                    <>Error</>
                ) : (
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                )}
            </CardContent>
        </Card>
    );
};
