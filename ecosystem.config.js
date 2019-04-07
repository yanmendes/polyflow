module.exports = {
  apps: [
    {
      name: 'polyflow.api',
      script: 'npm',
      args: 'start',
      watch: true,
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
