const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Item = require('../models/Item');

// Helper: validate a Mongo ObjectId parameter
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/items - Fetch all items (with search & pagination)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;

    // Validate pagination params
    let pageNum = parseInt(req.query.page, 10) || 1;
    let limitNum = parseInt(req.query.limit, 10) || 5;

    if (pageNum < 1) pageNum = 1;
    if (limitNum < 1) limitNum = 5;
    if (limitNum > 100) limitNum = 100;

    // Build filter
    let filter = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      filter = {
        $or: [{ name: regex }, { description: regex }],
      };
    }

    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Item.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Item.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('Error fetching items:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/items/:id - Fetch a single item
router.get('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid item id' });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (err) {
    console.error('Error fetching item:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/items - Create a new item
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }

    const newItem = new Item({ name, description });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    console.error('Error creating item:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /api/items/:id - Update an item
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid item id' });
    }

    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(updatedItem);
  } catch (err) {
    console.error('Error updating item:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE /api/items/:id - Delete an item
router.delete('/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid item id' });
    }

    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully', id: req.params.id });
  } catch (err) {
    console.error('Error deleting item:', err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;

