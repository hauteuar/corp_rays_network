const express = require('express');
const path = require('path');
const router = express.Router();

// Serve the login page
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'login.html'));
});


router.get('/booking_management.html', (req, res) => {
    if (!req.user) return res.redirect('/login.html');
    res.sendFile(path.join(__dirname, '../public', 'booking_management.html'));
  });
module.exports = router;
