import { Droppable } from '@hello-pangea/dnd';
import { MoreHorizontal, Plus } from 'lucide-react';
import { KanbanColumn as KanbanColumnType, KanbanCard as KanbanCardType, FieldDefinition } from '@/types/kanban';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { useKanbanStore } from '@/store/kanbanStore';

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
  const { addCard } = useKanbanStore();
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isAddingCard && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isAddingCard]);

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      addCard(column.id, newCardTitle.trim());
      setNewCardTitle('');
      // Keep form open for sequential adds
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddCard();
    }
    if (e.key === 'Escape') {
      setIsAddingCard(false);
      setNewCardTitle('');
    }
  };

  const handleBlur = () => {
    if (!newCardTitle.trim()) {
      setIsAddingCard(false);
    }
  };

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

            {/* Quick Add Card */}
            <div className="p-2">
              {isAddingCard ? (
                <div className="space-y-2">
                  <Textarea
                    ref={textareaRef}
                    value={newCardTitle}
                    onChange={(e) => setNewCardTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    placeholder="Digite o título do card..."
                    className="min-h-[60px] resize-none bg-background"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter para criar • Esc para cancelar
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingCard(true)}
                  className="w-full p-2 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Card</span>
                </button>
              )}
            </div>
          </div>
        )}
      </Droppable>
    </div>
  );
}