import { create } from 'zustand';
import { KanbanBoard, KanbanCard, KanbanColumn, FieldDefinition, FieldValue, FieldType, Workspace, Label } from '@/types/kanban';
import { DEFAULT_LABELS } from '@/lib/labelColors';

function createDefaultLabels(): Label[] {
  return DEFAULT_LABELS.map((l, i) => ({
    id: `label-default-${i + 1}`,
    name: l.name,
    color: l.color,
  }));
}

const defaultLabels = createDefaultLabels();

const initialFieldDefinitions: FieldDefinition[] = [
  { id: 'field-1', name: 'Estimativa (horas)', type: 'number', showOnCard: true },
  { id: 'field-2', name: 'Sprint', type: 'text', showOnCard: true },
];

const initialCards: KanbanCard[] = [
  {
    id: 'card-1',
    title: 'Configurar ambiente de desenvolvimento',
    description: 'Instalar dependências e configurar o projeto inicial com Vite + React + TypeScript.',
    labelIds: ['label-default-1', 'label-default-2'],
    priority: 'high',
    assignee: 'João Silva',
    fieldValues: { 'field-1': 4, 'field-2': 'Sprint 1' },
  },
  {
    id: 'card-2',
    title: 'Design do sistema de cores',
    description: 'Definir paleta de cores, tipografia e tokens do design system.',
    labelIds: ['label-default-6'],
    priority: 'high',
    assignee: 'Maria Santos',
    fieldValues: { 'field-1': 2 },
  },
  {
    id: 'card-3',
    title: 'Implementar sidebar de navegação',
    description: 'Criar componente de sidebar com menu de workspaces e quadros.',
    labelIds: ['label-default-3'],
    priority: 'medium',
    assignee: 'Pedro Costa',
    fieldValues: {},
  },
  {
    id: 'card-4',
    title: 'Integrar drag and drop',
    description: 'Adicionar funcionalidade de arrastar e soltar cards entre colunas.',
    labelIds: ['label-default-3'],
    priority: 'medium',
    assignee: 'João Silva',
    fieldValues: {},
  },
  {
    id: 'card-5',
    title: 'Criar modal de detalhes do card',
    description: 'Modal com informações completas do card, campos personalizados e ações.',
    labelIds: ['label-default-4'],
    priority: 'low',
    assignee: 'Maria Santos',
    fieldValues: {},
  },
  {
    id: 'card-6',
    title: 'Documentação inicial',
    description: 'Escrever README com instruções de instalação e uso.',
    labelIds: ['label-default-5'],
    priority: 'low',
    fieldValues: {},
  },
  {
    id: 'card-7',
    title: 'Testes unitários dos componentes',
    description: 'Criar testes para os principais componentes da aplicação.',
    labelIds: ['label-default-2'],
    priority: 'medium',
    assignee: 'Pedro Costa',
    fieldValues: {},
  },
];

const initialColumns: KanbanColumn[] = [
  {
    id: 'column-1',
    title: 'A Fazer',
    color: 'slate',
    cards: [initialCards[3], initialCards[4], initialCards[5]],
  },
  {
    id: 'column-2',
    title: 'Em Andamento',
    color: 'blue',
    cards: [initialCards[2], initialCards[6]],
  },
  {
    id: 'column-3',
    title: 'Concluído',
    color: 'green',
    cards: [initialCards[0], initialCards[1]],
  },
];

const initialBoard: KanbanBoard = {
  id: 'board-1',
  name: 'Projeto Teste',
  columns: initialColumns,
  fieldDefinitions: initialFieldDefinitions,
  labels: defaultLabels,
};

const initialWorkspaces: Workspace[] = [
  {
    id: 'workspace-1',
    name: 'Minha Empresa',
    boards: [
      initialBoard,
      { id: 'board-2', name: 'Marketing Q1', columns: [], fieldDefinitions: [], labels: createDefaultLabels() },
      { id: 'board-3', name: 'Roadmap Produto', columns: [], fieldDefinitions: [], labels: createDefaultLabels() },
    ],
  },
  {
    id: 'workspace-2',
    name: 'Projetos Pessoais',
    boards: [
      { id: 'board-4', name: 'Casa Nova', columns: [], fieldDefinitions: [], labels: createDefaultLabels() },
    ],
  },
];

interface KanbanState {
  workspaces: Workspace[];
  activeBoard: string;
  
  // Board actions
  setActiveBoard: (boardId: string) => void;
  getCurrentBoard: () => KanbanBoard | undefined;
  
  // Workspace actions
  addWorkspace: (name: string) => void;
  
  // Board CRUD actions
  addBoard: (workspaceId: string, name: string) => void;
  deleteBoard: (boardId: string) => void;
  
  // Column/Card actions
  moveCard: (cardId: string, sourceColumnId: string, destColumnId: string, sourceIndex: number, destIndex: number) => void;
  updateCard: (cardId: string, updates: Partial<KanbanCard>) => void;
  
  // Field Definition actions (board-level)
  addFieldDefinition: (boardId: string, field: Omit<FieldDefinition, 'id'>) => void;
  updateFieldDefinition: (boardId: string, fieldId: string, updates: Partial<FieldDefinition>) => void;
  deleteFieldDefinition: (boardId: string, fieldId: string) => void;
  
  // Card field value actions
  setCardFieldValue: (cardId: string, fieldId: string, value: FieldValue) => void;
  
  // Column actions
  addColumn: (boardId: string, title: string) => void;
  
  // Card creation actions
  addCard: (columnId: string, title: string) => void;
  
  // Label actions (board-level)
  addLabel: (boardId: string, label: Omit<Label, 'id'>) => void;
  updateLabel: (boardId: string, labelId: string, updates: Partial<Omit<Label, 'id'>>) => void;
  deleteLabel: (boardId: string, labelId: string) => void;
  
  // Card label actions
  toggleCardLabel: (cardId: string, labelId: string) => void;
}

export const useKanbanStore = create<KanbanState>((set, get) => ({
  workspaces: initialWorkspaces,
  activeBoard: 'board-1',
  
  setActiveBoard: (boardId) => set({ activeBoard: boardId }),
  
  addWorkspace: (name) => {
    const newWorkspace: Workspace = {
      id: `workspace-${Date.now()}`,
      name,
      boards: [],
    };
    set((state) => ({ workspaces: [...state.workspaces, newWorkspace] }));
  },
  
  addBoard: (workspaceId, name) => {
    const newBoard: KanbanBoard = {
      id: `board-${Date.now()}`,
      name,
      columns: [],
      fieldDefinitions: [],
      labels: createDefaultLabels(),
    };
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === workspaceId ? { ...w, boards: [...w.boards, newBoard] } : w
      ),
    }));
  },
  
  deleteBoard: (boardId) => {
    set((state) => {
      const newWorkspaces = state.workspaces.map((w) => ({
        ...w,
        boards: w.boards.filter((b) => b.id !== boardId),
      }));
      const newActive = state.activeBoard === boardId
        ? (newWorkspaces.flatMap((w) => w.boards)[0]?.id || '')
        : state.activeBoard;
      return { workspaces: newWorkspaces, activeBoard: newActive };
    });
  },
  
  getCurrentBoard: () => {
    const { workspaces, activeBoard } = get();
    for (const workspace of workspaces) {
      const board = workspace.boards.find((b) => b.id === activeBoard);
      if (board) return board;
    }
    return undefined;
  },
  
  moveCard: (cardId, sourceColumnId, destColumnId, sourceIndex, destIndex) => {
    set((state) => {
      const newWorkspaces = state.workspaces.map((workspace) => ({
        ...workspace,
        boards: workspace.boards.map((board) => {
          if (board.id !== state.activeBoard) return board;
          const sourceCol = board.columns.find((c) => c.id === sourceColumnId);
          const destCol = board.columns.find((c) => c.id === destColumnId);
          if (!sourceCol || !destCol) return board;
          const card = sourceCol.cards.find((c) => c.id === cardId);
          if (!card) return board;
          if (sourceColumnId === destColumnId) {
            const newCards = [...sourceCol.cards];
            newCards.splice(sourceIndex, 1);
            newCards.splice(destIndex, 0, card);
            return { ...board, columns: board.columns.map((col) => col.id === sourceColumnId ? { ...col, cards: newCards } : col) };
          } else {
            const sourceCards = sourceCol.cards.filter((c) => c.id !== cardId);
            const destCards = [...destCol.cards];
            destCards.splice(destIndex, 0, card);
            return {
              ...board,
              columns: board.columns.map((col) => {
                if (col.id === sourceColumnId) return { ...col, cards: sourceCards };
                if (col.id === destColumnId) return { ...col, cards: destCards };
                return col;
              }),
            };
          }
        }),
      }));
      return { workspaces: newWorkspaces };
    });
  },
  
  updateCard: (cardId, updates) => {
    set((state) => ({
      workspaces: state.workspaces.map((workspace) => ({
        ...workspace,
        boards: workspace.boards.map((board) => ({
          ...board,
          columns: board.columns.map((column) => ({
            ...column,
            cards: column.cards.map((card) => card.id === cardId ? { ...card, ...updates } : card),
          })),
        })),
      })),
    }));
  },
  
  addFieldDefinition: (boardId, field) => {
    const newField: FieldDefinition = { ...field, id: `field-${Date.now()}` };
    set((state) => ({
      workspaces: state.workspaces.map((workspace) => ({
        ...workspace,
        boards: workspace.boards.map((board) =>
          board.id === boardId ? { ...board, fieldDefinitions: [...board.fieldDefinitions, newField] } : board
        ),
      })),
    }));
  },
  
  updateFieldDefinition: (boardId, fieldId, updates) => {
    set((state) => ({
      workspaces: state.workspaces.map((workspace) => ({
        ...workspace,
        boards: workspace.boards.map((board) =>
          board.id === boardId
            ? { ...board, fieldDefinitions: board.fieldDefinitions.map((f) => f.id === fieldId ? { ...f, ...updates } : f) }
            : board
        ),
      })),
    }));
  },
  
  deleteFieldDefinition: (boardId, fieldId) => {
    set((state) => ({
      workspaces: state.workspaces.map((workspace) => ({
        ...workspace,
        boards: workspace.boards.map((board) =>
          board.id === boardId
            ? { ...board, fieldDefinitions: board.fieldDefinitions.filter((f) => f.id !== fieldId) }
            : board
        ),
      })),
    }));
  },
  
  setCardFieldValue: (cardId, fieldId, value) => {
    set((state) => ({
      workspaces: state.workspaces.map((workspace) => ({
        ...workspace,
        boards: workspace.boards.map((board) => ({
          ...board,
          columns: board.columns.map((column) => ({
            ...column,
            cards: column.cards.map((card) =>
              card.id === cardId
                ? { ...card, fieldValues: { ...card.fieldValues, [fieldId]: value } }
                : card
            ),
          })),
        })),
      })),
    }));
  },
  
  addColumn: (boardId, title) => {
    const newColumn: KanbanColumn = { id: `column-${Date.now()}`, title, color: 'slate', cards: [] };
    set((state) => ({
      workspaces: state.workspaces.map((workspace) => ({
        ...workspace,
        boards: workspace.boards.map((board) =>
          board.id === boardId ? { ...board, columns: [...board.columns, newColumn] } : board
        ),
      })),
    }));
  },
  
  addCard: (columnId, title) => {
    const newCard: KanbanCard = { id: `card-${Date.now()}`, title, fieldValues: {} };
    set((state) => ({
      workspaces: state.workspaces.map((workspace) => ({
        ...workspace,
        boards: workspace.boards.map((board) => ({
          ...board,
          columns: board.columns.map((column) =>
            column.id === columnId ? { ...column, cards: [...column.cards, newCard] } : column
          ),
        })),
      })),
    }));
  },
  
  // Label CRUD
  addLabel: (boardId, label) => {
    const newLabel: Label = { ...label, id: `label-${Date.now()}` };
    set((state) => ({
      workspaces: state.workspaces.map((workspace) => ({
        ...workspace,
        boards: workspace.boards.map((board) =>
          board.id === boardId ? { ...board, labels: [...board.labels, newLabel] } : board
        ),
      })),
    }));
  },

  updateLabel: (boardId, labelId, updates) => {
    set((state) => ({
      workspaces: state.workspaces.map((workspace) => ({
        ...workspace,
        boards: workspace.boards.map((board) =>
          board.id === boardId
            ? { ...board, labels: board.labels.map((l) => l.id === labelId ? { ...l, ...updates } : l) }
            : board
        ),
      })),
    }));
  },

  deleteLabel: (boardId, labelId) => {
    set((state) => ({
      workspaces: state.workspaces.map((workspace) => ({
        ...workspace,
        boards: workspace.boards.map((board) => {
          if (board.id !== boardId) return board;
          return {
            ...board,
            labels: board.labels.filter((l) => l.id !== labelId),
            // Also remove from all cards
            columns: board.columns.map((col) => ({
              ...col,
              cards: col.cards.map((card) => ({
                ...card,
                labelIds: (card.labelIds || []).filter((id) => id !== labelId),
              })),
            })),
          };
        }),
      })),
    }));
  },

  toggleCardLabel: (cardId, labelId) => {
    set((state) => ({
      workspaces: state.workspaces.map((workspace) => ({
        ...workspace,
        boards: workspace.boards.map((board) => ({
          ...board,
          columns: board.columns.map((column) => ({
            ...column,
            cards: column.cards.map((card) => {
              if (card.id !== cardId) return card;
              const current = card.labelIds || [];
              const has = current.includes(labelId);
              return { ...card, labelIds: has ? current.filter((id) => id !== labelId) : [...current, labelId] };
            }),
          })),
        })),
      })),
    }));
  },
}));
