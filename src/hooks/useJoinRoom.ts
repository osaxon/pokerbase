/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMutation } from "@tanstack/react-query";
import { joinRoomAsGuest, joinRoom } from "@/api/rooms";
import { TypedPocketBase } from "../types/pocketbase-types";
import { z } from "zod";

export type JoinRoomProps = {
    pb: TypedPocketBase;
    roomId: string;
    method: "guest" | "user";
};
