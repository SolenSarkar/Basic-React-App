require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const itemsRouter = require('./routes/items');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/items', itemsRouter);

// Health check / API overview
app.get('/', (req, res) => {
  res.json({
    message: 'MERN API is running!',
    endpoints: {
      'GET /api/items': 'List all items (supports ?search=&page=&limit=)',
      'GET /api/items/:id': 'Fetch a single item by id',
      'POST /api/items': 'Create a new item (body: { name, description })',
      'PUT /api/items/:id': 'Update an item (body: { name, description })',
      'DELETE /api/items/:id': 'Delete an item',
    },
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI, {
    // Use the database name 'mern_app' if not already in the URI
    dbName: 'mern_app',
    // TLS options to fix SSL handshake issues on Windows
    tls: true,
    tlsAllowInvalidCertificates: true,
  })
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    // Graceful shutdown on Ctrl+C (SIGINT)
    process.on('SIGINT', async () => {
      console.log('\n👋 Shutting down gracefully...');
      server.close(async () => {
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
        process.exit(0);
      });
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

