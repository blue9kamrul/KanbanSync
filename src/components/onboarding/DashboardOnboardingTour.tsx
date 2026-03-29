'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import GuidedTour, { GuidedTourStep } from './GuidedTour';

interface DashboardOnboardingTourProps {
    userId: string;
    firstBoardId?: string;
    boardCount: number;
}

export default function DashboardOnboardingTour({ userId, firstBoardId, boardCount }: DashboardOnboardingTourProps) {
    const router = useRouter();

    const steps = useMemo<GuidedTourStep[]>(() => {
        const hasBoards = boardCount > 0;
        return [
            {
                title: 'Welcome to KanbanSync',
                description: 'This quick walkthrough shows how to create boards, open workspaces, and use advanced task features.',
                selector: '[data-tour="dashboard-title"]',
            },
            {
                title: 'Create your first board',
                description: 'Use Create Board to add columns and invite teammates in one place.',
                selector: '[data-tour="create-board-button"]',
            },
            hasBoards
                ? {
                    title: 'Open a board',
                    description: 'Click any board card to enter the Kanban workspace and start managing tasks.',
                    selector: '[data-tour="open-board-card"]',
                }
                : {
                    title: 'Create a board to continue',
                    description: 'After creating your first board, you can open it from this dashboard and start the full board tour.',
                    selector: '[data-tour="dashboard-empty-state"]',
                },
            {
                title: 'Ready for full feature tour',
                description: hasBoards
                    ? 'When you continue, we will open your board and explain task category, priority, assignee, tags, description, comments, edit, and delete flows.'
                    : 'When your first board is ready, open it and the full board feature tour will start automatically.',
            },
        ];
    }, [boardCount]);

    return (
        <GuidedTour
            userId={userId}
            storageKey="dashboard-onboarding-v1"
            tourName="Dashboard Tour"
            steps={steps}
            finishLabel={firstBoardId ? 'Open board tour' : 'Finish'}
            onFinish={() => {
                if (firstBoardId) {
                    sessionStorage.setItem('ks-board-tour-pending', '1');
                    router.push(`/board/${firstBoardId}?tour=1`);
                }
            }}
        />
    );
}
