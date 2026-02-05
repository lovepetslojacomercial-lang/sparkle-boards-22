import { Calendar, User, Flag } from 'lucide-react';
import { KanbanCard as KanbanCardType, FieldDefinition } from '@/types/kanban';
import { cn } from '@/lib/utils';
import { Draggable } from '@hello-pangea/dnd';
import { CheckSquare, Hash, Type, CalendarDays, List } from 'lucide-react';

interface KanbanCardProps {
  card: KanbanCardType;
  index: number;
  onClick: () => void;
  fieldDefinitions?: FieldDefinition[];
}

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

const labelColors: Record<string, string> = {
  setup: 'bg-purple-100 text-purple-700',
  tech: 'bg-blue-100 text-blue-700',
  design: 'bg-pink-100 text-pink-700',
  ui: 'bg-indigo-100 text-indigo-700',
  frontend: 'bg-cyan-100 text-cyan-700',
  component: 'bg-teal-100 text-teal-700',
  feature: 'bg-emerald-100 text-emerald-700',
  docs: 'bg-orange-100 text-orange-700',
  testing: 'bg-yellow-100 text-yellow-700',
};

const fieldTypeIcons = {
  text: Type,
  number: Hash,
  date: CalendarDays,
  select: List,
  checkbox: CheckSquare,
};

export function KanbanCard({ card, index, onClick, fieldDefinitions = [] }: KanbanCardProps) {
  // Get fields that should be shown on card
  const visibleFields = fieldDefinitions.filter(
    (field) => field.showOnCard && card.fieldValues?.[field.id] !== undefined && card.fieldValues?.[field.id] !== null && card.fieldValues?.[field.id] !== ''
  );

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={cn(
            'kanban-card group',
            snapshot.isDragging && 'kanban-card-dragging'
          )}
        >
          {/* Labels */}
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.labels.map((label) => (
                <span
                  key={label}
                  className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    labelColors[label] || 'bg-muted text-muted-foreground'
                  )}
                >
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h4 className="font-medium text-card-foreground text-sm leading-snug mb-2">
            {card.title}
          </h4>

          {/* Description preview */}
          {card.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {card.description}
            </p>
          )}

          {/* Custom Field Previews */}
          {visibleFields.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {visibleFields.map((field) => {
                const value = card.fieldValues?.[field.id];
                const Icon = fieldTypeIcons[field.type];
                
                // Format value based on type
                let displayValue: string;
                if (field.type === 'checkbox') {
                  displayValue = value ? '✓' : '✗';
                } else if (field.type === 'date' && value) {
                  displayValue = new Date(value as string).toLocaleDateString('pt-BR');
                } else {
                  displayValue = String(value);
                }
                
                return (
                  <span
                    key={field.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-primary/10 text-primary border border-primary/20"
                  >
                    <Icon className="w-3 h-3" />
                    <span className="font-medium truncate max-w-[80px]" title={`${field.name}: ${displayValue}`}>
                      {displayValue}
                    </span>
                  </span>
                );
              })}
            </div>
          )}

          {/* Footer with metadata */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {card.priority && (
                <span
                  className={cn(
                    'flex items-center gap-1 px-1.5 py-0.5 rounded',
                    priorityColors[card.priority]
                  )}
                >
                  <Flag className="w-3 h-3" />
                </span>
              )}
              {card.dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(card.dueDate).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
            {card.assignee && (
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-primary" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}