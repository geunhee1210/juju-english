import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProjectList } from './components/ProjectList';
import { CalendarView } from './components/CalendarView';
import { FeedbackManager } from './components/FeedbackManager';
import { Settings } from './components/Settings';
import { ProjectDetail } from './components/ProjectDetail';
import { useProjectStore } from './store/projectStore';
import type { Project } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  // 모바일에서는 기본적으로 사이드바 숨김
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  
  const {
    projects,
    isLoading,
    updatePhaseStatus,
    updateDeliveryStatus,
    addFeedback,
    resolveFeedback,
    getStats,
    resetProjects,
  } = useProjectStore();

  const stats = getStats();

  // 화면 크기 변경 감지
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center animated-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">로딩 중...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            projects={projects} 
            monthlyStats={stats.monthlyStats}
            levelStats={stats.levelStats}
            deliveryStats={stats.deliveryStats}
          />
        );
      case 'projects':
        return (
          <ProjectList
            projects={projects}
            onUpdatePhase={updatePhaseStatus}
            onUpdateDelivery={updateDeliveryStatus}
            onSelectProject={setSelectedProject}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            projects={projects}
            onSelectProject={setSelectedProject}
          />
        );
      case 'feedback':
        return (
          <FeedbackManager
            projects={projects}
            onAddFeedback={addFeedback}
            onResolveFeedback={resolveFeedback}
          />
        );
      case 'settings':
        return (
          <Settings
            projects={projects}
            onResetProjects={resetProjects}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen animated-bg">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />
      
      {/* 메인 콘텐츠 - 항상 전체 너비 사용 */}
      <main 
        className="p-4 lg:p-8 pt-16 lg:pt-8 transition-all duration-300"
      >
        {renderContent()}
      </main>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onUpdatePhase={(projectId, phase, status, progress) => {
            updatePhaseStatus(projectId, phase, status, progress);
            // 선택된 프로젝트도 업데이트
            const updated = projects.find(p => p.id === projectId);
            if (updated) setSelectedProject(updated);
          }}
          onAddFeedback={(projectId, content) => {
            addFeedback(projectId, content);
            const updated = projects.find(p => p.id === projectId);
            if (updated) setSelectedProject(updated);
          }}
        />
      )}
    </div>
  );
}

export default App;
