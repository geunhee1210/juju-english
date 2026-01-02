import { useState } from 'react'

function App() {
  const [activeScreenshot, setActiveScreenshot] = useState(0)

  const screenshots = [
    { title: '대시보드', desc: '전체 프로젝트 현황을 한눈에' },
    { title: '프로젝트 목록', desc: '30개 에피소드 진행 상황 추적' },
    { title: '상세 관리', desc: '단계별 진행률 및 피드백 관리' },
  ]

  const features = [
    { icon: '📊', title: '실시간 대시보드', desc: '30개 에피소드 진행 현황을 한눈에 파악' },
    { icon: '📅', title: '일정 관리', desc: '월별 납품 일정 및 마감일 알림' },
    { icon: '🎬', title: '6단계 워크플로우', desc: '누끼 → 배경 → 리깅 → 애니메이션 → 오디오 → 렌더' },
    { icon: '💬', title: '피드백 관리', desc: '클라이언트 피드백 실시간 추적' },
    { icon: '📦', title: '납품 추적', desc: '누끼 선납품 → 영상 납품 → 최종 승인' },
    { icon: '📱', title: '모바일 지원', desc: '언제 어디서나 프로젝트 확인' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-500" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* App Icon */}
          <div className="animate-slide-up opacity-0">
            <div className="w-28 h-28 md:w-36 md:h-36 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-2xl animate-float animate-pulse-glow">
              <span className="text-5xl md:text-6xl">🎬</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="animate-slide-up opacity-0 delay-100 text-4xl md:text-6xl lg:text-7xl font-black mb-4">
            <span className="gradient-text">주주잉글리시</span>
          </h1>
          
          <p className="animate-slide-up opacity-0 delay-200 text-xl md:text-2xl text-white/70 mb-2">
            Animation Studio
          </p>
          
          <p className="animate-slide-up opacity-0 delay-300 text-lg md:text-xl text-white/50 mb-12 max-w-2xl mx-auto">
            영유아 교육용 2D 동화 애니메이션 제작 프로젝트를<br className="hidden md:block" />
            체계적으로 관리하는 전문 도구
          </p>

          {/* Download Button */}
          <div className="animate-slide-up opacity-0 delay-400 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="#download" 
              className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                📥 APK 다운로드
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </a>
            
            <a 
              href="#features" 
              className="px-8 py-4 glass rounded-2xl font-bold text-lg hover:bg-white/20 transition-all duration-300"
            >
              기능 살펴보기
            </a>
          </div>

          {/* Stats */}
          <div className="animate-slide-up opacity-0 delay-500 grid grid-cols-3 gap-4 md:gap-8 mt-16 max-w-2xl mx-auto">
            {[
              { value: '30', label: '에피소드' },
              { value: '6', label: '제작 단계' },
              { value: '100%', label: '무료' },
            ].map((stat, i) => (
              <div key={i} className="glass rounded-2xl p-4 md:p-6">
                <div className="text-2xl md:text-4xl font-black gradient-text">{stat.value}</div>
                <div className="text-sm md:text-base text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Screenshots Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
            📸 스크린샷
          </h2>
          <p className="text-white/50 text-center mb-12 text-lg">
            직관적인 UI로 프로젝트를 손쉽게 관리하세요
          </p>

          {/* Screenshot Tabs */}
          <div className="flex justify-center gap-2 md:gap-4 mb-8">
            {screenshots.map((screen, i) => (
              <button
                key={i}
                onClick={() => setActiveScreenshot(i)}
                className={`px-4 md:px-6 py-2 md:py-3 rounded-xl font-medium transition-all ${
                  activeScreenshot === i 
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white' 
                    : 'glass text-white/70 hover:text-white'
                }`}
              >
                {screen.title}
              </button>
            ))}
          </div>

          {/* Screenshot Display */}
          <div className="relative">
            <div className="glass rounded-3xl p-2 md:p-4 max-w-4xl mx-auto">
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {activeScreenshot === 0 ? '📊' : activeScreenshot === 1 ? '📁' : '⚙️'}
                  </div>
                  <p className="text-xl font-semibold">{screenshots[activeScreenshot].title}</p>
                  <p className="text-white/50">{screenshots[activeScreenshot].desc}</p>
                  <p className="text-sm text-white/30 mt-4">
                    (실제 스크린샷으로 교체 가능)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-4">
            ✨ 주요 기능
          </h2>
          <p className="text-white/50 text-center mb-12 text-lg">
            애니메이션 제작에 필요한 모든 기능을 담았습니다
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 group"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-white/60">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
            🛠️ 기술 스택
          </h2>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              { name: 'React', color: 'from-cyan-500 to-blue-500' },
              { name: 'TypeScript', color: 'from-blue-500 to-blue-700' },
              { name: 'Tailwind CSS', color: 'from-teal-500 to-cyan-500' },
              { name: 'Capacitor', color: 'from-blue-400 to-indigo-500' },
              { name: 'Vite', color: 'from-purple-500 to-violet-500' },
              { name: 'Recharts', color: 'from-pink-500 to-rose-500' },
            ].map((tech, i) => (
              <div 
                key={i}
                className={`px-6 py-3 rounded-full bg-gradient-to-r ${tech.color} font-semibold shadow-lg hover:scale-110 transition-transform cursor-default`}
              >
                {tech.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section id="download" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-3xl p-8 md:p-12 text-center">
            <div className="text-6xl mb-6">📱</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              지금 바로 다운로드
            </h2>
            <p className="text-white/60 mb-8 text-lg">
              무료로 앱을 다운로드하고 프로젝트 관리를 시작하세요
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="./juju-english-studio.apk" 
                download
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl font-bold text-lg shadow-lg hover:shadow-orange-500/50 hover:scale-105 transition-all"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.523 2.047a.5.5 0 0 0-.5.5v3.75a.5.5 0 0 0 1 0v-3.75a.5.5 0 0 0-.5-.5zm-11.046 0a.5.5 0 0 0-.5.5v3.75a.5.5 0 0 0 1 0v-3.75a.5.5 0 0 0-.5-.5zM3.75 5.297a2.75 2.75 0 0 0-2.75 2.75v11a2.75 2.75 0 0 0 2.75 2.75h16.5a2.75 2.75 0 0 0 2.75-2.75v-11a2.75 2.75 0 0 0-2.75-2.75H3.75zm8.25 3.75a4.75 4.75 0 1 1 0 9.5 4.75 4.75 0 0 1 0-9.5z"/>
                </svg>
                Android APK 다운로드
              </a>
              
              <a 
                href="https://github.com" 
                target="_blank"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 glass rounded-2xl font-bold text-lg hover:bg-white/20 transition-all"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                GitHub 소스코드
              </a>
            </div>

            <p className="text-white/40 text-sm mt-6">
              * Android 8.0 이상 필요 | 약 15MB
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">🎬</span>
            <span className="font-bold text-xl gradient-text">주주잉글리시</span>
          </div>
          <p className="text-white/40 text-sm">
            © 2026 JuJu English Animation Studio. All rights reserved.
          </p>
          <p className="text-white/30 text-xs mt-2">
            Made with ❤️ using React, TypeScript & Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
