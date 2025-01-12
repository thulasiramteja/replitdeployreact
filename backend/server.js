require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const promClient = require('prom-client');

const app = express();

// Allow frontend domain to make requests
app.use(cors({
  origin: 'https://replitdeployreact-production.up.railway.app', // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(bodyParser.json());

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

// Define Item model (for existing CRUD operations)
const Item = sequelize.define('Item', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// Define User model (for adding user data)
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

// Test database connection and sync the models
sequelize.authenticate()
  .then(() => console.log('Connected to PostgreSQL database!'))
  .catch((err) => console.error('Failed to connect to the database:', err));

sequelize.sync()
  .then(() => console.log('Database synced with models'))
  .catch((err) => console.error('Failed to sync database:', err));

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the CRUD Application!');
});

// CRUD Routes for Items

// Create an item
app.post('/items', async (req, res) => {
  try {
    const { name, description } = req.body;
    const newItem = await Item.create({ name, description });
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Get all items
app.get('/items', async (req, res) => {
  try {
    const items = await Item.findAll();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Get a single item by ID
app.get('/items/:id', async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (item) {
      res.status(200).json(item);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Update an item
app.put('/items/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const item = await Item.findByPk(req.params.id);
    if (item) {
      item.name = name;
      item.description = description;
      await item.save();
      res.status(200).json(item);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete an item
app.delete('/items/:id', async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (item) {
      await item.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// New Routes for User Data

// Create a user
app.post('/users', async (req, res) => {
  try {
    const { username, email } = req.body;
    const newUser = await User.create({ username, email });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get a single user by ID
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Start the server
app.listen(process.env.PORT || 5000, () => console.log('Server running on port 5000'));
