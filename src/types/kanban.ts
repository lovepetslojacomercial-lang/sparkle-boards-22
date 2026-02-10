export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  labels?: string[];
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
  dueComplete?: boolean;
  fieldValues?: Record<string, FieldValue>; // fieldDefinitionId -> value
}

export type FieldValue = string | number | boolean | string[] | null;

export type FieldType = 'text' | 'number' | 'date' | 'select' | 'checkbox';

export interface FieldDefinition {
  id: string;
  name: string;
  type: FieldType;
  options?: string[]; // For select type
  showOnCard?: boolean; // Show preview on card
}

export interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  cards: KanbanCard[];
}

export interface KanbanBoard {
  id: string;
  name: string;
  columns: KanbanColumn[];
  fieldDefinitions: FieldDefinition[]; // Board-level custom fields
}

export interface Workspace {
  id: string;
  name: string;
  boards: KanbanBoard[];
}