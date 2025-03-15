// src/components/EventManager.js
import React, { useState, useEffect } from 'react';
import EventForm from './EventForm';
import EventList from './EventList';

const EventManager = () => {
  const [events, setEvents] = useState([]);
  const [allCounters, setAllCounters] = useState({ nikkah: 0, shalima: 0, totalGuests: 0, totalMales: 0, totalFemales: 0 });
  const [selectedEvent, setSelectedEvent] = useState(null); // null means show all events

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/events');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched events:', data.events); // Debug fetched data
      setEvents(data.events || []);
      setAllCounters(data.counters || { nikkah: 0, shalima: 0, totalGuests: 0, totalMales: 0, totalFemales: 0 });
    } catch (error) {
      console.error('Fetch error:', error);
      setEvents([]);
      setAllCounters({ nikkah: 0, shalima: 0, totalGuests: 0, totalMales: 0, totalFemales: 0 });
    }
  };

  const addEvent = async (newEvent) => {
    try {
      const response = await fetch('http://localhost:5000/api/events', {
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
    try {
      const response = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      await fetchEvents();
    } catch (error) {
      console.error('Delete event error:', error);
    }
  };

  // Filter events based on selected event
  const filteredEvents = selectedEvent 
    ? events.filter(event => event.eventName === selectedEvent)
    : events;

  // Calculate dynamic counters based on filtered events
  const displayedCounters = selectedEvent
    ? {
        nikkah: selectedEvent === 'Nikkah' ? filteredEvents.reduce((sum, e) => sum + 1 + e.maleGuests + e.femaleGuests, 0) : 0,
        shalima: selectedEvent === 'Shalima' ? filteredEvents.reduce((sum, e) => sum + 1 + e.maleGuests + e.femaleGuests, 0) : 0,
        totalGuests: filteredEvents.reduce((sum, e) => sum + 1 + e.maleGuests + e.femaleGuests, 0),
        totalMales: filteredEvents.reduce((sum, e) => sum + 1 + e.maleGuests, 0),
        totalFemales: filteredEvents.reduce((sum, e) => sum + e.femaleGuests, 0)
      }
    : allCounters;

  // Debug button clicks
  const handleButtonClick = (eventName) => {
    console.log(`Button clicked: ${eventName || 'All Events'}`);
    setSelectedEvent(eventName);
    console.log('Displayed counters:', displayedCounters); // Log will show old value due to state update delay
  };

  // Log state changes after render
  useEffect(() => {
    console.log('Current selectedEvent:', selectedEvent);
    console.log('Current filteredEvents:', filteredEvents);
    console.log('Displayed counters:', displayedCounters);
  }, [selectedEvent, filteredEvents, displayedCounters]);

  return (
    <div>
      <div className="counters">
        <h3>Our Guest List</h3>
        <div className="event-buttons">
          <button 
            onClick={() => handleButtonClick('Nikkah')}
            className={selectedEvent === 'Nikkah' ? 'active' : ''}
          >
            Nikkah
          </button>
          <button 
            onClick={() => handleButtonClick('Shalima')}
            className={selectedEvent === 'Shalima' ? 'active' : ''}
          >
            Shalima
          </button>
          <button 
            onClick={() => handleButtonClick(null)}
            className={selectedEvent === null ? 'active' : ''}
          >
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