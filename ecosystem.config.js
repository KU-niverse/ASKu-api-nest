module.exports = {
  apps: [
    {
      name: 'nestjs-app',
      script: './dist/main.js',
      instances: 'max', // CPU 코어 수에 맞춰 최대 프로세스 수로 실행
      autorestart: true,
      exec_mode: 'cluster', // 클러스터 모드로 실행
      watch: false, // 코드 변경 시 자동으로 리스타트
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};
