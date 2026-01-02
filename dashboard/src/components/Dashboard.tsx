import { useMemo } from 'react';
import { 
  Film, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  CalendarClock,
  Sparkles,
  Package,
  Layers,
  Truck
} from 'lucide-react';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import type { Project, MonthlyStats, LevelStats, DeliveryStats } from '../types';
import { PHASE_LABELS, LEVEL_LABELS } from '../types';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

interface DashboardProps {
  projects: Project[];
  monthlyStats: MonthlyStats[];
  levelStats: LevelStats[];
  deliveryStats: DeliveryStats;
}

const COLORS = {
  completed: '#10b981',
  inProgress: '#3b82f6',
  pending: '#f59e0b',
  review: '#8b5cf6',
};

const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

export function Dashboard({ projects, monthlyStats, levelStats, deliveryStats }: DashboardProps) {
  const stats = useMemo(() => {
    const total = projects.length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const inProgress = projects.filter(p => p.status === 'in-progress').length;
    const pending = projects.filter(p => p.status === 'pending').length;
    const review = projects.filter(p => p.status === 'review').length;

    return { total, completed, inProgress, pending, review };
  }, [projects]);

  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    return projects
      .filter(p => p.status !== 'completed')
      .map(p => ({
        ...p,
        daysLeft: differenceInDays(parseISO(p.dueDate), now)
      }))
      .filter(p => p.daysLeft <= 14 && p.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5);
  }, [projects]);

  const upcomingNukkiDeadlines = useMemo(() => {
    const now = new Date();
    return projects
      .filter(p => p.deliveryStatus === 'not-started' || p.deliveryStatus === 'nukki-in-progress')
      .filter(p => p.nukkiDueDate)
      .map(p => ({
        ...p,
        daysLeft: differenceInDays(parseISO(p.nukkiDueDate!), now)
      }))
      .filter(p => p.daysLeft <= 14 && p.daysLeft >= 0)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 3);
  }, [projects]);

  const phaseProgress = useMemo(() => {
    const phases = ['nukki', 'background', 'rigging', 'animation', 'audio', 'render'] as const;
    return phases.map(phase => {
      const allPhases = projects.flatMap(p => p.phases.filter(ph => ph.phase === phase));
      const avgProgress = allPhases.length > 0
        ? Math.round(allPhases.reduce((sum, ph) => sum + ph.progress, 0) / allPhases.length)
        : 0;
      return {
        name: PHASE_LABELS[phase],
        progress: avgProgress,
        completed: allPhases.filter(ph => ph.status === 'completed').length,
        total: allPhases.length,
      };
    });
  }, [projects]);

  const pieData = [
    { name: '완료', value: stats.completed, color: COLORS.completed },
    { name: '진행중', value: stats.inProgress, color: COLORS.inProgress },
    { name: '대기', value: stats.pending, color: COLORS.pending },
    { name: '검토', value: stats.review, color: COLORS.review },
  ].filter(d => d.value > 0);

  const chartData = monthlyStats.map(m => ({
    month: m.month.split('-')[1] + '월',
    완료: m.completed,
    진행중: m.inProgress,
    대기: m.pending,
  }));

  const overallProgress = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  return (
    <div className="space-y-4 lg:space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2 lg:gap-3">
            <Sparkles className="w-6 h-6 lg:w-8 lg:h-8 text-orange-400" />
            대시보드
          </h2>
          <p className="text-white/50 text-sm lg:text-base mt-1">
            {format(new Date(), 'yyyy년 M월 d일 EEEE', { locale: ko })}
          </p>
        </div>
        <div className="flex items-center gap-3 lg:gap-4">
          <div className="text-right">
            <p className="text-xs lg:text-sm text-white/50">최종 마감일</p>
            <p className="text-base lg:text-lg font-bold text-orange-400">2026년 6월 30일</p>
          </div>
          <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
            <CalendarClock className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          { label: '전체 영상', value: stats.total, icon: Film, gradient: 'from-violet-500 to-purple-500' },
          { label: '완료', value: stats.completed, icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-500' },
          { label: '진행중', value: stats.inProgress, icon: TrendingUp, gradient: 'from-blue-500 to-cyan-500' },
          { label: '대기중', value: stats.pending, icon: Clock, gradient: 'from-amber-500 to-orange-500' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`glass rounded-xl lg:rounded-2xl p-4 lg:p-6 card-hover`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/50 text-xs lg:text-sm mb-1">{stat.label}</p>
                  <p className="text-2xl lg:text-4xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 lg:w-14 lg:h-14 rounded-lg lg:rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 lg:w-7 lg:h-7 text-white" />
                </div>
              </div>
              {stat.label === '전체 영상' && (
                <div className="mt-3 lg:mt-4">
                  <div className="flex justify-between text-xs lg:text-sm mb-1 lg:mb-2">
                    <span className="text-white/50">진행률</span>
                    <span className="text-white font-medium">{overallProgress}%</span>
                  </div>
                  <div className="h-1.5 lg:h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
                      style={{ width: `${overallProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delivery Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
        <div className="glass rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Package className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm lg:text-lg font-semibold text-white">누끼 납품 현황</h3>
              <p className="text-xs text-white/50">선납품 6개 기준</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 lg:gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg lg:rounded-xl p-3 lg:p-4">
              <p className="text-xl lg:text-3xl font-bold text-emerald-400">{deliveryStats.nukkiDelivered}</p>
              <p className="text-xs text-white/60">납품 완료</p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg lg:rounded-xl p-3 lg:p-4">
              <p className="text-xl lg:text-3xl font-bold text-amber-400">{deliveryStats.nukkiPending}</p>
              <p className="text-xs text-white/60">납품 대기</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <Truck className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm lg:text-lg font-semibold text-white">영상 납품 현황</h3>
              <p className="text-xs text-white/50">월 6개씩 총 30개</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 lg:gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg lg:rounded-xl p-3 lg:p-4">
              <p className="text-xl lg:text-3xl font-bold text-emerald-400">{deliveryStats.videoDelivered}</p>
              <p className="text-xs text-white/60">납품 완료</p>
            </div>
            <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg lg:rounded-xl p-3 lg:p-4">
              <p className="text-xl lg:text-3xl font-bold text-violet-400">{deliveryStats.videoPending}</p>
              <p className="text-xs text-white/60">작업 중/대기</p>
            </div>
          </div>
        </div>
      </div>

      {/* Level Stats */}
      <div className="glass rounded-xl lg:rounded-2xl p-4 lg:p-6">
        <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <Layers className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm lg:text-lg font-semibold text-white">3단계 레벨별 현황</h3>
            <p className="text-xs text-white/50">기초 2 + 심화 2 + 완성 2</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 lg:gap-4">
          {levelStats.map((levelStat) => (
            <div 
              key={levelStat.level}
              className={`relative overflow-hidden rounded-lg lg:rounded-xl p-3 lg:p-5 border ${
                levelStat.level === 'basic' 
                  ? 'bg-green-500/10 border-green-500/30' 
                  : levelStat.level === 'intermediate'
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : 'bg-purple-500/10 border-purple-500/30'
              }`}
            >
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mb-2 ${
                levelStat.level === 'basic' 
                  ? 'bg-green-500/20 text-green-400' 
                  : levelStat.level === 'intermediate'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-purple-500/20 text-purple-400'
              }`}>
                {LEVEL_LABELS[levelStat.level]}
              </span>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-xl lg:text-3xl font-bold text-white">{levelStat.completed}</span>
                <span className="text-white/50 text-xs lg:text-sm pb-1">/ {levelStat.total}</span>
              </div>
              <div className="h-1 lg:h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    levelStat.level === 'basic' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                      : levelStat.level === 'intermediate'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}
                  style={{ width: `${(levelStat.completed / levelStat.total) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Monthly Progress Chart */}
        <div className="lg:col-span-2 glass rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <h3 className="text-sm lg:text-lg font-semibold text-white mb-3 lg:mb-4">월별 진행 현황</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" fontSize={10} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '12px'
                }}
              />
              <Area type="monotone" dataKey="완료" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" strokeWidth={2} />
              <Area type="monotone" dataKey="진행중" stroke="#3b82f6" fillOpacity={1} fill="url(#colorInProgress)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Status Pie Chart */}
        <div className="glass rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <h3 className="text-sm lg:text-lg font-semibold text-white mb-3 lg:mb-4">상태 분포</h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(0,0,0,0.8)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '12px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {pieData.map(item => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                <span className="text-xs text-white/70">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Phase Progress */}
        <div className="glass rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <h3 className="text-sm lg:text-lg font-semibold text-white mb-3 lg:mb-4">단계별 진행률</h3>
          <div className="space-y-3 lg:space-y-4">
            {phaseProgress.map((phase, index) => (
              <div key={phase.name} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs lg:text-sm text-white/70">{phase.name}</span>
                  <span className="text-xs font-medium text-white">
                    {phase.completed}/{phase.total}
                  </span>
                </div>
                <div className="h-1.5 lg:h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${phase.progress}%`,
                      background: `linear-gradient(90deg, ${PIE_COLORS[index % PIE_COLORS.length]}, ${PIE_COLORS[(index + 1) % PIE_COLORS.length]})`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nukki Deadlines */}
        <div className="glass rounded-xl lg:rounded-2xl p-4 lg:p-6">
          <h3 className="text-sm lg:text-lg font-semibold text-white mb-3 lg:mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 lg:w-5 lg:h-5 text-amber-400" />
            누끼 납품 마감
          </h3>
          {upcomingNukkiDeadlines.length === 0 ? (
            <div className="text-center py-6 text-white/50">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
              <p className="text-xs lg:text-sm">누끼 납품이 완료되었습니다!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingNukkiDeadlines.map(project => (
                <div 
                  key={project.id}
                  className="flex items-center gap-2 p-2 lg:p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
                >
                  <div className={`
                    w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center text-xs font-bold
                    ${project.daysLeft <= 3 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-amber-500/20 text-amber-400'
                    }
                  `}>
                    D-{project.daysLeft}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate text-xs lg:text-sm">{project.title}</p>
                    <p className="text-xs text-white/50">
                      {LEVEL_LABELS[project.level]}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video Deadlines */}
        <div className="glass rounded-xl lg:rounded-2xl p-4 lg:p-6 md:col-span-2 lg:col-span-1">
          <h3 className="text-sm lg:text-lg font-semibold text-white mb-3 lg:mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-amber-400" />
            영상 마감 임박
          </h3>
          {upcomingDeadlines.length === 0 ? (
            <div className="text-center py-6 text-white/50">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
              <p className="text-xs lg:text-sm">마감 임박 프로젝트가 없습니다!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingDeadlines.slice(0, 4).map(project => (
                <div 
                  key={project.id}
                  className="flex items-center gap-2 p-2 lg:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className={`
                    w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center text-xs font-bold
                    ${project.daysLeft <= 3 
                      ? 'bg-red-500/20 text-red-400' 
                      : project.daysLeft <= 7 
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-blue-500/20 text-blue-400'
                    }
                  `}>
                    D-{project.daysLeft}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate text-xs lg:text-sm">{project.title}</p>
                    <p className="text-xs text-white/50">
                      {LEVEL_LABELS[project.level]} · {format(parseISO(project.dueDate), 'M/d')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
