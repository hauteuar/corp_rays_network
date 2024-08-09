// routes/user.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');
const auth = require('../middleware/auth');
const setDatabaseConnection = require('../middleware/setDatabaseConnection');

// User registration
router.post('/auth/register', setDatabaseConnection, async (req, res) => {
  const { firstName, lastName, dob, gender, email, contactNumber, password, confirmPassword, role, organizationId } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).send({ error: 'Passwords do not match' });
  }

  const hashedPassword = await bcrypt.hash(password, 8);

  const user = new req.db.model('User', User.schema)({
    firstName,
    lastName,
    dob,
    gender,
    email,
    contactNumber,
    password: hashedPassword,
    role,
    organization: organizationId ? mongoose.Types.ObjectId(organizationId) : null,
    age: calculateAge(dob)
  });

  try {
    const savedUser = await user.save();

    if (organizationId) {
      const organization = await Organization.findById(organizationId);
      if (organization) {
        if (role === 'org_admin') {
          organization.admins.push(savedUser._id);
        } else if (role === 'coach' || role === 'freelance_coach') {
          organization.coaches.push(savedUser._id);
        } else if (role === 'student') {
          organization.students.push(savedUser._id);
        } else if (role === 'parent') {
          organization.parents.push(savedUser._id);
        }
        await organization.save();
      }
    }

    res.status(201).send(savedUser);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Fetch user profile
router.get('/user/profile', auth, async (req, res) => {
  try {
    const user = await req.db.model('User').findById(req.user._id).populate('organization signedDocuments parent');
    //console.log('user org', user.organizationName);
    if (!user) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.send(user);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});



module.exports = router;

function calculateAge(dob) {
  const birthDate = new Date(dob);
  const difference = Date.now() - birthDate.getTime();
  const ageDate = new Date(difference);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
