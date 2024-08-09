const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const bcrypt = require('bcryptjs');

// Parent registration
router.post('/auth/register/parent', async (req, res) => {
  const { firstName, lastName, dob, gender, email, contactNumber, emergencyContactNumber, streetAddress, apartmentNumber, city, state, postalCode, country, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).send({ error: 'Passwords do not match' });
  }

  const hashedPassword = await bcrypt.hash(password, 8);

  const user = new User({
    firstName,
    lastName,
    dob,
    gender,
    email,
    contactNumber,
    emergencyContactNumber,
    streetAddress,
    apartmentNumber,
    city,
    state,
    postalCode,
    country,
    password: hashedPassword,
    role: 'parent',
    age: calculateAge(dob)
  });

  await user.save();
  res.send(user);
});

// Helper function to calculate age
function calculateAge(dob) {
  const birthDate = new Date(dob);
  const difference = Date.now() - birthDate.getTime();
  const ageDate = new Date(difference);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

module.exports = router;
