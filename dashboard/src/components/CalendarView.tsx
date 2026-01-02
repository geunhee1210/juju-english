import { useMemo, useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Film,
  CheckCircle2,
  Clock,
  Play
} from 'lucide-react';
import type { Project } from '../types';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  isToday
} from 'date-fns';
import { ko } from 'date-fns/locale';

interface CalendarViewProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
}

const STATUS_DOT_COLORS = {
  pending: 'bg-amber-400',
  'in-progress': 'bg-blue-400',
  review: 'bg-violet-400',
  completed: 'bg-emerald-400',
};

export function CalendarView({ projects, onSelectProject }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start, end });

    // 앞에 빈 날짜 추가 (일요일 시작)
    const startDayOfWeek = start.getDay();
    const emptyDays = Array(startDayOfWeek).fill(null);

    return [...emptyDays, ...days];
  }, [currentDate]);

  const projectsByDate = useMemo(() => {
    const map = new Map<string, Project[]>();
    projects.forEach(project => {
      const dateKey = project.dueDate;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(project);
    });
    return map;
  }, [projects]);

  const selectedDateProjects = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return projectsByDate.get(dateKey) || [];
  }, [selectedDate, projectsByDate]);

  const monthStats = useMemo(() => {
    const monthStr = format(currentDate, 'yyyy-MM');
    const monthProjects = projects.filter(p => p.dueDate.startsWith(monthStr));
    return {
      total: monthProjects.length,
      completed: monthProjects.filter(p => p.status === 'completed').length,
      inProgress: monthProjects.filter(p => p.status === 'in-progress').length,
      pending: monthProjects.filter(p => p.status === 'pending').length,
    };
  }, [projects, currentDate]);

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">일정 관리</h2>
          <p className="text-white/50 mt-1">마감일 기준 프로젝트 일정</p>
        </div>

        {/* Month Stats */}
        <div className="flex gap-4">
          <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
            <Film className="w-4 h-4 text-violet-400" />
            <span className="text-white/70 text-sm">이번 달:</span>
            <span className="text-white font-bold">{monthStats.total}개</span>
          </div>
          <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-white font-bold">{monthStats.completed}</span>
          </div>
          <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
            <Play className="w-4 h-4 text-blue-400" />
            <span className="text-white font-bold">{monthStats.inProgress}</span>
          </div>
          <div className="glass rounded-xl px-4 py-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-white font-bold">{monthStats.pending}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="col-span-2 glass rounded-2xl p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-white">
              {format(currentDate, 'yyyy년 M월', { locale: ko })}
            </h3>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Week Days Header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day, i) => (
              <div 
                key={day} 
                className={`text-center text-sm font-medium py-2 ${
                  i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-white/50'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dateKey = format(day, 'yyyy-MM-dd');
              const dayProjects = projectsByDate.get(dateKey) || [];
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const dayOfWeek = day.getDay();

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    aspect-square rounded-xl p-2 flex flex-col items-center justify-start gap-1
                    transition-all duration-200
                    ${isSelected 
                      ? 'bg-gradient-to-br from-orange-500 to-pink-500 shadow-lg shadow-orange-500/30' 
                      : 'hover:bg-white/10'
                    }
                    ${!isCurrentMonth ? 'opacity-30' : ''}
                  `}
                >
                  <span className={`
                    text-sm font-medium
                    ${isSelected ? 'text-white' : ''}
                    ${isToday(day) && !isSelected ? 'text-orange-400' : ''}
                    ${dayOfWeek === 0 && !isSelected ? 'text-red-400' : ''}
                    ${dayOfWeek === 6 && !isSelected ? 'text-blue-400' : ''}
                    ${!isSelected && dayOfWeek !== 0 && dayOfWeek !== 6 && !isToday(day) ? 'text-white/80' : ''}
                  `}>
                    {format(day, 'd')}
                  </span>
                  
                  {/* Project Dots */}
                  {dayProjects.length > 0 && (
                    <div className="flex flex-wrap gap-0.5 justify-center max-w-full">
                      {dayProjects.slice(0, 4).map(p => (
                        <div
                          key={p.id}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-white' : STATUS_DOT_COLORS[p.status]
                          }`}
                        />
                      ))}
                      {dayProjects.length > 4 && (
                        <span className={`text-xs ${isSelected ? 'text-white' : 'text-white/50'}`}>
                          +{dayProjects.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Projects */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {selectedDate 
              ? format(selectedDate, 'M월 d일 (EEEE)', { locale: ko })
              : '날짜를 선택하세요'
            }
          </h3>

          {selectedDate && (
            <div className="space-y-3">
              {selectedDateProjects.length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>이 날짜에 마감인 프로젝트가 없습니다</p>
                </div>
              ) : (
                selectedDateProjects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => onSelectProject(project)}
                    className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${STATUS_DOT_COLORS[project.status]}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate group-hover:text-orange-400 transition-colors">
                          {project.title}
                        </p>
                        <p className="text-sm text-white/50">EP{String(project.episodeNumber).padStart(2, '0')}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"
                              style={{ 
                                width: `${project.phases.reduce((sum, p) => sum + p.progress, 0) / project.phases.length}%` 
                              }}
                            />
                          </div>
                          <span className="text-xs text-white/50">
                            {Math.round(project.phases.reduce((sum, p) => sum + p.progress, 0) / project.phases.length)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="glass rounded-xl p-4 flex items-center justify-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-400" />
          <span className="text-sm text-white/70">완료</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-400" />
          <span className="text-sm text-white/70">진행중</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="text-sm text-white/70">대기</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-violet-400" />
          <span className="text-sm text-white/70">검토</span>
        </div>
      </div>
    </div>
  );
}

