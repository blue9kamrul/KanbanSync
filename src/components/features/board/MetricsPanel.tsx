'use client';

import React, { useMemo } from 'react';
import type { BoardWithColumnsAndTasks } from '../../../types/board';
import computeBoardMetrics from '../../../lib/metrics';

interface Props {
    board: BoardWithColumnsAndTasks;
}

export default function MetricsPanel({ board }: Props) {
    const metrics = useMemo(() => computeBoardMetrics(board), [board]);

    return (
        <section className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-sm border">
                <div className="text-xs text-gray-500">Lead Time (days)</div>
                <div className="text-xl font-semibold">{metrics.leadTime.avgDays.toFixed(1)}</div>
                <div className="text-sm text-gray-400">median {metrics.leadTime.medianDays.toFixed(1)} • samples {metrics.leadTime.samples}</div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm border">
                <div className="text-xs text-gray-500">Cycle Time (days)</div>
                <div className="text-xl font-semibold">{metrics.cycleTime.avgDays.toFixed(1)}</div>
                <div className="text-sm text-gray-400">median {metrics.cycleTime.medianDays.toFixed(1)}</div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm border">
                <div className="text-xs text-gray-500">Work In Progress</div>
                <div className="text-xl font-semibold">{metrics.wip.total}</div>
                <div className="text-sm text-gray-400">columns {Object.keys(metrics.wip.perColumn).length}</div>
            </div>

            <div className="p-4 bg-white rounded-lg shadow-sm border">
                <div className="text-xs text-gray-500">Throughput (last {metrics.throughput.periodDays}d)</div>
                <div className="text-xl font-semibold">{metrics.throughput.count}</div>
                <div className="text-sm text-gray-400">completed</div>
            </div>

            <div className="md:col-span-4 p-4 bg-white rounded-lg shadow-sm border">
                <div className="text-sm text-gray-600 font-medium mb-2">Oldest Active Tasks</div>
                <div className="flex gap-3 flex-wrap">
                    {metrics.workItemAges.slice(0, 5).map(t => (
                        <div key={t.id} className="px-3 py-2 bg-gray-50 rounded border text-sm">
                            <div className="font-medium truncate" title={t.title}>{t.title}</div>
                            <div className="text-xs text-gray-500">{t.ageDays.toFixed(1)} days</div>
                        </div>
                    ))}
                    {metrics.workItemAges.length === 0 && <div className="text-sm text-gray-400">No active tasks</div>}
                </div>
            </div>

            {/* Charts: CFD and Throughput */}
            <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg shadow-sm border">
                    <div className="text-sm text-gray-600 font-medium mb-2">Cumulative Flow (approx)</div>
                    <svg viewBox={`0 0 100 40`} className="w-full h-28">
                        {/* Simple stacked areas using percentages */}
                        {(() => {
                            const { dates, series } = metrics.cfd;
                            const total = series.backlog.map((v, i) => series.backlog[i] + series.inProgress[i] + series.done[i]);
                            const points = dates.map((d, i) => {
                                const t = total[i] || 1;
                                const b = (series.backlog[i] / t) * 100;
                                const p = (series.inProgress[i] / t) * 100;
                                const dval = (series.done[i] / t) * 100;
                                return { b, p, d: dval };
                            });
                            // Build paths
                            let backlogPath = 'M0 40';
                            let inProgPath = 'M0 40';
                            let donePath = 'M0 40';
                            points.forEach((pt, i) => {
                                const x = (i / Math.max(1, points.length - 1)) * 100;
                                backlogPath += ` L ${x.toFixed(2)} ${40 - (pt.b / 100) * 30}`;
                                inProgPath += ` L ${x.toFixed(2)} ${40 - ((pt.b + pt.p) / 100) * 30}`;
                                donePath += ` L ${x.toFixed(2)} ${40 - ((pt.b + pt.p + pt.d) / 100) * 30}`;
                            });
                            backlogPath += ' L 100 40 Z';
                            inProgPath += ' L 100 40 Z';
                            donePath += ' L 100 40 Z';
                            return (
                                <g>
                                    <path d={backlogPath} fill="#f3f4f6" stroke="none" />
                                    <path d={inProgPath} fill="#e0f2fe" stroke="none" />
                                    <path d={donePath} fill="#dcfce7" stroke="none" />
                                </g>
                            );
                        })()}
                    </svg>
                </div>

                <div className="p-4 bg-white rounded-lg shadow-sm border">
                    <div className="text-sm text-gray-600 font-medium mb-2">Throughput (last {metrics.throughput.periodDays}d)</div>
                    <div className="flex items-end gap-2 h-24">
                        {(() => {
                            const count = metrics.throughput.count;
                            // Show simple bar representing throughput vs samples
                            const bars = Array.from({ length: Math.min(7, metrics.cfd.dates.length) }).map((_, i) => {
                                const h = Math.round((count / Math.max(1, metrics.throughput.periodDays)) * 100);
                                return h;
                            });
                            return bars.map((h, i) => (
                                <div key={i} className="bg-blue-500" style={{ width: '12%', height: `${h}%` }} />
                            ));
                        })()}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">Completed: {metrics.throughput.count}</div>
                </div>
            </div>
        </section>
    );
}
