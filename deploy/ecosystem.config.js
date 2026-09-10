module.exports = {
  apps: [{
    name: "destinlmincy",
    script: "node_modules/.bin/next",
    args: "start",
    cwd: "/home/ubuntu/destinlmincy.com",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "512M",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
    },
  }],
};
