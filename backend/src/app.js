const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const ApiError = require('./utils/ApiError');

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/api-doc', (req, res) => res.redirect('/api-docs'));

app.use('/api/v1', routes);

app.use((req, _res, next) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} không tồn tại`));
});

app.use(errorHandler);

module.exports = app;
