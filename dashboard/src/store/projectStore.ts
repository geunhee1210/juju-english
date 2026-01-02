import { useState, useEffect } from 'react';
import type { Project, ProjectStatus, TaskPhase, ActivityLog, LevelType, DeliveryStatus, LevelStats, DeliveryStats } from '../types';

// 로컬 스토리지 키
const STORAGE_KEY = 'juju-english-projects-v2';
const ACTIVITY_KEY = 'juju-english-activity-v2';

// 예시 피드백 데이터
const SAMPLE_FEEDBACK = [
  { content: '암탉 캐릭터의 눈이 너무 작아요. 조금 더 크게 해주세요.', resolved: true },
  { content: '배경색이 너무 어두워서 아이들이 무서워할 것 같아요.', resolved: true },
  { content: '내레이션 속도가 빨라요. 5~7세 아이들 기준으로 천천히 해주세요.', resolved: false },
  { content: '인트로 BGM이 너무 시끄러워요. 볼륨 낮춰주세요.', resolved: false },
  { content: '늑대 캐릭터가 무서워요. 좀 더 귀엽게 수정해주세요.', resolved: true },
  { content: '자막 폰트가 너무 작아요. 크기를 키워주세요.', resolved: false },
  { content: '곰돌이 표정이 딱딱해요. 더 부드럽게 해주세요.', resolved: false },
  { content: '장면 전환이 너무 빨라요. 아이들이 따라가기 어려워요.', resolved: true },
];

// 예시 에셋 파일 경로
const generateSampleAssets = (episodeId: string, completed: boolean) => ({
  originalPages: completed ? [
    `/projects/${episodeId}/01_원본/page_01.jpg`,
    `/projects/${episodeId}/01_원본/page_02.jpg`,
    `/projects/${episodeId}/01_원본/page_03.jpg`,
    `/projects/${episodeId}/01_원본/page_04.jpg`,
    `/projects/${episodeId}/01_원본/page_05.jpg`,
    `/projects/${episodeId}/01_원본/page_06.jpg`,
    `/projects/${episodeId}/01_원본/page_07.jpg`,
    `/projects/${episodeId}/01_원본/page_08.jpg`,
  ] : [],
  nukkiFiles: completed ? [
    `/projects/${episodeId}/02_누끼/캐릭터/char_001.png`,
    `/projects/${episodeId}/02_누끼/캐릭터/char_002.png`,
    `/projects/${episodeId}/02_누끼/배경/bg_001.png`,
    `/projects/${episodeId}/02_누끼/소품/prop_001.png`,
  ] : [],
  psdFiles: completed ? [
    `/projects/${episodeId}/03_PSD/${episodeId}_main.psd`,
  ] : [],
  aeProject: completed ? `/projects/${episodeId}/04_AE/${episodeId}_project.aep` : undefined,
  audioFiles: completed ? [
    `/projects/${episodeId}/05_오디오/내레이션/narration_01.wav`,
    `/projects/${episodeId}/05_오디오/BGM/bgm_main.mp3`,
  ] : [],
  outputFile: completed ? `/projects/${episodeId}/06_출력/최종/${episodeId}_final.mp4` : undefined,
});

// 초기 활동 로그 생성
const generateInitialActivityLogs = (): ActivityLog[] => {
  const now = new Date();
  return [
    {
      id: 'LOG001',
      projectId: 'EP001',
      projectTitle: 'The Little Red Hen',
      action: '최종 승인 완료',
      phase: 'render',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'LOG002',
      projectId: 'EP002',
      projectTitle: 'Three Little Pigs',
      action: '영상 납품 완료',
      phase: 'render',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: 'LOG003',
      projectId: 'EP003',
      projectTitle: 'Goldilocks',
      action: '배경 리터칭 진행중 (50%)',
      phase: 'background',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString(),
    },
    {
      id: 'LOG004',
      projectId: 'EP003',
      projectTitle: 'Goldilocks',
      action: '누끼 납품 완료',
      phase: 'nukki',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'LOG005',
      projectId: 'EP004',
      projectTitle: 'The Ugly Duckling',
      action: '누끼 작업 시작',
      phase: 'nukki',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: 'LOG006',
      projectId: 'EP005',
      projectTitle: 'The Tortoise and the Hare',
      action: '누끼 작업 시작',
      phase: 'nukki',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
    {
      id: 'LOG007',
      projectId: 'EP006',
      projectTitle: 'Little Red Riding Hood',
      action: '누끼 납품 완료',
      phase: 'nukki',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
    {
      id: 'LOG008',
      projectId: 'EP001',
      projectTitle: 'The Little Red Hen',
      action: '클라이언트 피드백 반영 완료',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
    {
      id: 'LOG009',
      projectId: 'EP002',
      projectTitle: 'Three Little Pigs',
      action: '애니메이션 작업 완료',
      phase: 'animation',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    },
    {
      id: 'LOG010',
      projectId: 'EP001',
      projectTitle: 'The Little Red Hen',
      action: '새 피드백 추가',
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    },
  ];
};

// 3단계 레벨 결정 (매월 기초2 + 심화2 + 완성2)
const getLevelForIndex = (indexInMonth: number): LevelType => {
  if (indexInMonth < 2) return 'basic';
  if (indexInMonth < 4) return 'intermediate';
  return 'advanced';
};

// 초기 30개 프로젝트 생성
const generateInitialProjects = (): Project[] => {
  const projects: Project[] = [];
  const months = ['01', '02', '03', '04', '05', '06'];
  const storyTitles = [
    // 1월: 기초2 + 심화2 + 완성2
    'The Little Red Hen', 'Three Little Pigs', 'Goldilocks', 'The Ugly Duckling',
    'The Tortoise and the Hare', 'Little Red Riding Hood',
    // 2월
    'Jack and the Beanstalk', 'Cinderella', 'The Gingerbread Man', 'The Three Bears',
    'Snow White', 'Hansel and Gretel',
    // 3월
    'Rapunzel', 'The Frog Prince', 'Pinocchio', 'Thumbelina',
    'The Little Mermaid', 'Sleeping Beauty',
    // 4월
    'Rumpelstiltskin', 'The Pied Piper', 'The Elves and the Shoemaker', 'The Bremen Town Musicians',
    'The Princess and the Pea', 'The Snow Queen',
    // 5월
    'The Steadfast Tin Soldier', 'The Wild Swans', 'The Nightingale', 'The Red Shoes',
    'The Little Match Girl', 'The Tinderbox'
  ];

  const now = new Date();

  for (let i = 0; i < 30; i++) {
    const monthIndex = Math.floor(i / 6);
    const indexInMonth = i % 6;
    const month = months[monthIndex];
    const dayOffset = indexInMonth * 4 + 5;
    const dueDate = `2026-${month}-${String(Math.min(28, dayOffset + 10)).padStart(2, '0')}`;
    const nukkiDueDate = `2026-${month}-${String(Math.min(15, dayOffset)).padStart(2, '0')}`; // 누끼는 15일까지
    const episodeId = `EP${String(i + 1).padStart(3, '0')}`;
    
    // 3단계 레벨 설정
    const level = getLevelForIndex(indexInMonth);
    
    // 진행 상태 및 납품 상태 설정
    let status: ProjectStatus;
    let deliveryStatus: DeliveryStatus;
    let phases: Project['phases'];

    if (i === 0) {
      // EP001: 최종 승인 완료 (기초)
      status = 'completed';
      deliveryStatus = 'final-approved';
      phases = [
        { phase: 'nukki', status: 'completed', progress: 100, updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10).toISOString() },
        { phase: 'background', status: 'completed', progress: 100, updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 8).toISOString() },
        { phase: 'rigging', status: 'completed', progress: 100, updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 6).toISOString() },
        { phase: 'animation', status: 'completed', progress: 100, updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4).toISOString() },
        { phase: 'audio', status: 'completed', progress: 100, updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString() },
        { phase: 'render', status: 'completed', progress: 100, updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString() },
      ];
    } else if (i === 1) {
      // EP002: 영상 납품 완료 (기초)
      status = 'completed';
      deliveryStatus = 'video-delivered';
      phases = [
        { phase: 'nukki', status: 'completed', progress: 100, updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 8).toISOString() },
        { phase: 'background', status: 'completed', progress: 100, updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 6).toISOString() },
        { phase: 'rigging', status: 'completed', progress: 100, updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString() },
        { phase: 'animation', status: 'completed', progress: 100, updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4).toISOString() },
        { phase: 'audio', status: 'completed', progress: 100, updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString() },
        { phase: 'render', status: 'completed', progress: 100, updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString() },
      ];
    } else if (i === 2) {
      // EP003: 영상 작업중 (심화) - 배경 리터칭 단계
      status = 'in-progress';
      deliveryStatus = 'video-in-progress';
      phases = [
        { phase: 'nukki', status: 'completed', progress: 100, updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString() },
        { phase: 'background', status: 'in-progress', progress: 50, updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 8).toISOString() },
        { phase: 'rigging', status: 'pending', progress: 0, updatedAt: now.toISOString() },
        { phase: 'animation', status: 'pending', progress: 0, updatedAt: now.toISOString() },
        { phase: 'audio', status: 'pending', progress: 0, updatedAt: now.toISOString() },
        { phase: 'render', status: 'pending', progress: 0, updatedAt: now.toISOString() },
      ];
    } else if (i === 3) {
      // EP004: 누끼 작업중 (심화)
      status = 'in-progress';
      deliveryStatus = 'nukki-in-progress';
      phases = [
        { phase: 'nukki', status: 'in-progress', progress: 60, updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString() },
        { phase: 'background', status: 'pending', progress: 0, updatedAt: now.toISOString() },
        { phase: 'rigging', status: 'pending', progress: 0, updatedAt: now.toISOString() },
        { phase: 'animation', status: 'pending', progress: 0, updatedAt: now.toISOString() },
        { phase: 'audio', status: 'pending', progress: 0, updatedAt: now.toISOString() },
        { phase: 'render', status: 'pending', progress: 0, updatedAt: now.toISOString() },
      ];
    } else if (i === 4) {
      // EP005: 누끼 작업중 (완성)
      status = 'in-progress';
      deliveryStatus = 'nukki-in-progress';
      phases = [
        { phase: 'nukki', status: 'in-progress', progress: 30, updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString() },
        { phase: 'background', status: 'pending', progress: 0, updatedAt: now.toISOString() },
        { phase: 'rigging', status: 'pending', progress: 0, updatedAt: now.toISOString() },
        { phase: 'animation', status: 'pending', progress: 0, updatedAt: now.toISOString() },
        { phase: 'audio', status: 'pending', progress: 0, updatedAt: now.toISOString() },
        { phase: 'render', status: 'pending', progress: 0, updatedAt: now.toISOString() },
      ];
    } else if (i === 5) {
      // EP006: 누끼 납품 완료 (완성) - 영상 작업 대기
      status = 'in-progress';
      deliveryStatus = 'nukki-delivered';
      phases = [
        { phase: 'nukki', status: 'completed', progress: 100, updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString() },
        { phase: 'background', status: 'pending', progress: 0, updatedAt: now.toISOString() },
        { phase: 'rigging', status: 'pending', progress: 0, updatedAt: now.toISOString() },
        { phase: 'animation', status: 'pending', progress: 0, updatedAt: now.toISOString() },
        { phase: 'audio', status: 'pending', progress: 0, updatedAt: now.toISOString() },
        { phase: 'render', status: 'pending', progress: 0, updatedAt: now.toISOString() },
      ];
    } else {
      // 나머지: 대기
      status = 'pending';
      deliveryStatus = 'not-started';
      phases = [
        { phase: 'nukki', status: 'pending', progress: 0, updatedAt: now.toISOString() },
        { phase: 'background', status: 'pending', progress: 0, updatedAt: now.toISOString() },
        { phase: 'rigging', status: 'pending', progress: 0, updatedAt: now.toISOString() },
        { phase: 'animation', status: 'pending', progress: 0, updatedAt: now.toISOString() },
        { phase: 'audio', status: 'pending', progress: 0, updatedAt: now.toISOString() },
        { phase: 'render', status: 'pending', progress: 0, updatedAt: now.toISOString() },
      ];
    }

    // 피드백 추가 (처음 6개 프로젝트에)
    const feedback = [];
    if (i < 6) {
      const numFeedback = i < 2 ? 3 : i < 4 ? 2 : 1;
      for (let j = 0; j < numFeedback; j++) {
        const sampleIdx = (i * 2 + j) % SAMPLE_FEEDBACK.length;
        feedback.push({
          id: `FB${episodeId}_${j + 1}`,
          content: SAMPLE_FEEDBACK[sampleIdx].content,
          createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * (5 - j)).toISOString(),
          resolved: SAMPLE_FEEDBACK[sampleIdx].resolved,
          resolvedAt: SAMPLE_FEEDBACK[sampleIdx].resolved 
            ? new Date(now.getTime() - 1000 * 60 * 60 * 24 * (3 - j)).toISOString() 
            : undefined,
        });
      }
    }

    projects.push({
      id: episodeId,
      episodeNumber: i + 1,
      title: storyTitles[i],
      description: `Episode ${i + 1}: ${storyTitles[i]} - 5~7세 대상 영어 동화 애니메이션`,
      status,
      level,
      deliveryStatus,
      phases,
      dueDate,
      nukkiDueDate,
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      updatedAt: now.toISOString(),
      feedback,
      assets: generateSampleAssets(episodeId, status === 'completed'),
      metadata: {
        duration: 90 + Math.floor(Math.random() * 30),
        resolution: '1920x1080',
        frameRate: 24,
        pageCount: 8,
      },
    });
  }

  return projects;
};

// 프로젝트 스토어 훅
export function useProjectStore() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로드
  useEffect(() => {
    const loadData = () => {
      try {
        const storedProjects = localStorage.getItem(STORAGE_KEY);
        const storedActivity = localStorage.getItem(ACTIVITY_KEY);
        
        if (storedProjects) {
          setProjects(JSON.parse(storedProjects));
        } else {
          const initial = generateInitialProjects();
          setProjects(initial);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        }

        if (storedActivity) {
          setActivityLogs(JSON.parse(storedActivity));
        } else {
          const initialLogs = generateInitialActivityLogs();
          setActivityLogs(initialLogs);
          localStorage.setItem(ACTIVITY_KEY, JSON.stringify(initialLogs));
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        const initial = generateInitialProjects();
        setProjects(initial);
        const initialLogs = generateInitialActivityLogs();
        setActivityLogs(initialLogs);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 저장
  const saveProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProjects));
  };

  const saveActivity = (logs: ActivityLog[]) => {
    setActivityLogs(logs);
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(logs));
  };

  // 활동 로그 추가
  const addActivityLog = (projectId: string, action: string, phase?: TaskPhase) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newLog: ActivityLog = {
      id: `LOG${Date.now()}`,
      projectId,
      projectTitle: project.title,
      action,
      phase,
      timestamp: new Date().toISOString(),
    };

    const updatedLogs = [newLog, ...activityLogs].slice(0, 100);
    saveActivity(updatedLogs);
  };

  // 프로젝트 업데이트
  const updateProject = (projectId: string, updates: Partial<Project>) => {
    const updatedProjects = projects.map(p => 
      p.id === projectId 
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    );
    saveProjects(updatedProjects);
  };

  // 단계 상태 업데이트
  const updatePhaseStatus = (
    projectId: string, 
    phase: TaskPhase, 
    status: ProjectStatus, 
    progress: number
  ) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedPhases = project.phases.map(p => 
      p.phase === phase 
        ? { ...p, status, progress, updatedAt: new Date().toISOString() }
        : p
    );

    // 전체 프로젝트 상태 계산
    const allCompleted = updatedPhases.every(p => p.status === 'completed');
    const anyInProgress = updatedPhases.some(p => p.status === 'in-progress');
    const projectStatus: ProjectStatus = allCompleted 
      ? 'completed' 
      : anyInProgress 
        ? 'in-progress' 
        : 'pending';

    // 납품 상태 자동 업데이트
    let deliveryStatus = project.deliveryStatus;
    const nukkiPhase = updatedPhases.find(p => p.phase === 'nukki');
    const renderPhase = updatedPhases.find(p => p.phase === 'render');
    
    if (nukkiPhase?.status === 'in-progress' && deliveryStatus === 'not-started') {
      deliveryStatus = 'nukki-in-progress';
    }
    if (nukkiPhase?.status === 'completed' && (deliveryStatus === 'nukki-in-progress' || deliveryStatus === 'not-started')) {
      deliveryStatus = 'nukki-delivered';
    }
    if (renderPhase?.status === 'in-progress' || (nukkiPhase?.status === 'completed' && anyInProgress)) {
      deliveryStatus = 'video-in-progress';
    }
    if (allCompleted) {
      deliveryStatus = 'video-delivered';
    }

    updateProject(projectId, { phases: updatedPhases, status: projectStatus, deliveryStatus });
    addActivityLog(projectId, `${phase} 단계를 ${status}로 변경`, phase);
  };

  // 납품 상태 업데이트
  const updateDeliveryStatus = (projectId: string, deliveryStatus: DeliveryStatus) => {
    updateProject(projectId, { deliveryStatus });
    addActivityLog(projectId, `납품 상태: ${deliveryStatus}`);
  };

  // 피드백 추가
  const addFeedback = (projectId: string, content: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const newFeedback = {
      id: `FB${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      resolved: false,
    };

    updateProject(projectId, { 
      feedback: [...project.feedback, newFeedback] 
    });
    addActivityLog(projectId, '새 피드백 추가');
  };

  // 피드백 해결
  const resolveFeedback = (projectId: string, feedbackId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const updatedFeedback = project.feedback.map(f => 
      f.id === feedbackId 
        ? { ...f, resolved: true, resolvedAt: new Date().toISOString() }
        : f
    );

    updateProject(projectId, { feedback: updatedFeedback });
    addActivityLog(projectId, '피드백 해결');
  };

  // 레벨별 통계
  const getLevelStats = (): LevelStats[] => {
    const levels: LevelType[] = ['basic', 'intermediate', 'advanced'];
    return levels.map(level => {
      const levelProjects = projects.filter(p => p.level === level);
      return {
        level,
        total: levelProjects.length,
        completed: levelProjects.filter(p => p.status === 'completed').length,
        inProgress: levelProjects.filter(p => p.status === 'in-progress').length,
      };
    });
  };

  // 납품 통계
  const getDeliveryStats = (): DeliveryStats => {
    const nukkiDelivered = projects.filter(p => 
      p.deliveryStatus === 'nukki-delivered' || 
      p.deliveryStatus === 'video-in-progress' ||
      p.deliveryStatus === 'video-delivered' ||
      p.deliveryStatus === 'final-approved'
    ).length;
    const nukkiPending = projects.filter(p => 
      p.deliveryStatus === 'not-started' || 
      p.deliveryStatus === 'nukki-in-progress'
    ).length;
    const videoDelivered = projects.filter(p => 
      p.deliveryStatus === 'video-delivered' ||
      p.deliveryStatus === 'final-approved'
    ).length;
    const videoPending = projects.filter(p => 
      p.deliveryStatus !== 'video-delivered' && 
      p.deliveryStatus !== 'final-approved'
    ).length;

    return { nukkiDelivered, nukkiPending, videoDelivered, videoPending };
  };

  // 통계 계산
  const getStats = () => {
    const total = projects.length;
    const completed = projects.filter(p => p.status === 'completed').length;
    const inProgress = projects.filter(p => p.status === 'in-progress').length;
    const pending = projects.filter(p => p.status === 'pending').length;
    const overallProgress = total > 0 
      ? Math.round((completed / total) * 100)
      : 0;

    // 마감 임박 프로젝트 (14일 이내)
    const now = new Date();
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = projects
      .filter(p => {
        const dueDate = new Date(p.dueDate);
        return p.status !== 'completed' && dueDate <= twoWeeksFromNow;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    // 월별 통계
    const monthlyStats = ['01', '02', '03', '04', '05', '06'].map(month => {
      const monthProjects = projects.filter(p => p.dueDate.includes(`2026-${month}`));
      return {
        month: `2026-${month}`,
        total: monthProjects.length,
        completed: monthProjects.filter(p => p.status === 'completed').length,
        inProgress: monthProjects.filter(p => p.status === 'in-progress').length,
        pending: monthProjects.filter(p => p.status === 'pending').length,
      };
    });

    // 레벨별 통계
    const levelStats = getLevelStats();
    
    // 납품 통계
    const deliveryStats = getDeliveryStats();

    return {
      total,
      completed,
      inProgress,
      pending,
      overallProgress,
      upcomingDeadlines,
      monthlyStats,
      levelStats,
      deliveryStats,
      recentActivity: activityLogs.slice(0, 10),
    };
  };

  // 프로젝트 초기화 (데모용)
  const resetProjects = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACTIVITY_KEY);
    const initial = generateInitialProjects();
    const initialLogs = generateInitialActivityLogs();
    saveProjects(initial);
    saveActivity(initialLogs);
  };

  return {
    projects,
    activityLogs,
    isLoading,
    updateProject,
    updatePhaseStatus,
    updateDeliveryStatus,
    addFeedback,
    resolveFeedback,
    addActivityLog,
    getStats,
    getLevelStats,
    getDeliveryStats,
    resetProjects,
  };
}
