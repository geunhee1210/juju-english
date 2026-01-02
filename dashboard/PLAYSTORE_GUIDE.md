# 📱 Google Play Store 출시 가이드

## 🛠️ 준비 사항

### 1. 필수 요구 사항
- [ ] Google Play Console 계정 (등록비: $25 일회성)
- [ ] Android Studio 설치
- [ ] 앱 서명 키스토어 생성
- [ ] 앱 아이콘 (512x512 PNG)
- [ ] 스크린샷 (최소 2장, 권장 8장)
- [ ] 개인정보처리방침 URL

### 2. Google Play Console 가입
1. https://play.google.com/console 접속
2. Google 계정으로 로그인
3. 개발자 계정 등록 ($25)
4. 본인 인증 완료

---

## 📦 앱 빌드 단계

### Step 1: 웹 앱 빌드
```bash
cd /root/test/juju-english/dashboard
npm run build
```

### Step 2: Android 동기화
```bash
npx cap sync android
```

### Step 3: Android Studio에서 열기
```bash
npx cap open android
```

### Step 4: 서명된 APK/AAB 생성

#### Android Studio에서:
1. **Build** → **Generate Signed Bundle / APK**
2. **Android App Bundle** 선택 (Google Play 필수)
3. 키스토어 생성 또는 기존 키스토어 선택

#### 키스토어 생성 (터미널):
```bash
keytool -genkey -v -keystore juju-english.keystore \
  -alias juju-english \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

⚠️ **중요**: 키스토어 파일과 비밀번호를 안전하게 보관하세요!

---

## 🎨 앱 아이콘 설정

### 아이콘 크기 요구 사항
| 용도 | 크기 |
|------|------|
| Play Store | 512x512 |
| 런처 아이콘 (mdpi) | 48x48 |
| 런처 아이콘 (hdpi) | 72x72 |
| 런처 아이콘 (xhdpi) | 96x96 |
| 런처 아이콘 (xxhdpi) | 144x144 |
| 런처 아이콘 (xxxhdpi) | 192x192 |

### 아이콘 파일 위치
```
android/app/src/main/res/
├── mipmap-mdpi/ic_launcher.png
├── mipmap-hdpi/ic_launcher.png
├── mipmap-xhdpi/ic_launcher.png
├── mipmap-xxhdpi/ic_launcher.png
└── mipmap-xxxhdpi/ic_launcher.png
```

### 추천 도구
- [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/)
- [App Icon Generator](https://appicon.co/)

---

## 📸 스크린샷 준비

### 필수 스크린샷
- **휴대전화**: 최소 2장 (1080x1920 또는 비슷한 비율)
- **태블릿 7인치**: 권장 (1200x1920)
- **태블릿 10인치**: 권장 (1600x2560)

### 스크린샷 촬영 방법
1. Android Emulator 실행
2. 앱 실행 후 주요 화면 캡처
3. **Android Studio** → **View** → **Tool Windows** → **Device File Explorer**

---

## 📝 Play Console 등록 정보

### 앱 정보 입력
```
앱 이름: 주주잉글리시 - 애니메이션 프로젝트 관리
짧은 설명: 영유아 교육 애니메이션 제작 프로젝트를 효율적으로 관리하세요
```

### 전체 설명 (예시)
```
주주잉글리시 스튜디오는 영유아 교육용 2D 동화 애니메이션 제작 프로젝트를 
체계적으로 관리할 수 있는 전문 도구입니다.

🎬 주요 기능:
• 30개 에피소드 진행 상황 실시간 추적
• 월별/단계별 납품 일정 관리
• 누끼 작업, 배경 리터칭, 리깅, 애니메이션 등 6단계 워크플로우
• 클라이언트 피드백 관리
• 프로젝트 레벨 분류 (기초/심화/완성)
• 납품 상태 추적 (누끼 선납품 → 영상 납품 → 최종 승인)

📊 대시보드:
• 전체 진행률 한눈에 확인
• 마감 임박 프로젝트 알림
• 레벨별 진행 현황
• 월별 납품 현황 차트

이 앱은 교육 콘텐츠 제작사, 애니메이션 스튜디오, 
프리랜서 크리에이터를 위해 설계되었습니다.
```

---

## 🔒 개인정보처리방침

Play Store 출시를 위해 개인정보처리방침 URL이 필요합니다.

### 무료 호스팅 옵션
1. **GitHub Pages** (무료)
2. **Google Sites** (무료)
3. **Notion** (무료)

### 개인정보처리방침 예시 템플릿
```markdown
# 개인정보처리방침

주주잉글리시 앱은 사용자의 개인정보를 수집하지 않습니다.

## 수집하는 정보
- 본 앱은 어떠한 개인정보도 수집하지 않습니다.
- 모든 데이터는 사용자 기기에만 저장됩니다.

## 데이터 저장
- 프로젝트 데이터는 로컬 저장소에만 저장됩니다.
- 서버로 전송되는 데이터는 없습니다.

## 문의
이메일: your-email@example.com

마지막 업데이트: 2026년 1월 2일
```

---

## 🚀 출시 체크리스트

### 앱 빌드
- [ ] `npm run build` 완료
- [ ] `npx cap sync android` 완료
- [ ] Android Studio에서 오류 없이 빌드
- [ ] 서명된 AAB 파일 생성

### Play Console 설정
- [ ] 앱 이름 및 설명 입력
- [ ] 카테고리 선택 (도구 또는 비즈니스)
- [ ] 콘텐츠 등급 설정
- [ ] 타겟 연령대 설정
- [ ] 개인정보처리방침 URL 등록

### 스토어 등록정보
- [ ] 앱 아이콘 (512x512) 업로드
- [ ] 기능 그래픽 (1024x500) 업로드
- [ ] 스크린샷 최소 2장 업로드
- [ ] 연락처 이메일 입력

### 출시
- [ ] 내부 테스트 → 비공개 테스트 → 프로덕션 순서로 진행
- [ ] 첫 출시 검토는 1-3일 소요

---

## 💡 유용한 명령어

```bash
# 웹 빌드
npm run build

# Android 동기화
npx cap sync android

# Android Studio 열기
npx cap open android

# 앱 실행 (에뮬레이터/실기기)
npx cap run android

# 라이브 리로드 (개발용)
npx cap run android --livereload --external
```

---

## 📞 문의 및 지원

문제가 발생하면 다음을 확인하세요:
1. [Capacitor 공식 문서](https://capacitorjs.com/docs)
2. [Android 개발자 가이드](https://developer.android.com/guide)
3. [Play Console 도움말](https://support.google.com/googleplay/android-developer)

