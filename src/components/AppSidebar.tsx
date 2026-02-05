import { useState } from 'react';
import {
  LayoutDashboard,
  Folders,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  Kanban,
} from 'lucide-react';
import { useKanbanStore } from '@/store/kanbanStore';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  activeBoard: string;
  onBoardSelect: (boardId: string) => void;
}

export function AppSidebar({ activeBoard, onBoardSelect }: AppSidebarProps) {
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<string[]>(['workspace-1']);
  const { workspaces } = useKanbanStore();

  const toggleWorkspace = (workspaceId: string) => {
    setExpandedWorkspaces((prev) =>
      prev.includes(workspaceId)
        ? prev.filter((id) => id !== workspaceId)
        : [...prev, workspaceId]
    );
  };

  return (
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
            <button className="p-1 rounded hover:bg-sidebar-accent transition-colors">
              <Plus className="w-3.5 h-3.5 text-sidebar-muted" />
            </button>
          </div>

          {workspaces.map((workspace) => (
            <div key={workspace.id} className="space-y-0.5">
              <button
                onClick={() => toggleWorkspace(workspace.id)}
                className="sidebar-nav-item w-full"
              >
                {expandedWorkspaces.includes(workspace.id) ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
                <Folders className="w-4 h-4" />
                <span className="truncate">{workspace.name}</span>
              </button>

              {/* Boards within workspace */}
              {expandedWorkspaces.includes(workspace.id) && (
                <div className="ml-4 pl-4 border-l border-sidebar-border space-y-0.5 animate-fade-in">
                  {workspace.boards.map((board) => (
                    <button
                      key={board.id}
                      onClick={() => onBoardSelect(board.id)}
                      className={cn(
                        'sidebar-nav-item w-full text-sm',
                        activeBoard === board.id && 'sidebar-nav-item-active'
                      )}
                    >
                      <Kanban className="w-3.5 h-3.5" />
                      <span className="truncate">{board.name}</span>
                    </button>
                  ))}
                  <button className="sidebar-nav-item w-full text-sm text-sidebar-muted hover:text-sidebar-accent-foreground">
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
  );
}