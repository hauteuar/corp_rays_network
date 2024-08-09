const express = require('express');
const router = express.Router();
const setDatabaseConnection = require('../middleware/setDatabaseConnection');
const { ensureAuthenticated } = require('../config/auth');

// Get tasks for a student
router.get('/student/:studentId', setDatabaseConnection, ensureAuthenticated, async (req, res) => {
  try {
    const Task = req.db.model('Task');
    const tasks = await Task.find({ student: req.params.studentId }).populate('assignment');
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching tasks' });
  }
});

// Update task progress report
router.put('/progress/:taskId', setDatabaseConnection, ensureAuthenticated, async (req, res) => {
  const { progressReport } = req.body;
  try {
    const Task = req.db.model('Task');
    const task = await Task.findById(req.params.taskId);
    task.progressReport = progressReport;
    await task.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Error updating progress report' });
  }
});

module.exports = router;
