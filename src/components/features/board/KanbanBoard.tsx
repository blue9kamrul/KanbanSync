'use client';

import { useOptimistic, startTransition } from 'react';
import { BoardWithColumnsAndTasks } from '../../../types/board';
import { moveTask } from '../../../actions/taskActions';
import { DndContext, DragEndEvent, closestCorners } from '@dnd-kit/core';

import BoardColumn from './BoardColumn';
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
        <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
            <div className="flex flex-1 gap-6 overflow-x-auto pb-4 items-start">
                {optimisticColumns.map((column) => (
                    <BoardColumn key={column.id} column={column} />
                ))}
            </div>
        </DndContext>
    );
}