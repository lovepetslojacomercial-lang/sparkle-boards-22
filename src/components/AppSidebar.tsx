import { useState } from 'react';
import {
  LayoutDashboard,
  Folders,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  Kanban,
  Trash2,
} from 'lucide-react';
import { useKanbanStore } from '@/store/kanbanStore';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface AppSidebarProps {
  activeBoard: string;
  onBoardSelect: (boardId: string) => void;
}

export function AppSidebar({ activeBoard, onBoardSelect }: AppSidebarProps) {
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<string[]>(['workspace-1']);
  const { workspaces, addWorkspace, addBoard, deleteBoard, deleteWorkspace } = useKanbanStore();

  // Modal states
  const [showNewWorkspace, setShowNewWorkspace] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');

  const [showNewBoard, setShowNewBoard] = useState(false);
  const [newBoardWorkspaceId, setNewBoardWorkspaceId] = useState('');
  const [boardName, setBoardName] = useState('');

  const [boardToDelete, setBoardToDelete] = useState<{ id: string; name: string } | null>(null);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<{ id: string; name: string } | null>(null);

  const toggleWorkspace = (workspaceId: string) => {
    setExpandedWorkspaces((prev) =>
      prev.includes(workspaceId)
        ? prev.filter((id) => id !== workspaceId)
        : [...prev, workspaceId]
    );
  };

  const handleCreateWorkspace = () => {
    const trimmed = workspaceName.trim();
    if (!trimmed) return;
    addWorkspace(trimmed);
    setWorkspaceName('');
    setShowNewWorkspace(false);
    toast.success('Workspace criado com sucesso!');
  };

  const handleOpenNewBoard = (workspaceId: string) => {
    setNewBoardWorkspaceId(workspaceId);
    setBoardName('');
    setShowNewBoard(true);
  };

  const handleCreateBoard = () => {
    const trimmed = boardName.trim();
    if (!trimmed) return;
    addBoard(newBoardWorkspaceId, trimmed);
    setBoardName('');
    setShowNewBoard(false);
    toast.success('Quadro criado com sucesso!');
  };

  const handleDeleteWorkspace = () => {
    if (!workspaceToDelete) return;
    deleteWorkspace(workspaceToDelete.id);
    setWorkspaceToDelete(null);
    toast.success('Workspace deletado com sucesso!');
  };

  const handleDeleteBoard = () => {
    if (!boardToDelete) return;
    deleteBoard(boardToDelete.id);
    setBoardToDelete(null);
    toast.success('Quadro deletado com sucesso!');
  };

  return (
    <>
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col h-screen border-r border-sidebar-border">
        {/* Logo / Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Kanban className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-accent-foreground text-lg">
              TaskFlow
            </span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* Quick Links */}
          <div className="mb-4">
            <button className="sidebar-nav-item w-full">
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          </div>

          {/* Workspaces Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-medium uppercase tracking-wider text-sidebar-muted">
                Workspaces
              </span>
              <button
                onClick={() => { setWorkspaceName(''); setShowNewWorkspace(true); }}
                className="p-1 rounded hover:bg-sidebar-accent transition-colors"
                title="Novo Workspace"
              >
                <Plus className="w-3.5 h-3.5 text-sidebar-muted" />
              </button>
            </div>

            {workspaces.map((workspace) => (
              <div key={workspace.id} className="space-y-0.5">
                <div className="group flex items-center gap-1">
                  <button
                    onClick={() => toggleWorkspace(workspace.id)}
                    className="sidebar-nav-item flex-1"
                  >
                    {expandedWorkspaces.includes(workspace.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <Folders className="w-4 h-4" />
                    <span className="truncate">{workspace.name}</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setWorkspaceToDelete({ id: workspace.id, name: workspace.name });
                    }}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 transition-all"
                    title="Deletar workspace"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>

                {/* Boards within workspace */}
                {expandedWorkspaces.includes(workspace.id) && (
                  <div className="ml-4 pl-4 border-l border-sidebar-border space-y-0.5 animate-fade-in">
                    {workspace.boards.map((board) => (
                      <div
                        key={board.id}
                        className={cn(
                          'group flex items-center gap-1',
                        )}
                      >
                        <button
                          onClick={() => onBoardSelect(board.id)}
                          className={cn(
                            'sidebar-nav-item flex-1 text-sm',
                            activeBoard === board.id && 'sidebar-nav-item-active'
                          )}
                        >
                          <Kanban className="w-3.5 h-3.5" />
                          <span className="truncate">{board.name}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBoardToDelete({ id: board.id, name: board.name });
                          }}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/20 transition-all"
                          title="Deletar quadro"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => handleOpenNewBoard(workspace.id)}
                      className="sidebar-nav-item w-full text-sm text-sidebar-muted hover:text-sidebar-accent-foreground"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Novo Quadro</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Footer / Settings */}
        <div className="p-3 border-t border-sidebar-border">
          <button className="sidebar-nav-item w-full">
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </button>
        </div>
      </aside>

      {/* New Workspace Modal */}
      <Dialog open={showNewWorkspace} onOpenChange={setShowNewWorkspace}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Workspace</DialogTitle>
            <DialogDescription>Crie um workspace para organizar seus quadros.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="ws-name">Nome *</Label>
              <Input
                id="ws-name"
                placeholder="Ex: Minha Equipe"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
                maxLength={50}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewWorkspace(false)}>Cancelar</Button>
            <Button onClick={handleCreateWorkspace} disabled={!workspaceName.trim()}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Board Modal */}
      <Dialog open={showNewBoard} onOpenChange={setShowNewBoard}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Quadro</DialogTitle>
            <DialogDescription>Adicione um quadro ao workspace.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="board-name">Título *</Label>
              <Input
                id="board-name"
                placeholder="Ex: Sprint Q2"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
                maxLength={50}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewBoard(false)}>Cancelar</Button>
            <Button onClick={handleCreateBoard} disabled={!boardName.trim()}>Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Board Confirmation */}
      <AlertDialog open={!!boardToDelete} onOpenChange={(open) => !open && setBoardToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar quadro</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o quadro <strong>"{boardToDelete?.name}"</strong>? Todos os cards e colunas serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBoard} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Workspace Confirmation */}
      <AlertDialog open={!!workspaceToDelete} onOpenChange={(open) => !open && setWorkspaceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar o workspace <strong>"{workspaceToDelete?.name}"</strong>? Todos os quadros, colunas e cards dentro dele serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWorkspace} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
