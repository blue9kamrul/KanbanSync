'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo } from 'react';
import type { TaskCategory, Task } from '../../../generated/prisma/browser';

// Helper function to color-code categories
const getCategoryColor = (category: TaskCategory) => {
    switch (category) {
        case 'BUG': return 'bg-red-100 text-red-700 border-red-200';
        case 'FEATURE': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'CHORE': return 'bg-gray-100 text-gray-700 border-gray-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

export default memo(function SortableTask({ task }: { task: Task }) {
    console.log("Rendering Task:", task.id);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 999 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`bg-white p-4 rounded-lg shadow-sm border transition-shadow cursor-grab active:cursor-grabbing
        ${isDragging ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:shadow-md'}
      `}
        >
            <div className="flex justify-between items-start mb-2">
                {/* The Task Category Badge */}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${getCategoryColor(task.category)}`}>
                    {task.category}
                </span>
            </div>
            <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
        </div>
    );
})