// 프로젝트 상태 타입
export type ProjectStatus = 'pending' | 'in-progress' | 'review' | 'completed';

// 작업 단계 타입
export type TaskPhase = 'nukki' | 'background' | 'rigging' | 'animation' | 'audio' | 'render';

// 3단계 난이도 레벨 (기초/심화/완성)
export type LevelType = 'basic' | 'intermediate' | 'advanced';

// 납품 상태
export type DeliveryStatus = 'not-started' | 'nukki-in-progress' | 'nukki-delivered' | 'video-in-progress' | 'video-delivered' | 'final-approved';

// 각 단계별 상태
export interface PhaseStatus {
  phase: TaskPhase;
  status: ProjectStatus;
  progress: number; // 0-100
  notes?: string;
  updatedAt: string;
}

// 클라이언트 피드백
export interface Feedback {
  id: string;
  content: string;
  createdAt: string;
  resolved: boolean;
  resolvedAt?: string;
}

// 프로젝트 (영상 1개)
export interface Project {
  id: string;
  episodeNumber: number;
  title: string;
  description?: string;
  status: ProjectStatus;
  level: LevelType;           // 3단계 레벨
  deliveryStatus: DeliveryStatus; // 납품 상태
  phases: PhaseStatus[];
  dueDate: string;
  nukkiDueDate?: string;      // 누끼 납품 마감일
  createdAt: string;
  updatedAt: string;
  feedback: Feedback[];
  assets: {
    originalPages: string[]; // 원본 교재 8페이지 경로
    nukkiFiles: string[];    // 누끼 완료 파일 경로
    psdFiles: string[];      // PSD 파일 경로
    aeProject?: string;      // After Effects 프로젝트 경로
    audioFiles: string[];    // 오디오 파일 경로
    outputFile?: string;     // 최종 렌더링 파일 경로
  };
  metadata: {
    duration?: number;       // 영상 길이 (초)
    resolution?: string;     // 해상도
    frameRate?: number;      // 프레임 레이트
    pageCount?: number;      // 원본 페이지 수 (기본 8)
  };
}

// 월별 통계
export interface MonthlyStats {
  month: string; // YYYY-MM
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}

// 레벨별 통계
export interface LevelStats {
  level: LevelType;
  total: number;
  completed: number;
  inProgress: number;
}

// 납품 통계
export interface DeliveryStats {
  nukkiDelivered: number;
  nukkiPending: number;
  videoDelivered: number;
  videoPending: number;
}

// 대시보드 요약 데이터
export interface DashboardSummary {
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  pendingProjects: number;
  overallProgress: number;
  upcomingDeadlines: Project[];
  recentActivity: ActivityLog[];
  monthlyStats: MonthlyStats[];
  levelStats: LevelStats[];
  deliveryStats: DeliveryStats;
}

// 활동 로그
export interface ActivityLog {
  id: string;
  projectId: string;
  projectTitle: string;
  action: string;
  phase?: TaskPhase;
  timestamp: string;
}

// 알림
export interface Notification {
  id: string;
  type: 'deadline' | 'feedback' | 'milestone' | 'warning';
  title: string;
  message: string;
  projectId?: string;
  read: boolean;
  createdAt: string;
}

// 한국어 레이블 매핑
export const PHASE_LABELS: Record<TaskPhase, string> = {
  nukki: '누끼 작업',
  background: '배경 리터칭',
  rigging: '리깅',
  animation: '애니메이션',
  audio: '오디오 싱크',
  render: '렌더링',
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  pending: '대기',
  'in-progress': '진행중',
  review: '검토중',
  completed: '완료',
};

export const STATUS_COLORS: Record<ProjectStatus, string> = {
  pending: 'status-pending',
  'in-progress': 'status-in-progress',
  review: 'status-review',
  completed: 'status-completed',
};

// 3단계 레벨 레이블
export const LEVEL_LABELS: Record<LevelType, string> = {
  basic: '기초',
  intermediate: '심화',
  advanced: '완성',
};

export const LEVEL_COLORS: Record<LevelType, string> = {
  basic: 'from-green-500 to-emerald-500',
  intermediate: 'from-blue-500 to-cyan-500',
  advanced: 'from-purple-500 to-pink-500',
};

// 납품 상태 레이블
export const DELIVERY_LABELS: Record<DeliveryStatus, string> = {
  'not-started': '미시작',
  'nukki-in-progress': '누끼 작업중',
  'nukki-delivered': '누끼 납품완료',
  'video-in-progress': '영상 작업중',
  'video-delivered': '영상 납품완료',
  'final-approved': '최종 승인',
};

export const DELIVERY_COLORS: Record<DeliveryStatus, string> = {
  'not-started': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  'nukki-in-progress': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'nukki-delivered': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'video-in-progress': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  'video-delivered': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'final-approved': 'bg-green-500/20 text-green-400 border-green-500/30',
};

// 월별 마감일 (2026년 기준)
export const MONTHLY_DEADLINES: Record<string, string> = {
  '2026-01': '2026-01-31',
  '2026-02': '2026-02-28',
  '2026-03': '2026-03-31',
  '2026-04': '2026-04-30',
  '2026-05': '2026-05-31',
  '2026-06': '2026-06-30',
};

// 월별 누끼 선납품 마감일 (영상 마감 2주 전)
export const NUKKI_DEADLINES: Record<string, string> = {
  '2026-01': '2026-01-15',
  '2026-02': '2026-02-14',
  '2026-03': '2026-03-15',
  '2026-04': '2026-04-15',
  '2026-05': '2026-05-15',
  '2026-06': '2026-06-15',
};

// Re-export all types explicitly
export type { MonthlyStats as MonthlyStatsType };
