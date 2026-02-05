import { Calendar, User, Flag } from 'lucide-react';
import { KanbanCard as KanbanCardType } from '@/types/kanban';
import { cn } from '@/lib/utils';
import { Draggable } from '@hello-pangea/dnd';

interface KanbanCardProps {
  card: KanbanCardType;
  index: number;
  onClick: () => void;
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

export function KanbanCard({ card, index, onClick }: KanbanCardProps) {
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
                  {card.dueDate}
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