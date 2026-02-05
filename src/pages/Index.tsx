import { AppSidebar } from '@/components/AppSidebar';
import { KanbanBoard } from '@/components/KanbanBoard';
import { useKanbanStore } from '@/store/kanbanStore';

const Index = () => {
  const { activeBoard, setActiveBoard, getCurrentBoard } = useKanbanStore();
  const currentBoard = getCurrentBoard();

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar activeBoard={activeBoard} onBoardSelect={setActiveBoard} />
      <main className="flex-1 overflow-hidden">
        {currentBoard && currentBoard.columns.length > 0 ? (
          <KanbanBoard board={currentBoard} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {currentBoard?.name || 'Selecione um quadro'}
              </h2>
              <p className="text-muted-foreground">
                Este quadro ainda não possui colunas. Clique em "Adicionar Coluna" para começar.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
