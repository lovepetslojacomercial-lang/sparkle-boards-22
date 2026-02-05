import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, Search, Filter } from 'lucide-react';
import { KanbanColumn } from './KanbanColumn';
import { CardModal } from './CardModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KanbanBoard as KanbanBoardType, KanbanCard } from '@/types/kanban';
import { useKanbanStore } from '@/store/kanbanStore';
import { useState } from 'react';

interface KanbanBoardProps {
  board: KanbanBoardType;
}

export function KanbanBoard({ board }: KanbanBoardProps) {
  const { moveCard } = useKanbanStore();
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    moveCard(
      draggableId,
      source.droppableId,
      destination.droppableId,
      source.index,
      destination.index
    );
  };

  const handleCardClick = (card: KanbanCard) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  // Get fresh card data from the store when modal is open
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
              {board.columns.reduce((acc, col) => acc + col.cards.length, 0)} cards em {board.columns.length} colunas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Novo Card
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cards..."
            className="pl-10 bg-background"
          />
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full">
            {board.columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                onCardClick={handleCardClick}
                fieldDefinitions={board.fieldDefinitions}
              />
            ))}

            {/* Add Column Button */}
            <button className="w-80 flex-shrink-0 h-fit bg-muted/30 hover:bg-muted/50 border-2 border-dashed border-border hover:border-primary/30 rounded-xl p-4 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-all">
              <Plus className="w-5 h-5" />
              <span className="font-medium">Adicionar Coluna</span>
            </button>
          </div>
        </DragDropContext>
      </div>

      {/* Card Modal */}
      <CardModal
        card={currentCard}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}