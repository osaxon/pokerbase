import { squadQuery } from "@/api/squads";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createExtendedRoute } from "@/utils/modifyApiUrl";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const newRoomSchema = z.object({
    name: z.string(),
    squad: z.string(),
    stories: z.array(z.object({ title: z.string() })),
});

export const Route = createFileRoute("/rooms/new")({
    component: NewRoomComponent,
});

function NewRoomComponent() {
    const form = useForm<z.infer<typeof newRoomSchema>>({
        resolver: zodResolver(newRoomSchema),
        defaultValues: {
            name: "",
            stories: [{ title: "" }],
        },
    });
    const { fields, append } = useFieldArray({
        control: form.control,
        name: "stories",
    });

    const ctx = Route.useRouteContext();
    const { data } = useSuspenseQuery(squadQuery(ctx.pb));

    const { mutate, data: newRoom } = useMutation({
        mutationKey: ["rooms", "new"],
        mutationFn: async (data: z.infer<typeof newRoomSchema>) => {
            const url = createExtendedRoute("/api/ext/rooms");
            return await ctx.pb.send(url, {
                method: "POST",
                body: JSON.stringify(data),
            });
        },
        // onSuccess: () => {
        //     r.navigate({ to: "/" });
        // },
        onError: (error) => toast.error(error?.message),
    });

    const onSubmit = async (data: z.infer<typeof newRoomSchema>) => {
        mutate(data);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <h1>Create New Room</h1>
            {!newRoom && (
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6 w-full md:w-2/3"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="squad"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Squad</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a squad" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {data.map((squad) => (
                                                <SelectItem
                                                    key={squad.id}
                                                    value={squad.id}
                                                >
                                                    {squad.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="space-y-1">
                            <div className="space-y-2">
                                {fields.map((f, index) => (
                                    <FormField
                                        key={`${f.id}-${index}`}
                                        control={form.control}
                                        name={`stories.${index}.title`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Story {index + 1}
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder=""
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>

                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                    e.preventDefault();
                                    append({ title: "" });
                                }}
                            >
                                Add another +
                            </Button>
                        </div>

                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
            )}
            {newRoom && (
                <Dialog defaultOpen={true}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Room Created</DialogTitle>
                            <DialogDescription>
                                <div className="flex items-center justify-between py-6">
                                    <Button
                                        onClick={() =>
                                            toast.success(
                                                "copied to clipboard!"
                                            )
                                        }
                                        variant="outline"
                                    >
                                        {window.location.href
                                            .toString()
                                            .slice(0, -3)}
                                        {newRoom.id}
                                    </Button>

                                    <div className="flex items-center gap-1">
                                        <Button>
                                            <Link
                                                to="/rooms/$id"
                                                params={{ id: newRoom.id }}
                                            >
                                                Go to Room
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
