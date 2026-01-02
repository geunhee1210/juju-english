import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight,
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  MoreVertical,
  Package,
  Truck
} from 'lucide-react';
import type { Project, TaskPhase, ProjectStatus, LevelType, DeliveryStatus } from '../types';
import { PHASE_LABELS, STATUS_LABELS, LEVEL_LABELS, DELIVERY_LABELS, DELIVERY_COLORS } from '../types';
import { format, parseISO, differenceInDays } from 'date-fns';

interface ProjectListProps {
  projects: Project[];
  onUpdatePhase: (projectId: string, phase: TaskPhase, status: ProjectStatus, progress: number) => void;
  onUpdateDelivery: (projectId: string, status: DeliveryStatus) => void;
  onSelectProject: (project: Project) => void;
}

const STATUS_ICONS = {
  pending: Clock,
  'in-progress': Play,
  review: Eye,
  completed: CheckCircle2,
};

const STATUS_STYLES = {
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'in-progress': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  review: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const LEVEL_STYLES = {
  basic: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  advanced: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const DELIVERY_ICONS = {
  'not-started': Clock,
  'nukki-in-progress': Package,
  'nukki-delivered': Package,
  'video-in-progress': Truck,
  'video-delivered': Truck,
  'final-approved': CheckCircle2,
};

export function ProjectList({ projects, onUpdatePhase, onUpdateDelivery, onSelectProject }: ProjectListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<LevelType | 'all'>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryStatus | 'all'>('all');
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesMonth = monthFilter === 'all' || project.dueDate.includes(monthFilter);
      const matchesLevel = levelFilter === 'all' || project.level === levelFilter;
      const matchesDelivery = deliveryFilter === 'all' || project.deliveryStatus === deliveryFilter;
      return matchesSearch && matchesStatus && matchesMonth && matchesLevel && matchesDelivery;
    });
  }, [projects, searchQuery, statusFilter, monthFilter, levelFilter, deliveryFilter]);

  const activeFiltersCount = [statusFilter, monthFilter, levelFilter, deliveryFilter].filter(f => f !== 'all').length;

  const months = [
    { value: 'all', label: '전체 월' },
    { value: '2026-01', label: '1월' },
    { value: '2026-02', label: '2월' },
    { value: '2026-03', label: '3월' },
    { value: '2026-04', label: '4월' },
    { value: '2026-05', label: '5월' },
    { value: '2026-06', label: '6월' },
  ];

  const getProjectProgress = (project: Project) => {
    const total = project.phases.reduce((sum, p) => sum + p.progress, 0);
    return Math.round(total / project.phases.length);
  };

  const getDaysUntilDeadline = (dueDate: string) => {
    return differenceInDays(parseISO(dueDate), new Date());
  };

  const getNextDeliveryStatus = (current: DeliveryStatus): DeliveryStatus => {
    const order: DeliveryStatus[] = [
      'not-started',
      'nukki-in-progress',
      'nukki-delivered',
      'video-in-progress',
      'video-delivered',
      'final-approved'
    ];
    const currentIndex = order.indexOf(current);
    return currentIndex < order.length - 1 ? order[currentIndex + 1] : current;
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setMonthFilter('all');
    setLevelFilter('all');
    setDeliveryFilter('all');
  };

  return (
    <div className="space-y-4 lg:space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white">프로젝트 목록</h2>
          <p className="text-white/50 text-sm lg:text-base mt-1">총 {filteredProjects.length}개 프로젝트</p>
        </div>
      </div>

      {/* Search & Filter Toggle (Mobile) */}
      <div className="flex gap-2 lg:gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-5 lg:h-5 text-white/40" />
          <input
            type="text"
            placeholder="검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 lg:pl-12 text-sm lg:text-base"
          />
        </div>

        {/* Filter Toggle Button (Mobile) */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`lg:hidden flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-colors ${
            showFilters || activeFiltersCount > 0
              ? 'bg-orange-500/20 border-orange-500/30 text-orange-400'
              : 'bg-white/5 border-white/10 text-white/70'
          }`}
        >
          <Filter className="w-4 h-4" />
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {/* Desktop Filters */}
        <div className="hidden lg:flex gap-3 items-center flex-wrap">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
              className="input-field appearance-none pr-10 min-w-[120px] text-sm"
            >
              <option value="all">전체 상태</option>
              <option value="pending">대기</option>
              <option value="in-progress">진행중</option>
              <option value="review">검토중</option>
              <option value="completed">완료</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>

          {/* Level Filter */}
          <div className="relative">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as LevelType | 'all')}
              className="input-field appearance-none pr-10 min-w-[110px] text-sm"
            >
              <option value="all">전체 레벨</option>
              <option value="basic">기초</option>
              <option value="intermediate">심화</option>
              <option value="advanced">완성</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>

          {/* Month Filter */}
          <div className="relative">
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="input-field appearance-none pr-10 min-w-[100px] text-sm"
            >
              {months.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>

          {/* Delivery Filter */}
          <div className="relative">
            <select
              value={deliveryFilter}
              onChange={(e) => setDeliveryFilter(e.target.value as DeliveryStatus | 'all')}
              className="input-field appearance-none pr-10 min-w-[140px] text-sm"
            >
              <option value="all">전체 납품</option>
              <option value="not-started">미시작</option>
              <option value="nukki-in-progress">누끼 작업중</option>
              <option value="nukki-delivered">누끼 납품완료</option>
              <option value="video-in-progress">영상 작업중</option>
              <option value="video-delivered">영상 납품완료</option>
              <option value="final-approved">최종 승인</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Mobile Filters Panel */}
      {showFilters && (
        <div className="lg:hidden glass rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">필터</span>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs text-orange-400 hover:text-orange-300"
              >
                초기화
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
                className="input-field appearance-none pr-8 text-sm w-full"
              >
                <option value="all">전체 상태</option>
                <option value="pending">대기</option>
                <option value="in-progress">진행중</option>
                <option value="review">검토중</option>
                <option value="completed">완료</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>

            {/* Level Filter */}
            <div className="relative">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as LevelType | 'all')}
                className="input-field appearance-none pr-8 text-sm w-full"
              >
                <option value="all">전체 레벨</option>
                <option value="basic">기초</option>
                <option value="intermediate">심화</option>
                <option value="advanced">완성</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>

            {/* Month Filter */}
            <div className="relative">
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="input-field appearance-none pr-8 text-sm w-full"
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>

            {/* Delivery Filter */}
            <div className="relative">
              <select
                value={deliveryFilter}
                onChange={(e) => setDeliveryFilter(e.target.value as DeliveryStatus | 'all')}
                className="input-field appearance-none pr-8 text-sm w-full"
              >
                <option value="all">전체 납품</option>
                <option value="not-started">미시작</option>
                <option value="nukki-in-progress">누끼 작업중</option>
                <option value="nukki-delivered">누끼 납품</option>
                <option value="video-in-progress">영상 작업중</option>
                <option value="video-delivered">영상 납품</option>
                <option value="final-approved">최종 승인</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {/* Project Cards */}
      <div className="space-y-3">
        {filteredProjects.map((project, index) => {
          const StatusIcon = STATUS_ICONS[project.status];
          const DeliveryIcon = DELIVERY_ICONS[project.deliveryStatus];
          const isExpanded = expandedProject === project.id;
          const progress = getProjectProgress(project);
          const daysLeft = getDaysUntilDeadline(project.dueDate);
          const isUrgent = daysLeft <= 7 && project.status !== 'completed';

          return (
            <div
              key={project.id}
              className={`glass rounded-xl lg:rounded-2xl overflow-hidden transition-all duration-300 ${
                isExpanded ? 'ring-2 ring-orange-500/50' : ''
              }`}
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              {/* Main Row */}
              <div 
                className="p-3 lg:p-5 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedProject(isExpanded ? null : project.id)}
              >
                {/* Mobile Layout */}
                <div className="flex lg:hidden items-start gap-3">
                  {/* Episode Number */}
                  <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-orange-400">
                      {String(project.episodeNumber).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title & Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      <h3 className="text-sm font-semibold text-white truncate max-w-[120px]">{project.title}</h3>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${LEVEL_STYLES[project.level]}`}>
                        {LEVEL_LABELS[project.level]}
                      </span>
                    </div>

                    {/* Progress & Status */}
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <span>{progress}%</span>
                      <span>•</span>
                      <span className={isUrgent ? 'text-red-400 font-medium' : ''}>
                        {daysLeft < 0 ? '지연' : `D-${daysLeft}`}
                      </span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-col gap-1.5 items-end">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] ${DELIVERY_COLORS[project.deliveryStatus]}`}>
                      <DeliveryIcon className="w-3 h-3" />
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] ${STATUS_STYLES[project.status]}`}>
                      <StatusIcon className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:flex items-center gap-4">
                  {/* Expand Icon */}
                  <button className="text-white/50 hover:text-white transition-colors">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>

                  {/* Episode Number */}
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-orange-400">
                      {String(project.episodeNumber).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Title & ID */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white truncate">{project.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${LEVEL_STYLES[project.level]}`}>
                        {LEVEL_LABELS[project.level]}
                      </span>
                    </div>
                    <p className="text-sm text-white/50">{project.id}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-36 hidden xl:block">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/50">진행률</span>
                      <span className="text-white font-medium">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className={`text-center px-3 ${isUrgent ? 'animate-pulse' : ''}`}>
                    {isUrgent && daysLeft >= 0 ? (
                      <div className="flex items-center gap-1 text-red-400">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-bold text-sm">D-{daysLeft}</span>
                      </div>
                    ) : daysLeft < 0 ? (
                      <span className="text-red-400 font-bold text-sm">지연됨</span>
                    ) : (
                      <span className="text-white/70 text-sm">
                        {format(parseISO(project.dueDate), 'M/d')}
                      </span>
                    )}
                    <p className="text-xs text-white/40">마감</p>
                  </div>

                  {/* Delivery Status Badge */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs ${DELIVERY_COLORS[project.deliveryStatus]}`}>
                    <DeliveryIcon className="w-3.5 h-3.5" />
                    <span className="font-medium">{DELIVERY_LABELS[project.deliveryStatus]}</span>
                  </div>

                  {/* Status Badge */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs ${STATUS_STYLES[project.status]}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span className="font-medium">{STATUS_LABELS[project.status]}</span>
                  </div>

                  {/* Actions */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(project);
                    }}
                    className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Expanded Content - Phase Details */}
              {isExpanded && (
                <div className="px-3 lg:px-5 pb-3 lg:pb-5 border-t border-white/10 pt-3 lg:pt-4">
                  {/* Delivery Progress */}
                  <div className="mb-3 lg:mb-4 p-3 lg:p-4 rounded-lg lg:rounded-xl bg-white/5">
                    <div className="flex items-center justify-between mb-2 lg:mb-3">
                      <h4 className="text-xs lg:text-sm font-medium text-white flex items-center gap-2">
                        <Truck className="w-3 h-3 lg:w-4 lg:h-4 text-amber-400" />
                        납품 진행
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (project.deliveryStatus !== 'final-approved') {
                            onUpdateDelivery(project.id, getNextDeliveryStatus(project.deliveryStatus));
                          }
                        }}
                        className="text-[10px] lg:text-xs px-2 lg:px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                        disabled={project.deliveryStatus === 'final-approved'}
                      >
                        다음 단계
                      </button>
                    </div>
                    <div className="flex items-center gap-1 lg:gap-2">
                      {(['not-started', 'nukki-in-progress', 'nukki-delivered', 'video-in-progress', 'video-delivered', 'final-approved'] as DeliveryStatus[]).map((status, idx, arr) => {
                        const isActive = project.deliveryStatus === status;
                        const isPast = arr.indexOf(project.deliveryStatus) > idx;
                        return (
                          <div key={status} className="flex items-center gap-1 flex-1">
                            <div className={`
                              flex-1 h-1.5 lg:h-2 rounded-full transition-all
                              ${isPast || isActive ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-white/10'}
                            `} />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-1.5 lg:mt-2">
                      <span className="text-[10px] lg:text-xs text-white/40">미시작</span>
                      <span className="text-[10px] lg:text-xs text-white/40">최종승인</span>
                    </div>
                  </div>

                  {/* Phase Grid */}
                  <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3">
                    {project.phases.map((phase) => {
                      const PhaseStatusIcon = STATUS_ICONS[phase.status];
                      return (
                        <div
                          key={phase.phase}
                          className={`p-2 lg:p-4 rounded-lg lg:rounded-xl border transition-all ${STATUS_STYLES[phase.status]}`}
                        >
                          <div className="flex items-center justify-between mb-1 lg:mb-2">
                            <span className="text-[10px] lg:text-xs font-medium truncate">{PHASE_LABELS[phase.phase]}</span>
                            <PhaseStatusIcon className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                          </div>
                          <div className="h-1 lg:h-1.5 bg-black/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-current rounded-full transition-all duration-300"
                              style={{ width: `${phase.progress}%` }}
                            />
                          </div>
                          <p className="text-[10px] lg:text-xs mt-1 lg:mt-2 opacity-70">{phase.progress}%</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 lg:gap-3 mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-white/10">
                    <button
                      onClick={() => onSelectProject(project)}
                      className="btn-primary text-xs lg:text-sm py-2 flex-1 lg:flex-none"
                    >
                      상세 보기
                    </button>
                    <button
                      onClick={() => {
                        const currentPhase = project.phases.find(p => p.status === 'in-progress');
                        if (currentPhase) {
                          const newProgress = Math.min(100, currentPhase.progress + 10);
                          onUpdatePhase(
                            project.id, 
                            currentPhase.phase, 
                            newProgress === 100 ? 'completed' : 'in-progress',
                            newProgress
                          );
                        }
                      }}
                      className="btn-secondary text-xs lg:text-sm py-2 flex-1 lg:flex-none"
                    >
                      +10%
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="glass rounded-xl lg:rounded-2xl p-8 lg:p-12 text-center">
            <Search className="w-10 h-10 lg:w-12 lg:h-12 text-white/20 mx-auto mb-3 lg:mb-4" />
            <p className="text-white/50 text-base lg:text-lg">검색 결과가 없습니다</p>
            <p className="text-white/30 text-xs lg:text-sm mt-2">다른 검색어나 필터를 시도해보세요</p>
          </div>
        )}
      </div>
    </div>
  );
}
