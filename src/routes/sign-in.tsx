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
import { loginError, useLogin, usePasswordReset } from "@/utils/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
    // beforeLoad: ({ context }) => {
    //     if (context.user) {
    //         throw redirect({
    //             to: `/dashboard/$userId`,
    //             params: {
    //                 userId: context.user?.id,
    //             },
    //         });
    //     }
    // },
}).update({
    component: SignInComponent,
});

function SignInComponent() {
    const router = useRouter();
    const { isValid } = Route.useRouteContext({
        select: ({ token, pb }) => ({ isValid: token, pb }),
    });
    const search = Route.useSearch();

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const pb = Route.useRouteContext({ select: ({ pb }) => pb });

    const { mutate: login, isError } = useLogin(router, pb);
    const { mutate: OAuth } = useOAuth();
    const { pwReset } = usePasswordReset(pb);

    const onSubmit = async (formData: z.infer<typeof loginSchema>) => {
        console.log(formData);
        login(formData);
        if (isError) {
            form.setError("password", loginError);
            form.setError("email", loginError);
        }
    };

    const OAuthLogin = async () => {
        toast.success("oauth login");
        const data = await OAuth({ provider: "github", pb });
        console.log(data);
    };

    useLayoutEffect(() => {
        if (isValid && search.redirect) {
            console.log(isValid);
            router.history.push(search.redirect);
        }
    }, [isValid, search.redirect]);

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
