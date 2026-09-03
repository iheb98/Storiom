module.exports = {
  apps: [{
    name: 'storiom-backend',
    script: 'app.js',
    instances: 4,           // Use 4 of 6 vCPUs (leave 2 for PostgreSQL + Nginx)
    exec_mode: 'cluster',
    max_memory_restart: '2G',
    watch: false,
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    // Logging
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    // Graceful restart
    kill_timeout: 5000,
    listen_timeout: 8000,
    // Auto-restart on crash
    autorestart: true,
    max_restarts: 10,
    restart_delay: 1000
  }]
};
