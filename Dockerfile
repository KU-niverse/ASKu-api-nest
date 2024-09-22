# 1단계: 빌드 스테이지
FROM node:18 AS builder

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# 패키지 파일 복사 및 설치 (캐시 사용)
COPY package*.json ./
RUN npm ci

# 소스 코드 복사
COPY . .

# 애플리케이션 빌드
RUN npm run build

# 2단계: 실행 스테이지
FROM node:18-slim

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# pm2 설치
RUN npm install pm2 -g

# 빌드 결과물과 필요한 파일만 복사
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
COPY ecosystem.config.js ./

# PM2를 사용하여 설정 파일로 앱 실행
CMD ["pm2-runtime", "start", "ecosystem.config.js"]

# 호스트와 컨테이너 간에 연결할 포트 설정
EXPOSE 8000