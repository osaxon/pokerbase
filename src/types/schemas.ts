import { z } from "zod";
import { Collections } from "./pocketbase-types";

export const squadSchema = z.object({
    id: z.string().optional(),
    name: z.string(),
    members: z.array(z.string()).optional(),
});

export const baseSchema = z.object({
    id: z.string(),
    created: z.string().optional(),
    updated: z.string().optional(),
    collectionId: z.string().optional(),
    collectionName: z.nativeEnum(Collections).optional(),
});

export const userSchema = baseSchema.extend({
    email: z.string().email(),
    emailVisibility: z.boolean().optional(),
    username: z.string(),
    verified: z.boolean().optional(),
});

export const userSchemaWithSquad = userSchema.extend({
    squad: squadSchema,
});

export type UserSchema = z.infer<typeof userSchema>;
export type UserSchemaWithSquad = z.infer<typeof userSchemaWithSquad>;
