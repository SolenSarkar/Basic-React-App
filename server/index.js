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

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'MERN API is running!' });
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
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

