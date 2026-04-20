# 스마트 스케줄러 프론트엔드 기획 및 구조 명세서

## 1. 프론트엔드 기술 스택
- 코어 라이브러리: React 19, React Router DOM
- 상태 관리 및 네트워크: Context API, Axios
- UI 컴포넌트 및 스타일링: Tailwind CSS, FullCalendar, Recharts

## 2. 디렉토리 구조 설계
- src/assets: 정적 이미지 및 전역 스타일 파일 관리
- src/components: 캘린더, 모달, 버튼 등 재사용 가능한 공통 UI 요소 배치
- src/pages: 라우터와 1대1 매핑되는 전체 화면 집합
- src/services: 백엔드 API 엔드포인트 호출 및 Axios 인스턴스 캡슐화
- src/context: 전역 로그인 상태 및 유저 정보 공유

## 3. 라우팅 및 화면 구성
- /login: 이메일 비밀번호 입력 및 JWT 기반 로그인 처리 화면
- /signup: 사용자 정보 입력 및 신규 계정 생성 화면
- /: FullCalendar 기반 메인 달력 및 월별 주별 일정 확인 화면
- /stats: Recharts 기반 일정 완료율 및 카테고리 통계 데이터 시각화 화면

## 4. 핵심 기능 구현 전략
- 인증 상태 유지: 브라우저 로컬 스토리지를 활용한 Access Token 보관 및 전역 상태 동기화
- API 통신 제어: Axios 인터셉터 구성을 통한 모든 요청 헤더 토큰 자동 삽입
- 비인가 접근 차단: ProtectedRoute 컴포넌트 생성을 통한 로그인 상태 검증 및 미인증 사용자 리다이렉트 처리
- 데이터 매핑: 백엔드 응답 DTO 필드를 프론트엔드 캘린더 라이브러리 요구 규격으로 변환하는 유틸리티 함수 분리

## 5. 개발 마일스톤
- 1단계: 기본 리액트 프로젝트 생성 및 Tailwind CSS 환경 구축
- 2단계: 화면 라우팅 설정 및 공통 내비게이션 바 컴포넌트 디자인
- 3단계: AuthContext 및 Axios 인터셉터 기반 로그인 로그아웃 파이프라인 완성
- 4단계: 달력 화면 UI 렌더링 및 백엔드 일정 목록 조회 API 연동
- 5단계: 통계 대시보드 화면 차트 렌더링 및 데이터 집계 API 연동

# 프론트엔드 상세 구현 명세서 (Advanced)

## 1. 화면 및 컴포넌트 계층 구조 (Component Hierarchy)
- App (최상위)
  - AuthProvider: 전역 로그인 상태 및 토큰 관리 제공
  - BrowserRouter: 라우팅 관리
    - PublicRoute: 비로그인 사용자용 라우트 접근 제어
      - LoginPage: 로그인 폼 및 소셜 로그인 버튼 노출 화면
      - SignupPage: 이메일, 닉네임, 비밀번호 입력 및 유효성 검사 화면
    - PrivateRoute: 로그인 사용자 전용 라우트 접근 제어
      - MainLayout: 상단 네비게이션 바(GNB) 및 사이드바 공통 레이아웃
        - CalendarPage: FullCalendar 렌더링 및 일정 데이터 바인딩 화면
          - ScheduleModal: 일정 추가 및 수정을 위한 팝업 폼 컴포넌트
          - CategoryFilter: 특정 카테고리만 볼 수 있는 필터링 버튼 그룹
        - StatsPage: Recharts 라이브러리를 활용한 통계 대시보드 화면
          - CompletionRateChart: 월간 완료율을 보여주는 원형 차트(Pie Chart) 컴포넌트
          - ActivityBarChart: 주차별 활동량을 보여주는 막대 차트(Bar Chart) 컴포넌트

## 2. 상태 관리 및 커스텀 훅 (State & Hooks) 설계
- AuthContext: 사용자 인증 토큰 보관 및 로그인, 로그아웃 기능 전역 상태 공유
- useAxiosInterceptor: Axios 요청 전 헤더에 JWT 자동 삽입 및 만료 시 재발급 로직 처리용 커스텀 훅
- useSchedules: 일정 목록 페칭, 추가, 수정, 삭제 비동기 처리를 중앙에서 관리하는 커스텀 훅

## 3. 상세 UI/UX 및 상호작용 (Interaction)
- 일정 모달 렌더링: 달력의 빈 날짜 클릭 시 해당 날짜가 기본값으로 입력된 추가 폼 모달 오픈
- 유효성 검사 경고: 일정 폼 입력 시 제목 누락 또는 종료일이 시작일보다 빠른 경우 입력 필드 하단에 경고 텍스트 출력
- 로딩 스피너 (Loading Spinner): API 서버 통신 대기 중 화면 중앙에 스피너 노출 및 버튼 중복 클릭 방지 처리
- 토스트 알림 (Toast Notification): 작업(일정 추가, 수정, 삭제) 성공 및 실패 시 우측 상단에 3초간 노출 후 사라지는 알림창 렌더링

## 4. 컴포넌트별 백엔드 API 연동 매핑
- CalendarPage 초기 로드 시: GET /api/v1/schedules (전체 일정 데이터) 및 GET /api/v1/categories 호출
- ScheduleModal 폼 제출 시 (신규): POST /api/v1/schedules 데이터 전송
- ScheduleModal 폼 제출 시 (수정): PUT /api/v1/schedules/{id} 데이터 전송
- FullCalendar 드래그 앤 드롭 이벤트 발생 시: PATCH /api/v1/schedules/{id} 호출을 통한 날짜 실시간 업데이트