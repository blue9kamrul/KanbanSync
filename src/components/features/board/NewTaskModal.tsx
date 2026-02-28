'use client';

import { useRef, useTransition, useState } from 'react';
import Modal from '../../../components/ui/Modal';
import { createTask } from '../../../actions/taskActions';
import { TaskStatus, TaskCategory } from '../../../generated/prisma/enums';

interface NewTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    boardId: string;
    columnId: string;
    columnTitle: string;
}

export default function NewTaskModal({ isOpen, onClose, boardId, columnId, columnTitle }: NewTaskModalProps) {
    // Uncontrolled ref (No re-renders on keystrokes!)
    const inputRef = useRef<HTMLInputElement>(null);
    const categoryRef = useRef<HTMLSelectElement>(null);

    // Transition for the server action
    const [isPending, startTransition] = useTransition();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleSave = () => {
        const title = inputRef.current?.value;
        const category = categoryRef.current?.value as TaskCategory;

        if (!title || title.trim() === '') return;
        setErrorMsg(null);

        // Map title to Enum
        let status: TaskStatus = TaskStatus.TODO;
        if (columnTitle === 'In Progress') status = TaskStatus.IN_PROGRESS;
        if (columnTitle === 'Done') status = TaskStatus.DONE;

        startTransition(async () => {
            const result = await createTask(boardId, columnId, title, status, category);
            if (result.success) {
                // Clear the input so it's fresh for the next time it opens
                if (inputRef.current) inputRef.current.value = '';
                if (categoryRef.current) categoryRef.current.value = 'FEATURE';
                onClose();
            } else {
                setErrorMsg(result.error ?? 'Something went wrong');
            }
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-xl font-bold mb-4">New Task in {columnTitle}</h2>

            {errorMsg && (
                <div className="mb-4 px-3 py-2 bg-red-50 border border-red-300 text-red-700 text-sm rounded-md">
                    {errorMsg}
                </div>
            )}

            <div className="flex flex-col gap-4">
                {/* Title Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="e.g., Fix login bug..."
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-blue-500"
                        autoFocus
                    />
                </div>

                {/* Category Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                        ref={categoryRef}
                        defaultValue="FEATURE"
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-blue-500 bg-white"
                    >
                        <option value="FEATURE">✨ Feature</option>
                        <option value="BUG">🐛 Bug</option>
                        <option value="CHORE">🧹 Chore</option>
                    </select>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[100px]"
                    >
                        {isPending ? 'Saving...' : 'Save Task'}
                    </button>
                </div>
            </div>
        </Modal>
    );

}