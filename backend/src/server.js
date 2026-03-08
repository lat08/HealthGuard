const env = require('./config/env');
const app = require('./app');

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`
  HealthGuard API Server
  http://localhost:${PORT}
  http://localhost:${PORT}/api-docs
  Environment: ${env.NODE_ENV}
  API Base: /api/v1
  `);
});
