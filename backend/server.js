require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const promClient = require('prom-client');
const userRoutes = require('./routes/userRoutes');
const path = require('path');

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

// Use DATABASE_URL directly for Sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true, // Ensure SSL is used
      rejectUnauthorized: false, // Skip certificate verification
    },
  },
});

sequelize.authenticate()
  .then(() => console.log('Connected to PostgreSQL database!'))
  .catch((err) => console.error('Failed to connect to the database:', err));

sequelize.sync()
  .then(() => console.log('DB synced'))
  .catch((err) => console.error('Failed to sync DB:', err));

// Serve React App in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, 'build');
  console.log('Serving static files from:', buildPath); // Debugging line to check path

  app.use(express.static(buildPath));

  // Serve the React app for any other route
  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

app.listen(process.env.PORT || 5000, () => console.log('Server running on port 5000'));
