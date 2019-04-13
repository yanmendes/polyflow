module.exports = {
  apps: [
    {
      name: 'polyflow.api',
      script: 'yarn',
      args: 'start',
      watch: true,
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
