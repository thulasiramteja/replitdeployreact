const express = require('express');
const { User } = require('../models/User');
const router = express.Router();

router.post('/add', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.get('/view', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

router.put('/update/:id', async (req, res) => {
  try {
    await User.update(req.body, { where: { id: req.params.id } });
    res.sendStatus(200);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.delete('/delete/:id', async (req, res) => {
  await User.destroy({ where: { id: req.params.id } });
  res.sendStatus(200);
});

module.exports = router;
