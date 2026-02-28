'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableTask from './SortableTask';
import { Prisma } from '../../../generated/prisma/client';

type ColumnWithTasks = Prisma.ColumnGetPayload<{
    include: { tasks: true };
}>;

export default function BoardColumn({ column }: { column: ColumnWithTasks }) {
    // Make the entire column a drop target
    const { setNodeRef } = useDroppable({
        id: column.id,
        data: {
            type: 'Column',
            column,
        },
    });

    return (
        <div
            ref={setNodeRef}
            className="w-80 shrink-0 bg-gray-200/80 rounded-xl p-4 flex flex-col gap-4 shadow-sm"
        >
            <div className="flex justify-between items-center px-1">
                <h2 className="font-semibold text-gray-700">{column.title}</h2>
                <span className="text-xs font-medium bg-gray-300 text-gray-700 px-2 py-1 rounded-full">
                    {column.tasks.length}
                </span>
            </div>

            <SortableContext
                id={column.id}
                items={column.tasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
            >
                {/* min-h ensures the column always has a drop area, even when empty */}
                <div className="flex flex-col gap-3 min-h-[150px]">
                    {column.tasks.map((task) => (
                        <SortableTask key={task.id} task={task} />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}