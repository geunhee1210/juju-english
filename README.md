# 🎬 주주잉글리시 2D 동화 애니메이션 제작 시스템

5~7세 영유아 대상 미국 공교육 영어 프로그램을 위한 2D 애니메이션 제작 자동화 시스템입니다.

## 📋 프로젝트 개요

- **목표**: 30개 영상 제작 (2026년 6월 30일까지)
- **월별 목표**: 6개 영상/월
- **영상 길이**: 1분 30초 ~ 2분
- **해상도**: 1920x1080 @ 24fps

## 🗂️ 시스템 구성

```
juju-english/
├── dashboard/           # 프로젝트 트래킹 대시보드 (React)
├── scripts/             # 파일 자동화 스크립트 (Node.js)
├── ae-scripts/          # After Effects 자동화 스크립트
├── templates/           # 템플릿 파일
└── projects/            # 실제 프로젝트 파일 (자동 생성)
```

## 🚀 빠른 시작

### 1. 대시보드 실행

```bash
cd dashboard
npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 2. 프로젝트 폴더 생성

```bash
cd scripts
npm install
node init-project.js
```

대화형 메뉴에서:
- **전체 30개 에피소드 생성**: 모든 프로젝트 폴더를 한 번에 생성
- **단일 에피소드 생성**: 특정 에피소드만 생성
- **공통 폴더만 생성**: 템플릿 및 공통 애셋 폴더만 생성

### 3. 파일 자동 정리

```bash
# 미리보기 (실제 이동 없음)
node organize-files.js preview ./projects

# 실행
node organize-files.js organize ./projects

# 실시간 감시 모드
node organize-files.js watch ./projects
```

### 4. After Effects 스크립트

After Effects에서 `File > Scripts > Run Script File`로 실행:

| 스크립트 | 설명 |
|---------|------|
| `JujuEnglish_ImportAssets.jsx` | 애셋 일괄 가져오기 및 프로젝트 구성 |
| `JujuEnglish_AutoRig.jsx` | 캐릭터 자동 리깅 |
| `JujuEnglish_TimelineSync.jsx` | 타임라인 자동 구성 & 오디오 싱크 |
| `JujuEnglish_BatchRender.jsx` | 배치 렌더링 |

## 📁 프로젝트 폴더 구조

각 에피소드 폴더는 다음과 같은 구조를 가집니다:

```
EP001_TheLittleRedHen/
├── 01_원본/              # 원본 교재 이미지 (8페이지)
├── 02_누끼/              # 누끼 완료 파일
│   ├── 캐릭터/
│   ├── 배경/
│   └── 소품/
├── 03_PSD/               # 작업용 PSD 파일
├── 04_AE/                # After Effects 프로젝트
├── 05_오디오/            # 오디오 파일
│   ├── 내레이션/
│   ├── BGM/
│   └── 효과음/
├── 06_출력/              # 렌더링 결과물
│   ├── 프리뷰/
│   └── 최종/
├── project.json          # 프로젝트 메타데이터
└── README.md             # 작업 체크리스트
```

## 📊 대시보드 기능

### 메인 대시보드
- 전체 진행 현황 요약
- 월별 통계 차트
- 단계별 진행률
- 마감 임박 프로젝트 알림

### 프로젝트 관리
- 30개 영상 목록 및 검색
- 상태별/월별 필터링
- 단계별 진행률 관리
- 프로젝트 상세 정보

### 일정 관리
- 캘린더 뷰로 마감일 확인
- 날짜별 프로젝트 조회

### 피드백 관리
- 클라이언트 피드백 등록
- 해결 상태 추적

## 🔧 작업 프로세스

```
[월요일]
1. 클라이언트로부터 교재 8P 이미지 수령
2. 대시보드에 새 프로젝트 상태 업데이트
3. init-project.js로 폴더 생성

[화~수]
4. Photoshop에서 누끼 작업
5. organize-files.js로 파일 자동 분류
6. PSD 레이어 구조화

[목]
7. JujuEnglish_ImportAssets.jsx로 AE 프로젝트 생성
8. JujuEnglish_AutoRig.jsx로 리깅 적용
9. JujuEnglish_TimelineSync.jsx로 타임라인 구성

[금]
10. 애니메이션 세부 조정
11. 오디오 싱크 마무리
12. JujuEnglish_BatchRender.jsx로 렌더링

[주말]
13. 렌더링 확인 및 납품
14. 대시보드에서 완료 체크
```

## 📝 파일 네이밍 규칙

```
EP001_char_001.png    # 캐릭터 누끼
EP001_bg_001.png      # 배경
EP001_prop_001.png    # 소품
EP001_narr_01.wav     # 내레이션
EP001_bgm_01.mp3      # BGM
EP001_sfx_01.wav      # 효과음
```

## 🎯 월별 마감일

| 월 | 에피소드 | 마감일 |
|---|---------|-------|
| 1월 | EP001~006 | 2026-01-31 |
| 2월 | EP007~012 | 2026-02-28 |
| 3월 | EP013~018 | 2026-03-31 |
| 4월 | EP019~024 | 2026-04-30 |
| 5월 | EP025~030 | 2026-05-31 |
| 6월 | 최종 검수 | 2026-06-30 |

## 💡 팁

1. **누끼 작업 시**: 레이어명을 영문으로 작성하면 AE 자동 리깅이 더 정확합니다
   - `head`, `body`, `arm_L`, `arm_R` 등

2. **파일 정리**: `watch` 모드를 켜두면 파일이 자동으로 정리됩니다

3. **렌더링**: 야간에 배치 렌더링을 실행하면 효율적입니다

4. **백업**: 대시보드 설정에서 데이터 내보내기로 정기 백업하세요

## 📞 문의

프로젝트 관련 문의사항은 담당자에게 연락해주세요.

---

*주주잉글리시 2D 동화 애니메이션 프로젝트 - 2026*

