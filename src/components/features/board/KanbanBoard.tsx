'use client';

import { useState } from 'react';
import { useOptimistic, startTransition } from 'react';
import { BoardWithColumnsAndTasks } from '../../../types/board';
import { moveTask } from '../../../actions/taskActions';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, closestCorners } from '@dnd-kit/core';

import BoardColumn from './BoardColumn';
import { TaskStatus } from '../../../types/board';

interface KanbanBoardProps {
    initialBoard: BoardWithColumnsAndTasks;
}
type TaskType = BoardWithColumnsAndTasks['columns'][number]['tasks'][number];

export default function KanbanBoard({ initialBoard }: KanbanBoardProps) {
    // Add a new "movedTask" property to the state, which we can use to render the dragging task in the overlay
    const [activeTask, setActiveTask] = useState<TaskType | null>(null);
    // Optimistic Hook
    // It takes the real data from the server, and a "reducer" to calculate the fake instant UI updates when we drag tasks around. It returns the "fake" state to render, and a function to trigger fake updates.   
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

    // 1. Handle Drag Start
    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const taskId = active.id as string;

        // Find the task data so we can render it in the overlay
        for (const column of optimisticColumns) {
            const task = column.tasks.find(t => t.id === taskId);
            if (task) {
                setActiveTask(task);
                break;
            }
        }
    };

    // The Drag End Handler
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

    // 3. Handle Drag Cancel (if user presses ESC)
    const handleDragCancel = () => {
        setActiveTask(null);
    };

    return (
        // <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        //     <div className="flex flex-1 gap-6 overflow-x-auto pb-4 items-start">
        //         {optimisticColumns.map((column) => (
        //             <BoardColumn key={column.id} column={column} />
        //         ))}
        //     </div>
        // </DndContext>
        // Add the new handlers to DndContext
        <DndContext
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
        >
            <div className="flex flex-1 gap-6 overflow-x-auto pb-4 items-start">
                {optimisticColumns.map((column) => (
                    <BoardColumn key={column.id} column={column} />
                ))}
            </div>

            {/* 4. The Magic Overlay */}
            <DragOverlay>
                {activeTask ? (
                    // We render a clone of the task here. 
                    // We wrap it in a div that mimics the SortableTask styling 
                    // but without the sorting hooks attached.
                    <div className="bg-white p-4 rounded-lg shadow-2xl border-2 border-blue-500 cursor-grabbing rotate-2 scale-105 transition-transform">
                        <h3 className="text-sm font-medium text-gray-900">{activeTask.title}</h3>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}