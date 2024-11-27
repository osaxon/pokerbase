import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    RoomsStatusOptions,
    RoomsViewRecord,
    RoomsViewResponse,
} from "@/types/pocketbase-types";
import { Link } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ShareIcon } from "lucide-react";

export const columns: ColumnDef<RoomsViewResponse<RoomsViewRecord>>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="justify-start pl-0 hover:bg-transparent"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ getValue }) => {
            return <p className="font-mono text-lg">{getValue() as string}</p>;
        },
    },
    {
        accessorKey: "id",
        header: "URL",
        cell: ({ getValue }) => {
            const id = getValue() as string;
            return (
                <div className="flex items-center gap-2">
                    <Link className="text-lg" to="/rooms/$id" params={{ id }}>
                        /{id}
                    </Link>
                    <ShareIcon className="w-4 h-4" />
                </div>
            );
        },
    },
    {
        accessorKey: "stories",
        header: "#Stories",
    },
    {
        accessorKey: "members",
        header: "#Members",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row, getValue }) => {
            const status = getValue() as RoomsStatusOptions;
            return (
                <Badge
                    className="text-lg"
                    variant={
                        status === RoomsStatusOptions.closed
                            ? "outline"
                            : "default"
                    }
                >
                    {row.getValue("status")}
                </Badge>
            );
        },
    },
];
