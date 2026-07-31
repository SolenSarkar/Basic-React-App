const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// GET /api/items - Fetch all items (with search & pagination)
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 5 } = req.query;

    // Build filter
    let filter = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      filter = {
        $or: [{ name: regex }, { description: regex }],
      };
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Item.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Item.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error('Error fetching items:', err.message);
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

