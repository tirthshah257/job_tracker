
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@college.com' });

    if (existingAdmin) {
      console.log('Admin user already exists');
    } else {
      const admin = await User.create({
        name: 'Admin',
        email: 'admin@college.com',
        password: 'admin123',
        role: 'admin',
      });
      console.log(`Admin user created: ${admin.email}`);
    }

    await mongoose.disconnect();
    console.log('MongoDB disconnected');
    process.exit(0);
  } catch (error) {
    console.error(`Seed error: ${error.message}`);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedAdmin();
