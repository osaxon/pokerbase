import { Schema } from "@/types/database";
import { TypedPocketBase } from "typed-pocketbase";

export const createTypedPB = () =>
    new TypedPocketBase<Schema>(import.meta.env.VITE_POCKET_BASE_URL);
