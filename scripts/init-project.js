#!/usr/bin/env node
/**
 * 주주잉글리시 프로젝트 초기화 스크립트
 * 새 에피소드 프로젝트 폴더 구조를 자동으로 생성합니다.
 */

import fs from 'fs-extra';
import path from 'path';
import { input, select, confirm } from '@inquirer/prompts';
import chalk from 'chalk';

// 기본 설정
const DEFAULT_BASE_PATH = process.env.JUJU_PROJECT_PATH || './projects';

// 에피소드별 폴더 구조
const FOLDER_STRUCTURE = [
  '01_원본',           // 원본 교재 이미지 (8페이지)
  '02_누끼/캐릭터',    // 누끼 완료 - 캐릭터
  '02_누끼/배경',      // 누끼 완료 - 배경
  '02_누끼/소품',      // 누끼 완료 - 소품
  '03_PSD',            // 작업용 PSD 파일
  '04_AE',             // After Effects 프로젝트
  '05_오디오/내레이션', // 성우 내레이션
  '05_오디오/BGM',     // 배경음악
  '05_오디오/효과음',  // 효과음
  '06_출력/프리뷰',    // 프리뷰 렌더링
  '06_출력/최종',      // 최종 렌더링
];

// 동화 제목 목록 (30개 에피소드)
const STORY_TITLES = [
  'The Little Red Hen',
  'Three Little Pigs',
  'Goldilocks',
  'The Ugly Duckling',
  'The Tortoise and the Hare',
  'Little Red Riding Hood',
  'Jack and the Beanstalk',
  'Cinderella',
  'The Gingerbread Man',
  'The Three Bears',
  'Snow White',
  'Hansel and Gretel',
  'Rapunzel',
  'The Frog Prince',
  'Pinocchio',
  'Thumbelina',
  'The Little Mermaid',
  'Sleeping Beauty',
  'Rumpelstiltskin',
  'The Pied Piper',
  'The Elves and the Shoemaker',
  'The Bremen Town Musicians',
  'The Princess and the Pea',
  'The Snow Queen',
  'The Steadfast Tin Soldier',
  'The Wild Swans',
  'The Nightingale',
  'The Red Shoes',
  'The Little Match Girl',
  'The Tinderbox',
];

// 프로젝트 메타데이터 템플릿
const createMetadata = (episodeNumber, title, basePath) => ({
  id: `EP${String(episodeNumber).padStart(3, '0')}`,
  episodeNumber,
  title,
  titleKorean: '', // 나중에 추가
  status: 'pending',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  dueDate: calculateDueDate(episodeNumber),
  phases: {
    nukki: { status: 'pending', progress: 0 },
    background: { status: 'pending', progress: 0 },
    rigging: { status: 'pending', progress: 0 },
    animation: { status: 'pending', progress: 0 },
    audio: { status: 'pending', progress: 0 },
    render: { status: 'pending', progress: 0 },
  },
  assets: {
    originalPages: 8,
    nukkiCount: 0,
    audioFiles: [],
  },
  notes: [],
  basePath,
});

// 마감일 계산 (월 6개씩)
function calculateDueDate(episodeNumber) {
  const monthIndex = Math.floor((episodeNumber - 1) / 6);
  const month = String(monthIndex + 1).padStart(2, '0');
  const day = ((episodeNumber - 1) % 6) * 4 + 15;
  return `2026-${month}-${String(Math.min(28, day)).padStart(2, '0')}`;
}

// 폴더 생성 함수
async function createProjectFolders(basePath, episodeNumber, title) {
  const projectId = `EP${String(episodeNumber).padStart(3, '0')}`;
  const folderName = `${projectId}_${title.replace(/\s+/g, '')}`;
  const projectPath = path.join(basePath, folderName);

  console.log(chalk.blue('\n📁 프로젝트 폴더 생성 중...'));
  console.log(chalk.gray(`   경로: ${projectPath}\n`));

  // 메인 폴더 및 하위 폴더 생성
  for (const folder of FOLDER_STRUCTURE) {
    const folderPath = path.join(projectPath, folder);
    await fs.ensureDir(folderPath);
    console.log(chalk.green(`   ✓ ${folder}`));
  }

  // 메타데이터 파일 생성
  const metadata = createMetadata(episodeNumber, title, projectPath);
  const metadataPath = path.join(projectPath, 'project.json');
  await fs.writeJson(metadataPath, metadata, { spaces: 2 });
  console.log(chalk.green(`   ✓ project.json`));

  // README 파일 생성
  const readme = generateReadme(episodeNumber, title);
  await fs.writeFile(path.join(projectPath, 'README.md'), readme);
  console.log(chalk.green(`   ✓ README.md`));

  return projectPath;
}

// README 생성
function generateReadme(episodeNumber, title) {
  return `# EP${String(episodeNumber).padStart(3, '0')} - ${title}

## 📋 프로젝트 정보
- **에피소드**: ${episodeNumber}
- **제목**: ${title}
- **마감일**: ${calculateDueDate(episodeNumber)}
- **영상 길이**: 1분 30초 ~ 2분

## 📁 폴더 구조
\`\`\`
├── 01_원본/           # 원본 교재 이미지 (8페이지)
├── 02_누끼/           # 누끼 완료 파일
│   ├── 캐릭터/
│   ├── 배경/
│   └── 소품/
├── 03_PSD/            # 작업용 PSD 파일
├── 04_AE/             # After Effects 프로젝트
├── 05_오디오/         # 오디오 파일
│   ├── 내레이션/
│   ├── BGM/
│   └── 효과음/
└── 06_출력/           # 렌더링 결과물
    ├── 프리뷰/
    └── 최종/
\`\`\`

## ✅ 작업 체크리스트
- [ ] 원본 이미지 수령 및 배치
- [ ] 누끼 작업 (캐릭터/배경/소품)
- [ ] 배경 리터칭
- [ ] PSD 레이어 구조화
- [ ] AE 프로젝트 생성
- [ ] 캐릭터 리깅
- [ ] 애니메이션 작업
- [ ] 오디오 싱크
- [ ] 프리뷰 렌더링 및 검토
- [ ] 최종 렌더링
- [ ] 납품

## 📝 작업 노트
(작업 중 메모를 여기에 기록하세요)

---
*주주잉글리시 2D 동화 애니메이션 프로젝트*
`;
}

// 전체 프로젝트 일괄 생성
async function createAllProjects(basePath) {
  console.log(chalk.yellow('\n🎬 전체 30개 에피소드 프로젝트 생성 시작...\n'));

  for (let i = 1; i <= 30; i++) {
    const title = STORY_TITLES[i - 1];
    await createProjectFolders(basePath, i, title);
    console.log(chalk.cyan(`\n[${i}/30] ${title} 완료\n`));
  }

  // 공통 폴더 생성
  console.log(chalk.blue('\n📁 공통 폴더 생성 중...'));
  
  const commonFolders = [
    '_템플릿/AE_템플릿',
    '_템플릿/PSD_템플릿',
    '_템플릿/리깅_프리셋',
    '_공통애셋/UI',
    '_공통애셋/효과',
    '_공통애셋/BGM',
    '_공통애셋/효과음',
  ];

  for (const folder of commonFolders) {
    await fs.ensureDir(path.join(basePath, folder));
    console.log(chalk.green(`   ✓ ${folder}`));
  }

  // 전체 프로젝트 메타데이터 생성
  const allProjectsMeta = {
    projectName: '주주잉글리시 2D 동화 애니메이션',
    totalEpisodes: 30,
    deadline: '2026-06-30',
    createdAt: new Date().toISOString(),
    episodes: STORY_TITLES.map((title, i) => ({
      id: `EP${String(i + 1).padStart(3, '0')}`,
      title,
      dueDate: calculateDueDate(i + 1),
    })),
  };

  await fs.writeJson(
    path.join(basePath, 'project-meta.json'),
    allProjectsMeta,
    { spaces: 2 }
  );

  console.log(chalk.green('\n✅ 전체 프로젝트 구조 생성 완료!'));
  console.log(chalk.gray(`   위치: ${path.resolve(basePath)}`));
}

// 단일 프로젝트 생성
async function createSingleProject(basePath) {
  const episodeNumber = await input({
    message: '에피소드 번호 (1-30):',
    validate: (value) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 1 || num > 30) {
        return '1에서 30 사이의 숫자를 입력하세요';
      }
      return true;
    },
  });

  const defaultTitle = STORY_TITLES[parseInt(episodeNumber) - 1];
  const title = await input({
    message: '프로젝트 제목:',
    default: defaultTitle,
  });

  await createProjectFolders(basePath, parseInt(episodeNumber), title);
  
  console.log(chalk.green('\n✅ 프로젝트 생성 완료!'));
}

// 메인 함수
async function main() {
  console.log(chalk.bold.magenta('\n🎨 주주잉글리시 프로젝트 초기화 도구\n'));
  console.log(chalk.gray('5~7세 영유아 대상 2D 동화 애니메이션 프로젝트\n'));

  // 기본 경로 설정
  const basePath = await input({
    message: '프로젝트 기본 경로:',
    default: DEFAULT_BASE_PATH,
  });

  // 생성 모드 선택
  const mode = await select({
    message: '어떤 작업을 수행할까요?',
    choices: [
      { value: 'all', name: '전체 30개 에피소드 프로젝트 생성' },
      { value: 'single', name: '단일 에피소드 프로젝트 생성' },
      { value: 'common', name: '공통 폴더만 생성' },
    ],
  });

  // 확인
  const shouldContinue = await confirm({
    message: '프로젝트를 생성하시겠습니까?',
    default: true,
  });

  if (!shouldContinue) {
    console.log(chalk.yellow('\n작업이 취소되었습니다.\n'));
    return;
  }

  // 기본 경로 생성
  await fs.ensureDir(basePath);

  switch (mode) {
    case 'all':
      await createAllProjects(basePath);
      break;
    case 'single':
      await createSingleProject(basePath);
      break;
    case 'common':
      console.log(chalk.blue('\n📁 공통 폴더 생성 중...'));
      const commonFolders = [
        '_템플릿/AE_템플릿',
        '_템플릿/PSD_템플릿',
        '_템플릿/리깅_프리셋',
        '_공통애셋/UI',
        '_공통애셋/효과',
        '_공통애셋/BGM',
        '_공통애셋/효과음',
      ];
      for (const folder of commonFolders) {
        await fs.ensureDir(path.join(basePath, folder));
        console.log(chalk.green(`   ✓ ${folder}`));
      }
      console.log(chalk.green('\n✅ 공통 폴더 생성 완료!'));
      break;
  }
}

main().catch(console.error);

