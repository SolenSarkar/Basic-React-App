require('dotenv').config();
const mongoose = require('mongoose');
const Item = require('./models/Item');

const seedItems = [
  { name: 'React Project', description: 'A modern React app built with Vite for fast development' },
  { name: 'Express API', description: 'RESTful API built with Express.js and connected to MongoDB Atlas' },
  { name: 'MERN Stack', description: 'Full-stack JavaScript app using MongoDB, Express, React, and Node.js' },
  { name: 'MongoDB Atlas', description: 'Cloud database service for modern applications with auto-scaling' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'mern_app',
      tls: true,
      tlsAllowInvalidCertificates: true,
    });
    console.log('✅ Connected to MongoDB Atlas');

    await Item.deleteMany({});
    console.log('🗑️  Cleared existing items');

    const created = await Item.insertMany(seedItems);
    console.log(`✅ Inserted ${created.length} items:`);
    created.forEach((item) => console.log(`   - ${item.name}`));

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
}

seed();

