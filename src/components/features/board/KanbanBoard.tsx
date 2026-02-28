'use client';

import { useOptimistic, startTransition } from 'react';
import { BoardWithColumnsAndTasks } from '../../../types/board';
import { moveTask } from '../../../actions/taskActions';
import { DndContext, DragEndEvent, closestCorners } from '@dnd-kit/core';
import SortableTask from './SortableTask';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskStatus } from '../../../types/board';

interface KanbanBoardProps {
    initialBoard: BoardWithColumnsAndTasks;
}

export default function KanbanBoard({ initialBoard }: KanbanBoardProps) {
    // Optimistic Hook
    // It takes the real data from the server, and a "reducer" to calculate the fake instant UI
    const [optimisticColumns, addOptimisticUpdate] = useOptimistic(
        initialBoard.columns,
        (state, update: { taskId: string; newColumnId: string; newOrder: number }) => {
            // Deep clone the state so we don't mutate the original
            const newState = structuredClone(state);

            let movedTask = null;

            // Remove task from old column
            for (const col of newState) {
                const taskIndex = col.tasks.findIndex(t => t.id === update.taskId);
                if (taskIndex > -1) {
                    [movedTask] = col.tasks.splice(taskIndex, 1);
                    break;
                }
            }

            if (!movedTask) return state;

            // Update task properties and push to new column
            movedTask.columnId = update.newColumnId;
            movedTask.order = update.newOrder;

            const targetCol = newState.find(c => c.id === update.newColumnId);
            if (targetCol) {
                targetCol.tasks.splice(update.newOrder, 0, movedTask);
            }

            return newState;
        }
    );

    // 2. The Drag End Handler
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const taskId = active.id as string;
        const newColumnId = over.data.current?.sortable?.containerId || over.id as string;
        const newOrder = over.data.current?.sortable?.index ?? 0;

        // We need the status string to match your Prisma enum
        const targetColumn = initialBoard.columns.find(c => c.id === newColumnId);
        let newStatus: TaskStatus = TaskStatus.TODO;
        if (targetColumn?.title === 'In Progress') newStatus = TaskStatus.IN_PROGRESS;
        if (targetColumn?.title === 'Done') newStatus = TaskStatus.DONE;

        // Instantly update UI, then fire the server action in the background
        startTransition(() => {
            // Instantly apply the fake visual update
            addOptimisticUpdate({ taskId, newColumnId, newOrder });
        });

        // Fire the server action you wrote
        const result = await moveTask(taskId, newColumnId, newOrder, newStatus, initialBoard.id);

        if (!result.success) {
            console.error("Server action failed, React will auto-revert the UI.");
            // In a real app, you might trigger a toast notification here
        }
    };

    return (
        <DndContext id="kanban-dnd" collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <div className="flex flex-1 gap-6 overflow-x-auto pb-4 items-start">
                {optimisticColumns.map((column) => (
                    <div
                        key={column.id}
                        className="w-80 shrink-0 bg-gray-200/80 rounded-xl p-4 flex flex-col gap-4 shadow-sm"
                    >
                        <div className="flex justify-between items-center px-1">
                            <h2 className="font-semibold text-gray-700">{column.title}</h2>
                            <span className="text-xs font-medium bg-gray-300 text-gray-700 px-2 py-1 rounded-full">
                                {column.tasks.length}
                            </span>
                        </div>

                        {/* dnd-kit context for the list of tasks */}
                        <SortableContext
                            id={column.id}
                            items={column.tasks.map(t => t.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="flex flex-col gap-3 min-h-[150px]">
                                {column.tasks.map((task) => (
                                    <SortableTask key={task.id} task={task} />
                                ))}
                            </div>
                        </SortableContext>
                    </div>
                ))}
            </div>
        </DndContext>
    );
}