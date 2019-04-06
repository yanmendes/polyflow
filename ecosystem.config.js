module.exports = {
  apps: [
    {
      name: 'polyflow.api',
      script: 'yarn',
      args: 'run start:prod',
      watch: true,
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
