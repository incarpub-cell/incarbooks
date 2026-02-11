# 🔑 디지털 에셋 스토어 설정 가이드 (Digital Asset Store Setup Guide)

이 문서는 `digital-store` 웹사이트를 정상적으로 작동시키기 위해 필요한 **Firebase**와 **PayPal** 설정 방법을 상세히 설명합니다.

---

## 1. Firebase 설정 (데이터베이스 및 로그인)

Firebase는 사용자 인증(로그인)과 상품/주문 데이터 저장에 사용됩니다.

### 1단계: 프로젝트 생성
1. [Firebase 콘솔](https://console.firebase.google.com/)에 접속합니다.
2. **"프로젝트 추가"**를 클릭합니다.
3. 프로젝트 이름을 입력하고 (예: `digital-store`) 계속 진행하여 프로젝트를 생성합니다. (Google Analytics는 사용 안 함으로 설정해도 됩니다.)

### 2단계: 웹 앱 등록 및 키 확인
1. 프로젝트 개요 페이지 중앙에 있는 **웹 아이콘 (`</>`)**을 클릭합니다.
2. 앱 닉네임을 입력하고 **"앱 등록"**을 클릭합니다.
3. **"SDK 설정 및 구성"** 화면에서 `const firebaseConfig = { ... }` 부분을 찾습니다.
4. 이 안에 있는 값들이 우리가 필요한 키입니다.

### 3단계: 값을 `.env.local`에 복사
`digital-store` 폴더 안에 `.env.local` 파일을 생성하고(없는 경우) 아래와 같이 채워 넣습니다:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY="apiKey 값"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="authDomain 값"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="projectId 값"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="storageBucket 값"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="messagingSenderId 값"
NEXT_PUBLIC_FIREBASE_APP_ID="appId 값"
```

### 4단계: Firestore 및 Auth 활성화 (**중요**)
1. **Firestore Database**: 좌측 메뉴 `빌드` > `Firestore Database` > **"데이터베이스 만들기"** 클릭.
    - 보안 규칙은 **"테스트 모드에서 시작"** 선택 (개발 편의를 위해).
2. **Authentication**: 좌측 메뉴 `빌드` > `Authentication` > **"시작하기"** 클릭.
    - `Sign-in method` 탭에서 **"이메일/비밀번호"**를 사용 설정합니다.

---

## 2. PayPal 설정 (국제 결제)

PayPal은 전 세계 고객에게서 달러($) 결제를 받기 위해 사용합니다.

### 1단계: 개발자 계정 접속
1. [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox)에 접속하고 로그인합니다. (기존 PayPal 계정 사용 가능)
2. **"Apps & Credentials"** 메뉴로 이동합니다.
3. 상단 토글이 **"Sandbox"** (테스트용)로 되어 있는지 확인합니다.

### 2단계: 앱 생성
1. **"Create App"** 버튼을 클릭합니다.
2. App Name에 `Digital Store` 등을 입력하고 **"Create App"**을 누릅니다.

### 3단계: Client ID 확인
1. 생성된 앱 상세 페이지에서 **"Client ID"**를 찾습니다. (긴 문자열입니다)

### 4단계: 값을 `.env.local`에 복사
`.env.local` 파일 맨 아래에 추가합니다:

```bash
NEXT_PUBLIC_PAYPAL_CLIENT_ID="복사한 Client ID"
```

---

## 3. 실행 테스트

모든 키를 입력했다면, 터미널에서 다음 명령어로 서버를 실행하세요:

```bash
npm run dev
```

웹브라우저에서 `http://localhost:3000`으로 접속하여 상품을 클릭하고 결제 창이 뜨는지 확인합니다.
