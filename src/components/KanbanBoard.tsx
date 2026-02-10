import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Plus, Search, Filter, X, Tag } from 'lucide-react';
import { KanbanColumn } from './KanbanColumn';
import { CardModal } from './CardModal';
import { NewCardModal } from './NewCardModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { KanbanBoard as KanbanBoardType, KanbanCard } from '@/types/kanban';
import { useKanbanStore } from '@/store/kanbanStore';
import { useState, useRef, useEffect, useMemo } from 'react';
import { getLabelClasses, labelSwatchClasses } from '@/lib/labelColors';
import { cn } from '@/lib/utils';

interface KanbanBoardProps {
  board: KanbanBoardType;
}

export function KanbanBoard({ board }: KanbanBoardProps) {
  const { moveCard, addColumn } = useKanbanStore();
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isNewCardModalOpen, setIsNewCardModalOpen] = useState(false);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const columnInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAddingColumn && columnInputRef.current) {
      columnInputRef.current.focus();
    }
  }, [isAddingColumn]);

  // Filter cards based on search query AND selected labels
  const filteredColumns = useMemo(() => {
    const hasSearch = searchQuery.trim().length > 0;
    const hasLabelFilter = selectedLabelIds.length > 0;

    if (!hasSearch && !hasLabelFilter) return board.columns;

    const query = searchQuery.toLowerCase();

    return board.columns.map((column) => ({
      ...column,
      cards: column.cards.filter((card) => {
        const matchesSearch =
          !hasSearch ||
          card.title.toLowerCase().includes(query) ||
          card.description?.toLowerCase().includes(query);

        const matchesLabels =
          !hasLabelFilter ||
          selectedLabelIds.some((id) => card.labelIds?.includes(id));

        return matchesSearch && matchesLabels;
      }),
    }));
  }, [board.columns, searchQuery, selectedLabelIds]);

  const totalCards = board.columns.reduce((acc, col) => acc + col.cards.length, 0);
  const filteredCardCount = filteredColumns.reduce((acc, col) => acc + col.cards.length, 0);
  const isFiltering = searchQuery.trim().length > 0 || selectedLabelIds.length > 0;

  const toggleLabelFilter = (labelId: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    );
  };

  const clearFilters = () => {
    setSelectedLabelIds([]);
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    moveCard(draggableId, source.droppableId, destination.droppableId, source.index, destination.index);
  };

  const handleCardClick = (card: KanbanCard) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      addColumn(board.id, newColumnTitle.trim());
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  const handleColumnKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddColumn();
    if (e.key === 'Escape') { setIsAddingColumn(false); setNewColumnTitle(''); }
  };

  const getCardFromBoard = (cardId: string): KanbanCard | null => {
    for (const column of board.columns) {
      const found = column.cards.find((c) => c.id === cardId);
      if (found) return found;
    }
    return null;
  };

  const currentCard = selectedCard ? getCardFromBoard(selectedCard.id) : null;

  return (
    <div className="flex flex-col h-full">
      {/* Board Header */}
      <div className="px-6 py-4 border-b border-border bg-card/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{board.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isFiltering
                ? `${filteredCardCount} de ${totalCards} cards`
                : `${totalCards} cards em ${board.columns.length} colunas`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={selectedLabelIds.length > 0 ? 'default' : 'outline'} size="sm" className="relative">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrar
                  {selectedLabelIds.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {selectedLabelIds.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-0 bg-popover z-50" align="end">
                <div className="p-3 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">Filtrar por Etiqueta</span>
                    </div>
                    {selectedLabelIds.length > 0 && (
                      <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground">Limpar</button>
                    )}
                  </div>
                </div>
                <div className="p-2 max-h-64 overflow-y-auto">
                  {board.labels.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhuma etiqueta encontrada</p>
                  ) : (
                    <div className="space-y-1">
                      {board.labels.map((label) => (
                        <label key={label.id} className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-muted cursor-pointer">
                          <Checkbox checked={selectedLabelIds.includes(label.id)} onCheckedChange={() => toggleLabelFilter(label.id)} />
                          <span className={cn('w-3 h-3 rounded-full', labelSwatchClasses[label.color] || 'bg-blue-500')} />
                          <span className="text-sm">{label.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <Button size="sm" onClick={() => setIsNewCardModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />Novo Card
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar cards..." className="pl-10 bg-background" />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full">
            {filteredColumns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                onCardClick={handleCardClick}
                fieldDefinitions={board.fieldDefinitions}
                boardLabels={board.labels}
              />
            ))}

            {/* Add Column Button */}
            <div className="w-80 flex-shrink-0">
              {isAddingColumn ? (
                <div className="bg-card rounded-xl border border-border p-4">
                  <Input ref={columnInputRef} value={newColumnTitle} onChange={(e) => setNewColumnTitle(e.target.value)} onKeyDown={handleColumnKeyDown} onBlur={() => { if (!newColumnTitle.trim()) setIsAddingColumn(false); }} placeholder="Nome da coluna..." className="mb-2" />
                  <p className="text-xs text-muted-foreground">Enter para criar • Esc para cancelar</p>
                </div>
              ) : (
                <button onClick={() => setIsAddingColumn(true)} className="w-full h-fit bg-muted/30 hover:bg-muted/50 border-2 border-dashed border-border hover:border-primary/30 rounded-xl p-4 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-all">
                  <Plus className="w-5 h-5" /><span className="font-medium">Adicionar Coluna</span>
                </button>
              )}
            </div>
          </div>
        </DragDropContext>
      </div>

      <CardModal card={currentCard} open={isModalOpen} onClose={handleCloseModal} />
      <NewCardModal open={isNewCardModalOpen} onClose={() => setIsNewCardModalOpen(false)} columns={board.columns} />
    </div>
  );
}
