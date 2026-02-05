import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calendar,
  User,
  Flag,
  Plus,
  X,
  Type,
  Hash,
  CalendarDays,
  List,
  CheckSquare,
} from 'lucide-react';
import { KanbanCard } from '@/types/kanban';
import { cn } from '@/lib/utils';

interface CardModalProps {
  card: KanbanCard | null;
  open: boolean;
  onClose: () => void;
}

const priorityLabels = {
  low: { label: 'Baixa', color: 'bg-muted text-muted-foreground' },
  medium: { label: 'Média', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'Alta', color: 'bg-red-100 text-red-700' },
};

const labelColors: Record<string, string> = {
  setup: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
  tech: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  design: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
  ui: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
  frontend: 'bg-cyan-100 text-cyan-700 hover:bg-cyan-200',
  component: 'bg-teal-100 text-teal-700 hover:bg-teal-200',
  feature: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  docs: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  testing: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
};

const fieldTypeIcons = {
  text: Type,
  number: Hash,
  date: CalendarDays,
  select: List,
  checkbox: CheckSquare,
};

export function CardModal({ card, open, onClose }: CardModalProps) {
  if (!card) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold pr-8">
            {card.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Labels Section */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Etiquetas
            </h4>
            <div className="flex flex-wrap gap-2">
              {card.labels?.map((label) => (
                <Badge
                  key={label}
                  variant="secondary"
                  className={cn(
                    'cursor-pointer transition-colors',
                    labelColors[label]
                  )}
                >
                  {label}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
              <Button variant="outline" size="sm" className="h-6 text-xs">
                <Plus className="w-3 h-3 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Descrição
            </h4>
            <Textarea
              defaultValue={card.description}
              placeholder="Adicione uma descrição mais detalhada..."
              className="min-h-[100px] resize-none"
            />
          </div>

          <Separator />

          {/* Metadata Row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Assignee */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <User className="w-4 h-4" />
                Responsável
              </h4>
              <Input
                defaultValue={card.assignee || ''}
                placeholder="Selecionar..."
                className="h-9"
              />
            </div>

            {/* Due Date */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Data de Entrega
              </h4>
              <Input
                type="date"
                defaultValue={card.dueDate}
                className="h-9"
              />
            </div>

            {/* Priority */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Flag className="w-4 h-4" />
                Prioridade
              </h4>
              <div className="flex gap-1">
                {(['low', 'medium', 'high'] as const).map((priority) => (
                  <button
                    key={priority}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                      card.priority === priority
                        ? priorityLabels[priority].color + ' ring-2 ring-offset-1 ring-primary/30'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {priorityLabels[priority].label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Custom Fields Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Campos Personalizados
              </h4>
            </div>

            {/* Existing Custom Fields */}
            {card.customFields && card.customFields.length > 0 && (
              <div className="space-y-3 mb-4">
                {card.customFields.map((field) => {
                  const IconComponent = fieldTypeIcons[field.type];
                  return (
                    <div
                      key={field.id}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                    >
                      <IconComponent className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium min-w-[100px]">
                        {field.name}
                      </span>
                      <Input
                        defaultValue={String(field.value)}
                        className="h-8 flex-1"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Property Button - The Differential */}
            <Button
              variant="outline"
              className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Propriedade
            </Button>

            {/* Field Type Hints */}
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(fieldTypeIcons).map(([type, Icon]) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground bg-muted/50 rounded"
                >
                  <Icon className="w-3 h-3" />
                  {type === 'text' && 'Texto'}
                  {type === 'number' && 'Número'}
                  {type === 'date' && 'Data'}
                  {type === 'select' && 'Seleção'}
                  {type === 'checkbox' && 'Checkbox'}
                </span>
              ))}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button>
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}