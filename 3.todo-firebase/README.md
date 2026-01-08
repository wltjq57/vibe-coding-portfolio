# 할일 관리 앱 - Firebase Realtime Database

## 실행 방법

### 방법 1: VS Code Live Server (권장)

1. VS Code에서 **Live Server** 확장 프로그램 설치
2. `index.html` 파일을 우클릭
3. **"Open with Live Server"** 선택
4. 브라우저에서 자동으로 열립니다

### 방법 2: Node.js http-server 사용

Node.js가 설치되어 있다면:

```bash
npx http-server -p 8080
```

그 후 브라우저에서 `http://localhost:8080` 접속

### 방법 3: Python 간단 서버 (Python이 있다면)

```bash
python -m http.server 8080
```

## 중요 사항

⚠️ **파일을 직접 열면 CORS 에러가 발생합니다!**
- `file://` 프로토콜로 열면 ES6 모듈 import가 작동하지 않습니다
- 반드시 로컬 서버를 통해 실행해야 합니다

## 기능

- ✅ 할일 추가
- ✅ 할일 수정
- ✅ 할일 삭제
- ✅ 완료 상태 토글
- ✅ 필터링 (전체/진행중/완료)
- ✅ 완료된 항목 일괄 삭제
- ✅ Firebase Realtime Database 실시간 동기화
