const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const setDatabaseConnection = require('../middleware/setDatabaseConnection');
const CourseSchema = require('../models/Course').schema;
const BatchSchema = require('../models/Batch').schema;

// Add a new course
router.post('/courses', setDatabaseConnection, async (req, res) => {
  try {
    const Course = req.db.model('Course', CourseSchema);
    const newCourse = new Course({
      ...req.body,
      organization: req.organization._id
    });
    await newCourse.save();
    res.status(201).send(newCourse);
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(400).send({ error: 'Invalid data provided' });
  }
});

// Update a course with batches
router.patch('/courses/:id', setDatabaseConnection, async (req, res) => {
  try {
    const { batches, ...courseData } = req.body;
    const Course = req.db.model('Course', CourseSchema);
    const Batch = req.db.model('Batch', BatchSchema);

    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, organization: req.organization._id },
      courseData,
      { new: true }
    );

    if (!course) {
      return res.status(404).send({ error: 'Course not found' });
    }

    if (batches) {
      const batchIds = await Promise.all(
        batches.map(async (batchId) => {
          const batch = await Batch.findById(batchId);
          if (batch) {
            batch.course = course._id;
            await batch.save();
            return batch._id;
          }
        })
      );

      course.batches = batchIds.filter(id => id); // Filter out undefined values
      await course.save();
    }

    res.send(course);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(400).send({ error: 'Invalid data provided' });
  }
});

// Get a specific course by ID
router.get('/courses/:id', setDatabaseConnection, async (req, res) => {
  try {
    const Course = req.db.model('Course', CourseSchema);
    const course = await Course.findOne({ _id: req.params.id, organization: req.organization._id }).populate('coaches batches');
    if (!course) {
      return res.status(404).send({ error: 'Course not found' });
    }
    res.send(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Get all courses
router.get('/courses', setDatabaseConnection, async (req, res) => {
  try {
    const Course = req.db.model('Course', CourseSchema);
    const courses = await Course.find({ organization: req.organization._id }).populate('coaches batches');
    res.send(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;
