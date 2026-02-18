import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  CalendarClock,
  Users,
} from 'lucide-react';
import { AppSidebar } from '@/components/AppSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useKanbanStore } from '@/store/kanbanStore';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { getLabelClasses } from '@/lib/labelColors';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { cn } from '@/lib/utils';

const PRIORITY_LABELS: Record<string, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { workspaces, activeBoard, setActiveBoard } = useKanbanStore();
  const allBoards = workspaces.flatMap((w) => w.boards);

  const handleBoardSelect = (boardId: string) => {
    setActiveBoard(boardId);
    navigate('/');
  };

  const [selectedBoard, setSelectedBoard] = useState<string>('all');
  const boardId = selectedBoard === 'all' ? undefined : selectedBoard;
  const metrics = useDashboardMetrics(boardId);

  const [loading, setLoading] = useState(false);
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  };

  const board = boardId ? allBoards.find((b) => b.id === boardId) : undefined;
  const allLabels = board ? board.labels : workspaces.flatMap((w) => w.boards.flatMap((b) => b.labels));

  const getLabelName = (id: string) => allLabels.find((l) => l.id === id)?.name || id;
  const getLabelColor = (id: string) => allLabels.find((l) => l.id === id)?.color || 'blue';

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar activeBoard={activeBoard} onBoardSelect={handleBoardSelect} />
    <div className="flex-1 overflow-y-auto bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedBoard} onValueChange={setSelectedBoard}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todos os quadros" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os quadros</SelectItem>
                {allBoards.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Total de Cards"
              value={metrics.totalCards}
              icon={<LayoutGrid className="w-5 h-5" />}
              accent="primary"
            />
            <KpiCard
              title="Concluídos"
              value={metrics.completedCards}
              subtitle={`${metrics.completionRate}% concluído`}
              icon={<CheckCircle2 className="w-5 h-5" />}
              accent="green"
            />
            <KpiCard
              title="Em Andamento"
              value={metrics.inProgressCards}
              subtitle="WIP"
              icon={<Clock className="w-5 h-5" />}
              accent="blue"
            />
            <KpiCard
              title="Atrasados"
              value={metrics.overdueCards}
              icon={<AlertTriangle className="w-5 h-5" />}
              accent={metrics.overdueCards > 0 ? 'red' : 'muted'}
            />
          </div>
        )}

        {/* Charts Row */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart - Status */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Distribuição por Status</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.cardsByStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={metrics.cardsByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {metrics.cardsByStatus.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState text="Nenhum card encontrado" />
                )}
              </CardContent>
            </Card>

            {/* Bar Chart - Labels */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Cards por Etiqueta</CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.cardsByLabel.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={metrics.cardsByLabel} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {metrics.cardsByLabel.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState text="Nenhuma etiqueta aplicada" />
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Workload + Lists Row */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Assignee workload */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4" /> Carga por Responsável
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metrics.cardsByAssignee.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={metrics.cardsByAssignee} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(160, 84%, 39%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState text="Nenhum responsável atribuído" />
                )}
              </CardContent>
            </Card>

            {/* Due Today */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CalendarClock className="w-4 h-4" /> Vencendo Hoje
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-60 overflow-y-auto space-y-2">
                {metrics.dueTodayList.length > 0 ? (
                  metrics.dueTodayList.map((card) => (
                    <div key={card.id} className="flex items-start justify-between gap-2 p-2 rounded-lg bg-muted/50">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{card.title}</p>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {(card.labelIds || []).slice(0, 2).map((lid) => (
                            <span key={lid} className={cn('text-[10px] px-1.5 py-0.5 rounded-full', getLabelClasses(getLabelColor(lid)))}>
                              {getLabelName(lid)}
                            </span>
                          ))}
                          {card.assignee && (
                            <span className="text-[10px] text-muted-foreground">{card.assignee}</span>
                          )}
                        </div>
                      </div>
                      {card.priority && (
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {PRIORITY_LABELS[card.priority] || card.priority}
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <EmptyState text="Nenhum card vencendo hoje" />
                )}
              </CardContent>
            </Card>

            {/* Overdue */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-4 h-4" /> Cards Atrasados
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-60 overflow-y-auto space-y-2">
                {metrics.overdueList.length > 0 ? (
                  metrics.overdueList.map((card) => (
                    <div key={card.id} className="flex items-start justify-between gap-2 p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{card.title}</p>
                        <p className="text-[11px] text-destructive font-medium mt-0.5">
                          {card.daysOverdue} dia{card.daysOverdue !== 1 ? 's' : ''} de atraso
                        </p>
                      </div>
                      {card.assignee && (
                        <span className="text-[10px] text-muted-foreground shrink-0">{card.assignee}</span>
                      )}
                    </div>
                  ))
                ) : (
                  <EmptyState text="Nenhum card atrasado 🎉" />
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

const ACCENT_CLASSES: Record<string, string> = {
  primary: 'bg-primary/10 text-primary',
  green: 'bg-emerald-500/10 text-emerald-600',
  blue: 'bg-blue-500/10 text-blue-600',
  red: 'bg-red-500/10 text-red-600',
  muted: 'bg-muted text-muted-foreground',
};

function KpiCard({ title, value, subtitle, icon, accent }: {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={cn('p-2.5 rounded-xl', ACCENT_CLASSES[accent] || ACCENT_CLASSES.muted)}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
      {text}
    </div>
  );
}
