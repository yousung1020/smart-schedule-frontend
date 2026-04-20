# 스마트 스케줄러 종합 기획

## 1. 프로젝트 개요
- 프로젝트명: 스마트 스케줄러
- 개발 목적: 리액트와 스프링 부트를 연동한 실생활 밀착형 스케줄 관리 플랫폼 구축
- 핵심 목표: REST API 설계 표준 준수 및 비동기 처리, 복잡한 데이터 집계 등 백엔드 기술에 능숙해지기

## 2. 기술 스택
- 프론트엔드: React, Axios, Tailwind CSS, FullCalendar 라이브러리
- 백엔드: Spring Boot, Spring Data JPA, Spring Security, QueryDSL
- 데이터베이스: MySQL 8.0
- 인프라 및 도구: Docker, Swagger, GitHub Actions

## 3. 기능 요구사항 요약
- 인증: JWT 기반 로그인 및 회원가입
- 스케줄: 일정 CRUD 및 카테고리 분류
- 알림: 다가오는 일정 이메일 비동기 발송
- 통계: 월간 달성률 및 카테고리별 통계 데이터 시각화