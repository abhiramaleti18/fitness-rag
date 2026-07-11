const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'Fitness RAG Express Gateway is running' });
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);

const profileRoutes = require('./routes/profileRoutes');
app.use('/api/profile', profileRoutes);

const workoutLogRoutes = require('./routes/workoutLogRoutes');
app.use('/api/logs', workoutLogRoutes);

const workoutSplitRoutes = require('./routes/workoutSplitRoutes');
app.use('/api/splits', workoutSplitRoutes);

mongoose.connect(process.env.EXPRESS_MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 4000, () => {
      console.log(`Express gateway running on port ${process.env.PORT || 4000}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });