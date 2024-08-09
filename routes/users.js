const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Student = mongoose.model('Student');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth'); // Middleware to authenticate user token

// User registration
router.post('/auth/register/child', async (req, res) => {
    const {
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
        password,
        confirmPassword,
        parent
    } = req.body;

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
        role: 'student', // Set the default role to 'student'
        age: calculateAge(dob),
        parent: parent ? mongoose.Types.ObjectId(parent) : null
    });

    try {
        const savedUser = await user.save();
        
        // Automatically add user to Student model if they are not parent, coach, or admin
        if (savedUser.role === 'student') {
            const student = new Student({
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                email: savedUser.email,
                phone: savedUser.contactNumber
            });
            await student.save();
        }

        res.status(201).send(savedUser);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Helper function to calculate age
function calculateAge(dob) {
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}




// Route to fetch user profile
router.get('/user/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('parent organization signedDocuments');
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        res.send(user);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});
module.exports = router;
