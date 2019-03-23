module.exports = {
  apps: [
    {
      name: 'polyflow-api',
      script: './dist/src',
      watch: true,
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
