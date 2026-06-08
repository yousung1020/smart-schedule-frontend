import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// 인증 정보가 필요 없는 공용 API 클라이언트 (로그인, 회원가입, 토큰 재발급용)
export const publicApiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인증 정보가 필요한 전용 API 클라이언트 (비즈니스 API 및 인터셉터 적용)
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

// 대기열에 쌓인 요청들을 일괄 처리하는 함수
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 응답 인터셉터: API 요청에 대한 공통 에러 제어
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 에러 응답이 없거나 HTTP 상태 코드가 401(Unauthorized)이 아닌 경우 에러 반환
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // 이미 재시도를 거쳤다면 바로 로그아웃 처리
    if (originalRequest._retry) {
      handleUnauthorized();
      return Promise.reject(error);
    }

    // 다른 요청에 의해 이미 토큰 재발급 프로세스가 활성화되어 동작 중인 경우
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest); // 새 토큰으로 원본 요청 재시도
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    // 최초 401 감지 시: 토큰 재발급 절차 가동
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // 인터셉터가 없는 순수 publicApiClient를 사용하여 토큰 재발급 요청 수행
      const response = await publicApiClient.post('/auth/reissue');

      if (response.data && response.data.isSuccess && response.data.result?.accessToken) {
        const newAccessToken = response.data.result.accessToken;

        // 새 토큰 저장소 갱신
        if (localStorage.getItem('access_token')) {
          localStorage.setItem('access_token', newAccessToken);
        } else {
          sessionStorage.setItem('access_token', newAccessToken);
        }

        // 기본 헤더 및 현재 실패했던 요청 헤더 업데이트
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        // 큐에 대기 중이던 요청들에게 새 토큰 전달하여 모두 실행시킴
        processQueue(null, newAccessToken);

        // 현재 실패했던 최초 요청 재시도 실행
        return apiClient(originalRequest);
      } else {
        throw new Error('Invalid token refresh response structure');
      }
    } catch (refreshError) {
      // 재발급 실패 시 대기열의 모든 요청을 실패 처리하고 로그아웃
      processQueue(refreshError, null);
      handleUnauthorized();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// 토큰 완전 만료 시 로그아웃 및 페이지 이동 처리
const handleUnauthorized = () => {
  localStorage.removeItem('access_token');
  sessionStorage.removeItem('access_token');

  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

// 요청 인터셉터: 로컬/세션 스토리지에 토큰이 있다면 매 요청 시 헤더에 자동 주입
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);