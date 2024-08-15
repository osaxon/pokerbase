import { roomsQuery } from "@/api/rooms";
import { TypedPocketBase } from "@/types/pocketbase-types";
import { useSuspenseQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "../data.table";

export default function RoomsTable({ pb }: { pb: TypedPocketBase }) {
    const { data } = useSuspenseQuery(roomsQuery(pb));

    return (
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={data.items} />
        </div>
    );
}
