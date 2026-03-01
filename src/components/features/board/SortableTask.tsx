'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo, useState, useTransition } from 'react';
import type { TaskCategory, Task, Prisma } from '../../../generated/prisma/browser';
import { deleteTask } from '@/src/actions/taskActions';
import EditTaskModal from './EditTaskModal';
import Modal from '../../ui/Modal';

type TaskType = Prisma.TaskGetPayload<{
    include: { column: true } // Assuming you can access column for boardId, or we can pass boardId as a prop. 
}>;

// Helper function to color-code categories
const getCategoryColor = (category: TaskCategory) => {
    switch (category) {
        case 'BUG': return 'bg-red-100 text-red-700 border-red-200';
        case 'FEATURE': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'CHORE': return 'bg-gray-100 text-gray-700 border-gray-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

export default memo(function SortableTask({ task, boardId
}: { task: TaskType; boardId: string }) {
    console.log("Rendering Task:", task.id);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPendingDelete, startTransition] = useTransition();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 999 : 'auto',
    };

    // New function to actually execute the delete
    const confirmDelete = () => {
        startTransition(async () => {
            await deleteTask(task.id, boardId);
            setIsDeleteModalOpen(false); // Close modal when done
        });
    };
    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                {...attributes}
                {...listeners}
                className={`group bg-white p-4 rounded-lg shadow-sm border transition-shadow cursor-grab active:cursor-grabbing
                ${isDragging ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:shadow-md'}
            `}
            >
                <div className="flex justify-between items-start mb-2">
                    {/* The Task Category Badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${getCategoryColor(task.category)}`}>
                        {task.category}
                    </span>
                    {/* Action Buttons (Visible on hover) */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onPointerDown={(e) => e.stopPropagation()} // CRITICAL: Stops drag-and-drop
                            onClick={() => setIsEditModalOpen(true)}
                            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 p-1 rounded disabled:opacity-50"
                            title="Edit"
                            aria-label="Edit task"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                        </button>
                        <button
                            onPointerDown={(e) => e.stopPropagation()} // CRITICAL: Stops drag-and-drop
                            onClick={() => setIsDeleteModalOpen(true)}
                            disabled={isPendingDelete}
                            className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-1 rounded disabled:opacity-50"
                            title="Delete"
                            aria-label="Delete task"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5 0V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" />
                            </svg>
                        </button>
                    </div>
                </div>
                <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
            </div>
            <EditTaskModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                task={task}
                boardId={boardId}
            />
            {/* 3. The Custom Delete Confirmation Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <h2 className="text-xl font-bold mb-4 text-gray-900">Delete Task</h2>
                <p className="text-gray-600 mb-6">
                    Are you sure you want to delete <span className="font-semibold text-gray-800">{task.title}</span>? This action cannot be undone.
                </p>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button
                        onClick={() => setIsDeleteModalOpen(false)}
                        disabled={isPendingDelete}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmDelete}
                        disabled={isPendingDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[100px]"
                    >
                        {isPendingDelete ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </Modal>
        </>
    );
})