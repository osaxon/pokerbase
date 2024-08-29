/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";
import { useMemo } from "react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    UniqueIdentifier,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading";
import { useRealtime } from "@/hooks/useRealtime";
import {
    StoriesRecord,
    StoriesResponse,
    TypedPocketBase,
} from "@/types/pocketbase-types";
import {
    QueryClient,
    useMutation,
    useSuspenseQuery,
} from "@tanstack/react-query";
import { SaveIcon, UndoIcon } from "lucide-react";
import { useState } from "react";
import { columns, DraggableRow } from "./columns";

interface DataTableProps {
    columns: typeof columns;
    roomId: string;
    roomOwnerId: string;
    userId: string;
    sortable?: boolean;
    pb: TypedPocketBase;
    queryClient: QueryClient;
}

async function saveListOrder(
    oldData: StoriesResponse<StoriesRecord>[],
    data: StoriesResponse<StoriesRecord>[],
    pb: TypedPocketBase
) {
    const promises: Promise<void>[] = [];
    data.forEach((row) => {
        const existingRow = oldData.find((story) => story.id === row.id);
        if (existingRow?.order !== row.order) {
            promises.push(
                pb.collection("stories").update(row.id, {
                    order: row.order,
                })
            );
        }
    });
    console.log(`Updating ${promises.length} stories`);
    return Promise.all(promises);
}

export function StoriesTable({
    columns,
    pb,
    roomId,
    roomOwnerId,
    userId,
    queryClient,
}: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        order: userId === roomOwnerId,
    });

    const { data, refetch, fetchStatus } = useSuspenseQuery({
        queryKey: ["stories", roomId],
        queryFn: async () =>
            pb
                .collection("stories")
                .getFullList<StoriesResponse<StoriesRecord>>({
                    filter: pb.filter("room = {:room}", { room: roomId }),
                }),
        select: (data) => data.sort((a, b) => a.order - b.order),
    });

    const [sortableData, setSortableData] = useState(data);

    const dataIds = useMemo<UniqueIdentifier[]>(
        () => sortableData.map((row) => row.id),
        [sortableData]
    );

    useRealtime("stories", pb, (d) => {
        const { record } = d;
        queryClient.setQueryData<
            unknown,
            string[],
            StoriesResponse<StoriesRecord>[]
        >(
            ["stories", roomId],
            (old) => old && [...old.filter((r) => r.id !== record.id), record]
        );
        const updatedData = queryClient.getQueryData<
            unknown,
            string[],
            StoriesResponse<StoriesRecord>[]
        >(["stories", roomId]);
        if (updatedData) {
            setSortableData(updatedData);
        }
    });

    const table = useReactTable({
        data: sortableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.id,
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,

        getFilteredRowModel: getFilteredRowModel(),

        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
    });

    const { mutate: saveOrderToDb, isPending } = useMutation({
        mutationKey: ["stories", roomId],
        mutationFn: async () => saveListOrder(data, sortableData, pb),
    });

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (active && over && active.id !== over.id) {
            setSortableData((data) => {
                const oldIndex = dataIds.indexOf(active.id);
                const newIndex = dataIds.indexOf(over.id);
                const newArray = arrayMove(data, oldIndex, newIndex);
                return newArray.map((item, index) => ({
                    ...item,
                    order: (+index + 1) * 10,
                }));
            });
        }
    }

    function resetOrder() {
        setSortableData(data);
    }

    const sensors = useSensors(
        useSensor(MouseSensor, {}),
        useSensor(TouchSensor, {}),
        useSensor(KeyboardSensor, {})
    );

    return (
        <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
        >
            <div className="space-y-2">
                {roomOwnerId === userId ? (
                    <div className="flex gap-2">
                        <Button
                            size="icon"
                            variant="ghost"
                            disabled={
                                isPending || arraysAreEqual(data, sortableData)
                            }
                            onClick={() => saveOrderToDb()}
                        >
                            {isPending ? <LoadingSpinner /> : <SaveIcon />}
                        </Button>
                        <Button
                            disabled={arraysAreEqual(data, sortableData)}
                            onClick={resetOrder}
                            variant="ghost"
                            size="icon"
                        >
                            <UndoIcon />
                        </Button>
                    </div>
                ) : null}

                <div className="rounded-sm border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column
                                                              .columnDef.header,
                                                          header.getContext()
                                                      )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            <SortableContext
                                items={dataIds}
                                strategy={verticalListSortingStrategy}
                            >
                                {table.getRowModel().rows?.length ? (
                                    table
                                        .getRowModel()
                                        .rows.map((row) => (
                                            <DraggableRow
                                                key={row.id}
                                                row={row}
                                            />
                                        ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </SortableContext>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </DndContext>
    );
}

function arraysAreEqual<T>(arr1: T[], arr2: T[]): boolean {
    // Check if the arrays have the same length
    if (arr1.length !== arr2.length) {
        return false;
    }

    // Compare elements at the same indexes
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    // If all elements match, return true
    return true;
}
