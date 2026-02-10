import { Calendar, User, Flag, Check, X as XIcon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { KanbanCard as KanbanCardType, FieldDefinition, Label } from '@/types/kanban';
import { cn } from '@/lib/utils';
import { Draggable } from '@hello-pangea/dnd';
import { CheckSquare, Hash, Type, CalendarDays, List } from 'lucide-react';
import { format, parseISO, differenceInDays, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getLabelClasses } from '@/lib/labelColors';

interface KanbanCardProps {
  card: KanbanCardType;
  index: number;
  onClick: () => void;
  fieldDefinitions?: FieldDefinition[];
  boardLabels?: Label[];
}

const priorityColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};

const fieldTypeIcons = {
  text: Type,
  number: Hash,
  date: CalendarDays,
  select: List,
  checkbox: CheckSquare,
};

const fieldBadgeColors: Record<string, string> = {
  text: 'bg-blue-100 text-blue-700 border-blue-200',
  number: 'bg-purple-100 text-purple-700 border-purple-200',
  date: 'bg-amber-100 text-amber-700 border-amber-200',
  select: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  checkbox: 'bg-pink-100 text-pink-700 border-pink-200',
};

export function KanbanCard({ card, index, onClick, fieldDefinitions = [], boardLabels = [] }: KanbanCardProps) {
  const visibleFields = fieldDefinitions.filter(
    (field) => field.showOnCard && card.fieldValues?.[field.id] !== undefined && card.fieldValues?.[field.id] !== null && card.fieldValues?.[field.id] !== ''
  );

  // Resolve label IDs to label objects
  const cardLabels = (card.labelIds || [])
    .map((id) => boardLabels.find((l) => l.id === id))
    .filter(Boolean) as Label[];

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={cn('kanban-card group', snapshot.isDragging && 'kanban-card-dragging')}
        >
          {/* Labels */}
          {cardLabels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {cardLabels.map((label) => (
                <span
                  key={label.id}
                  className={cn('px-2 py-0.5 rounded-full text-xs font-medium', getLabelClasses(label.color))}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h4 className="font-medium text-card-foreground text-sm leading-snug mb-2">{card.title}</h4>

          {/* Description preview */}
          {card.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{card.description}</p>
          )}

          {/* Custom Field Previews */}
          {visibleFields.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {visibleFields.map((field) => {
                const value = card.fieldValues?.[field.id];
                const Icon = fieldTypeIcons[field.type];
                const badgeColor = fieldBadgeColors[field.type] || 'bg-muted text-muted-foreground border-muted';
                let displayValue: string;
                if (field.type === 'checkbox') {
                  displayValue = value ? 'Sim' : 'Não';
                } else if (field.type === 'date' && value) {
                  try {
                    displayValue = format(parseISO(value as string), 'dd/MM', { locale: ptBR });
                  } catch {
                    displayValue = String(value);
                  }
                } else {
                  displayValue = String(value);
                }
                return (
                  <span key={field.id} className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs border font-medium', badgeColor)}>
                    {field.type === 'checkbox' ? (value ? <Check className="w-3 h-3" /> : <XIcon className="w-3 h-3" />) : <Icon className="w-3 h-3" />}
                    <span className="font-medium truncate max-w-[80px]" title={`${field.name}: ${displayValue}`}>{displayValue}</span>
                  </span>
                );
              })}
            </div>
          )}

          {/* Footer with metadata */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {card.priority && (
                <span className={cn('flex items-center gap-1 px-1.5 py-0.5 rounded', priorityColors[card.priority])}>
                  <Flag className="w-3 h-3" />
                </span>
              )}
              {card.dueDate && (() => {
                const date = parseISO(card.dueDate);
                const isComplete = card.dueComplete;
                const isOverdue = !isComplete && isPast(date) && !isToday(date);
                const isWarning = !isComplete && !isOverdue && differenceInDays(date, new Date()) <= 2;
                return (
                  <span className={cn(
                    'flex items-center gap-1 px-1.5 py-0.5 rounded',
                    isComplete && 'bg-emerald-100 text-emerald-700 line-through',
                    isOverdue && 'bg-red-100 text-red-700',
                    isWarning && 'bg-amber-100 text-amber-700',
                    !isComplete && !isOverdue && !isWarning && 'text-muted-foreground'
                  )}>
                    {isOverdue ? <AlertTriangle className="w-3 h-3" /> : isComplete ? <CheckCircle2 className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                    {format(date, 'dd/MM', { locale: ptBR })}
                  </span>
                );
              })()}
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
