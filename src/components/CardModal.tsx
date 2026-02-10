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
  AlertTriangle,
  CheckCircle2,
  Pencil,
  Check,
  Tag,
} from 'lucide-react';
import { KanbanCard, FieldDefinition, FieldType, FieldValue, Label } from '@/types/kanban';
import { useKanbanStore } from '@/store/kanbanStore';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { format, parseISO, differenceInDays, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getLabelClasses, LABEL_COLOR_OPTIONS, labelSwatchClasses } from '@/lib/labelColors';

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
  const { getCurrentBoard, addFieldDefinition, setCardFieldValue, updateCard, deleteFieldDefinition, toggleCardLabel, addLabel, updateLabel, deleteLabel } = useKanbanStore();
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('text');
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [showOnCard, setShowOnCard] = useState(true);
  const [isLabelPopoverOpen, setIsLabelPopoverOpen] = useState(false);
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('blue');
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editLabelName, setEditLabelName] = useState('');
  const [editLabelColor, setEditLabelColor] = useState('');

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
    updateCard(card.id, { dueDate, dueComplete: false });
  };

  const handleDueCompleteToggle = (checked: boolean) => {
    updateCard(card.id, { dueComplete: checked });
  };

  const handleRemoveDueDate = () => {
    updateCard(card.id, { dueDate: undefined, dueComplete: undefined });
  };

  const getDueDateStatus = () => {
    if (!card.dueDate) return null;
    if (card.dueComplete) return 'complete';
    const date = parseISO(card.dueDate);
    if (isPast(date) && !isToday(date)) return 'overdue';
    const daysLeft = differenceInDays(date, new Date());
    if (daysLeft <= 2) return 'warning';
    return 'normal';
  };

  const dueDateStatus = getDueDateStatus();

  const handleCreateLabel = () => {
    if (!board || !newLabelName.trim()) return;
    addLabel(board.id, { name: newLabelName.trim(), color: newLabelColor });
    setNewLabelName('');
    setNewLabelColor('blue');
    setIsCreatingLabel(false);
  };

  const handleStartEditLabel = (label: Label) => {
    setEditingLabelId(label.id);
    setEditLabelName(label.name);
    setEditLabelColor(label.color);
  };

  const handleSaveEditLabel = () => {
    if (!board || !editingLabelId || !editLabelName.trim()) return;
    updateLabel(board.id, editingLabelId, { name: editLabelName.trim(), color: editLabelColor });
    setEditingLabelId(null);
  };

  const handleDeleteLabel = (labelId: string) => {
    if (!board) return;
    deleteLabel(board.id, labelId);
  };

  const cardLabelIds = card.labelIds || [];
  const boardLabels = board?.labels || [];

  const renderFieldInput = (field: FieldDefinition) => {
    const value = card.fieldValues?.[field.id];
    switch (field.type) {
      case 'text':
        return <Input value={(value as string) || ''} onChange={(e) => handleFieldValueChange(field.id, e.target.value)} placeholder="Digite..." className="h-8 flex-1" />;
      case 'number':
        return <Input type="number" value={(value as number) ?? ''} onChange={(e) => handleFieldValueChange(field.id, e.target.value ? Number(e.target.value) : null)} placeholder="0" className="h-8 flex-1" />;
      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn('h-8 flex-1 justify-start text-left font-normal', !value && 'text-muted-foreground')}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(parseISO(value as string), 'PPP', { locale: ptBR }) : 'Selecione...'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent mode="single" selected={value ? parseISO(value as string) : undefined} onSelect={(date) => handleFieldValueChange(field.id, date ? format(date, 'yyyy-MM-dd') : null)} locale={ptBR} initialFocus className="p-3 pointer-events-auto" />
            </PopoverContent>
          </Popover>
        );
      case 'checkbox':
        return (
          <div className="flex items-center gap-3 flex-1">
            <Switch checked={Boolean(value)} onCheckedChange={(checked) => handleFieldValueChange(field.id, checked)} />
            <span className="text-sm text-muted-foreground">{value ? 'Marcado' : 'Não marcado'}</span>
          </div>
        );
      case 'select':
        return (
          <Select value={(value as string) || ''} onValueChange={(v) => handleFieldValueChange(field.id, v)}>
            <SelectTrigger className="h-8 flex-1"><SelectValue placeholder="Selecione..." /></SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {field.options?.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
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
          <DialogTitle className="text-xl font-semibold pr-8">{card.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Labels Section */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Tag className="w-4 h-4" />
              Etiquetas
            </h4>
            <div className="flex flex-wrap gap-2 items-center">
              {cardLabelIds.map((labelId) => {
                const label = boardLabels.find((l) => l.id === labelId);
                if (!label) return null;
                return (
                  <Badge
                    key={label.id}
                    className={cn('cursor-pointer transition-all text-xs', getLabelClasses(label.color))}
                    onClick={() => toggleCardLabel(card.id, label.id)}
                  >
                    {label.name}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                );
              })}
              <Popover open={isLabelPopoverOpen} onOpenChange={(o) => { setIsLabelPopoverOpen(o); if (!o) { setIsCreatingLabel(false); setEditingLabelId(null); } }}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-6 text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    Etiquetas
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0 bg-popover z-50" align="start">
                  <div className="p-3 border-b border-border">
                    <span className="font-medium text-sm">Etiquetas</span>
                  </div>

                  {/* Label list with checkboxes */}
                  <div className="p-2 max-h-60 overflow-y-auto space-y-1">
                    {boardLabels.map((label) => {
                      if (editingLabelId === label.id) {
                        return (
                          <div key={label.id} className="p-2 rounded-md bg-muted/50 space-y-2">
                            <Input value={editLabelName} onChange={(e) => setEditLabelName(e.target.value)} className="h-8 text-sm" autoFocus />
                            <div className="flex flex-wrap gap-1.5">
                              {LABEL_COLOR_OPTIONS.map((c) => (
                                <button key={c} onClick={() => setEditLabelColor(c)} className={cn('w-6 h-6 rounded-full transition-all', labelSwatchClasses[c], editLabelColor === c && 'ring-2 ring-offset-2 ring-primary')} />
                              ))}
                            </div>
                            <div className="flex gap-1.5">
                              <Button size="sm" className="h-7 flex-1 text-xs" onClick={handleSaveEditLabel} disabled={!editLabelName.trim()}>
                                <Check className="w-3 h-3 mr-1" /> Salvar
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditingLabelId(null)}>Cancelar</Button>
                            </div>
                          </div>
                        );
                      }
                      const isApplied = cardLabelIds.includes(label.id);
                      return (
                        <div key={label.id} className="flex items-center gap-2 px-1 py-1 rounded-md hover:bg-muted group">
                          <Checkbox checked={isApplied} onCheckedChange={() => toggleCardLabel(card.id, label.id)} />
                          <button
                            onClick={() => toggleCardLabel(card.id, label.id)}
                            className={cn('flex-1 text-left px-2 py-1 rounded text-xs font-medium transition-all', getLabelClasses(label.color))}
                          >
                            {label.name}
                          </button>
                          <button onClick={() => handleStartEditLabel(label)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted-foreground/10 text-muted-foreground transition-all">
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleDeleteLabel(label.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Create new label */}
                  <div className="p-2 border-t border-border">
                    {isCreatingLabel ? (
                      <div className="space-y-2">
                        <Input value={newLabelName} onChange={(e) => setNewLabelName(e.target.value)} placeholder="Nome da etiqueta" className="h-8 text-sm" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') handleCreateLabel(); }} />
                        <div className="flex flex-wrap gap-1.5">
                          {LABEL_COLOR_OPTIONS.map((c) => (
                            <button key={c} onClick={() => setNewLabelColor(c)} className={cn('w-6 h-6 rounded-full transition-all', labelSwatchClasses[c], newLabelColor === c && 'ring-2 ring-offset-2 ring-primary')} />
                          ))}
                        </div>
                        <div className="flex gap-1.5">
                          <Button size="sm" className="h-7 flex-1 text-xs" onClick={handleCreateLabel} disabled={!newLabelName.trim()}>Criar</Button>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setIsCreatingLabel(false)}>Cancelar</Button>
                        </div>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => setIsCreatingLabel(true)}>
                        <Plus className="w-3 h-3 mr-1" /> Criar Nova Etiqueta
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h4>
            <Textarea value={card.description || ''} onChange={(e) => handleDescriptionChange(e.target.value)} placeholder="Adicione uma descrição mais detalhada..." className="min-h-[100px] resize-none" />
          </div>

          <Separator />

          {/* Metadata Row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Assignee */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1"><User className="w-4 h-4" />Responsável</h4>
              <Input value={card.assignee || ''} onChange={(e) => handleAssigneeChange(e.target.value)} placeholder="Selecionar..." className="h-9" />
            </div>

            {/* Due Date */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                Data de Entrega
                {dueDateStatus === 'overdue' && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                {dueDateStatus === 'complete' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              </h4>
              <div className="space-y-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn(
                      'w-full h-9 justify-start text-left font-normal',
                      !card.dueDate && 'text-muted-foreground',
                      dueDateStatus === 'overdue' && 'border-red-300 text-red-600 bg-red-50 hover:bg-red-100',
                      dueDateStatus === 'warning' && 'border-amber-300 text-amber-600 bg-amber-50 hover:bg-amber-100',
                      dueDateStatus === 'complete' && 'border-emerald-300 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 line-through'
                    )}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {card.dueDate ? format(parseISO(card.dueDate), 'PPP', { locale: ptBR }) : 'Selecione...'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent mode="single" selected={card.dueDate ? parseISO(card.dueDate) : undefined} onSelect={(date) => handleDueDateChange(date ? format(date, 'yyyy-MM-dd') : '')} locale={ptBR} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
                {card.dueDate && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="dueComplete" checked={card.dueComplete || false} onCheckedChange={handleDueCompleteToggle} />
                      <label htmlFor="dueComplete" className="text-xs text-muted-foreground cursor-pointer">Prazo concluído</label>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-muted-foreground hover:text-destructive" onClick={handleRemoveDueDate}>
                      <X className="w-3 h-3 mr-1" />Remover data
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Priority */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1"><Flag className="w-4 h-4" />Prioridade</h4>
              <div className="flex gap-1">
                {(['low', 'medium', 'high'] as const).map((priority) => (
                  <button key={priority} onClick={() => handlePriorityChange(priority)} className={cn(
                    'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                    card.priority === priority ? priorityLabels[priority].color + ' ring-2 ring-offset-1 ring-primary/30' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  )}>
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
              <h4 className="text-sm font-medium text-muted-foreground">Campos Personalizados</h4>
            </div>

            {board?.fieldDefinitions && board.fieldDefinitions.length > 0 && (
              <div className="space-y-3 mb-4">
                {board.fieldDefinitions.map((field) => {
                  const IconComponent = fieldTypeIcons[field.type] || Type;
                  return (
                    <div key={field.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg group">
                      <IconComponent className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium min-w-[120px]">
                        {field.name}
                        {field.showOnCard && <span className="ml-1 text-xs text-primary">●</span>}
                      </span>
                      {renderFieldInput(field)}
                      <button onClick={() => deleteFieldDefinition(board.id, field.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Property Button */}
            <Popover open={isAddingField} onOpenChange={setIsAddingField}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all">
                  <Plus className="w-4 h-4 mr-2" />Adicionar Propriedade
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4 bg-popover z-50" align="start">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm">Nova Propriedade</h4>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Nome do Campo</label>
                    <Input value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} placeholder="Ex: Status do Cliente" className="h-9" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Tipo</label>
                    <div className="grid grid-cols-5 gap-1">
                      {(Object.keys(fieldTypeIcons) as FieldType[]).map((type) => {
                        const Icon = fieldTypeIcons[type];
                        return (
                          <button key={type} onClick={() => setNewFieldType(type)} className={cn(
                            'flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all',
                            newFieldType === type ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                          )}>
                            <Icon className="w-4 h-4" />
                            <span className="text-[10px]">{fieldTypeLabels[type]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {newFieldType === 'select' && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Opções (separadas por vírgula)</label>
                      <Input value={newFieldOptions} onChange={(e) => setNewFieldOptions(e.target.value)} placeholder="Alta, Média, Baixa" className="h-9" />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Checkbox id="showOnCard" checked={showOnCard} onCheckedChange={(checked) => setShowOnCard(Boolean(checked))} />
                    <label htmlFor="showOnCard" className="text-sm">Mostrar no card (preview)</label>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsAddingField(false)} className="flex-1">Cancelar</Button>
                    <Button size="sm" onClick={handleAddField} disabled={!newFieldName.trim()} className="flex-1">Criar Campo</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {board?.fieldDefinitions && board.fieldDefinitions.length > 0 && (
              <p className="text-xs text-muted-foreground mt-3"><span className="text-primary">●</span> = Visível no card</p>
            )}
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
