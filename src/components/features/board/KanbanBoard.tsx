'use client';

import { BoardWithColumnsAndTasks } from '../../../types/board';

interface KanbanBoardProps {
    initialBoard: BoardWithColumnsAndTasks;
}

export default function KanbanBoard({ initialBoard }: KanbanBoardProps) {
    // For now, will just render the initial board data without any interactivity

    return (
        <div className="flex flex-1 gap-6 overflow-x-auto pb-4 items-start">
            {initialBoard.columns.map((column) => (
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

                    <div className="flex flex-col gap-3 min-h-[150px]">
                        {column.tasks.map((task) => (
                            <div
                                key={task.id}
                                className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
                            >
                                <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                                {/* will add tags and edit buttons here later */}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}