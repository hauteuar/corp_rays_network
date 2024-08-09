const express = require('express');
const Sport = require('../models/Sport');
const Court = require('../models/Court');
const PriceDetail = require('../models/PriceDetail');
const router = express.Router();

// Add a new sport
router.post('/sport', async (req, res) => {
  try {
    const { name } = req.body;
    const newSport = new Sport({ name });
    await newSport.save();
    res.status(201).json(newSport);
  } catch (error) {
    console.error('Error adding sport:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a new court
router.post('/court', async (req, res) => {
  try {
    const { name, sportId } = req.body;
    const newCourt = new Court({ name, sport: sportId });
    await newCourt.save();
    res.status(201).json(newCourt);
  } catch (error) {
    console.error('Error adding court:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add price details
router.post('/price-detail', async (req, res) => {
  try {
    const { sportId, courtId, normalRate, specialRates } = req.body;
    const newPriceDetail = new PriceDetail({
      sport: sportId,
      court: courtId,
      normalRate,
      specialRates,
    });

    await newPriceDetail.save();
    res.status(201).json(newPriceDetail);
  } catch (error) {
    console.error('Error adding price detail:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
