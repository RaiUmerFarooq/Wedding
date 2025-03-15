// src/components/EventManager.js
import React, { useState, useEffect } from 'react';
import EventForm from './EventForm';
import EventList from './EventList';

const EventManager = () => {
  const [events, setEvents] = useState([]);
  const [counters, setCounters] = useState({ nikkah: 0, shalima: 0, totalGuests: 0, totalMales: 0, totalFemales: 0 });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const response = await fetch('http://localhost:5000/api/events');
    const data = await response.json();
    setEvents(data.events);
    setCounters(data.counters);
  };

  const addEvent = async (newEvent) => {
    const response = await fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent)
    });
    if (response.ok) {
      fetchEvents();
    }
  };

  const deleteEvent = async (id) => {
    const response = await fetch(`http://localhost:5000/api/events/${id}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      fetchEvents();
    }
  };

  return (
    <div>
      <div className="counters">
        <h3>Our Guest List</h3>
        <div className="counter-grid">
          <div className="counter-item">
            <span className="counter-number">{counters.nikkah}</span>
            <span className="counter-label">Nikkah Attendees</span>
          </div>
          <div className="counter-item">
            <span className="counter-number">{counters.shalima}</span>
            <span className="counter-label">Shalima Attendees</span>
          </div>
          <div className="counter-item">
            <span className="counter-number">{counters.totalMales}</span>
            <span className="counter-label">Total Males</span>
          </div>
          <div className="counter-item">
            <span className="counter-number">{counters.totalFemales}</span>
            <span className="counter-label">Total Females</span>
          </div>
          <div className="counter-item total">
            <span className="counter-number">{counters.totalGuests}</span>
            <span className="counter-label">Total Attendees</span>
          </div>
        </div>
      </div>
      <EventForm onAddEvent={addEvent} />
      <EventList events={events} onDelete={deleteEvent} />
    </div>
  );
};

export default EventManager;