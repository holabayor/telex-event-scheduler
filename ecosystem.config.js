module.exports = {
  apps: [
    {
      name: 'telex-event-scheduler',
      script: './dist/index.js',
      instances: 1,
      autorestart: true,
    },
  ],
};
