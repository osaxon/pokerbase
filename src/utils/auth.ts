/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { redirect } from "@tanstack/react-router";
import { RecordAuthResponse } from "pocketbase";
import {
    TypedPocketBase,
    UsersRecord,
    UsersResponse,
} from "@/types/pocketbase-types";
import { MyRouter } from "@/App";
import { toast } from "sonner";
import { ParsedLocation } from "@tanstack/react-router";
import { MyRouterContext } from "@/routes/__root";

export const loginError = {
    type: "manual",
    message: "Invalid username or password!",
};

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const useLogin = (router: MyRouter, pb: TypedPocketBase) =>
    useMutation({
        mutationFn: async (
            formData: z.infer<typeof loginSchema>
        ): Promise<RecordAuthResponse<UsersResponse<UsersRecord>>> => {
            return pb
                .collection("users")
                .authWithPassword(formData.email, formData.password);
        },
        mutationKey: ["login"],
        onSuccess: (data) => {
            if (data.token) {
                toast.success("Logged in successfully");
                router.invalidate();
                router.navigate({
                    to: "/",
                });
            }
        },
        onError: (err) => {
            toast.error(err.message);
        },
    });

export const usePasswordReset = (pb: TypedPocketBase) => {
    const { mutate: pwReset, ...rest } = useMutation({
        mutationKey: ["pw-reset"],
        mutationFn: async (email: string) => {
            return await pb.collection("users").requestPasswordReset(email);
        },
    });
    return {
        pwReset,
        ...rest,
    };
};

export const protectedRoute = ({
    location,
    context,
}: {
    location: ParsedLocation;
    context: MyRouterContext;
}) => {
    if (!context.pb.authStore.isValid) {
        throw redirect({
            to: "/sign-in",
            search: {
                redirect: location.href,
            },
        });
    }
};
