module.exports = {
  apps: [
    {
      name: 'polyflow.api',
      script: 'node',
      args: 'dist',
      watch: true,
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
