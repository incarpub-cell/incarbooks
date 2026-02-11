# ⚡ Cloudflare Pages 배포 가이드 (Deployment Guide)

Netlify 사용이 어려우므로, 강력한 대안인 **Cloudflare Pages**를 사용하여 배포합니다. 

---

## 🚀 1단계: Cloudflare 가입 및 로그인

1. **[Cloudflare 대시보드](https://dash.cloudflare.com/sign-up)**에 접속하여 가입합니다. (이메일 인증 필요)
2. 로그인 후, 왼쪽 메뉴에서 **`Workers & Pages`**를 클릭합니다.
3. **`Create Application`** 버튼을 클릭합니다.
4. **`Pages`** 탭을 선택하고 **`Connect to Git`**을 클릭합니다.

## 🔗 2단계: GitHub 연결

1. **GitHub** 탭을 선택하고 `Connect GitHub` 버튼을 누릅니다.
2. 권한 요청 화면에서 `Authorize Cloudflare`를 클릭하여 승인합니다.
3. 저장소 목록에서 **`digital-store`**를 선택하고 `Begin setup`을 누릅니다.

## ⚙️ 3단계: 빌드 설정 (Build Settings)

1. **Project name**: `digital-store` (자동 입력됨)
2. **Production branch**: `main` (자동 입력됨)
3. **Framework preset**: 메뉴에서 **`Next.js`**를 찾아서 선택합니다. (**중요**)
    - 선택하면 Build command 등이 자동으로 채워집니다.

## 🔑 4단계: 환경변수 설정 (Environment Variables)

화면 아래쪽 **`Environment variables (advanced)`** 섹션을 펼칩니다.
여기에 아까 메모해둔 키 값들을 추가해야 합니다.

| Variable name (변수명) | Value (값) |
| :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | (Firebase API Key 값) |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | (PayPal Client ID 값) |
| ... (나머지 Firebase 키들도 모두 추가) | ... |

*`+ Add variable` 버튼을 눌러서 한 줄씩 추가하세요.*

## ✅ 5단계: 배포 시작

1. **`Save and Deploy`** 버튼을 클릭합니다.
2. 배포 로그가 올라가는 것을 지켜봅니다. (약 1~2분 소요)
3. 완료되면 **Success!** 메시지와 함께 사이트 주소(`...pages.dev`)가 나옵니다.
