'use client';

import { useRef, useTransition } from 'react';
import Modal from '../../../components/ui/Modal';
import { createTask } from '../../../actions/taskActions';
import { TaskStatus } from '../../../generated/prisma/enums';

interface NewTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    boardId: string;
    columnId: string;
    columnTitle: string;
}

export default function NewTaskModal({ isOpen, onClose, boardId, columnId, columnTitle }: NewTaskModalProps) {
    // 1. Uncontrolled ref (No re-renders on keystrokes!)
    const inputRef = useRef<HTMLInputElement>(null);

    // 2. Transition for the server action
    const [isPending, startTransition] = useTransition();

    const handleSave = () => {
        const title = inputRef.current?.value;
        if (!title || title.trim() === '') return;

        // Map title to Enum
        let status: TaskStatus = TaskStatus.TODO;
        if (columnTitle === 'In Progress') status = TaskStatus.IN_PROGRESS;
        if (columnTitle === 'Done') status = TaskStatus.DONE;

        startTransition(async () => {
            const result = await createTask(boardId, columnId, title, status);
            if (result.success) {
                onClose(); // Close modal on success
            } else {
                console.error(result.error);
            }
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-xl font-bold mb-4">New Task in {columnTitle}</h2>

            <div className="flex flex-col gap-4">
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Task title..."
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-blue-500"
                    autoFocus
                />

                <div className="flex justify-end gap-2 mt-4">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isPending ? 'Saving...' : 'Save Task'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}