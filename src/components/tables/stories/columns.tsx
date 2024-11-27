import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
    RoomsStatusOptions,
    StoriesRecord,
    StoriesResponse,
} from "@/types/pocketbase-types";
import { useSortable } from "@dnd-kit/sortable";
import { ColumnDef, flexRender, Row } from "@tanstack/react-table";
import { ArrowUpDown, GripVertical, Trash2 } from "lucide-react";
import { CSSProperties } from "react";

export const RowDragHandleCell = ({
    rowId,
    disabled,
}: {
    rowId: string;
    disabled?: boolean;
}) => {
    const { attributes, listeners } = useSortable({
        id: rowId,
    });
    return (
        // Alternatively, you could set these attributes on the rows themselves
        <Button
            size="icon"
            variant="ghost"
            {...attributes}
            {...listeners}
            disabled={disabled}
            className="cursor-grab"
        >
            <GripVertical className="text-muted" />
        </Button>
    );
};

export function DraggableRow({
    row,
}: {
    row: Row<StoriesResponse<StoriesRecord>>;
}) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
        id: row.original.id,
    });

    const style: CSSProperties = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined, //let dnd-kit do its thing
        transition: transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 1 : 0,
        position: "relative",
    };

    return (
        <TableRow
            style={style}
            ref={setNodeRef}
            key={row.id}
            data-state={row.getIsSelected() && "selected"}
        >
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export const columns: ColumnDef<StoriesResponse<StoriesRecord>>[] = [
    {
        accessorKey: "order",
        header: "Order",
        cell: ({ row, getValue }) => {
            return (
                <div className="flex items-center">
                    <RowDragHandleCell rowId={row.id} />
                    <span>{getValue() as string}</span>
                </div>
            );
        },
        size: 60,
    },
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "title",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === "asc")
                    }
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: "points",
        header: "Points",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row, getValue }) => {
            const status = getValue() as RoomsStatusOptions;
            return (
                <Badge
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
    {
        id: "delete-button",
        header: undefined,
        cell: ({ row }) => (
            <Button
                onClick={() => console.log(row)}
                size="icon"
                variant="ghost"
            >
                <Trash2 />
            </Button>
        ),
    },
];
