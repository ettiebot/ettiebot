module.exports = {
  apps: [
    {
      name: 'worker',
      script: 'npm run build && npm run start:worker',
      max_memory_restart: '1G',
    },
  ]
}