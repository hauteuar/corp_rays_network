const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const setDatabaseConnection = require('../middleware/setDatabaseConnection');
const CategorySchema = require('../models/Category').schema;
const CoachSchema = require('../models/Coach').schema;

// Helper function to validate ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all categories
router.get('/categories', setDatabaseConnection, async (req, res) => {
  try {
    const Category = req.db.model('Category', CategorySchema);
    const categories = await Category.find({});
    res.send(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Add a new category
router.post('/categories', setDatabaseConnection, async (req, res) => {
  try {
    const Category = req.db.model('Category', CategorySchema);
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.status(201).send(newCategory);
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(400).send({ error: 'Invalid data provided' });
  }
});

// Get coaches by category ID
router.get('/categories/:id/coaches', setDatabaseConnection, async (req, res) => {
  try {
    const categoryId = req.params.id;
    if (!isValidObjectId(categoryId)) {
      return res.status(400).send({ error: 'Invalid category ID' });
    }

    const Category = req.db.model('Category', CategorySchema);
    const Coach = req.db.model('Coach', CoachSchema);

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).send({ error: 'Category not found' });
    }

    const coaches = await Coach.find({ category: category.name, organization: req.organization._id });
    res.send(coaches);
  } catch (error) {
    console.error('Error fetching coaches by category:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

module.exports = router;
