import { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  FolderOpen, 
  RefreshCw, 
  Download,
  Upload,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import type { Project } from '../types';

interface SettingsProps {
  projects: Project[];
  onResetProjects: () => void;
}

export function Settings({ projects, onResetProjects }: SettingsProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [projectPath, setProjectPath] = useState('/mnt/d/Projects/JujuEnglish');
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [deadlineWarningDays, setDeadlineWarningDays] = useState(7);

  const handleExportData = () => {
    const data = JSON.stringify(projects, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `juju-english-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        localStorage.setItem('juju-english-projects', JSON.stringify(data));
        window.location.reload();
      } catch (error) {
        alert('유효하지 않은 파일 형식입니다.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-white/70" />
          설정
        </h2>
        <p className="text-white/50 mt-1">프로젝트 환경 설정 및 데이터 관리</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">일반 설정</h3>
          
          <div className="space-y-6">
            {/* Project Path */}
            <div>
              <label className="block text-sm text-white/70 mb-2">프로젝트 경로</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={projectPath}
                  onChange={(e) => setProjectPath(e.target.value)}
                  className="input-field flex-1"
                />
                <button className="px-4 py-2 rounded-xl bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors">
                  <FolderOpen className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-white/40 mt-2">
                프로젝트 파일이 저장될 기본 경로입니다
              </p>
            </div>

            {/* Auto Save */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">자동 저장</p>
                <p className="text-sm text-white/50">변경사항을 자동으로 저장합니다</p>
              </div>
              <button
                onClick={() => setAutoSave(!autoSave)}
                className={`w-14 h-8 rounded-full transition-colors relative ${
                  autoSave ? 'bg-emerald-500' : 'bg-white/20'
                }`}
              >
                <div className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-transform ${
                  autoSave ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">알림</p>
                <p className="text-sm text-white/50">마감일 및 피드백 알림을 받습니다</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-14 h-8 rounded-full transition-colors relative ${
                  notifications ? 'bg-emerald-500' : 'bg-white/20'
                }`}
              >
                <div className={`absolute w-6 h-6 bg-white rounded-full top-1 transition-transform ${
                  notifications ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Deadline Warning Days */}
            <div>
              <label className="block text-sm text-white/70 mb-2">
                마감일 경고 (D-N)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="14"
                  value={deadlineWarningDays}
                  onChange={(e) => setDeadlineWarningDays(parseInt(e.target.value))}
                  className="flex-1 accent-orange-500"
                />
                <span className="w-12 text-center text-white font-bold">
                  {deadlineWarningDays}일
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">데이터 관리</h3>
          
          <div className="space-y-4">
            {/* Export */}
            <button
              onClick={handleExportData}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                <Download className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">데이터 내보내기</p>
                <p className="text-sm text-white/50">현재 프로젝트 데이터를 JSON으로 백업</p>
              </div>
            </button>

            {/* Import */}
            <label className="w-full flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
                <Upload className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <p className="text-white font-medium">데이터 가져오기</p>
                <p className="text-sm text-white/50">백업 파일에서 데이터 복원</p>
              </div>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>

            {/* Reset */}
            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors text-left border border-red-500/30 group"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                <RefreshCw className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-red-400 font-medium">데이터 초기화</p>
                <p className="text-sm text-white/50">모든 프로젝트 데이터를 초기 상태로 리셋</p>
              </div>
            </button>
          </div>

          {/* Stats */}
          <div className="mt-6 p-4 rounded-xl bg-white/5">
            <h4 className="text-sm font-medium text-white/70 mb-3">데이터 통계</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/50">프로젝트 수:</span>
                <span className="text-white ml-2 font-medium">{projects.length}개</span>
              </div>
              <div>
                <span className="text-white/50">총 피드백:</span>
                <span className="text-white ml-2 font-medium">
                  {projects.reduce((sum, p) => sum + p.feedback.length, 0)}개
                </span>
              </div>
              <div>
                <span className="text-white/50">저장 위치:</span>
                <span className="text-white ml-2 font-medium">LocalStorage</span>
              </div>
              <div>
                <span className="text-white/50">마지막 수정:</span>
                <span className="text-white ml-2 font-medium">방금 전</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Folder Structure Preview */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">권장 폴더 구조</h3>
        <div className="font-mono text-sm bg-black/30 rounded-xl p-4 overflow-x-auto">
          <pre className="text-green-400">
{`📁 JujuEnglish/
├── 📁 EP001_LittleRedHen/
│   ├── 📁 01_원본/          # 원본 교재 이미지
│   ├── 📁 02_누끼/          # 누끼 완료 파일
│   │   ├── 📁 캐릭터/
│   │   ├── 📁 배경/
│   │   └── 📁 소품/
│   ├── 📁 03_PSD/           # 작업용 PSD 파일
│   ├── 📁 04_AE/            # After Effects 프로젝트
│   ├── 📁 05_오디오/        # 내레이션, BGM
│   └── 📁 06_출력/          # 최종 렌더링 파일
├── 📁 EP002_ThreeLittlePigs/
│   └── ...
├── 📁 _템플릿/              # 공통 템플릿
│   ├── 📁 AE_템플릿/
│   ├── 📁 PSD_템플릿/
│   └── 📁 리깅_프리셋/
└── 📁 _공통애셋/            # 재사용 애셋
    ├── 📁 UI/
    ├── 📁 효과/
    └── 📁 BGM/`}
          </pre>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-light rounded-2xl p-6 max-w-md w-full mx-4 animate-slide-up">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">데이터 초기화</h3>
                <p className="text-sm text-white/50">이 작업은 되돌릴 수 없습니다</p>
              </div>
            </div>
            
            <p className="text-white/70 mb-6">
              모든 프로젝트 데이터와 피드백이 삭제되고 초기 상태로 돌아갑니다. 
              계속하시겠습니까?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  onResetProjects();
                  setShowResetConfirm(false);
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

