require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const promClient = require('prom-client');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Allow frontend domain to make requests
app.use(cors({
  origin: 'https://replitdeployreact-production.up.railway.app', // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(bodyParser.json());
app.use('/users', userRoutes);

// Prometheus Metrics Setup
const register = promClient.register;
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestsTotal.inc({ method: req.method, route: req.originalUrl, status_code: res.statusCode });
  });
  next();
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Use environment variables for the Sequelize connection
const sequelize = new Sequelize({
  host: process.env.PGHOST,  // PostgreSQL host from .env
  dialect: 'postgres',
  username: process.env.POSTGRES_USER,  // PostgreSQL username from .env
  password: process.env.POSTGRES_PASSWORD,  // PostgreSQL password from .env
  database: process.env.POSTGRES_DB,  // PostgreSQL database name from .env
});

sequelize.sync()
  .then(() => console.log('DB synced'))
  .catch((err) => console.error('Failed to sync DB:', err));

app.listen(process.env.PORT || 5000, () => console.log('Server running on port 5000'));
