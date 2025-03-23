// wedding-backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true,
}));

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost/wedding-events';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Event Schema
const eventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  personName: { type: String, required: true },
  date: { type: String, required: true },
  maleGuests: { type: Number, default: 0, min: 0 },
  femaleGuests: { type: Number, default: 0, min: 0 },
  location: { type: String, required: true },
});

const Event = mongoose.model('Event', eventSchema);

// Contribution Schema
const contributionSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  contributions: [{
    amount: { type: Number, default: 0, min: 0 }, // Allow 0 as a valid value
    description: { type: String, default: '' }, // Allow empty strings
    createdAt: { type: Date, default: Date.now },
  }],
});

const Contribution = mongoose.model('Contribution', contributionSchema);

// Event Routes
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
      totalFemales: events.reduce((sum, e) => sum + e.femaleGuests, 0),
      locations: {},
    };

    events.forEach(event => {
      const totalForLocation = 1 + event.maleGuests + event.femaleGuests;
      counters.locations[event.location] = (counters.locations[event.location] || 0) + totalForLocation;
    });

    res.json({ events, counters });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const { eventName, personName, date, maleGuests, femaleGuests, location } = req.body;
    if (!eventName || !personName || !date || !location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const event = new Event({ eventName, personName, date, maleGuests, femaleGuests, location });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({ error: 'Bad request' });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    await Contribution.deleteMany({ eventId: req.params.id });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(400).json({ error: 'Bad request' });
  }
});

// Contribution Routes
app.get('/api/contributions/:eventId', async (req, res) => {
  try {
    const contribution = await Contribution.findOne({ eventId: req.params.eventId });
    res.json({ contributions: contribution ? contribution.contributions : [] });
  } catch (error) {
    console.error('Error fetching contributions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/contributions', async (req, res) => {
  try {
    const { eventId, contributions } = req.body;
    if (!eventId || !Array.isArray(contributions)) {
      return res.status(400).json({ error: 'Invalid request: eventId and contributions array required' });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Prepare contributions, allowing empty or partial entries
    const formattedContributions = contributions.map(contrib => ({
      amount: contrib.amount !== undefined ? contrib.amount : 0,
      description: contrib.description || '',
      createdAt: contrib.createdAt || new Date(),
    }));

    // Upsert contributions
    const existingContribution = await Contribution.findOne({ eventId });
    if (existingContribution) {
      existingContribution.contributions = formattedContributions;
      await existingContribution.save();
      res.json(existingContribution);
    } else {
      const newContribution = new Contribution({
        eventId,
        contributions: formattedContributions,
      });
      await newContribution.save();
      res.status(201).json(newContribution);
    }
  } catch (error) {
    console.error('Error saving contributions:', error);
    res.status(400).json({ error: 'Bad request' });
  }
});

// Initial Data (optional for local testing)
const initializeData = async () => {
  try {
    const eventCount = await Event.countDocuments();
    if (eventCount === 0) {
      await Event.insertMany([
        { eventName: 'Nikkah', personName: 'Ali & Sana', date: '2025-04-04', maleGuests: 0, femaleGuests: 0, location: 'Lahore' },
        { eventName: 'Shalima', personName: 'Ali & Sana', date: '2025-04-05', maleGuests: 0, femaleGuests: 0, location: 'Karachi' },
      ]);
      console.log('Initial events added');
    }

    const contributionCount = await Contribution.countDocuments();
    if (contributionCount === 0) {
      const events = await Event.find();
      if (events.length > 0) {
        await Contribution.create({
          eventId: events[0]._id,
          contributions: [
            { amount: 5000, description: 'Cash for Nikkah' },
          ],
        });
        console.log('Initial contribution added');
      }
    }
  } catch (error) {
    console.error('Error initializing data:', error);
  }
};

// Start Server
const startServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    await mongoose.connection.once('open', async () => {
      await initializeData();
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    });
  } else {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }
};

startServer();

module.exports = app;