import { useState } from 'react';
import { 
  X, 
  Play, 
  CheckCircle2, 
  Clock, 
  Eye,
  Film,
  MessageSquare,
  Save,
  Package,
  Truck
} from 'lucide-react';
import type { Project, TaskPhase, ProjectStatus, DeliveryStatus } from '../types';
import { PHASE_LABELS, STATUS_LABELS, LEVEL_LABELS, DELIVERY_LABELS, DELIVERY_COLORS } from '../types';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ProjectDetailProps {
  project: Project;
  onClose: () => void;
  onUpdatePhase: (projectId: string, phase: TaskPhase, status: ProjectStatus, progress: number) => void;
  onAddFeedback: (projectId: string, content: string) => void;
}

const STATUS_OPTIONS: { value: ProjectStatus; label: string; icon: typeof Clock }[] = [
  { value: 'pending', label: '대기', icon: Clock },
  { value: 'in-progress', label: '진행', icon: Play },
  { value: 'review', label: '검토', icon: Eye },
  { value: 'completed', label: '완료', icon: CheckCircle2 },
];

const PHASE_COLORS: Record<TaskPhase, string> = {
  nukki: 'from-rose-500 to-pink-500',
  background: 'from-amber-500 to-orange-500',
  rigging: 'from-emerald-500 to-teal-500',
  animation: 'from-blue-500 to-cyan-500',
  audio: 'from-violet-500 to-purple-500',
  render: 'from-fuchsia-500 to-pink-500',
};

const LEVEL_STYLES = {
  basic: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  advanced: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const DELIVERY_STEPS: { status: DeliveryStatus; label: string; shortLabel: string; icon: typeof Package }[] = [
  { status: 'not-started', label: '미시작', shortLabel: '미시작', icon: Clock },
  { status: 'nukki-in-progress', label: '누끼 작업', shortLabel: '누끼', icon: Package },
  { status: 'nukki-delivered', label: '누끼 납품', shortLabel: '납품', icon: Package },
  { status: 'video-in-progress', label: '영상 작업', shortLabel: '영상', icon: Truck },
  { status: 'video-delivered', label: '영상 납품', shortLabel: '납품', icon: Truck },
  { status: 'final-approved', label: '최종 승인', shortLabel: '승인', icon: CheckCircle2 },
];

export function ProjectDetail({ project, onClose, onUpdatePhase, onAddFeedback }: ProjectDetailProps) {
  const [newFeedback, setNewFeedback] = useState('');
  const daysLeft = differenceInDays(parseISO(project.dueDate), new Date());
  const nukkiDaysLeft = project.nukkiDueDate 
    ? differenceInDays(parseISO(project.nukkiDueDate), new Date()) 
    : null;
  
  const overallProgress = Math.round(
    project.phases.reduce((sum, p) => sum + p.progress, 0) / project.phases.length
  );

  const currentDeliveryIndex = DELIVERY_STEPS.findIndex(s => s.status === project.deliveryStatus);

  const handleSubmitFeedback = () => {
    if (!newFeedback.trim()) return;
    onAddFeedback(project.id, newFeedback.trim());
    setNewFeedback('');
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end lg:items-center justify-center z-50 lg:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="glass-light rounded-t-3xl lg:rounded-3xl w-full lg:max-w-5xl max-h-[95vh] lg:max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="relative p-4 lg:p-6 border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-pink-500/10" />
          
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 lg:gap-4 min-w-0">
              <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg shadow-orange-500/30 flex-shrink-0">
                <span className="text-lg lg:text-2xl font-bold text-white">
                  {String(project.episodeNumber).padStart(2, '0')}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg lg:text-2xl font-bold text-white truncate">{project.title}</h2>
                  {/* Level Badge */}
                  <span className={`px-2 lg:px-3 py-0.5 lg:py-1 rounded-lg text-xs lg:text-sm font-medium border ${LEVEL_STYLES[project.level]}`}>
                    {LEVEL_LABELS[project.level]}
                  </span>
                </div>
                <p className="text-white/50 text-xs lg:text-sm flex items-center gap-2 mt-1">
                  <Film className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span className="truncate">{project.id} • {project.metadata.duration}초</span>
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="relative grid grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-4 mt-4 lg:mt-6">
            <div className="bg-white/5 rounded-lg lg:rounded-xl p-2 lg:p-3">
              <p className="text-[10px] lg:text-xs text-white/50">상태</p>
              <p className="text-sm lg:text-lg font-semibold text-white">{STATUS_LABELS[project.status]}</p>
            </div>
            <div className="bg-white/5 rounded-lg lg:rounded-xl p-2 lg:p-3">
              <p className="text-[10px] lg:text-xs text-white/50">진행률</p>
              <p className="text-sm lg:text-lg font-semibold text-white">{overallProgress}%</p>
            </div>
            <div className={`rounded-lg lg:rounded-xl p-2 lg:p-3 ${
              daysLeft <= 7 ? 'bg-red-500/20' : daysLeft <= 14 ? 'bg-amber-500/20' : 'bg-white/5'
            }`}>
              <p className="text-[10px] lg:text-xs text-white/50">D-Day</p>
              <p className={`text-sm lg:text-lg font-semibold ${
                daysLeft <= 7 ? 'text-red-400' : daysLeft <= 14 ? 'text-amber-400' : 'text-white'
              }`}>
                {daysLeft < 0 ? '지연' : `D-${daysLeft}`}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg lg:rounded-xl p-2 lg:p-3 hidden lg:block">
              <p className="text-xs text-white/50">누끼 마감</p>
              <p className={`text-lg font-semibold ${
                nukkiDaysLeft !== null && nukkiDaysLeft <= 3 ? 'text-red-400' : 'text-white'
              }`}>
                {project.nukkiDueDate ? format(parseISO(project.nukkiDueDate), 'M/d') : '-'}
              </p>
            </div>
            <div className="bg-white/5 rounded-lg lg:rounded-xl p-2 lg:p-3 hidden lg:block">
              <p className="text-xs text-white/50">영상 마감</p>
              <p className="text-lg font-semibold text-white">
                {format(parseISO(project.dueDate), 'M/d')}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6 overflow-y-auto max-h-[calc(95vh-280px)] lg:max-h-[calc(90vh-320px)]">
          {/* Delivery Progress */}
          <div className="mb-4 lg:mb-6">
            <h3 className="text-sm lg:text-lg font-semibold text-white mb-3 lg:mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 lg:w-5 lg:h-5 text-amber-400" />
              납품 진행
            </h3>
            <div className="bg-white/5 rounded-lg lg:rounded-xl p-3 lg:p-5 border border-white/10">
              {/* Mobile: Simple Progress Bar */}
              <div className="lg:hidden mb-3">
                <div className="flex items-center gap-1 mb-2">
                  {DELIVERY_STEPS.map((step, idx) => {
                    const isActive = step.status === project.deliveryStatus;
                    const isPast = idx < currentDeliveryIndex;
                    return (
                      <div 
                        key={step.status} 
                        className={`flex-1 h-2 rounded-full ${
                          isPast || isActive 
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                            : 'bg-white/10'
                        }`}
                      />
                    );
                  })}
                </div>
                <p className="text-center text-sm font-medium text-amber-400">
                  {DELIVERY_LABELS[project.deliveryStatus]}
                </p>
              </div>

              {/* Desktop: Full Progress Steps */}
              <div className="hidden lg:flex items-center justify-between mb-4">
                {DELIVERY_STEPS.map((step, idx) => {
                  const isActive = step.status === project.deliveryStatus;
                  const isPast = idx < currentDeliveryIndex;
                  const Icon = step.icon;
                  
                  return (
                    <div key={step.status} className="flex items-center flex-1">
                      <div className="flex flex-col items-center flex-1">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all
                          ${isActive 
                            ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white scale-110 shadow-lg shadow-amber-500/30' 
                            : isPast 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-white/5 text-white/30 border border-white/10'
                          }
                        `}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-xs font-medium text-center ${
                          isActive ? 'text-amber-400' : isPast ? 'text-emerald-400' : 'text-white/40'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                      {idx < DELIVERY_STEPS.length - 1 && (
                        <div className={`w-full h-1 mx-2 rounded-full ${
                          isPast ? 'bg-emerald-500' : 'bg-white/10'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className={`text-center py-2 rounded-lg ${DELIVERY_COLORS[project.deliveryStatus]} hidden lg:block`}>
                <span className="font-medium">{DELIVERY_LABELS[project.deliveryStatus]}</span>
              </div>
            </div>
          </div>

          {/* Phase Progress */}
          <div className="mb-6 lg:mb-8">
            <h3 className="text-sm lg:text-lg font-semibold text-white mb-3 lg:mb-4">단계별 진행</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4">
              {project.phases.map((phase) => {
                const StatusIcon = STATUS_OPTIONS.find(s => s.value === phase.status)?.icon || Clock;
                return (
                  <div
                    key={phase.phase}
                    className="bg-white/5 rounded-lg lg:rounded-xl p-3 lg:p-4 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2 lg:mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-gradient-to-r ${PHASE_COLORS[phase.phase]}`} />
                        <span className="font-medium text-white text-xs lg:text-base">{PHASE_LABELS[phase.phase]}</span>
                      </div>
                      <StatusIcon className="w-3 h-3 lg:w-4 lg:h-4 text-white/50" />
                    </div>

                    {/* Progress Slider */}
                    <div className="mb-2 lg:mb-3">
                      <div className="flex justify-between text-xs lg:text-sm mb-1 lg:mb-2">
                        <span className="text-white/50">진행률</span>
                        <span className="text-white font-medium">{phase.progress}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={phase.progress}
                        onChange={(e) => {
                          const newProgress = parseInt(e.target.value);
                          const newStatus: ProjectStatus = 
                            newProgress === 100 ? 'completed' :
                            newProgress > 0 ? 'in-progress' : 'pending';
                          onUpdatePhase(project.id, phase.phase, newStatus, newProgress);
                        }}
                        className="w-full accent-orange-500 h-1"
                      />
                    </div>

                    {/* Status Buttons - Compact on Mobile */}
                    <div className="grid grid-cols-4 gap-1">
                      {STATUS_OPTIONS.map(option => {
                        const Icon = option.icon;
                        const isActive = phase.status === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => {
                              const newProgress = 
                                option.value === 'completed' ? 100 :
                                option.value === 'pending' ? 0 :
                                phase.progress || 50;
                              onUpdatePhase(project.id, phase.phase, option.value, newProgress);
                            }}
                            className={`flex items-center justify-center p-1.5 lg:p-2 rounded-lg text-[10px] lg:text-xs font-medium transition-all ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                            }`}
                            title={option.label}
                          >
                            <Icon className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                            <span className="hidden lg:inline ml-1">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback Section */}
          <div className="border-t border-white/10 pt-4 lg:pt-6">
            <h3 className="text-sm lg:text-lg font-semibold text-white mb-3 lg:mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 lg:w-5 lg:h-5 text-violet-400" />
              피드백 ({project.feedback.length})
            </h3>

            {/* Add Feedback */}
            <div className="flex gap-2 lg:gap-3 mb-3 lg:mb-4">
              <input
                type="text"
                value={newFeedback}
                onChange={(e) => setNewFeedback(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitFeedback()}
                placeholder="새 피드백..."
                className="input-field flex-1 text-sm"
              />
              <button
                onClick={handleSubmitFeedback}
                disabled={!newFeedback.trim()}
                className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed px-3 lg:px-4"
              >
                추가
              </button>
            </div>

            {/* Feedback List */}
            <div className="space-y-2 max-h-32 lg:max-h-48 overflow-y-auto">
              {project.feedback.length === 0 ? (
                <p className="text-white/40 text-center py-4 text-sm">피드백이 없습니다</p>
              ) : (
                project.feedback.map(fb => (
                  <div
                    key={fb.id}
                    className={`p-2 lg:p-3 rounded-lg flex items-start gap-2 lg:gap-3 ${
                      fb.resolved ? 'bg-white/5' : 'bg-amber-500/10'
                    }`}
                  >
                    {fb.resolved ? (
                      <CheckCircle2 className="w-3 h-3 lg:w-4 lg:h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Clock className="w-3 h-3 lg:w-4 lg:h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-white text-xs lg:text-sm ${fb.resolved ? 'line-through opacity-60' : ''}`}>
                        {fb.content}
                      </p>
                      <p className="text-[10px] lg:text-xs text-white/40 mt-1">
                        {format(parseISO(fb.createdAt), 'M/d HH:mm', { locale: ko })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 lg:p-4 border-t border-white/10 flex justify-end gap-2 lg:gap-3">
          <button
            onClick={onClose}
            className="px-4 lg:px-6 py-2 lg:py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors text-sm lg:text-base"
          >
            닫기
          </button>
          <button className="btn-primary flex items-center gap-2 text-sm lg:text-base py-2 lg:py-3">
            <Save className="w-4 h-4" />
            <span className="hidden lg:inline">변경사항 저장</span>
            <span className="lg:hidden">저장</span>
          </button>
        </div>
      </div>
    </div>
  );
}
