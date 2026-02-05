import { Workspace, KanbanBoard, KanbanColumn, KanbanCard } from '@/types/kanban';

export const mockCards: KanbanCard[] = [
  {
    id: 'card-1',
    title: 'Configurar ambiente de desenvolvimento',
    description: 'Instalar dependências e configurar o projeto inicial com Vite + React + TypeScript.',
    labels: ['setup', 'tech'],
    priority: 'high',
    assignee: 'João Silva',
    customFields: [
      { id: 'cf-1', name: 'Estimativa', type: 'number', value: 4 },
      { id: 'cf-2', name: 'Sprint', type: 'text', value: 'Sprint 1' },
    ],
  },
  {
    id: 'card-2',
    title: 'Design do sistema de cores',
    description: 'Definir paleta de cores, tipografia e tokens do design system.',
    labels: ['design', 'ui'],
    priority: 'high',
    assignee: 'Maria Santos',
    customFields: [
      { id: 'cf-3', name: 'Estimativa', type: 'number', value: 2 },
    ],
  },
  {
    id: 'card-3',
    title: 'Implementar sidebar de navegação',
    description: 'Criar componente de sidebar com menu de workspaces e quadros.',
    labels: ['frontend', 'component'],
    priority: 'medium',
    assignee: 'Pedro Costa',
  },
  {
    id: 'card-4',
    title: 'Integrar drag and drop',
    description: 'Adicionar funcionalidade de arrastar e soltar cards entre colunas.',
    labels: ['frontend', 'feature'],
    priority: 'medium',
    assignee: 'João Silva',
  },
  {
    id: 'card-5',
    title: 'Criar modal de detalhes do card',
    description: 'Modal com informações completas do card, campos personalizados e ações.',
    labels: ['frontend', 'ui'],
    priority: 'low',
    assignee: 'Maria Santos',
  },
  {
    id: 'card-6',
    title: 'Documentação inicial',
    description: 'Escrever README com instruções de instalação e uso.',
    labels: ['docs'],
    priority: 'low',
  },
  {
    id: 'card-7',
    title: 'Testes unitários dos componentes',
    description: 'Criar testes para os principais componentes da aplicação.',
    labels: ['testing', 'tech'],
    priority: 'medium',
    assignee: 'Pedro Costa',
  },
];

export const mockColumns: KanbanColumn[] = [
  {
    id: 'column-1',
    title: 'A Fazer',
    color: 'slate',
    cards: [mockCards[3], mockCards[4], mockCards[5]],
  },
  {
    id: 'column-2',
    title: 'Em Andamento',
    color: 'blue',
    cards: [mockCards[2], mockCards[6]],
  },
  {
    id: 'column-3',
    title: 'Concluído',
    color: 'green',
    cards: [mockCards[0], mockCards[1]],
  },
];

export const mockBoard: KanbanBoard = {
  id: 'board-1',
  name: 'Projeto Teste',
  columns: mockColumns,
};

export const mockWorkspaces: Workspace[] = [
  {
    id: 'workspace-1',
    name: 'Minha Empresa',
    boards: [
      mockBoard,
      {
        id: 'board-2',
        name: 'Marketing Q1',
        columns: [],
      },
      {
        id: 'board-3',
        name: 'Roadmap Produto',
        columns: [],
      },
    ],
  },
  {
    id: 'workspace-2',
    name: 'Projetos Pessoais',
    boards: [
      {
        id: 'board-4',
        name: 'Casa Nova',
        columns: [],
      },
    ],
  },
];