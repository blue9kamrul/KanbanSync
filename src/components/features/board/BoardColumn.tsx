'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableTask from './SortableTask';
import type { Prisma } from '../../../generated/prisma/browser';
import { useState } from 'react';
import NewTaskModal from './NewTaskModal';
import { memo } from 'react';

type ColumnWithTasks = Prisma.ColumnGetPayload<{
    include: { tasks: true };
}>;

export default memo(function BoardColumn({ column }: { column: ColumnWithTasks }) {
    console.log("Rendering Column:", column.id);
    // Make the entire column a drop target
    const { setNodeRef } = useDroppable({
        id: column.id,
        data: {
            type: 'Column',
            column,
        },
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Calculate if the column is at or over its WIP limit
    const isAtLimit = column.wipLimit !== null && column.tasks.length >= column.wipLimit;
    const isOverLimit = column.wipLimit !== null && column.tasks.length > column.wipLimit;

    return (
        <div
            ref={setNodeRef}
            className={`w-80 shrink-0 rounded-xl p-4 flex flex-col gap-4 shadow-sm transition-colors
        ${isOverLimit ? 'bg-red-50 border-2 border-red-300' : 'bg-gray-200/80 border-2 border-transparent'}
      `}
        >
            <div className="flex justify-between items-center px-1">
                <h2 className={`font-semibold ${isOverLimit ? 'text-red-700' : 'text-gray-700'}`}>
                    {column.title}
                </h2>

                {/* WIP Display (e.g., 2/3 or just 2) */}
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${isOverLimit ? 'bg-red-200 text-red-800' : 'bg-gray-300 text-gray-700'}`}>
                    {column.wipLimit ? `${column.tasks.length} / ${column.wipLimit}` : column.tasks.length}
                </span>
            </div>

            {isOverLimit && (
                <div className="text-xs font-bold text-red-600 px-1 uppercase tracking-wider">
                    WIP Limit Exceeded
                </div>
            )}

            <SortableContext
                id={column.id}
                items={column.tasks.map(t => t.id)}
                strategy={verticalListSortingStrategy}
            >
                {/* min-h ensures the column always has a drop area, even when empty */}
                <div className="flex flex-col gap-3 min-h-[150px]">
                    {column.tasks.map((task) => (
                        <SortableTask key={task.id} task={task} boardId={column.boardId} />
                    ))}
                </div>
            </SortableContext>
            {/* The Add Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                disabled={isAtLimit}
                className="mt-2 text-gray-500 hover:text-gray-800 hover:bg-gray-300/50 p-2 rounded-md flex items-center gap-2 transition-colors font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
                <span>+</span> {isAtLimit ? 'WIP limit reached' : 'Add a card'}
            </button>

            {/* The Portal Modal */}
            <NewTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                boardId={column.boardId}
                columnId={column.id}
                columnTitle={column.title}
            />
        </div>
    );
})

