import { Droppable } from '@hello-pangea/dnd';
import { MoreHorizontal, Plus } from 'lucide-react';
import { KanbanColumn as KanbanColumnType, KanbanCard as KanbanCardType, FieldDefinition } from '@/types/kanban';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  column: KanbanColumnType;
  onCardClick: (card: KanbanCardType) => void;
  fieldDefinitions?: FieldDefinition[];
}

const columnColors: Record<string, string> = {
  slate: 'border-t-slate-400',
  blue: 'border-t-blue-500',
  green: 'border-t-primary',
};

export function KanbanColumn({ column, onCardClick, fieldDefinitions = [] }: KanbanColumnProps) {
  return (
    <div className="flex flex-col w-80 flex-shrink-0">
      {/* Column Header */}
      <div
        className={cn(
          'bg-card rounded-t-xl px-4 py-3 border border-b-0 border-border',
          'border-t-4',
          columnColors[column.color || 'slate']
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-card-foreground">
              {column.title}
            </h3>
            <span className="bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">
              {column.cards.length}
            </span>
          </div>
          <button className="p-1 rounded hover:bg-muted transition-colors">
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Cards Container */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              'kanban-column flex-1 rounded-b-xl border border-t-0 border-border kanban-scroll overflow-y-auto',
              snapshot.isDraggingOver && 'bg-primary/5 border-primary/30'
            )}
          >
            <div className="space-y-2 p-2">
              {column.cards.map((card, index) => (
                <KanbanCard
                  key={card.id}
                  card={card}
                  index={index}
                  onClick={() => onCardClick(card)}
                  fieldDefinitions={fieldDefinitions}
                />
              ))}
              {provided.placeholder}
            </div>

            {/* Add Card Button */}
            <button className="w-full p-3 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors mx-auto">
              <Plus className="w-4 h-4" />
              <span>Adicionar Card</span>
            </button>
          </div>
        )}
      </Droppable>
    </div>
  );
}