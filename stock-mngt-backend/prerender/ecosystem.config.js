module.exports = {
  apps: [{
    name: 'prerender',
    script: 'prerender-server.js',
    cwd: '/var/www/Storiom/backend/prerender',
    env: {
      NODE_ENV: 'production',
      TARGET_HOST: 'https://storiom.com',
      PRERENDER_PORT: 3030,
      CACHE_TTL: 86400000,      // 24 hours
      MAX_CACHE_SIZE: 5000
    },
    max_memory_restart: '300M',
    restart_delay: 5000,
    max_restarts: 10
  }]
};
