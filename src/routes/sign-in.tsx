import { useOAuth } from "@/api/auth";
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
import { Separator } from "@/components/ui/separator";
import { useLogin, usePasswordReset } from "@/utils/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const validSearchParms = z.object({
    redirect: z.string().optional(),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const Route = createFileRoute("/sign-in")({
    validateSearch: (search) => validSearchParms.parse(search),
}).update({
    component: SignInComponent,
});

function SignInComponent() {
    const router = useRouter();
    const ctx = Route.useRouteContext();
    const search = Route.useSearch();

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const pb = Route.useRouteContext({ select: ({ pb }) => pb });

    const { mutateAsync: login } = useLogin(router, pb);

    const { mutateAsync: OAuth } = useOAuth(router);
    const { pwReset } = usePasswordReset(pb);

    const onSubmit = async (formData: z.infer<typeof loginSchema>) => {
        const user = await login(formData);
        if (user) {
            ctx.user = { ...user.record };
        }
    };

    const OAuthLogin = async () => {
        const data = await OAuth({ provider: "github", pb });
        ctx.user = { ...data.record };
    };

    useLayoutEffect(() => {
        if (ctx.pb.authStore.isValid && search.redirect) {
            router.history.push(search.redirect);
        }
    }, [search.redirect, ctx.pb.authStore.isValid, router.history]);

    return (
        <div className="mx-auto max-w-lg min-h-screen py-10 px-2">
            <Card>
                <CardHeader>
                    <CardTitle>Welcome back</CardTitle>
                    <CardDescription>Sign in to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6 flex flex-col w-full"
                        >
                            <FormField
                                control={form.control}
                                name="email"
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
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="********"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-1 flex flex-col items-end">
                                <Button
                                    variant="link"
                                    type="button"
                                    size="sm"
                                    className="text-muted-foreground"
                                    onClick={() =>
                                        pwReset("oliverrsaxon@gmail.com")
                                    }
                                >
                                    Forgot your password
                                </Button>
                                <Button className="w-full" type="submit">
                                    Sign In
                                </Button>
                                <Button
                                    onClick={async () => {
                                        pb.authStore.clear();
                                        router.navigate({ to: "/" });
                                    }}
                                    className="w-full"
                                    type="button"
                                >
                                    Sign out
                                </Button>
                            </div>
                        </form>
                    </Form>
                    <div>
                        <Separator className="my-8" />
                        <Button className="w-full" onClick={OAuthLogin}>
                            Sign in with GitHub
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
