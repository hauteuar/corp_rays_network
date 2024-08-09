const express = require('express');
const router = express.Router();
const { orgUserConnection } = require('../db');
const OrgUser = orgUserConnection.model('OrgUser', require('../models/OrgUserSchema'));
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

// Organization user registration
router.post('/auth/register/orgUser', async (req, res) => {
  const { firstName, lastName, email, password, role, organization } = req.body;

  const hashedPassword = await bcrypt.hash(password, 8);

  const orgUser = new OrgUser({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role,
    organization
  });

  try {
    const savedOrgUser = await orgUser.save();
    res.status(201).send(savedOrgUser);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Organization user login
router.post('/auth/login/orgUser', async (req, res) => {
  const { email, password } = req.body;

  try {
    const orgUser = await OrgUser.findOne({ email });
    if (!orgUser) {
      return res.status(404).send({ error: 'Invalid login credentials' });
    }

    const isMatch = await bcrypt.compare(password, orgUser.password);
    if (!isMatch) {
      return res.status(404).send({ error: 'Invalid login credentials' });
    }

    const token = await orgUser.generateAuthToken();
    res.send({ orgUser, token });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Fetch organization user profile
router.get('/orgUser/profile', auth, async (req, res) => {
  try {
    const orgUser = await OrgUser.findById(req.orgUser._id).populate('organization');
    if (!orgUser) {
      return res.status(404).send({ error: 'User not found' });
    }
    res.send(orgUser);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
