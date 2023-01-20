module.exports = {
  apps: [
  {
    name: 'tg',
    script: 'npm run build && npm run start:tg',
    max_memory_restart: '1G',
  },
]
}