'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../../../generated/prisma/client';

export default function SortableTask({ task }: { task: Task }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

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
            <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
        </div>
    );
}