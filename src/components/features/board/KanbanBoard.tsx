'use client';

import { useMemo, useState, useTransition } from 'react';
import { useOptimistic } from 'react';
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

    // The value shown in the input box (updates instantly)
    const [inputValue, setInputValue] = useState('');

    // The value used to filter the board (updates in the background)
    const [searchQuery, setSearchQuery] = useState('');

    // The concurrent hook
    const [isPending, startTransition] = useTransition();

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        startTransition(() => {
            setSearchQuery(val);
        });
    };

    const clearSearch = () => {
        setInputValue('');
        startTransition(() => setSearchQuery(''));
    };

    // Memoize the filter so it doesn't recalculate during 60fps dragging
    const filteredColumns = useMemo(() => {
        if (!searchQuery.trim()) return optimisticColumns;
        return optimisticColumns.map(column => ({
            ...column,
            tasks: column.tasks.filter(task =>
                task.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }));
    }, [optimisticColumns, searchQuery]);

    // Determine if dragging should be allowed
    const isSearchActive = searchQuery.trim().length > 0;

    // Handle Drag Start
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

    // Handle Drag Cancel (if user presses ESC)
    const handleDragCancel = () => {
        setActiveTask(null);
    };

    return (
        <div className="flex flex-col w-full h-full">
            {/* Industry Standard Search Bar UI */}
            <div className="mb-6 relative w-80">
                {/* Search Icon */}
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <input
                    type="text"
                    value={inputValue}
                    onChange={handleSearchChange}
                    placeholder="Search tasks..."
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />

                {/* Clear Button (Only shows if there is text) */}
                {inputValue && (
                    <button
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}

                {/* Loading Indicator */}
                {isPending && (
                    <div className="absolute -right-24 top-2 text-sm text-gray-500 animate-pulse">
                        Searching...
                    </div>
                )}
            </div>

            {/* 3. Disable Dragging when filtering */}
            <DndContext
                collisionDetection={closestCorners}
                onDragStart={isSearchActive ? undefined : handleDragStart}
                onDragEnd={isSearchActive ? undefined : handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <div className="flex flex-1 gap-6 overflow-x-auto pb-4 items-start">
                    {/* MAKE SURE THIS MAPS OVER filteredColumns! */}
                    {filteredColumns.map((column) => (
                        <BoardColumn key={column.id} column={column} />
                    ))}
                </div>

                {/* The Magic Overlay */}
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
        </div>
    );
}