import { create } from 'zustand';
import { KanbanBoard, KanbanCard, KanbanColumn, FieldDefinition, FieldValue, FieldType, Workspace } from '@/types/kanban';

// Initial mock data
const initialFieldDefinitions: FieldDefinition[] = [
  { id: 'field-1', name: 'Estimativa (horas)', type: 'number', showOnCard: true },
  { id: 'field-2', name: 'Sprint', type: 'text', showOnCard: true },
];

const initialCards: KanbanCard[] = [
  {
    id: 'card-1',
    title: 'Configurar ambiente de desenvolvimento',
    description: 'Instalar dependências e configurar o projeto inicial com Vite + React + TypeScript.',
    labels: ['setup', 'tech'],
    priority: 'high',
    assignee: 'João Silva',
    fieldValues: { 'field-1': 4, 'field-2': 'Sprint 1' },
  },
  {
    id: 'card-2',
    title: 'Design do sistema de cores',
    description: 'Definir paleta de cores, tipografia e tokens do design system.',
    labels: ['design', 'ui'],
    priority: 'high',
    assignee: 'Maria Santos',
    fieldValues: { 'field-1': 2 },
  },
  {
    id: 'card-3',
    title: 'Implementar sidebar de navegação',
    description: 'Criar componente de sidebar com menu de workspaces e quadros.',
    labels: ['frontend', 'component'],
    priority: 'medium',
    assignee: 'Pedro Costa',
    fieldValues: {},
  },
  {
    id: 'card-4',
    title: 'Integrar drag and drop',
    description: 'Adicionar funcionalidade de arrastar e soltar cards entre colunas.',
    labels: ['frontend', 'feature'],
    priority: 'medium',
    assignee: 'João Silva',
    fieldValues: {},
  },
  {
    id: 'card-5',
    title: 'Criar modal de detalhes do card',
    description: 'Modal com informações completas do card, campos personalizados e ações.',
    labels: ['frontend', 'ui'],
    priority: 'low',
    assignee: 'Maria Santos',
    fieldValues: {},
  },
  {
    id: 'card-6',
    title: 'Documentação inicial',
    description: 'Escrever README com instruções de instalação e uso.',
    labels: ['docs'],
    priority: 'low',
    fieldValues: {},
  },
  {
    id: 'card-7',
    title: 'Testes unitários dos componentes',
    description: 'Criar testes para os principais componentes da aplicação.',
    labels: ['testing', 'tech'],
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
};

const initialWorkspaces: Workspace[] = [
  {
    id: 'workspace-1',
    name: 'Minha Empresa',
    boards: [
      initialBoard,
      { id: 'board-2', name: 'Marketing Q1', columns: [], fieldDefinitions: [] },
      { id: 'board-3', name: 'Roadmap Produto', columns: [], fieldDefinitions: [] },
    ],
  },
  {
    id: 'workspace-2',
    name: 'Projetos Pessoais',
    boards: [
      { id: 'board-4', name: 'Casa Nova', columns: [], fieldDefinitions: [] },
    ],
  },
];

interface KanbanState {
  workspaces: Workspace[];
  activeBoard: string;
  
  // Board actions
  setActiveBoard: (boardId: string) => void;
  getCurrentBoard: () => KanbanBoard | undefined;
  
  // Column/Card actions
  moveCard: (
    cardId: string,
    sourceColumnId: string,
    destColumnId: string,
    sourceIndex: number,
    destIndex: number
  ) => void;
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
  
  // Tag actions
  addTagToCard: (cardId: string, tagName: string) => void;
  removeTagFromCard: (cardId: string, tagName: string) => void;
  getAllTags: () => string[];
}

export const useKanbanStore = create<KanbanState>((set, get) => ({
  workspaces: initialWorkspaces,
  activeBoard: 'board-1',
  
  setActiveBoard: (boardId) => set({ activeBoard: boardId }),
  
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
            // Reorder within same column
            const newCards = [...sourceCol.cards];
            newCards.splice(sourceIndex, 1);
            newCards.splice(destIndex, 0, card);
            
            return {
              ...board,
              columns: board.columns.map((col) =>
                col.id === sourceColumnId ? { ...col, cards: newCards } : col
              ),
            };
          } else {
            // Move between columns
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
            cards: column.cards.map((card) =>
              card.id === cardId ? { ...card, ...updates } : card
            ),
          })),
        })),
      })),
    }));
  },
  
  addFieldDefinition: (boardId, field) => {
    const newField: FieldDefinition = {
      ...field,
      id: `field-${Date.now()}`,
    };
    
    set((state) => ({
      workspaces: state.workspaces.map((workspace) => ({
        ...workspace,
        boards: workspace.boards.map((board) =>
          board.id === boardId
            ? { ...board, fieldDefinitions: [...board.fieldDefinitions, newField] }
            : board
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
            ? {
                ...board,
                fieldDefinitions: board.fieldDefinitions.map((f) =>
                  f.id === fieldId ? { ...f, ...updates } : f
                ),
              }
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
            ? {
                ...board,
                fieldDefinitions: board.fieldDefinitions.filter((f) => f.id !== fieldId),
              }
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
                ? {
                    ...card,
                    fieldValues: {
                      ...card.fieldValues,
                      [fieldId]: value,
                    },
                  }
                : card
            ),
          })),
        })),
      })),
    }));
  },
  
  addColumn: (boardId, title) => {
    const newColumn: KanbanColumn = {
      id: `column-${Date.now()}`,
      title,
      color: 'slate',
      cards: [],
    };
    
    set((state) => ({
      workspaces: state.workspaces.map((workspace) => ({
        ...workspace,
        boards: workspace.boards.map((board) =>
          board.id === boardId
            ? { ...board, columns: [...board.columns, newColumn] }
            : board
        ),
      })),
    }));
  },
  
  addCard: (columnId, title) => {
    const newCard: KanbanCard = {
      id: `card-${Date.now()}`,
      title,
      fieldValues: {},
    };
    
    set((state) => ({
      workspaces: state.workspaces.map((workspace) => ({
        ...workspace,
        boards: workspace.boards.map((board) => ({
          ...board,
          columns: board.columns.map((column) =>
            column.id === columnId
              ? { ...column, cards: [...column.cards, newCard] }
              : column
          ),
        })),
      })),
    }));
  },
  
  addTagToCard: (cardId, tagName) => {
    const tag = tagName.trim().toLowerCase();
    if (!tag) return;
    set((state) => ({
      workspaces: state.workspaces.map((workspace) => ({
        ...workspace,
        boards: workspace.boards.map((board) => ({
          ...board,
          columns: board.columns.map((column) => ({
            ...column,
            cards: column.cards.map((card) => {
              if (card.id !== cardId) return card;
              const current = card.labels || [];
              if (current.includes(tag) || current.length >= 10) return card;
              return { ...card, labels: [...current, tag] };
            }),
          })),
        })),
      })),
    }));
  },
  
  removeTagFromCard: (cardId, tagName) => {
    set((state) => ({
      workspaces: state.workspaces.map((workspace) => ({
        ...workspace,
        boards: workspace.boards.map((board) => ({
          ...board,
          columns: board.columns.map((column) => ({
            ...column,
            cards: column.cards.map((card) =>
              card.id === cardId
                ? { ...card, labels: (card.labels || []).filter((l) => l !== tagName) }
                : card
            ),
          })),
        })),
      })),
    }));
  },
  
  getAllTags: () => {
    const { workspaces, activeBoard } = get();
    const tags = new Set<string>();
    for (const workspace of workspaces) {
      const board = workspace.boards.find((b) => b.id === activeBoard);
      if (board) {
        for (const col of board.columns) {
          for (const card of col.cards) {
            card.labels?.forEach((l) => tags.add(l));
          }
        }
      }
    }
    return Array.from(tags).sort();
  },
}));