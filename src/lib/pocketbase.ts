import PocketBase from "pocketbase";
import { TypedPocketBase } from "@/types/pocketbase-types";

export const createTypedPB = () =>
    new PocketBase(import.meta.env.VITE_POCKET_BASE_URL) as TypedPocketBase;
