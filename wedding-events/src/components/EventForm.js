// src/components/EventForm.js
import React, { useState } from 'react';

const EventForm = ({ onAddEvent }) => {
  const [eventName, setEventName] = useState('');
  const [personName, setPersonName] = useState('');
  const [date, setDate] = useState('');
  const [maleGuests, setMaleGuests] = useState(0);
  const [femaleGuests, setFemaleGuests] = useState(0);
  const [location, setLocation] = useState(''); // New state for location

  // Array of predefined locations
  const locations = [
    "Lahore",
    "Jaranwala",
    "Kot Fazal",
    "Kot Ameer",
    "Kot Hadayat",
    "Kot Falak Sher",
    "Kot Namdar",
    "Hammad ka Chak",
    "Lodhi Wala",
    "Lundiawala",
    "Norpura",
    "Khokhar ka Thatha",
    "Raja Wala",
    "Nankana",
    "Chah Pakka",
    "Bazm",
    "Islamabad"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (eventName && personName && date && location) {
      if (date !== '2025-04-04' && date !== '2025-04-05') {
        alert('Events can only be scheduled on April 4th or 5th, 2025');
        return;
      }
      onAddEvent({ 
        eventName, 
        personName, 
        date, 
        maleGuests: Number(maleGuests), 
        femaleGuests: Number(femaleGuests),
        location // Include location in the submitted data
      });
      setEventName('');
      setPersonName('');
      setDate('');
      setMaleGuests(0);
      setFemaleGuests(0);
      setLocation(''); // Reset location
    } else {
      alert('Please fill out all required fields');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="wedding-form">
      <div className="form-group">
        <label htmlFor="eventName">Select Event</label>
        <select
          id="eventName"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          required
        >
          <option value="">Choose an Event</option>
          <option value="Nikkah">Nikkah</option>
          <option value="Shalima">Shalima</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="personName">Guest Name</label>
        <input
          id="personName"
          type="text"
          placeholder="Enter Person's Name"
          value={personName}
          onChange={(e) => setPersonName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="date">Event Date</label>
        <select
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        >
          <option value="">Choose Date</option>
          <option value="2025-04-04">April 4th, 2025 - Nikkah Day</option>
          <option value="2025-04-05">April 5th, 2025 - Shalima Day</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="maleGuests">Male Guests</label>
        <input
          id="maleGuests"
          type="number"
          min="0"
          max="10"
          placeholder="Number of Male Guests"
          value={maleGuests}
          onChange={(e) => setMaleGuests(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="femaleGuests">Female Guests</label>
        <input
          id="femaleGuests"
          type="number"
          min="0"
          max="10"
          placeholder="Number of Female Guests"
          value={femaleGuests}
          onChange={(e) => setFemaleGuests(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="location">Location</label>
        <select
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        >
          <option value="">Select Location</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>
      <button type="submit">Add to Wedding Plans</button>
    </form>
  );
};

export default EventForm;