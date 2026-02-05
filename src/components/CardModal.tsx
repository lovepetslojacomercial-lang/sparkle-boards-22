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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  User,
  Flag,
  Plus,
  X,
  Type,
  Hash,
  CalendarDays,
  List,
  CheckSquare,
  Trash2,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { KanbanCard, FieldDefinition, FieldType, FieldValue } from '@/types/kanban';
import { useKanbanStore } from '@/store/kanbanStore';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

const fieldTypeIcons: Record<FieldType, React.ElementType> = {
  text: Type,
  number: Hash,
  date: CalendarDays,
  select: List,
  checkbox: CheckSquare,
};

const fieldTypeLabels: Record<FieldType, string> = {
  text: 'Texto',
  number: 'Número',
  date: 'Data',
  select: 'Seleção',
  checkbox: 'Checkbox',
};

export function CardModal({ card, open, onClose }: CardModalProps) {
  const { getCurrentBoard, addFieldDefinition, setCardFieldValue, updateCard, deleteFieldDefinition } = useKanbanStore();
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('text');
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [showOnCard, setShowOnCard] = useState(true);

  const board = getCurrentBoard();

  if (!card) return null;

  const handleAddField = () => {
    if (!board || !newFieldName.trim()) return;

    const field: Omit<FieldDefinition, 'id'> = {
      name: newFieldName.trim(),
      type: newFieldType,
      showOnCard,
      ...(newFieldType === 'select' && {
        options: newFieldOptions.split(',').map((o) => o.trim()).filter(Boolean),
      }),
    };

    addFieldDefinition(board.id, field);
    setNewFieldName('');
    setNewFieldType('text');
    setNewFieldOptions('');
    setShowOnCard(true);
    setIsAddingField(false);
  };

  const handleFieldValueChange = (fieldId: string, value: FieldValue) => {
    setCardFieldValue(card.id, fieldId, value);
  };

  const handlePriorityChange = (priority: 'low' | 'medium' | 'high') => {
    updateCard(card.id, { priority });
  };

  const handleDescriptionChange = (description: string) => {
    updateCard(card.id, { description });
  };

  const handleAssigneeChange = (assignee: string) => {
    updateCard(card.id, { assignee });
  };

  const handleDueDateChange = (dueDate: string) => {
    updateCard(card.id, { dueDate });
  };

  const renderFieldInput = (field: FieldDefinition) => {
    const value = card.fieldValues?.[field.id];

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={(value as string) || ''}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
            placeholder="Digite..."
            className="h-8 flex-1"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={(value as number) ?? ''}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value ? Number(e.target.value) : null)}
            placeholder="0"
            className="h-8 flex-1"
          />
        );
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'h-8 flex-1 justify-start text-left font-normal',
                  !value && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(parseISO(value as string), 'PPP', { locale: ptBR }) : 'Selecione...'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={value ? parseISO(value as string) : undefined}
                onSelect={(date) =>
                  handleFieldValueChange(field.id, date ? format(date, 'yyyy-MM-dd') : null)
                }
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );
      case 'checkbox':
        return (
          <div className="flex items-center gap-3 flex-1">
            <Switch
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleFieldValueChange(field.id, checked)}
            />
            <span className="text-sm text-muted-foreground">
              {value ? 'Marcado' : 'Não marcado'}
            </span>
          </div>
        );
      case 'select':
        return (
          <Select
            value={(value as string) || ''}
            onValueChange={(v) => handleFieldValueChange(field.id, v)}
          >
            <SelectTrigger className="h-8 flex-1">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return null;
    }
  };

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
              value={card.description || ''}
              onChange={(e) => handleDescriptionChange(e.target.value)}
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
                value={card.assignee || ''}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                placeholder="Selecionar..."
                className="h-9"
              />
            </div>

            {/* Due Date */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                Data de Entrega
              </h4>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full h-9 justify-start text-left font-normal',
                      !card.dueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {card.dueDate
                      ? format(parseISO(card.dueDate), 'PPP', { locale: ptBR })
                      : 'Selecione...'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={card.dueDate ? parseISO(card.dueDate) : undefined}
                    onSelect={(date) =>
                      handleDueDateChange(date ? format(date, 'yyyy-MM-dd') : '')
                    }
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
                    onClick={() => handlePriorityChange(priority)}
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

            {/* Board-level Custom Fields */}
            {board?.fieldDefinitions && board.fieldDefinitions.length > 0 && (
              <div className="space-y-3 mb-4">
                {board.fieldDefinitions.map((field) => {
                  const IconComponent = fieldTypeIcons[field.type] || Type;
                  return (
                    <div
                      key={field.id}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg group"
                    >
                      <IconComponent className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium min-w-[120px]">
                        {field.name}
                        {field.showOnCard && (
                          <span className="ml-1 text-xs text-primary">●</span>
                        )}
                      </span>
                      {renderFieldInput(field)}
                      <button
                        onClick={() => deleteFieldDefinition(board.id, field.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Property Button - The Differential */}
            <Popover open={isAddingField} onOpenChange={setIsAddingField}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Propriedade
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Nova Propriedade</h4>
                  
                  {/* Field Name */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Nome do Campo
                    </label>
                    <Input
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      placeholder="Ex: Status do Cliente"
                      className="h-9"
                    />
                  </div>
                  
                  {/* Field Type */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">
                      Tipo
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                      {(Object.keys(fieldTypeIcons) as FieldType[]).map((type) => {
                        const Icon = fieldTypeIcons[type];
                        return (
                          <button
                            key={type}
                            onClick={() => setNewFieldType(type)}
                            className={cn(
                              'flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all',
                              newFieldType === type
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                            )}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-[10px]">{fieldTypeLabels[type]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Options for Select type */}
                  {newFieldType === 'select' && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Opções (separadas por vírgula)
                      </label>
                      <Input
                        value={newFieldOptions}
                        onChange={(e) => setNewFieldOptions(e.target.value)}
                        placeholder="Alta, Média, Baixa"
                        className="h-9"
                      />
                    </div>
                  )}
                  
                  {/* Show on Card */}
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="showOnCard"
                      checked={showOnCard}
                      onCheckedChange={(checked) => setShowOnCard(Boolean(checked))}
                    />
                    <label htmlFor="showOnCard" className="text-sm">
                      Mostrar no card (preview)
                    </label>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingField(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddField}
                      disabled={!newFieldName.trim()}
                      className="flex-1"
                    >
                      Criar Campo
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Info about field visibility */}
            {board?.fieldDefinitions && board.fieldDefinitions.length > 0 && (
              <p className="text-xs text-muted-foreground mt-3">
                <span className="text-primary">●</span> = Visível no card
              </p>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}