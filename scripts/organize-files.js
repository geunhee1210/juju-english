#!/usr/bin/env node
/**
 * 주주잉글리시 파일 자동 정리 스크립트
 * 누끼 완료 파일을 자동으로 분류하고 정리합니다.
 */

import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';
import chokidar from 'chokidar';

// 파일 분류 규칙
const FILE_CATEGORIES = {
  character: {
    keywords: ['char', 'character', '캐릭터', 'person', 'animal', '동물', '사람', 'hero', 'villain'],
    folder: '02_누끼/캐릭터',
    extensions: ['.png', '.psd', '.tiff'],
  },
  background: {
    keywords: ['bg', 'background', '배경', 'scene', 'landscape', '풍경', 'sky', 'ground'],
    folder: '02_누끼/배경',
    extensions: ['.png', '.psd', '.tiff', '.jpg'],
  },
  prop: {
    keywords: ['prop', '소품', 'item', 'object', '물건', 'tool', 'thing'],
    folder: '02_누끼/소품',
    extensions: ['.png', '.psd', '.tiff'],
  },
  audio_narration: {
    keywords: ['narr', 'voice', '내레이션', '성우', 'speech'],
    folder: '05_오디오/내레이션',
    extensions: ['.wav', '.mp3', '.aiff'],
  },
  audio_bgm: {
    keywords: ['bgm', 'music', '음악', 'background_music'],
    folder: '05_오디오/BGM',
    extensions: ['.wav', '.mp3', '.aiff'],
  },
  audio_sfx: {
    keywords: ['sfx', 'effect', '효과음', 'sound'],
    folder: '05_오디오/효과음',
    extensions: ['.wav', '.mp3', '.aiff'],
  },
};

// 파일명 규칙 검증
const FILE_NAMING_RULES = {
  pattern: /^EP\d{3}_[a-z]+_\d{3}\.(png|psd|tiff|jpg)$/i,
  example: 'EP001_char_001.png',
};

// 파일 분류 함수
function categorizeFile(filename) {
  const lowerName = filename.toLowerCase();
  const ext = path.extname(filename).toLowerCase();

  for (const [category, config] of Object.entries(FILE_CATEGORIES)) {
    // 확장자 먼저 확인
    if (!config.extensions.includes(ext)) continue;

    // 키워드 확인
    for (const keyword of config.keywords) {
      if (lowerName.includes(keyword.toLowerCase())) {
        return { category, folder: config.folder };
      }
    }
  }

  // 확장자로만 분류 (키워드 없을 때)
  if (['.png', '.psd', '.tiff'].includes(ext)) {
    return { category: 'prop', folder: FILE_CATEGORIES.prop.folder };
  }
  if (['.wav', '.mp3', '.aiff'].includes(ext)) {
    return { category: 'audio_sfx', folder: FILE_CATEGORIES.audio_sfx.folder };
  }

  return null;
}

// 파일명 표준화
function standardizeFilename(filename, category, episodeNumber, index) {
  const ext = path.extname(filename);
  const categoryPrefix = {
    character: 'char',
    background: 'bg',
    prop: 'prop',
    audio_narration: 'narr',
    audio_bgm: 'bgm',
    audio_sfx: 'sfx',
  }[category] || 'misc';

  return `EP${String(episodeNumber).padStart(3, '0')}_${categoryPrefix}_${String(index).padStart(3, '0')}${ext}`;
}

// 단일 프로젝트 폴더 정리
async function organizeProjectFolder(projectPath, options = {}) {
  const { dryRun = false, rename = false } = options;
  
  console.log(chalk.blue(`\n📁 폴더 정리: ${projectPath}`));

  // 에피소드 번호 추출
  const match = path.basename(projectPath).match(/EP(\d{3})/);
  const episodeNumber = match ? parseInt(match[1]) : 1;

  // 정리되지 않은 파일 찾기 (루트 또는 임시 폴더)
  const unorganizedPatterns = [
    path.join(projectPath, '*.*'),
    path.join(projectPath, 'temp/**/*.*'),
    path.join(projectPath, 'inbox/**/*.*'),
  ];

  const categoryCounters = {};
  const movedFiles = [];
  const skippedFiles = [];

  for (const pattern of unorganizedPatterns) {
    const files = await glob(pattern, { nodir: true });

    for (const file of files) {
      const filename = path.basename(file);
      
      // 메타데이터 파일 스킵
      if (['project.json', 'README.md', '.DS_Store'].includes(filename)) {
        continue;
      }

      const result = categorizeFile(filename);
      
      if (!result) {
        skippedFiles.push({ file, reason: '분류 불가' });
        continue;
      }

      const { category, folder } = result;
      const targetFolder = path.join(projectPath, folder);

      // 카운터 초기화
      if (!categoryCounters[category]) {
        // 기존 파일 수 확인
        const existingFiles = await glob(path.join(targetFolder, '*.*'), { nodir: true });
        categoryCounters[category] = existingFiles.length + 1;
      }

      // 파일명 결정
      let targetFilename = filename;
      if (rename) {
        targetFilename = standardizeFilename(filename, category, episodeNumber, categoryCounters[category]);
        categoryCounters[category]++;
      }

      const targetPath = path.join(targetFolder, targetFilename);

      if (dryRun) {
        console.log(chalk.gray(`  [미리보기] ${filename} → ${folder}/${targetFilename}`));
      } else {
        await fs.ensureDir(targetFolder);
        await fs.move(file, targetPath, { overwrite: false });
        console.log(chalk.green(`  ✓ ${filename} → ${folder}/${targetFilename}`));
      }

      movedFiles.push({ from: file, to: targetPath, category });
    }
  }

  // 결과 요약
  console.log(chalk.cyan(`\n  정리 완료: ${movedFiles.length}개 파일`));
  if (skippedFiles.length > 0) {
    console.log(chalk.yellow(`  스킵됨: ${skippedFiles.length}개 파일`));
    for (const { file, reason } of skippedFiles) {
      console.log(chalk.gray(`    - ${path.basename(file)}: ${reason}`));
    }
  }

  return { movedFiles, skippedFiles };
}

// 전체 프로젝트 정리
async function organizeAllProjects(basePath, options) {
  console.log(chalk.bold.magenta('\n🗂️  전체 프로젝트 파일 정리\n'));

  // EP로 시작하는 폴더 찾기
  const projectFolders = await glob(path.join(basePath, 'EP*'), { onlyDirectories: true });

  if (projectFolders.length === 0) {
    console.log(chalk.yellow('프로젝트 폴더를 찾을 수 없습니다.'));
    return;
  }

  console.log(chalk.gray(`발견된 프로젝트: ${projectFolders.length}개\n`));

  let totalMoved = 0;
  let totalSkipped = 0;

  for (const folder of projectFolders) {
    const result = await organizeProjectFolder(folder, options);
    totalMoved += result.movedFiles.length;
    totalSkipped += result.skippedFiles.length;
  }

  console.log(chalk.bold.green(`\n✅ 전체 정리 완료!`));
  console.log(chalk.gray(`   이동: ${totalMoved}개 | 스킵: ${totalSkipped}개`));
}

// 실시간 파일 감시 모드
async function watchMode(basePath) {
  console.log(chalk.bold.magenta('\n👀 파일 감시 모드 시작\n'));
  console.log(chalk.gray(`감시 경로: ${basePath}`));
  console.log(chalk.gray('새 파일이 추가되면 자동으로 정리합니다.\n'));
  console.log(chalk.yellow('종료하려면 Ctrl+C를 누르세요.\n'));

  const watcher = chokidar.watch([
    path.join(basePath, 'EP*/temp'),
    path.join(basePath, 'EP*/inbox'),
    path.join(basePath, 'EP*'),
  ], {
    ignored: /(^|[\/\\])\../, // 숨김 파일 무시
    persistent: true,
    ignoreInitial: true,
    depth: 1,
  });

  watcher.on('add', async (filePath) => {
    const filename = path.basename(filePath);
    
    // 메타데이터 파일 스킵
    if (['project.json', 'README.md'].includes(filename)) return;

    // 이미 정리된 폴더에 있는 파일 스킵
    if (filePath.includes('02_누끼') || 
        filePath.includes('05_오디오') ||
        filePath.includes('03_PSD') ||
        filePath.includes('04_AE') ||
        filePath.includes('06_출력')) {
      return;
    }

    console.log(chalk.blue(`\n📥 새 파일 감지: ${filename}`));

    // 부모 프로젝트 폴더 찾기
    const projectFolder = filePath.split(path.sep).find(p => p.startsWith('EP'));
    if (!projectFolder) return;

    const projectPath = path.join(basePath, projectFolder);
    await organizeProjectFolder(projectPath, { rename: false });
  });

  // 프로세스 종료 핸들링
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\n감시 모드 종료...'));
    watcher.close();
    process.exit(0);
  });
}

// 파일명 검증
async function validateFilenames(basePath) {
  console.log(chalk.bold.magenta('\n🔍 파일명 규칙 검증\n'));

  const allFiles = await glob(path.join(basePath, 'EP*/**/*.*'), { nodir: true });
  const invalidFiles = [];
  const validFiles = [];

  for (const file of allFiles) {
    const filename = path.basename(file);
    
    // 메타데이터 파일 스킵
    if (['project.json', 'README.md', '.DS_Store'].includes(filename)) continue;

    if (FILE_NAMING_RULES.pattern.test(filename)) {
      validFiles.push(file);
    } else {
      invalidFiles.push(file);
    }
  }

  console.log(chalk.green(`✓ 규칙 준수: ${validFiles.length}개`));
  
  if (invalidFiles.length > 0) {
    console.log(chalk.yellow(`✗ 규칙 위반: ${invalidFiles.length}개\n`));
    console.log(chalk.gray(`권장 형식: ${FILE_NAMING_RULES.example}\n`));
    
    for (const file of invalidFiles.slice(0, 10)) {
      console.log(chalk.red(`  - ${path.basename(file)}`));
    }
    
    if (invalidFiles.length > 10) {
      console.log(chalk.gray(`  ... 외 ${invalidFiles.length - 10}개`));
    }
  }
}

// 메인 함수
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const basePath = args[1] || './projects';

  switch (command) {
    case 'organize':
      await organizeAllProjects(basePath, { dryRun: false, rename: args.includes('--rename') });
      break;
    
    case 'preview':
      await organizeAllProjects(basePath, { dryRun: true, rename: args.includes('--rename') });
      break;
    
    case 'watch':
      await watchMode(basePath);
      break;
    
    case 'validate':
      await validateFilenames(basePath);
      break;
    
    case 'single':
      if (args[1]) {
        await organizeProjectFolder(args[1], { dryRun: false, rename: args.includes('--rename') });
      } else {
        console.log(chalk.red('프로젝트 폴더 경로를 지정하세요.'));
      }
      break;
    
    default:
      console.log(chalk.bold.magenta('\n🗂️  주주잉글리시 파일 정리 도구\n'));
      console.log(chalk.white('사용법:'));
      console.log(chalk.gray('  node organize-files.js <command> [path] [options]\n'));
      console.log(chalk.white('명령어:'));
      console.log(chalk.cyan('  organize [path]    ') + chalk.gray('파일 자동 정리 실행'));
      console.log(chalk.cyan('  preview [path]     ') + chalk.gray('정리 결과 미리보기 (실제 이동 없음)'));
      console.log(chalk.cyan('  watch [path]       ') + chalk.gray('파일 감시 모드 (실시간 정리)'));
      console.log(chalk.cyan('  validate [path]    ') + chalk.gray('파일명 규칙 검증'));
      console.log(chalk.cyan('  single <folder>    ') + chalk.gray('단일 폴더 정리'));
      console.log(chalk.white('\n옵션:'));
      console.log(chalk.cyan('  --rename           ') + chalk.gray('파일명 표준화 (EP001_char_001.png 형식)'));
      console.log(chalk.white('\n예시:'));
      console.log(chalk.gray('  node organize-files.js organize ./projects'));
      console.log(chalk.gray('  node organize-files.js watch ./projects'));
      console.log(chalk.gray('  node organize-files.js single ./projects/EP001_LittleRedHen --rename'));
  }
}

main().catch(console.error);

