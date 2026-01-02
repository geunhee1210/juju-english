import { 
  LayoutDashboard, 
  FolderKanban, 
  Calendar, 
  MessageSquare, 
  Settings,
  Film,
  Sparkles,
  X,
  Menu
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { id: 'projects', label: '프로젝트', icon: FolderKanban },
  { id: 'calendar', label: '일정', icon: Calendar },
  { id: 'feedback', label: '피드백', icon: MessageSquare },
  { id: 'settings', label: '설정', icon: Settings },
];

export function Sidebar({ activeTab, onTabChange, isCollapsed, onToggle }: SidebarProps) {
  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
    // 메뉴 선택 시 자동으로 닫기
    onToggle();
  };

  return (
    <>
      {/* 오버레이 배경 - 클릭 시 사이드바 닫기 */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={onToggle}
        />
      )}

      {/* 사이드바 */}
      <aside 
        className={`
          fixed left-0 top-0 h-full glass-light flex flex-col z-50
          transition-all duration-300 ease-in-out
          w-72
          ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {/* 내부 콘텐츠 래퍼 */}
        <div className="w-72 h-full flex flex-col">
          {/* Logo */}
          <div className="p-4 lg:p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg flex-shrink-0">
                  <Film className="w-5 h-5 lg:w-7 lg:h-7 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap">
                    주주잉글리시
                  </h1>
                  <p className="text-xs text-white/50 whitespace-nowrap">Animation Studio</p>
                </div>
              </div>
              {/* 닫기 버튼 */}
              <button
                onClick={onToggle}
                className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2 overflow-y-auto">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 lg:px-4 py-3 lg:py-3.5 rounded-xl
                    transition-all duration-300 group whitespace-nowrap
                    ${isActive 
                      ? 'bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 text-white' 
                      : 'hover:bg-white/5 text-white/60 hover:text-white'
                    }
                  `}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={`
                    w-8 h-8 lg:w-9 lg:h-9 rounded-lg flex items-center justify-center flex-shrink-0
                    transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-br from-orange-500 to-pink-500 shadow-lg shadow-orange-500/30' 
                      : 'bg-white/5 group-hover:bg-white/10'
                    }
                  `}>
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <span className="font-medium text-sm lg:text-base">{item.label}</span>
                  {isActive && (
                    <Sparkles className="w-4 h-4 ml-auto text-orange-400 animate-pulse flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Project Progress Summary */}
          <div className="p-3 m-3 lg:p-4 lg:m-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20">
            <div className="flex items-center justify-between mb-2 lg:mb-3">
              <span className="text-xs lg:text-sm font-medium text-white/80 whitespace-nowrap">전체 진행률</span>
              <span className="text-base lg:text-lg font-bold text-violet-400">6.7%</span>
            </div>
            <div className="h-1.5 lg:h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full progress-bar"
                style={{ width: '6.7%' }}
              />
            </div>
            <p className="text-xs text-white/50 mt-2 whitespace-nowrap">
              2/30 영상 완료 • 마감일 6/30
            </p>
          </div>

          {/* Version */}
          <div className="p-4 border-t border-white/10 text-center">
            <p className="text-xs text-white/30 whitespace-nowrap">v1.0.0 • 2026</p>
          </div>
        </div>
      </aside>

      {/* 메뉴 열기 버튼 (사이드바가 숨겨졌을 때) */}
      {isCollapsed && (
        <button
          onClick={onToggle}
          className="fixed left-3 top-3 lg:left-4 lg:top-4 w-11 h-11 lg:w-12 lg:h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg hover:scale-110 transition-all z-50"
          title="메뉴 열기"
        >
          <Menu className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>
      )}
    </>
  );
}
