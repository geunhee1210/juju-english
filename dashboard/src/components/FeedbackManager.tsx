import { useState, useMemo } from 'react';
import { 
  MessageSquare, 
  CheckCircle2, 
  Circle,
  Send,
  Filter,
  Clock,
  AlertCircle
} from 'lucide-react';
import type { Project, Feedback } from '../types';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

interface FeedbackManagerProps {
  projects: Project[];
  onAddFeedback: (projectId: string, content: string) => void;
  onResolveFeedback: (projectId: string, feedbackId: string) => void;
}

interface FeedbackWithProject extends Feedback {
  projectId: string;
  projectTitle: string;
  episodeNumber: number;
}

export function FeedbackManager({ projects, onAddFeedback, onResolveFeedback }: FeedbackManagerProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [newFeedbackProject, setNewFeedbackProject] = useState<string>('');
  const [newFeedbackContent, setNewFeedbackContent] = useState('');

  const allFeedback: FeedbackWithProject[] = useMemo(() => {
    return projects.flatMap(project => 
      project.feedback.map(fb => ({
        ...fb,
        projectId: project.id,
        projectTitle: project.title,
        episodeNumber: project.episodeNumber,
      }))
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [projects]);

  const filteredFeedback = useMemo(() => {
    switch (filter) {
      case 'pending':
        return allFeedback.filter(fb => !fb.resolved);
      case 'resolved':
        return allFeedback.filter(fb => fb.resolved);
      default:
        return allFeedback;
    }
  }, [allFeedback, filter]);

  const stats = useMemo(() => ({
    total: allFeedback.length,
    pending: allFeedback.filter(fb => !fb.resolved).length,
    resolved: allFeedback.filter(fb => fb.resolved).length,
  }), [allFeedback]);

  const handleSubmitFeedback = () => {
    if (!newFeedbackProject || !newFeedbackContent.trim()) return;
    onAddFeedback(newFeedbackProject, newFeedbackContent.trim());
    setNewFeedbackContent('');
    setNewFeedbackProject('');
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-violet-400" />
            피드백 관리
          </h2>
          <p className="text-white/50 mt-1">클라이언트 피드백을 효율적으로 관리하세요</p>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <div className="glass rounded-xl px-4 py-3 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-white/50">전체</p>
          </div>
          <div className="glass rounded-xl px-4 py-3 text-center border border-amber-500/30">
            <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
            <p className="text-xs text-white/50">미해결</p>
          </div>
          <div className="glass rounded-xl px-4 py-3 text-center border border-emerald-500/30">
            <p className="text-2xl font-bold text-emerald-400">{stats.resolved}</p>
            <p className="text-xs text-white/50">해결됨</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Add New Feedback */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">새 피드백 추가</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">프로젝트 선택</label>
              <select
                value={newFeedbackProject}
                onChange={(e) => setNewFeedbackProject(e.target.value)}
                className="input-field"
              >
                <option value="">프로젝트를 선택하세요</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    EP{String(p.episodeNumber).padStart(2, '0')} - {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-2">피드백 내용</label>
              <textarea
                value={newFeedbackContent}
                onChange={(e) => setNewFeedbackContent(e.target.value)}
                placeholder="클라이언트 피드백을 입력하세요..."
                rows={4}
                className="input-field resize-none"
              />
            </div>

            <button
              onClick={handleSubmitFeedback}
              disabled={!newFeedbackProject || !newFeedbackContent.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              피드백 등록
            </button>
          </div>
        </div>

        {/* Feedback List */}
        <div className="col-span-2 glass rounded-2xl p-6">
          {/* Filter Tabs */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-white/70 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              필터:
            </span>
            {[
              { id: 'all', label: '전체' },
              { id: 'pending', label: '미해결' },
              { id: 'resolved', label: '해결됨' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as typeof filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f.id
                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Feedback Items */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {filteredFeedback.length === 0 ? (
              <div className="text-center py-12 text-white/50">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg">피드백이 없습니다</p>
                <p className="text-sm mt-1">새 피드백을 추가해보세요</p>
              </div>
            ) : (
              filteredFeedback.map(feedback => (
                <div
                  key={feedback.id}
                  className={`p-4 rounded-xl border transition-all ${
                    feedback.resolved
                      ? 'bg-white/5 border-white/10'
                      : 'bg-amber-500/10 border-amber-500/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <button
                      onClick={() => !feedback.resolved && onResolveFeedback(feedback.projectId, feedback.id)}
                      disabled={feedback.resolved}
                      className={`mt-1 transition-colors ${
                        feedback.resolved
                          ? 'text-emerald-400 cursor-default'
                          : 'text-amber-400 hover:text-emerald-400'
                      }`}
                    >
                      {feedback.resolved ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-400 text-xs font-medium">
                          EP{String(feedback.episodeNumber).padStart(2, '0')}
                        </span>
                        <span className="text-white/70 text-sm truncate">
                          {feedback.projectTitle}
                        </span>
                      </div>
                      <p className={`text-white ${feedback.resolved ? 'line-through opacity-60' : ''}`}>
                        {feedback.content}
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-white/50">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(parseISO(feedback.createdAt), 'M/d HH:mm', { locale: ko })}
                        </span>
                        {feedback.resolved && feedback.resolvedAt && (
                          <span className="flex items-center gap-1 text-emerald-400/70">
                            <CheckCircle2 className="w-3 h-3" />
                            {format(parseISO(feedback.resolvedAt), 'M/d HH:mm', { locale: ko })} 해결
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Urgent Badge */}
                    {!feedback.resolved && (
                      <div className="flex items-center gap-1 text-amber-400 text-xs">
                        <AlertCircle className="w-4 h-4" />
                        미해결
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

