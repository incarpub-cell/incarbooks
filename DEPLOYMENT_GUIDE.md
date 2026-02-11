# 🌐 Netlify 배포 가이드 (Deployment Guide)

상업적 용도(수익 창출)로도 무료 플랜 사용이 가능한 **Netlify**에 웹사이트를 배포하는 방법입니다.

---

## 🚀 1단계: GitHub에 코드 올리기

Netlify는 GitHub에 있는 코드를 가져와서 자동으로 배포해 줍니다. 따라서 먼저 코드를 GitHub에 올려야 합니다.

1. **GitHub 로그인**: [GitHub.com](https://github.com/)에 로그인합니다.
2. **새 저장소(Repository) 생성**:
    - 우측 상단 `+` 버튼 -> `New repository` 클릭.
    - Repository name: `digital-store` (원하는 이름).
    - `Public` 선택 (Private도 가능).
    - `Create repository` 버튼 클릭.
3. **코드 업로드 (터미널 명령어)**:
    - VS Code 터미널에서 아래 명령어를 차례로 입력합니다. (GitHub 페이지에 나오는 주소를 사용하세요)
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/사용자아이디/레포지토리이름.git
    git push -u origin main
    ```

---

## ⚡ 2단계: Netlify와 연결하기

1. **Netlify 가입/로그인**: [Netlify.com](https://www.netlify.com/)에 접속하여 가입합니다. (GitHub 계정으로 가입 추천)
2. **새 사이트 추가**:
    - 대시보드에서 `Add new site` -> `Import from existing project` 선택.
3. **GitHub 연결**:
    - `GitHub` 아이콘 클릭 -> 권한 승인.
    - 방금 만든 `digital-store` 저장소 선택.
4. **배포 설정 (Build Settings)**:
    - Netlify가 Next.js를 자동으로 인식하므로 기본 설정을 그대로 두면 됩니다.
    - **Base directory**: (비워둠)
    - **Build command**: `npm run build`
    - **Publish directory**: `.next`
5. **환경변수 설정 (중요!)**:
    - `Environment variables` 설정을 클릭하거나, 배포 후 `Site configuration > Environment variables` 메뉴로 이동합니다.
    - `.env.local` 파일에 있는 값들을 똑같이 등록해 줍니다. (Firebase 키, PayPal Client ID 등)
    - **Key**: `NEXT_PUBLIC_FIREBASE_API_KEY`, **Value**: `...` (이런 식으로 모두 추가)

---

## ✅ 3단계: 배포 완료 및 확인

1. **Deploy site** 버튼을 누르면 배포가 시작됩니다.
2. 1~2분 정도 기다리면 `https://임의의이름.netlify.app` 주소가 생성됩니다.
3. 해당 주소로 접속하여 사이트가 잘 뜨는지 확인합니다.

---

## 💡 Cloudflare Pages (대안)

Cloudflare Pages도 훌륭한 대안입니다. 과정은 비슷합니다.
1. [Cloudflare Dashboard](https://dash.cloudflare.com/) 접속 > `Workers & Pages` > `Create Application` > `Pages` > `Connect to Git`.
2. GitHub 저장소 선택.
3. `Framework preset`에서 **Next.js** 선택.
4. 환경변수 입력 후 `Save and Deploy`.
