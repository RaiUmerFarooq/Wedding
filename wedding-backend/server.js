// wedding-backend/server.js
require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection using environment variable with fallback for local
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/wedding-events';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Event Schema
const eventSchema = new mongoose.Schema({
  eventName: String,
  personName: String,
  date: String,
  maleGuests: { type: Number, default: 0 },
  femaleGuests: { type: Number, default: 0 }
});

const Event = mongoose.model('Event', eventSchema);

// Routes
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find();
    const counters = {
      nikkah: events
        .filter(e => e.eventName === 'Nikkah')
        .reduce((sum, e) => sum + 1 + e.maleGuests + e.femaleGuests, 0),
      shalima: events
        .filter(e => e.eventName === 'Shalima')
        .reduce((sum, e) => sum + 1 + e.maleGuests + e.femaleGuests, 0),
      totalGuests: events.reduce((sum, e) => sum + 1 + e.maleGuests + e.femaleGuests, 0),
      totalMales: events.reduce((sum, e) => sum + 1 + e.maleGuests, 0),
      totalFemales: events.reduce((sum, e) => sum + e.femaleGuests, 0)
    };
    res.json({ events, counters });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(400).json({ error: 'Bad request' });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Bad request' });
  }
});

// Initial data (optional for local testing)
const initializeData = async () => {
  const count = await Event.countDocuments();
  if (count === 0) {
    await Event.insertMany([
      { eventName: 'Nikkah', date: '2025-04-04', maleGuests: 0, femaleGuests: 0 },
      { eventName: 'Shalima', date: '2025-04-05', maleGuests: 0, femaleGuests: 0 }
    ]);
    console.log('Initial events added');
  }
};

// Run initialization and start server locally if not on Vercel
if (process.env.NODE_ENV !== 'production') {
  mongoose.connection.once('open', () => {
    initializeData();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}

// Export the app for Vercel
module.exports = app;