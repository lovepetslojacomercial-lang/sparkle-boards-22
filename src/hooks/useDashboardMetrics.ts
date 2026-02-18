import { useMemo } from 'react';
import { useKanbanStore } from '@/store/kanbanStore';
import { KanbanBoard, KanbanCard, KanbanColumn } from '@/types/kanban';

export interface DashboardMetrics {
  totalCards: number;
  completedCards: number;
  inProgressCards: number;
  overdueCards: number;
  completionRate: number;
  cardsByStatus: { name: string; value: number; color: string }[];
  cardsByLabel: { name: string; value: number; color: string }[];
  cardsByAssignee: { name: string; value: number }[];
  overdueList: (KanbanCard & { daysOverdue: number; columnName: string })[];
  dueTodayList: (KanbanCard & { columnName: string })[];
}

function isOverdue(card: KanbanCard): boolean {
  if (!card.dueDate || card.dueComplete) return false;
  const due = new Date(card.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

function isDueToday(card: KanbanCard): boolean {
  if (!card.dueDate || card.dueComplete) return false;
  const due = new Date(card.dueDate);
  const today = new Date();
  return due.toDateString() === today.toDateString();
}

function getDaysOverdue(card: KanbanCard): number {
  if (!card.dueDate) return 0;
  const due = new Date(card.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = today.getTime() - due.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

const STATUS_COLORS: Record<string, string> = {
  'A Fazer': 'hsl(215, 16%, 47%)',
  'Em Andamento': 'hsl(217, 91%, 60%)',
  'Concluído': 'hsl(160, 84%, 39%)',
};

const LABEL_HEX: Record<string, string> = {
  red: '#ef4444', orange: '#f97316', amber: '#f59e0b', yellow: '#eab308',
  lime: '#84cc16', green: '#22c55e', emerald: '#10b981', teal: '#14b8a6',
  cyan: '#06b6d4', blue: '#3b82f6', indigo: '#6366f1', purple: '#a855f7',
  pink: '#ec4899', rose: '#f43f5e',
};

export function useDashboardMetrics(selectedBoardId?: string): DashboardMetrics {
  const { workspaces } = useKanbanStore();

  return useMemo(() => {
    // Gather boards
    const allBoards: KanbanBoard[] = workspaces.flatMap((w) => w.boards);
    const boards = selectedBoardId
      ? allBoards.filter((b) => b.id === selectedBoardId)
      : allBoards;

    // Flatten
    const allColumns: (KanbanColumn & { boardId: string })[] = boards.flatMap((b) =>
      b.columns.map((c) => ({ ...c, boardId: b.id }))
    );

    const allCards: (KanbanCard & { columnTitle: string })[] = allColumns.flatMap((col) =>
      col.cards.map((card) => ({ ...card, columnTitle: col.title }))
    );

    const totalCards = allCards.length;

    // Status detection by column title keywords
    const doneKeywords = ['concluído', 'concluido', 'done', 'finalizado'];
    const progressKeywords = ['andamento', 'progress', 'doing', 'em andamento'];

    const completedCards = allCards.filter((c) =>
      doneKeywords.some((k) => c.columnTitle.toLowerCase().includes(k))
    ).length;

    const inProgressCards = allCards.filter((c) =>
      progressKeywords.some((k) => c.columnTitle.toLowerCase().includes(k))
    ).length;

    const overdueCards = allCards.filter(isOverdue).length;
    const completionRate = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

    // Cards by status (column)
    const statusMap = new Map<string, number>();
    allColumns.forEach((col) => {
      statusMap.set(col.title, (statusMap.get(col.title) || 0) + col.cards.length);
    });
    const cardsByStatus = Array.from(statusMap.entries()).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] || 'hsl(215, 16%, 47%)',
    }));

    // Cards by label
    const labelMap = new Map<string, { count: number; color: string }>();
    const allLabels = boards.flatMap((b) => b.labels);
    allCards.forEach((card) => {
      (card.labelIds || []).forEach((lid) => {
        const label = allLabels.find((l) => l.id === lid);
        if (label) {
          const existing = labelMap.get(label.name);
          labelMap.set(label.name, {
            count: (existing?.count || 0) + 1,
            color: LABEL_HEX[label.color] || '#3b82f6',
          });
        }
      });
    });
    const cardsByLabel = Array.from(labelMap.entries()).map(([name, { count, color }]) => ({
      name,
      value: count,
      color,
    }));

    // Cards by assignee
    const assigneeMap = new Map<string, number>();
    allCards.forEach((c) => {
      if (c.assignee) {
        assigneeMap.set(c.assignee, (assigneeMap.get(c.assignee) || 0) + 1);
      }
    });
    const cardsByAssignee = Array.from(assigneeMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Overdue list
    const overdueList = allCards
      .filter(isOverdue)
      .map((c) => ({ ...c, daysOverdue: getDaysOverdue(c), columnName: c.columnTitle }))
      .sort((a, b) => b.daysOverdue - a.daysOverdue);

    // Due today
    const dueTodayList = allCards
      .filter(isDueToday)
      .map((c) => ({ ...c, columnName: c.columnTitle }));

    return {
      totalCards,
      completedCards,
      inProgressCards,
      overdueCards,
      completionRate,
      cardsByStatus,
      cardsByLabel,
      cardsByAssignee,
      overdueList,
      dueTodayList,
    };
  }, [workspaces, selectedBoardId]);
}
