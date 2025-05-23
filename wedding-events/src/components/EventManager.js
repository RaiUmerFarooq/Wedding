// src/components/EventManager.js
import React, { useState, useEffect } from 'react';
import EventForm from './EventForm';
import EventList from './EventList';

const EventManager = () => {
  const [events, setEvents] = useState([]);
  const [allCounters, setAllCounters] = useState({ nikkah: 0, shalima: 0, totalGuests: 0, totalMales: 0, totalFemales: 0, locations: {} });
  const [selectedEvent, setSelectedEvent] = useState(null); // null means show all events
  const [selectedLocation, setSelectedLocation] = useState(null); // null means show all locations

  // Base API URL from environment variable
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'; // Fallback for safety

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched events:', data.events); // Debug fetched data
      setEvents(data.events || []);
      setAllCounters(data.counters || { nikkah: 0, shalima: 0, totalGuests: 0, totalMales: 0, totalFemales: 0, locations: {} });
    } catch (error) {
      console.error('Fetch error:', error);
      setEvents([]);
      setAllCounters({ nikkah: 0, shalima: 0, totalGuests: 0, totalMales: 0, totalFemales: 0, locations: {} });
    }
  };

  const addEvent = async (newEvent) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      await fetchEvents();
    } catch (error) {
      console.error('Add event error:', error);
    }
  };

  const deleteEvent = async (id) => {
    // Show confirmation popup
    const confirmDelete = window.confirm('Are you sure you want to delete this guest from the list?');
    if (!confirmDelete) {
      console.log('Delete canceled by user');
      return; // Exit if user clicks "Cancel"
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      console.log(`Event ${id} deleted successfully`);
      await fetchEvents();
    } catch (error) {
      console.error('Delete event error:', error);
    }
  };

  // Filter events based on selected event and location
  const filteredEvents = events
    .filter(event => !selectedEvent || event.eventName === selectedEvent)
    .filter(event => !selectedLocation || event.location === selectedLocation);

  // Calculate dynamic counters based on filtered events (excluding event owner)
  const displayedCounters = {
    nikkah: filteredEvents
      .filter(e => e.eventName === 'Nikkah')
      .reduce((sum, e) => sum + e.maleGuests + e.femaleGuests, 0),
    shalima: filteredEvents
      .filter(e => e.eventName === 'Shalima')
      .reduce((sum, e) => sum + e.maleGuests + e.femaleGuests, 0),
    totalGuests: filteredEvents.reduce((sum, e) => sum + e.maleGuests + e.femaleGuests, 0),
    totalMales: filteredEvents.reduce((sum, e) => sum + e.maleGuests, 0),
    totalFemales: filteredEvents.reduce((sum, e) => sum + e.femaleGuests, 0),
    locations: filteredEvents.reduce((acc, e) => {
      acc[e.location] = (acc[e.location] || 0) + e.maleGuests + e.femaleGuests;
      return acc;
    }, {})
  };

  const handleEventClick = (eventName) => {
    console.log(`Event clicked: ${eventName || 'All Events'}`);
    setSelectedEvent(eventName);
  };

  const handleLocationChange = (location) => {
    console.log(`Location selected: ${location || 'All Locations'}`);
    setSelectedLocation(location || null); // Empty string becomes null
  };

  // Get unique locations from events
  const uniqueLocations = [...new Set(events.map(event => event.location).filter(Boolean))];

  return (
    <div>
      <div className="counters">
        <h3>Our Guest List</h3>
        <div className="location-selector">
          <select
            value={selectedLocation || ''}
            onChange={(e) => handleLocationChange(e.target.value)}
          >
            <option value="">All Locations</option>
            {uniqueLocations.map((loc) => (
              <option key={loc} value={loc}>
                {loc} ({displayedCounters.locations[loc] || 0})
              </option>
            ))}
          </select>
        </div>
        <div className="event-buttons">
          <button onClick={() => handleEventClick('Nikkah')} className={selectedEvent === 'Nikkah' ? 'active' : ''}>
            Nikkah
          </button>
          <button onClick={() => handleEventClick('Shalima')} className={selectedEvent === 'Shalima' ? 'active' : ''}>
            Shalima
          </button>
          <button onClick={() => handleEventClick(null)} className={selectedEvent === null ? 'active' : ''}>
            All Events
          </button>
        </div>
        <div className="counter-grid">
          <div className="counter-item">
            <span className="counter-number">{displayedCounters.nikkah}</span>
            <span className="counter-label">Nikkah Attendees</span>
          </div>
          <div className="counter-item">
            <span className="counter-number">{displayedCounters.shalima}</span>
            <span className="counter-label">Shalima Attendees</span>
          </div>
          <div className="counter-item">
            <span className="counter-number">{displayedCounters.totalMales}</span>
            <span className="counter-label">Total Males</span>
          </div>
          <div className="counter-item">
            <span className="counter-number">{displayedCounters.totalFemales}</span>
            <span className="counter-label">Total Females</span>
          </div>
          <div className="counter-item total">
            <span className="counter-number">{displayedCounters.totalGuests}</span>
            <span className="counter-label">Total Attendees</span>
          </div>
        </div>
      </div>
      <EventForm onAddEvent={addEvent} />
      <EventList events={filteredEvents} onDelete={deleteEvent} />
    </div>
  );
};

export default EventManager;